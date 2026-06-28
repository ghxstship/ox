// Thin Stripe wrapper. With no STRIPE_SECRET_KEY we run in mock mode and mint
// fake PaymentIntents — no network calls. Swap in the real `stripe` SDK in prod.
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";

export interface PaymentIntentLike {
  id: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: "requires_payment_method" | "succeeded";
  mock: boolean;
}

@Injectable()
export class BillingService {
  private readonly log = new Logger("Billing");
  private readonly secret?: string;

  constructor(config: ConfigService) {
    this.secret = config.get<string>("STRIPE_SECRET_KEY") || undefined;
    if (!this.secret) this.log.warn("STRIPE_SECRET_KEY unset — billing in MOCK mode.");
  }

  get isMock(): boolean {
    return !this.secret;
  }

  /** Create (or mock) a PaymentIntent. */
  async createPaymentIntent(amountCents: number, kind: string): Promise<PaymentIntentLike> {
    if (this.isMock) {
      const id = `pi_mock_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
      return {
        id,
        clientSecret: `${id}_secret_mock`,
        amountCents,
        currency: "usd",
        status: "requires_payment_method",
        mock: true,
      };
    }
    // TODO: wire Stripe — new Stripe(this.secret).paymentIntents.create({ amount, currency, metadata })
    throw new Error("Live Stripe not wired. Unset STRIPE_SECRET_KEY for mock mode.");
  }

  /** Retry a failed payment — mock returns a fresh intent. */
  async retry(amountCents: number, kind: string): Promise<PaymentIntentLike> {
    return this.createPaymentIntent(amountCents, kind);
  }
}
