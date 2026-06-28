// Consumer store extras (consumer parity): credit packs, gift cards, promo codes.
// Packs and gift cards mint a Stripe PaymentIntent via BillingService; pack buys
// also grant a UserPack and a CreditLedger entry. Member-owned writes run scoped
// by userId; minting Payments and crediting wallets are privileged and use the
// service client with explicit userId/floorId scoping. Packs and promo validation
// read public/global tables with the anon client.
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { OxSupabase } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { randomBytes } from "node:crypto";
import { BillingService } from "../billing/billing.service";
import { SupaService } from "../common/supa.service";
import { WalletService } from "./wallet.service";
import type { BuyGiftCardDto, PromoDto, RedeemGiftCardDto } from "./consumer.dto";

@Injectable()
export class StoreService {
  constructor(
    private readonly supa: SupaService,
    private readonly billing: BillingService,
    private readonly wallet: WalletService,
  ) {}

  // ── Packs ──────────────────────────────────────────────────────────
  /** Public list of active credit packs (global + the floor's, if signed in). */
  async packs(session?: Session) {
    const sb = this.supa.forUser();
    let q = sb.from("Pack").select("*").eq("active", true);
    if (session?.floorId) q = q.or(`floorId.is.null,floorId.eq.${session.floorId}`);
    else q = q.is("floorId", null);
    const { data, error } = await q.order("priceCents", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data ?? [];
  }

  /** Buy a pack: mint a PaymentIntent, grant a UserPack, credit the wallet. */
  async buyPack(session: Session, token: string | undefined, packId: string) {
    const sb = this.supa.forUser(token);
    const { data: pack, error: packErr } = await sb
      .from("Pack")
      .select("*")
      .eq("id", packId)
      .eq("active", true)
      .maybeSingle();
    if (packErr) throw new InternalServerErrorException({ code: "internal", message: packErr.message });
    if (!pack) throw new NotFoundException({ code: "not_found", message: "No pack." });

    const pi = await this.billing.createPaymentIntent(pack.priceCents, "Pack", {
      metadata: { packId: pack.id, userId: session.userId },
    });

    const svc = this.supa.service();
    const { error: payErr } = await svc.from("Payment").insert({
      userId: session.userId,
      floorId: session.floorId ?? "",
      kind: "Pack",
      amountCents: pack.priceCents,
      state: "pending",
      stripePiId: pi.id,
    });
    if (payErr) throw new InternalServerErrorException({ code: "internal", message: payErr.message });

    const { data: userPack, error: upErr } = await svc
      .from("UserPack")
      .insert({ userId: session.userId, packId: pack.id, creditsRemaining: pack.credits })
      .select()
      .single();
    if (upErr) throw new InternalServerErrorException({ code: "internal", message: upErr.message });

    await this.wallet.post(svc, session.userId, pack.credits, "purchase", `Pack ${pack.name}`);
    return { userPack, payment: { clientSecret: pi.clientSecret, mock: pi.mock } };
  }

  // ── Gift cards ─────────────────────────────────────────────────────
  /** Purchase a gift card: mint a PaymentIntent and create the card with balance. */
  async buyGiftCard(session: Session, token: string | undefined, dto: BuyGiftCardDto) {
    if (dto.amountCents <= 0) throw new ForbiddenException({ code: "bad_request", message: "Amount must be positive." });
    const code = `GIFT-${randomBytes(5).toString("hex").toUpperCase()}`;
    const pi = await this.billing.createPaymentIntent(dto.amountCents, "GiftCard", {
      metadata: { userId: session.userId },
    });

    const svc = this.supa.service();
    const { error: payErr } = await svc.from("Payment").insert({
      userId: session.userId,
      floorId: session.floorId ?? "",
      kind: "GiftCard",
      amountCents: dto.amountCents,
      state: "pending",
      stripePiId: pi.id,
    });
    if (payErr) throw new InternalServerErrorException({ code: "internal", message: payErr.message });

    const { data: card, error: cardErr } = await svc
      .from("GiftCard")
      .insert({
        code,
        balanceCents: dto.amountCents,
        initialCents: dto.amountCents,
        purchaserId: session.userId,
        recipientEmail: dto.recipientEmail,
      })
      .select()
      .single();
    if (cardErr) throw new InternalServerErrorException({ code: "internal", message: cardErr.message });
    return { card, payment: { clientSecret: pi.clientSecret, mock: pi.mock } };
  }

  /** Redeem a gift card: zero its balance and credit the redeemer's wallet. */
  async redeemGiftCard(session: Session, token: string | undefined, dto: RedeemGiftCardDto) {
    const svc = this.supa.service();
    const { data: card, error: cardErr } = await svc
      .from("GiftCard")
      .select("*")
      .eq("code", dto.code)
      .maybeSingle();
    if (cardErr) throw new InternalServerErrorException({ code: "internal", message: cardErr.message });
    if (!card) throw new NotFoundException({ code: "not_found", message: "No gift card with that code." });
    if (card.redeemedById || card.balanceCents <= 0) {
      throw new ForbiddenException({ code: "bad_request", message: "This gift card has already been redeemed." });
    }
    const amount = card.balanceCents;
    const { data: updated, error: updErr } = await svc
      .from("GiftCard")
      .update({ balanceCents: 0, redeemedById: session.userId })
      .eq("id", card.id)
      .select()
      .single();
    if (updErr) throw new InternalServerErrorException({ code: "internal", message: updErr.message });
    const ledger = await this.wallet.post(svc, session.userId, amount, "gift", `Gift card ${card.code}`);
    return { card: updated, ledger };
  }

  // ── Promo codes ────────────────────────────────────────────────────
  /**
   * Validate a promo code and compute the discount against the caller's open
   * cart total. Returns { code, kind, discountCents, totalAfterCents }. Does NOT
   * mutate timesRedeemed — that increments on a successful checkout.
   */
  async promo(session: Session, token: string | undefined, dto: PromoDto) {
    const sb = this.supa.forUser(token);
    const promo = await StoreService.validatePromo(sb, dto.code);
    const { data: cart, error: cartErr } = await sb
      .from("Order")
      .select("id")
      .eq("userId", session.userId)
      .eq("state", "cart")
      .maybeSingle();
    if (cartErr) throw new InternalServerErrorException({ code: "internal", message: cartErr.message });
    let subtotal = 0;
    if (cart) {
      const { data: items, error: itemsErr } = await sb
        .from("OrderItem")
        .select("priceCents, qty")
        .eq("orderId", cart.id);
      if (itemsErr) throw new InternalServerErrorException({ code: "internal", message: itemsErr.message });
      subtotal = (items ?? []).reduce((s, i) => s + i.priceCents * i.qty, 0);
    }
    const discountCents = StoreService.computeDiscount(promo, subtotal);
    return {
      code: promo.code,
      kind: promo.kind,
      value: promo.value,
      subtotalCents: subtotal,
      discountCents,
      totalAfterCents: Math.max(0, subtotal - discountCents),
    };
  }

  /** Look up + validate (active, not expired, under maxRedemptions). Throws otherwise. */
  static async validatePromo(sb: OxSupabase, code: string) {
    const { data: promo, error } = await sb
      .from("PromoCode")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    if (!promo || !promo.active) {
      throw new NotFoundException({ code: "not_found", message: "That promo code isn't valid." });
    }
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
      throw new ForbiddenException({ code: "bad_request", message: "That promo code has expired." });
    }
    if (promo.maxRedemptions !== null && promo.timesRedeemed >= promo.maxRedemptions) {
      throw new ForbiddenException({ code: "bad_request", message: "That promo code is fully redeemed." });
    }
    return promo;
  }

  /** Compute the discount in cents for a subtotal (percent or fixed). */
  static computeDiscount(promo: { kind: string; value: number }, subtotalCents: number): number {
    if (promo.kind === "percent") return Math.round(subtotalCents * (promo.value / 100));
    return Math.min(subtotalCents, promo.value);
  }
}
