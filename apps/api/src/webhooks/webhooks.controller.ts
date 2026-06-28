// Stripe webhooks. Public (verified by signature, not JWT).
//
//   - Signature: when STRIPE_WEBHOOK_SECRET is set we verify with
//     stripe.webhooks.constructEvent(rawBody, sig, secret). Missing/invalid
//     signature → rejected. With no secret (dev) we parse the body directly.
//   - Idempotency: by event id, persisted to the `WebhookEvent` table. We upsert
//     the event on arrival; if it already carries a `processedAt` we skip. After
//     a handler succeeds we stamp `processedAt` so dedupe survives restarts and is
//     shared across instances. (Trusted server context — service() client, RLS
//     bypass, no user on the request.)
//   - Handling: branch on the lifecycle events and apply the real DB mutations
//     from 05-state-machines via the service() client (webhooks are trusted
//     server context, so they legitimately write without an RLS scope).
//
// Enqueue-style side effects (dunning retries, notifications) are left as logged
// TODO comments; the DB mutations are real.
import { Controller, Headers, HttpCode, InternalServerErrorException, Logger, Post, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Enums } from "@ox/supabase";
import type Stripe from "stripe";
import { BillingService } from "../billing/billing.service";
import { Public } from "../common/decorators";
import type { OxRequest } from "../common/session";
import { SupaService } from "../common/supa.service";

@Controller("webhooks")
export class WebhooksController {
  private readonly log = new Logger("StripeWebhook");

  constructor(
    private readonly config: ConfigService,
    private readonly billing: BillingService,
    private readonly supa: SupaService,
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

    const sb = this.supa.service();
    const id = event.id ?? "evt_unknown";
    // Durable idempotency by event id. Look up first; if it already has a
    // processedAt, this is a replay — skip. Otherwise upsert the arrival record.
    const { data: existing } = await sb.from("WebhookEvent").select("processedAt").eq("id", id).maybeSingle();
    if (existing?.processedAt) {
      this.log.log(`Duplicate event ${id} ignored.`);
      return { received: true, duplicate: true };
    }
    if (!existing) {
      const { error } = await sb.from("WebhookEvent").insert({ id, type: event.type });
      if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    }

    try {
      await this.handle(event);
    } catch (e) {
      // A failed handler should 500 so Stripe retries. We left processedAt null,
      // so the retry re-processes cleanly.
      this.log.error(`Handler failed for ${id} (${event.type}): ${(e as Error).message}`);
      throw e;
    }

    await sb.from("WebhookEvent").update({ processedAt: new Date().toISOString() }).eq("id", id);
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
    const { data } = await this.supa.service().from("Payment").update({ state }).eq("stripePiId", piId).select("id");
    if (!data || data.length === 0) this.log.debug(`No Payment row for PI ${piId}.`);
  }

  private async advanceOrderForPi(piId: string, state: "paid" | "cart"): Promise<void> {
    const sb = this.supa.service();
    const { data: payment } = await sb
      .from("Payment")
      .select("userId")
      .eq("stripePiId", piId)
      .eq("kind", "Shop")
      .maybeSingle();
    if (!payment) return;
    // The user's most recent placed order is the one this PI settled.
    const { data: order } = await sb
      .from("Order")
      .select("id")
      .eq("userId", payment.userId)
      .eq("state", "placed")
      .order("placedAt", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (order) await sb.from("Order").update({ state }).eq("id", order.id);
  }

  private async markTicketsPaidForPi(piId: string): Promise<void> {
    const sb = this.supa.service();
    const { data: payment } = await sb
      .from("Payment")
      .select("userId")
      .eq("stripePiId", piId)
      .eq("kind", "Ticket")
      .maybeSingle();
    if (!payment) return;
    // Promote the buyer's reserved tickets to paid.
    await sb.from("Ticket").update({ state: "paid" }).eq("userId", payment.userId).eq("state", "reserved");
  }

  /**
   * Connect payout — when a settled Payment belongs to a partner floor that has a
   * connected account (Floor.stripeAccountId), transfer the floor's share. The
   * platform fee is held back (here a flat 20%); the rest goes to the floor.
   */
  private async payoutPartnerFloor(piId: string): Promise<void> {
    const sb = this.supa.service();
    const { data: payment } = await sb.from("Payment").select("*").eq("stripePiId", piId).maybeSingle();
    if (!payment) return;
    const { data: floor } = await sb.from("Floor").select("*").eq("id", payment.floorId).maybeSingle();
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
    const { data } = await this.supa
      .service()
      .from("Membership")
      .update({ status: status as Enums<"MembershipStatus"> })
      .eq("stripeSubId", subId)
      .select("id");
    if (!data || data.length === 0) this.log.debug(`No Membership for sub ${subId}.`);
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
