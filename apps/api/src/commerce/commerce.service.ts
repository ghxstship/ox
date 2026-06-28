// Commerce (Alo parity). Products are public but gated drops are filtered by the
// viewer's level. Cart/Order rows are owner-scoped via supa.forUser(token) (RLS).
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { OxSupabase } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { BillingService } from "../billing/billing.service";
import { SupaService } from "../common/supa.service";
import { StoreService } from "../consumer/store.service";
import type { AddCartItemDto } from "./commerce.dto";

@Injectable()
export class CommerceService {
  constructor(
    private readonly supa: SupaService,
    private readonly billing: BillingService,
  ) {}

  /** List products visible to the viewer: gateLevel must be <= the viewer's level. */
  async products(session: Session | undefined, token: string | undefined, collection?: string) {
    const sb = this.supa.forUser(token);
    // The session carries no guaranteed level, so resolve it from the DB when signed in.
    let level = session?.level ?? 0;
    if (session && level === 0) {
      const { data: user } = await sb.from("User").select("level").eq("id", session.userId).maybeSingle();
      level = user?.level ?? 0;
    }
    let q = sb.from("Product").select("*").order("priceCents", { ascending: true });
    if (collection) q = q.eq("collection", collection);
    const { data: all, error } = await q;
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return (all ?? []).filter((p) => p.gateLevel <= level);
  }

  /** The caller's open cart (Order in `cart` state), created lazily. */
  async cart(session: Session, token: string | undefined) {
    const sb = this.supa.forUser(token);
    const { data: cart } = await sb
      .from("Order")
      .select("*")
      .eq("userId", session.userId)
      .eq("state", "cart")
      .maybeSingle();
    if (!cart) return { id: null, userId: session.userId, state: "cart", totalCents: 0, items: [] };
    const { data: items } = await sb.from("OrderItem").select("*").eq("orderId", cart.id);
    return { ...cart, items: items ?? [] };
  }

  async addItem(session: Session, token: string | undefined, dto: AddCartItemDto) {
    const sb = this.supa.forUser(token);
    const { data: product } = await sb.from("Product").select("*").eq("id", dto.productId).maybeSingle();
    if (!product) throw new NotFoundException({ code: "not_found", message: "No product." });

    let { data: cart } = await sb
      .from("Order")
      .select("*")
      .eq("userId", session.userId)
      .eq("state", "cart")
      .maybeSingle();
    if (!cart) {
      const { data: created, error } = await sb
        .from("Order")
        .insert({ userId: session.userId, state: "cart", totalCents: 0 })
        .select()
        .single();
      if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
      cart = created;
    }

    const qty = dto.qty ?? 1;
    const { error: itemErr } = await sb.from("OrderItem").insert({
      orderId: cart.id,
      productId: product.id,
      size: dto.size,
      qty,
      priceCents: product.priceCents,
    });
    if (itemErr) throw new InternalServerErrorException({ code: "internal", message: itemErr.message });
    return this.recount(sb, cart.id);
  }

  async removeItem(session: Session, token: string | undefined, itemId: string) {
    const sb = this.supa.forUser(token);
    const { data: item } = await sb.from("OrderItem").select("*").eq("id", itemId).maybeSingle();
    if (!item) throw new NotFoundException({ code: "not_found", message: "No cart item." });
    const { data: order } = await sb.from("Order").select("userId").eq("id", item.orderId).maybeSingle();
    if (!order || order.userId !== session.userId) {
      throw new NotFoundException({ code: "not_found", message: "No cart item." });
    }
    const { error } = await sb.from("OrderItem").delete().eq("id", itemId);
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return this.recount(sb, item.orderId);
  }

  /**
   * Place the cart: total it, apply an optional promo code, mint a PaymentIntent,
   * move to `placed`, write Payment(pending). A valid promo increments its
   * timesRedeemed only on this successful checkout.
   */
  async checkout(session: Session, token: string | undefined, promoCode?: string) {
    const sb = this.supa.forUser(token);
    const { data: cart } = await sb
      .from("Order")
      .select("*")
      .eq("userId", session.userId)
      .eq("state", "cart")
      .maybeSingle();
    const { data: items } = cart
      ? await sb.from("OrderItem").select("*").eq("orderId", cart.id)
      : { data: [] as { priceCents: number; qty: number }[] };
    if (!cart || !items || items.length === 0) {
      throw new NotFoundException({ code: "not_found", message: "Cart is empty." });
    }
    const subtotal = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
    let total = subtotal;
    let discountCents = 0;
    if (promoCode) {
      const promo = await StoreService.validatePromo(sb, promoCode);
      discountCents = StoreService.computeDiscount(promo, subtotal);
      total = Math.max(0, subtotal - discountCents);
      await sb.from("PromoCode").update({ timesRedeemed: promo.timesRedeemed + 1 }).eq("id", promo.id);
    }
    const pi = await this.billing.createPaymentIntent(total, "Shop");

    const { data: order, error: ordErr } = await sb
      .from("Order")
      .update({ state: "placed", totalCents: total, placedAt: new Date().toISOString() })
      .eq("id", cart.id)
      .select()
      .single();
    if (ordErr) throw new InternalServerErrorException({ code: "internal", message: ordErr.message });
    const { data: orderItems } = await sb.from("OrderItem").select("*").eq("orderId", cart.id);

    // Minting a Payment is privileged → service() client, scoped explicitly.
    const { data: payment, error: payErr } = await this.supa
      .service()
      .from("Payment")
      .insert({
        userId: session.userId,
        floorId: session.floorId ?? "",
        kind: "Shop",
        amountCents: total,
        state: "pending",
        stripePiId: pi.id,
      })
      .select()
      .single();
    if (payErr) throw new InternalServerErrorException({ code: "internal", message: payErr.message });

    return {
      order: { ...order, items: orderItems ?? [] },
      subtotalCents: subtotal,
      discountCents,
      totalCents: total,
      payment: { id: payment.id, clientSecret: pi.clientSecret, mock: pi.mock },
    };
  }

  private async recount(sb: OxSupabase, orderId: string) {
    const { data: items } = await sb.from("OrderItem").select("*").eq("orderId", orderId);
    const total = (items ?? []).reduce((s, i) => s + i.priceCents * i.qty, 0);
    const { data: order, error } = await sb
      .from("Order")
      .update({ totalCents: total })
      .eq("id", orderId)
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { ...order, items: items ?? [] };
  }
}
