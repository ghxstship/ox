// POS · Desk Sales (11 §B #27). A floor sells Products at the desk; each sale
// becomes a real Payment row (kind "Shop"/"POS") on the host's floor — minted
// through the service-role client with an explicit floor guard, so a host only
// ever rings sales on their own floor. The product catalog is the existing
// Product table (public-read).
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";
import { BillingService } from "../billing/billing.service";

export interface PosLineItem {
  productId: string;
  qty: number;
}

@Injectable()
export class PosService {
  constructor(
    private readonly supa: SupaService,
    private readonly billing: BillingService,
  ) {}

  /** The tap-to-cart catalog — products available to sell at the desk. */
  catalog() {
    return this.supa
      .forUser()
      .from("Product")
      .select("*")
      .order("name", { ascending: true })
      .then((res) => this.supa.unwrap(res, "No product."));
  }

  /**
   * Ring a sale. tender "cash" settles immediately (Payment.paid). tender "card"
   * mints a PaymentIntent and leaves the Payment pending until the webhook
   * confirms it, returning the client secret for the terminal/reader.
   */
  async sale(session: Session, token: string | undefined, input: { items: PosLineItem[]; tender: "cash" | "card"; memberId?: string }) {
    if (!input.items?.length) throw new BadRequestException({ code: "bad_request", message: "No items to sell." });
    const products = this.supa.unwrap(
      await this.supa
        .forUser(token)
        .from("Product")
        .select("*")
        .in("id", input.items.map((i) => i.productId)),
      "No product.",
    );
    const byId = new Map(products.map((p) => [p.id, p]));
    let totalCents = 0;
    for (const item of input.items) {
      const p = byId.get(item.productId);
      if (!p) throw new NotFoundException({ code: "not_found", message: `No product ${item.productId}.` });
      totalCents += p.priceCents * Math.max(1, item.qty);
    }

    const floorId = session.floorId ?? "";
    // The buyer is the named member if given, else the operator (walk-in desk sale).
    const buyerId = input.memberId ?? session.userId;
    const svc = this.supa.service();

    if (input.tender === "cash") {
      const payment = this.supa.unwrap(
        await svc
          .from("Payment")
          .insert({ userId: buyerId, floorId, kind: "POS", amountCents: totalCents, state: "paid" })
          .select()
          .single(),
        "No product.",
      );
      return { payment, totalCents, tender: "cash", receipt: this.receipt(payment.id, totalCents) };
    }

    const pi = await this.billing.createPaymentIntent(totalCents, "POS", { metadata: { floorId } });
    const payment = this.supa.unwrap(
      await svc
        .from("Payment")
        .insert({ userId: buyerId, floorId, kind: "POS", amountCents: totalCents, state: "pending", stripePiId: pi.id })
        .select()
        .single(),
      "No product.",
    );
    return { payment, totalCents, tender: "card", clientSecret: pi.clientSecret, mock: pi.mock, receipt: this.receipt(payment.id, totalCents) };
  }

  private receipt(paymentId: string, totalCents: number) {
    return { paymentId, totalCents, at: new Date().toISOString() };
  }
}
