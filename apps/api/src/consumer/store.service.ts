// Consumer store extras (consumer parity): credit packs, gift cards, promo codes.
// Packs and gift cards mint a Stripe PaymentIntent via BillingService; pack buys
// also grant a UserPack and a CreditLedger entry. Member-owned writes run through
// ScopeRunner (RLS) scoped by userId. Packs and promo validation read public/
// global tables with the bare client.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { randomBytes } from "node:crypto";
import { BillingService } from "../billing/billing.service";
import { ScopeRunner } from "../common/scope.runner";
import { WalletService } from "./wallet.service";
import type { BuyGiftCardDto, PromoDto, RedeemGiftCardDto } from "./consumer.dto";

@Injectable()
export class StoreService {
  constructor(
    private readonly scope: ScopeRunner,
    private readonly billing: BillingService,
    private readonly wallet: WalletService,
  ) {}

  // ── Packs ──────────────────────────────────────────────────────────
  /** Public list of active credit packs (global + the floor's, if signed in). */
  packs(session?: Session) {
    const where: Prisma.PackWhereInput = { active: true };
    if (session?.floorId) where.OR = [{ floorId: null }, { floorId: session.floorId }];
    else where.floorId = null;
    return prisma.pack.findMany({ where, orderBy: { priceCents: "asc" } });
  }

  /** Buy a pack: mint a PaymentIntent, grant a UserPack, credit the wallet. */
  buyPack(session: Session, packId: string) {
    return this.scope.run(session, async (tx) => {
      const pack = await tx.pack.findFirst({ where: { id: packId, active: true } });
      if (!pack) throw new NotFoundException({ code: "not_found", message: "No pack." });

      const pi = await this.billing.createPaymentIntent(pack.priceCents, "Pack", {
        metadata: { packId: pack.id, userId: session.userId },
      });
      await tx.payment.create({
        data: {
          userId: session.userId,
          floorId: session.floorId ?? "",
          kind: "Pack",
          amountCents: pack.priceCents,
          state: "pending",
          stripePiId: pi.id,
        },
      });
      const userPack = await tx.userPack.create({
        data: { userId: session.userId, packId: pack.id, creditsRemaining: pack.credits },
      });
      await this.wallet.post(tx, session.userId, pack.credits, "purchase", `Pack ${pack.name}`);
      return { userPack, payment: { clientSecret: pi.clientSecret, mock: pi.mock } };
    });
  }

  // ── Gift cards ─────────────────────────────────────────────────────
  /** Purchase a gift card: mint a PaymentIntent and create the card with balance. */
  buyGiftCard(session: Session, dto: BuyGiftCardDto) {
    if (dto.amountCents <= 0) throw new ForbiddenException({ code: "bad_request", message: "Amount must be positive." });
    return this.scope.run(session, async (tx) => {
      const code = `GIFT-${randomBytes(5).toString("hex").toUpperCase()}`;
      const pi = await this.billing.createPaymentIntent(dto.amountCents, "GiftCard", {
        metadata: { userId: session.userId },
      });
      await tx.payment.create({
        data: {
          userId: session.userId,
          floorId: session.floorId ?? "",
          kind: "GiftCard",
          amountCents: dto.amountCents,
          state: "pending",
          stripePiId: pi.id,
        },
      });
      const card = await tx.giftCard.create({
        data: {
          code,
          balanceCents: dto.amountCents,
          initialCents: dto.amountCents,
          purchaserId: session.userId,
          recipientEmail: dto.recipientEmail,
        },
      });
      return { card, payment: { clientSecret: pi.clientSecret, mock: pi.mock } };
    });
  }

  /** Redeem a gift card: zero its balance and credit the redeemer's wallet. */
  redeemGiftCard(session: Session, dto: RedeemGiftCardDto) {
    return this.scope.run(session, async (tx) => {
      const card = await tx.giftCard.findUnique({ where: { code: dto.code } });
      if (!card) throw new NotFoundException({ code: "not_found", message: "No gift card with that code." });
      if (card.redeemedById || card.balanceCents <= 0) {
        throw new ForbiddenException({ code: "bad_request", message: "This gift card has already been redeemed." });
      }
      const amount = card.balanceCents;
      const updated = await tx.giftCard.update({
        where: { id: card.id },
        data: { balanceCents: 0, redeemedById: session.userId },
      });
      const ledger = await this.wallet.post(tx, session.userId, amount, "gift", `Gift card ${card.code}`);
      return { card: updated, ledger };
    });
  }

  // ── Promo codes ────────────────────────────────────────────────────
  /**
   * Validate a promo code and compute the discount against the caller's open
   * cart total. Returns { code, kind, discountCents, totalAfterCents }. Does NOT
   * mutate timesRedeemed — that increments on a successful checkout.
   */
  promo(session: Session, dto: PromoDto) {
    return this.scope.run(session, async (tx) => {
      const promo = await StoreService.validatePromo(tx, dto.code);
      const cart = await tx.order.findFirst({
        where: { userId: session.userId, state: "cart" },
        include: { items: true },
      });
      const subtotal = cart?.items.reduce((s, i) => s + i.priceCents * i.qty, 0) ?? 0;
      const discountCents = StoreService.computeDiscount(promo, subtotal);
      return {
        code: promo.code,
        kind: promo.kind,
        value: promo.value,
        subtotalCents: subtotal,
        discountCents,
        totalAfterCents: Math.max(0, subtotal - discountCents),
      };
    });
  }

  /** Look up + validate (active, not expired, under maxRedemptions). Throws otherwise. */
  static async validatePromo(tx: Prisma.TransactionClient, code: string) {
    const promo = await tx.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.active) {
      throw new NotFoundException({ code: "not_found", message: "That promo code isn't valid." });
    }
    if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
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
