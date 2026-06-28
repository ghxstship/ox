// Commerce (Alo parity). Products are public but gated drops are filtered by the
// viewer's level. Cart/Order rows are owner-scoped via ScopeRunner (RLS).
import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma, Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { BillingService } from "../billing/billing.service";
import { ScopeRunner } from "../common/scope.runner";
import { StoreService } from "../consumer/store.service";
import type { AddCartItemDto } from "./commerce.dto";

@Injectable()
export class CommerceService {
  constructor(
    private readonly scope: ScopeRunner,
    private readonly billing: BillingService,
  ) {}

  /** List products visible to the viewer: gateLevel must be <= the viewer's level. */
  async products(session: Session | undefined, collection?: string) {
    // The JWT carries no level, so resolve it from the DB when signed in.
    let level = session?.level ?? 0;
    if (session && level === 0) {
      const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { level: true } });
      level = user?.level ?? 0;
    }
    const all = await prisma.product.findMany({
      where: collection ? { collection } : undefined,
      orderBy: { priceCents: "asc" },
    });
    return all.filter((p) => p.gateLevel <= level);
  }

  /** The caller's open cart (Order in `cart` state), created lazily. */
  cart(session: Session) {
    return this.scope.run(session, async (tx) => {
      const cart = await tx.order.findFirst({
        where: { userId: session.userId, state: "cart" },
        include: { items: true },
      });
      return cart ?? { id: null, userId: session.userId, state: "cart", totalCents: 0, items: [] };
    });
  }

  addItem(session: Session, dto: AddCartItemDto) {
    return this.scope.run(session, async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException({ code: "not_found", message: "No product." });

      let cart = await tx.order.findFirst({ where: { userId: session.userId, state: "cart" } });
      cart ??= await tx.order.create({ data: { userId: session.userId, state: "cart", totalCents: 0 } });

      const qty = dto.qty ?? 1;
      await tx.orderItem.create({
        data: { orderId: cart.id, productId: product.id, size: dto.size, qty, priceCents: product.priceCents },
      });
      return this.recount(tx, cart.id);
    });
  }

  removeItem(session: Session, itemId: string) {
    return this.scope.run(session, async (tx) => {
      const item = await tx.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });
      if (!item || item.order.userId !== session.userId) {
        throw new NotFoundException({ code: "not_found", message: "No cart item." });
      }
      await tx.orderItem.delete({ where: { id: itemId } });
      return this.recount(tx, item.orderId);
    });
  }

  /**
   * Place the cart: total it, apply an optional promo code, mint a PaymentIntent,
   * move to `placed`, write Payment(pending). A valid promo increments its
   * timesRedeemed only on this successful checkout.
   */
  checkout(session: Session, promoCode?: string) {
    return this.scope.run(session, async (tx) => {
      const cart = await tx.order.findFirst({
        where: { userId: session.userId, state: "cart" },
        include: { items: true },
      });
      if (!cart || cart.items.length === 0) {
        throw new NotFoundException({ code: "not_found", message: "Cart is empty." });
      }
      const subtotal = cart.items.reduce((s, i) => s + i.priceCents * i.qty, 0);
      let total = subtotal;
      let discountCents = 0;
      if (promoCode) {
        const promo = await StoreService.validatePromo(tx, promoCode);
        discountCents = StoreService.computeDiscount(promo, subtotal);
        total = Math.max(0, subtotal - discountCents);
        await tx.promoCode.update({ where: { id: promo.id }, data: { timesRedeemed: { increment: 1 } } });
      }
      const pi = await this.billing.createPaymentIntent(total, "Shop");

      const order = await tx.order.update({
        where: { id: cart.id },
        data: { state: "placed", totalCents: total, placedAt: new Date() },
        include: { items: true },
      });
      const payment = await tx.payment.create({
        data: {
          userId: session.userId,
          floorId: session.floorId ?? "",
          kind: "Shop",
          amountCents: total,
          state: "pending",
          stripePiId: pi.id,
        },
      });
      return {
        order,
        subtotalCents: subtotal,
        discountCents,
        totalCents: total,
        payment: { id: payment.id, clientSecret: pi.clientSecret, mock: pi.mock },
      };
    });
  }

  private async recount(tx: Prisma.TransactionClient, orderId: string) {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    const total = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
    return tx.order.update({ where: { id: orderId }, data: { totalCents: total }, include: { items: true } });
  }
}
