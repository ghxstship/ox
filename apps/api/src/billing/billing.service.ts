// Stripe wrapper. With STRIPE_SECRET_KEY set we hit the real Stripe SDK; with it
// unset we run in MOCK mode — minting deterministic fake objects, no network — so
// the API still runs in dev. Nothing throws: both paths return the same shapes.
//
// Covers the full money surface from 05-state-machines:
//   - PaymentIntents (shop checkout, tickets, drop-ins, retries)
//   - Customers + Subscriptions/Billing (memberships)
//   - Connect transfers (partner-floor payouts to Floor.stripeAccountId)
//   - Refunds + retrieving/retrying failed PaymentIntents
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";

export interface PaymentIntentLike {
  id: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: string;
  mock: boolean;
}

export interface CustomerLike {
  id: string;
  mock: boolean;
}

export interface SubscriptionLike {
  id: string;
  status: string;
  currentPeriodEnd: Date | null;
  latestInvoicePaymentIntentClientSecret: string | null;
  mock: boolean;
}

export interface RefundLike {
  id: string;
  status: string;
  amountCents: number;
  mock: boolean;
}

export interface TransferLike {
  id: string;
  amountCents: number;
  destination: string;
  mock: boolean;
}

@Injectable()
export class BillingService {
  private readonly log = new Logger("Billing");
  private readonly secret?: string;
  private readonly stripe?: Stripe;

  constructor(config: ConfigService) {
    this.secret = config.get<string>("STRIPE_SECRET_KEY") || undefined;
    if (this.secret) {
      this.stripe = new Stripe(this.secret, { apiVersion: "2024-06-20" });
      this.log.log("Stripe live mode — STRIPE_SECRET_KEY detected.");
    } else {
      this.log.warn("STRIPE_SECRET_KEY unset — billing in MOCK mode (no network).");
    }
  }

  get isMock(): boolean {
    return !this.stripe;
  }

  /** Construct + verify a webhook event. Throws on bad signature (live mode only). */
  constructEvent(rawBody: Buffer, signature: string, secret: string): Stripe.Event {
    if (!this.stripe) {
      // No SDK in mock mode — caller falls back to a parsed body. Should not be
      // reached when a secret is configured (live mode always has the SDK).
      throw new Error("Stripe SDK unavailable for signature verification.");
    }
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }

  /** Create (or mock) a PaymentIntent. */
  async createPaymentIntent(
    amountCents: number,
    kind: string,
    opts: { customerId?: string; metadata?: Record<string, string>; currency?: string } = {},
  ): Promise<PaymentIntentLike> {
    const currency = opts.currency ?? "usd";
    if (!this.stripe) {
      const id = `pi_mock_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
      return {
        id,
        clientSecret: `${id}_secret_mock`,
        amountCents,
        currency,
        status: "requires_payment_method",
        mock: true,
      };
    }
    const pi = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      customer: opts.customerId,
      metadata: { kind, ...(opts.metadata ?? {}) },
      automatic_payment_methods: { enabled: true },
    });
    return {
      id: pi.id,
      clientSecret: pi.client_secret ?? "",
      amountCents: pi.amount,
      currency: pi.currency,
      status: pi.status,
      mock: false,
    };
  }

  /** Retrieve a PaymentIntent (used to check why a payment failed before retry). */
  async retrievePaymentIntent(piId: string): Promise<PaymentIntentLike | null> {
    if (!this.stripe) {
      return { id: piId, clientSecret: `${piId}_secret_mock`, amountCents: 0, currency: "usd", status: "requires_payment_method", mock: true };
    }
    try {
      const pi = await this.stripe.paymentIntents.retrieve(piId);
      return { id: pi.id, clientSecret: pi.client_secret ?? "", amountCents: pi.amount, currency: pi.currency, status: pi.status, mock: false };
    } catch (e) {
      this.log.warn(`retrievePaymentIntent ${piId} failed: ${(e as Error).message}`);
      return null;
    }
  }

  /**
   * Retry a failed payment. Live: if the original PI is retriable we reuse it,
   * otherwise we mint a fresh one for the same amount. Mock: fresh intent.
   */
  async retry(amountCents: number, kind: string, originalPiId?: string): Promise<PaymentIntentLike> {
    if (this.stripe && originalPiId) {
      const existing = await this.retrievePaymentIntent(originalPiId);
      // A canceled/failed PI cannot be confirmed again; mint a new one.
      if (existing && existing.status === "requires_payment_method") return existing;
    }
    return this.createPaymentIntent(amountCents, kind, originalPiId ? { metadata: { retryOf: originalPiId } } : {});
  }

  /** Find or create a Stripe Customer for a user (idempotent by metadata.userId). */
  async ensureCustomer(userId: string, email?: string, name?: string): Promise<CustomerLike> {
    if (!this.stripe) return { id: `cus_mock_${userId}`, mock: true };
    const found = await this.stripe.customers.search({ query: `metadata['userId']:'${userId}'`, limit: 1 }).catch(() => null);
    if (found?.data.length) return { id: found.data[0]!.id, mock: false };
    const created = await this.stripe.customers.create({ email, name, metadata: { userId } });
    return { id: created.id, mock: false };
  }

  /** Create a subscription (membership). priceId from a configured Stripe Price. */
  async createSubscription(customerId: string, priceId: string, metadata: Record<string, string> = {}): Promise<SubscriptionLike> {
    if (!this.stripe) {
      return {
        id: `sub_mock_${randomUUID().replace(/-/g, "").slice(0, 14)}`,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000),
        latestInvoicePaymentIntentClientSecret: null,
        mock: true,
      };
    }
    const sub = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata,
    });
    return this.toSubscriptionLike(sub);
  }

  /** Cancel a subscription at period end (membership cancel → access ends later). */
  async cancelSubscription(subId: string, atPeriodEnd = true): Promise<SubscriptionLike> {
    if (!this.stripe) {
      return { id: subId, status: atPeriodEnd ? "active" : "canceled", currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000), latestInvoicePaymentIntentClientSecret: null, mock: true };
    }
    const sub = atPeriodEnd
      ? await this.stripe.subscriptions.update(subId, { cancel_at_period_end: true })
      : await this.stripe.subscriptions.cancel(subId);
    return this.toSubscriptionLike(sub);
  }

  /** Pause / resume a subscription (membership pause → resume). */
  async pauseSubscription(subId: string, pause: boolean): Promise<SubscriptionLike> {
    if (!this.stripe) {
      return { id: subId, status: pause ? "paused" : "active", currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000), latestInvoicePaymentIntentClientSecret: null, mock: true };
    }
    const sub = await this.stripe.subscriptions.update(subId, {
      pause_collection: pause ? { behavior: "void" } : null,
    });
    return this.toSubscriptionLike(sub);
  }

  /** Refund a captured PaymentIntent (ticket refund, return). qty/amount partial ok. */
  async refund(piId: string, amountCents?: number): Promise<RefundLike> {
    if (!this.stripe) {
      return { id: `re_mock_${randomUUID().replace(/-/g, "").slice(0, 14)}`, status: "succeeded", amountCents: amountCents ?? 0, mock: true };
    }
    const refund = await this.stripe.refunds.create({ payment_intent: piId, amount: amountCents });
    return { id: refund.id, status: refund.status ?? "pending", amountCents: refund.amount, mock: false };
  }

  /**
   * Connect transfer — pay a partner floor its share. `destination` is the
   * Floor.stripeAccountId (a connected account). Mock returns a fake transfer.
   */
  async transferToFloor(destination: string, amountCents: number, metadata: Record<string, string> = {}): Promise<TransferLike> {
    if (!this.stripe) {
      return { id: `tr_mock_${randomUUID().replace(/-/g, "").slice(0, 14)}`, amountCents, destination, mock: true };
    }
    const tr = await this.stripe.transfers.create({ amount: amountCents, currency: "usd", destination, metadata });
    return { id: tr.id, amountCents: tr.amount, destination: String(tr.destination), mock: false };
  }

  private toSubscriptionLike(sub: Stripe.Subscription): SubscriptionLike {
    const invoice = sub.latest_invoice;
    let clientSecret: string | null = null;
    if (invoice && typeof invoice !== "string") {
      const pi = (invoice as Stripe.Invoice).payment_intent;
      if (pi && typeof pi !== "string") clientSecret = pi.client_secret ?? null;
    }
    return {
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
      latestInvoicePaymentIntentClientSecret: clientSecret,
      mock: false,
    };
  }
}
