// Stripe webhooks. Public (verified by signature, not JWT).
//
//   - Signature: when STRIPE_WEBHOOK_SECRET is set we verify with
//     stripe.webhooks.constructEvent(rawBody, sig, secret). Missing/invalid
//     signature → rejected. With no secret (dev) we parse the body directly.
//   - Idempotency: by event id. We keep an in-memory Set of processed ids.
//     PRODUCTION needs a durable store (a WebhookEvent table / Redis) so dedupe
//     survives restarts and is shared across instances.
//   - Handling: branch on the lifecycle events and apply the real DB mutations
//     from 05-state-machines via Prisma (webhooks are trusted server context, so
//     they legitimately write without an RLS scope — no user is on the request).
//
// Enqueue-style side effects (dunning retries, notifications) are left as logged
// TODO comments; the DB mutations are real.
import { Controller, Headers, HttpCode, Logger, Post, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@ox/db";
import type Stripe from "stripe";
import { BillingService } from "../billing/billing.service";
import { Public } from "../common/decorators";
import type { OxRequest } from "../common/session";

@Controller("webhooks")
export class WebhooksController {
  private readonly log = new Logger("StripeWebhook");
  // In-memory idempotency. PRODUCTION: swap for a durable store (table/Redis).
  private readonly seen = new Set<string>();

  constructor(
    private readonly config: ConfigService,
    private readonly billing: BillingService,
  ) {}

  @Public()
  @Post("stripe")
  @HttpCode(200)
  async stripe(@Req() req: OxRequest, @Headers("stripe-signature") signature?: string) {
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));

    let event: Stripe.Event;
    if (secret) {
      if (!signature) {
        this.log.warn("Missing stripe-signature; rejecting.");
        return { received: false, reason: "missing_signature" };
      }
      try {
        event = this.billing.constructEvent(raw, signature, secret);
      } catch (e) {
        this.log.warn(`Signature verification failed: ${(e as Error).message}`);
        return { received: false, reason: "bad_signature" };
      }
    } else {
      // Dev path — no secret configured. Parse the body and trust it.
      try {
        event = JSON.parse(raw.toString("utf8")) as Stripe.Event;
      } catch {
        this.log.warn("Unparseable webhook body.");
        return { received: false, reason: "bad_payload" };
      }
    }

    const id = event.id ?? "evt_unknown";
    if (this.seen.has(id)) {
      this.log.log(`Duplicate event ${id} ignored.`);
      return { received: true, duplicate: true };
    }
    this.seen.add(id);

    try {
      await this.handle(event);
    } catch (e) {
      // A failed handler should 500 so Stripe retries — but we de-duped above, so
      // drop the id to allow the retry to re-process.
      this.seen.delete(id);
      this.log.error(`Handler failed for ${id} (${event.type}): ${(e as Error).message}`);
      throw e;
    }

    this.log.log(`Stripe event ${id} (${event.type}) processed.`);
    return { received: true, id };
  }

  /** Branch on the lifecycle events we care about and apply DB mutations. */
  private async handle(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.markPaymentByPi(pi.id, "paid");
        await this.advanceOrderForPi(pi.id, "paid");
        await this.markTicketsPaidForPi(pi.id);
        await this.payoutPartnerFloor(pi.id);
        // TODO(enqueue): fulfillment + receipt notification jobs.
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.markPaymentByPi(pi.id, "failed");
        // Checkout state machine: placed --PI.failed--> cart (keep items).
        await this.advanceOrderForPi(pi.id, "cart");
        // TODO(enqueue): surface in the operator recovery queue + dunning retry.
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await this.setMembershipBySub(this.subId(invoice.subscription), "active");
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Membership: payment failed x N → past_due.
        await this.setMembershipBySub(this.subId(invoice.subscription), "past_due");
        // TODO(enqueue): dunning schedule (Redis-scheduled retries).
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await this.setMembershipBySub(sub.id, this.mapSubStatus(sub));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await this.setMembershipBySub(sub.id, "cancelled");
        break;
      }
      default:
        this.log.debug(`Unhandled event type ${event.type}.`);
    }
  }

  private async markPaymentByPi(piId: string, state: "paid" | "failed"): Promise<void> {
    const res = await prisma.payment.updateMany({ where: { stripePiId: piId }, data: { state } });
    if (res.count === 0) this.log.debug(`No Payment row for PI ${piId}.`);
  }

  private async advanceOrderForPi(piId: string, state: "paid" | "cart"): Promise<void> {
    const payment = await prisma.payment.findFirst({ where: { stripePiId: piId, kind: "Shop" } });
    if (!payment) return;
    // The user's most recent placed order is the one this PI settled.
    const order = await prisma.order.findFirst({
      where: { userId: payment.userId, state: "placed" },
      orderBy: { placedAt: "desc" },
    });
    if (order) await prisma.order.update({ where: { id: order.id }, data: { state } });
  }

  private async markTicketsPaidForPi(piId: string): Promise<void> {
    const payment = await prisma.payment.findFirst({ where: { stripePiId: piId, kind: "Ticket" } });
    if (!payment) return;
    // Promote the buyer's reserved tickets for this floor's events to paid.
    await prisma.ticket.updateMany({
      where: { userId: payment.userId, state: "reserved" },
      data: { state: "paid" },
    });
  }

  /**
   * Connect payout — when a settled Payment belongs to a partner floor that has a
   * connected account (Floor.stripeAccountId), transfer the floor's share. The
   * platform fee is held back (here a flat 20%); the rest goes to the floor.
   */
  private async payoutPartnerFloor(piId: string): Promise<void> {
    const payment = await prisma.payment.findFirst({ where: { stripePiId: piId } });
    if (!payment) return;
    const floor = await prisma.floor.findUnique({ where: { id: payment.floorId } });
    if (!floor?.stripeAccountId) return; // first-party floor — no transfer needed.
    const PLATFORM_FEE_BPS = 2000; // 20%
    const floorShare = Math.round(payment.amountCents * (1 - PLATFORM_FEE_BPS / 10_000));
    if (floorShare <= 0) return;
    try {
      const transfer = await this.billing.transferToFloor(floor.stripeAccountId, floorShare, {
        paymentId: payment.id,
        piId,
      });
      this.log.log(`Paid out ${floorShare}¢ to floor ${floor.id} (transfer ${transfer.id}).`);
    } catch (e) {
      this.log.error(`Connect transfer for ${payment.id} failed: ${(e as Error).message}`);
    }
  }

  private async setMembershipBySub(subId: string | null, status: string): Promise<void> {
    if (!subId) return;
    const res = await prisma.membership.updateMany({ where: { stripeSubId: subId }, data: { status } });
    if (res.count === 0) this.log.debug(`No Membership for sub ${subId}.`);
  }

  private subId(sub: string | Stripe.Subscription | null | undefined): string | null {
    if (!sub) return null;
    return typeof sub === "string" ? sub : sub.id;
  }

  private mapSubStatus(sub: Stripe.Subscription): string {
    if (sub.cancel_at_period_end) return "active"; // still active until period end
    switch (sub.status) {
      case "active":
      case "trialing":
        return "active";
      case "past_due":
      case "unpaid":
        return "past_due";
      case "paused":
        return "paused";
      case "canceled":
        return "cancelled";
      default:
        return sub.status;
    }
  }
}
