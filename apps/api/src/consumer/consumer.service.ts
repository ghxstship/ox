// Consumer parity surfaces (11 §B consumer side). Notifications, body metrics,
// wishlist, product reviews, shipping addresses, waivers, health connections,
// guest passes, onboarding — every member-owned table is scoped by
// `userId = session.userId` through ScopeRunner (RLS) with explicit userId
// filters so a member only ever touches their own rows.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { randomBytes } from "node:crypto";
import { ScopeRunner } from "../common/scope.runner";
import type {
  ConnectHealthDto,
  CreateAddressDto,
  CreateBodyMetricDto,
  CreateReviewDto,
  UpdateAddressDto,
  UpsertOnboardingDto,
} from "./consumer.dto";

export type HealthProvider = "apple_health" | "google_fit" | "garmin" | "whoop" | "fitbit";

@Injectable()
export class ConsumerService {
  constructor(private readonly scope: ScopeRunner) {}

  // ── Notifications ──────────────────────────────────────────────────
  notifications(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.notification.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } }),
    );
  }

  markNotificationRead(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const note = await tx.notification.findFirst({ where: { id, userId: session.userId } });
      if (!note) throw new NotFoundException({ code: "not_found", message: "No notification." });
      return tx.notification.update({ where: { id }, data: { read: true } });
    });
  }

  markAllNotificationsRead(session: Session) {
    return this.scope.run(session, async (tx) => {
      const res = await tx.notification.updateMany({
        where: { userId: session.userId, read: false },
        data: { read: true },
      });
      return { updated: res.count };
    });
  }

  // ── Body metrics ───────────────────────────────────────────────────
  bodyMetrics(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.bodyMetric.findMany({ where: { userId: session.userId }, orderBy: { at: "desc" } }),
    );
  }

  addBodyMetric(session: Session, dto: CreateBodyMetricDto) {
    return this.scope.run(session, (tx) =>
      tx.bodyMetric.create({
        data: {
          userId: session.userId,
          weightLb: dto.weightLb,
          bodyFatPct: dto.bodyFatPct,
          restingHr: dto.restingHr,
          notes: dto.notes,
        },
      }),
    );
  }

  // ── Wishlist ───────────────────────────────────────────────────────
  wishlist(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.wishlistItem.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } }),
    );
  }

  addWishlist(session: Session, productId: string) {
    return this.scope.run(session, (tx) =>
      tx.wishlistItem.upsert({
        where: { userId_productId: { userId: session.userId, productId } },
        create: { userId: session.userId, productId },
        update: {},
      }),
    );
  }

  removeWishlist(session: Session, productId: string) {
    return this.scope.run(session, async (tx) => {
      await tx.wishlistItem.deleteMany({ where: { userId: session.userId, productId } });
      return { removed: true };
    });
  }

  // ── Product reviews ────────────────────────────────────────────────
  // Public read — no session needed; uses the bare client.
  productReviews(productId: string) {
    return prisma.productReview.findMany({ where: { productId }, orderBy: { createdAt: "desc" } });
  }

  addReview(session: Session, productId: string, dto: CreateReviewDto) {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new ForbiddenException({ code: "bad_request", message: "Rating must be 1–5." });
    }
    return this.scope.run(session, (tx) =>
      tx.productReview.upsert({
        where: { productId_userId: { productId, userId: session.userId } },
        create: { productId, userId: session.userId, rating: dto.rating, title: dto.title, body: dto.body ?? "" },
        update: { rating: dto.rating, title: dto.title, body: dto.body ?? "" },
      }),
    );
  }

  // ── Shipping addresses ─────────────────────────────────────────────
  addresses(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.shippingAddress.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } }),
    );
  }

  createAddress(session: Session, dto: CreateAddressDto) {
    return this.scope.run(session, async (tx) => {
      if (dto.isDefault) {
        await tx.shippingAddress.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
      }
      return tx.shippingAddress.create({
        data: {
          userId: session.userId,
          name: dto.name,
          line1: dto.line1,
          line2: dto.line2,
          city: dto.city,
          region: dto.region,
          postal: dto.postal,
          country: dto.country ?? "US",
          phone: dto.phone,
          isDefault: dto.isDefault ?? false,
        },
      });
    });
  }

  updateAddress(session: Session, id: string, dto: UpdateAddressDto) {
    return this.scope.run(session, async (tx) => {
      const existing = await tx.shippingAddress.findFirst({ where: { id, userId: session.userId } });
      if (!existing) throw new NotFoundException({ code: "not_found", message: "No address." });
      if (dto.isDefault) {
        await tx.shippingAddress.updateMany({ where: { userId: session.userId }, data: { isDefault: false } });
      }
      const data: Prisma.ShippingAddressUpdateInput = {
        name: dto.name,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        region: dto.region,
        postal: dto.postal,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault,
      };
      return tx.shippingAddress.update({ where: { id }, data });
    });
  }

  deleteAddress(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const res = await tx.shippingAddress.deleteMany({ where: { id, userId: session.userId } });
      if (res.count === 0) throw new NotFoundException({ code: "not_found", message: "No address." });
      return { removed: true };
    });
  }

  // ── Waivers ────────────────────────────────────────────────────────
  // Floor waivers (or global, floorId null) — visible to the member on their floor.
  waivers(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.waiver.findMany({
        where: { OR: [{ floorId: null }, { floorId: session.floorId ?? "__none__" }] },
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  signWaiver(session: Session, waiverId: string) {
    return this.scope.run(session, async (tx) => {
      const waiver = await tx.waiver.findUnique({ where: { id: waiverId } });
      if (!waiver) throw new NotFoundException({ code: "not_found", message: "No waiver." });
      return tx.waiverSignature.upsert({
        where: { waiverId_userId: { waiverId, userId: session.userId } },
        create: { waiverId, userId: session.userId },
        update: {},
      });
    });
  }

  signedWaivers(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.waiverSignature.findMany({ where: { userId: session.userId }, orderBy: { signedAt: "desc" } }),
    );
  }

  // ── Health connections ─────────────────────────────────────────────
  healthConnections(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.healthConnection.findMany({ where: { userId: session.userId }, orderBy: { connectedAt: "desc" } }),
    );
  }

  connectHealth(session: Session, dto: ConnectHealthDto) {
    return this.scope.run(session, (tx) =>
      tx.healthConnection.upsert({
        where: { userId_provider: { userId: session.userId, provider: dto.provider } },
        create: { userId: session.userId, provider: dto.provider, status: "connected" },
        update: { status: "connected", connectedAt: new Date() },
      }),
    );
  }

  disconnectHealth(session: Session, provider: HealthProvider) {
    return this.scope.run(session, async (tx) => {
      await tx.healthConnection.deleteMany({ where: { userId: session.userId, provider } });
      return { disconnected: true };
    });
  }

  // ── Guest passes ───────────────────────────────────────────────────
  guestPasses(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.guestPass.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } }),
    );
  }

  mintGuestPass(session: Session, guestName?: string) {
    const code = `OX-${randomBytes(4).toString("hex").toUpperCase()}`;
    // Passes lapse after 30 days — a sensible OX default for a single visit.
    const expiresAt = new Date(Date.now() + 30 * 86_400_000);
    return this.scope.run(session, (tx) =>
      tx.guestPass.create({ data: { userId: session.userId, code, guestName, expiresAt } }),
    );
  }

  // ── Onboarding ─────────────────────────────────────────────────────
  onboarding(session: Session) {
    return this.scope.run(session, async (tx) => {
      const state = await tx.onboardingState.findUnique({ where: { userId: session.userId } });
      return state ?? { userId: session.userId, step: 0, completed: false, data: {}, updatedAt: new Date() };
    });
  }

  upsertOnboarding(session: Session, dto: UpsertOnboardingDto) {
    const data = (dto.data ?? {}) as Prisma.InputJsonValue;
    return this.scope.run(session, (tx) =>
      tx.onboardingState.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          step: dto.step ?? 0,
          completed: dto.completed ?? false,
          data,
          updatedAt: new Date(),
        },
        update: {
          ...(dto.step !== undefined ? { step: dto.step } : {}),
          ...(dto.completed !== undefined ? { completed: dto.completed } : {}),
          ...(dto.data !== undefined ? { data } : {}),
          updatedAt: new Date(),
        },
      }),
    );
  }
}
