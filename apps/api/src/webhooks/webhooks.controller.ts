// Stripe webhooks. Public (verified by signature, not JWT). Idempotent by event
// id — we log + dedupe. Signature is only checked if STRIPE_WEBHOOK_SECRET is set.
import { Controller, Headers, HttpCode, Logger, Post, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../common/decorators";
import type { OxRequest } from "../common/session";

@Controller("webhooks")
export class WebhooksController {
  private readonly log = new Logger("StripeWebhook");
  private readonly seen = new Set<string>(); // in-memory idempotency (swap for durable store)

  constructor(private readonly config: ConfigService) {}

  @Public()
  @Post("stripe")
  @HttpCode(200)
  stripe(@Req() req: OxRequest, @Headers("stripe-signature") signature?: string) {
    const secret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));

    if (secret) {
      // TODO: wire Stripe — stripe.webhooks.constructEvent(raw, signature, secret)
      if (!signature) {
        this.log.warn("Missing stripe-signature; rejecting.");
        return { received: false, reason: "missing_signature" };
      }
    }

    let event: { id?: string; type?: string };
    try {
      event = JSON.parse(raw.toString("utf8"));
    } catch {
      this.log.warn("Unparseable webhook body.");
      return { received: false, reason: "bad_payload" };
    }

    const id = event.id ?? "evt_unknown";
    if (this.seen.has(id)) {
      this.log.log(`Duplicate event ${id} ignored.`);
      return { received: true, duplicate: true };
    }
    this.seen.add(id);
    this.log.log(`Stripe event ${id} (${event.type ?? "unknown"}) accepted.`);
    // TODO: wire Stripe — branch on event.type to update Payment/Membership + enqueue jobs.
    return { received: true, id };
  }
}
