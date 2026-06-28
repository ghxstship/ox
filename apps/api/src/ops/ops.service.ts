// Operator / CRM / billing. Every list is RLS-scoped (host=floor, coach=roster,
// admin=all) — we never hand-filter; ScopeRunner sets the GUCs and the policies
// return only the visible rows.
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { BillingService } from "../billing/billing.service";
import { ScopeRunner } from "../common/scope.runner";

@Injectable()
export class OpsService {
  constructor(
    private readonly scope: ScopeRunner,
    private readonly billing: BillingService,
  ) {}

  /** Members — RLS scopes the set (self / roster / floor / all). */
  members(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.user.findMany({
        where: { role: "member" },
        select: { id: true, name: true, initial: true, level: true, xp: true, floorId: true, coachId: true },
        orderBy: { name: "asc" },
      }),
    );
  }

  member(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        include: { memberships: true, bookings: { include: { class: true } }, payments: true },
      });
      if (!user) throw new NotFoundException({ code: "not_found", message: "No member (or out of scope)." });
      return user;
    });
  }

  /** Coach roster — members coached by the caller (RLS enforces coachId == me). */
  clients(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.user.findMany({
        where: { role: "member" },
        select: { id: true, name: true, initial: true, level: true, xp: true, floorId: true, coachId: true },
        orderBy: { name: "asc" },
      }),
    );
  }

  payments(session: Session) {
    return this.scope.run(session, (tx) => tx.payment.findMany({ orderBy: { at: "desc" } }));
  }

  /**
   * Retry a failed payment via Stripe (Payment state machine: failed → pending).
   * Live mode reuses the original PaymentIntent if it is still retriable, else
   * mints a fresh one; mock mode mints a fake intent. Returns the fresh client
   * secret so the operator UI can collect a new payment method.
   */
  retryPayment(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const pay = await tx.payment.findUnique({ where: { id } });
      if (!pay) throw new NotFoundException({ code: "not_found", message: "No payment (or out of scope)." });
      const pi = await this.billing.retry(pay.amountCents, pay.kind, pay.stripePiId ?? undefined);
      const updated = await tx.payment.update({
        where: { id },
        data: { state: "pending", stripePiId: pi.id },
      });
      return { payment: updated, clientSecret: pi.clientSecret, mock: pi.mock };
    });
  }

  memberships(session: Session) {
    return this.scope.run(session, (tx) => tx.membership.findMany({ orderBy: { createdAt: "desc" } }));
  }

  /**
   * Subscribe a member to a tier (Membership state machine: (none) → active).
   * Ensures a Stripe Customer, creates a Subscription (priceId from the tier
   * mapping / env), and writes the Membership row. Mock mode returns a fake sub.
   */
  subscribe(session: Session, input: { userId: string; floorId: string; tier: string; priceId?: string; addOns?: string[] }) {
    return this.scope.run(session, async (tx) => {
      const user = await tx.user.findUnique({ where: { id: input.userId } });
      if (!user) throw new NotFoundException({ code: "not_found", message: "No member (or out of scope)." });

      const customer = await this.billing.ensureCustomer(user.id, user.email, user.name);
      const priceId = input.priceId ?? `price_${input.tier}`; // tier→price map in prod config
      const sub = await this.billing.createSubscription(customer.id, priceId, { userId: user.id, tier: input.tier });

      const membership = await tx.membership.create({
        data: {
          userId: input.userId,
          floorId: input.floorId,
          tier: input.tier as Prisma.MembershipCreateInput["tier"],
          addOns: input.addOns ?? [],
          status: sub.status === "active" ? "active" : "pending",
          renewsAt: sub.currentPeriodEnd,
          stripeSubId: sub.id,
        },
      });
      return { membership, clientSecret: sub.latestInvoicePaymentIntentClientSecret, mock: sub.mock };
    });
  }

  /**
   * Update a membership lifecycle: pause | resume | cancel (cancel at period
   * end → access ends later). Mirrors the Membership state machine in 05.
   */
  updateMembership(session: Session, id: string, action: "pause" | "resume" | "cancel") {
    return this.scope.run(session, async (tx) => {
      const membership = await tx.membership.findUnique({ where: { id } });
      if (!membership) throw new NotFoundException({ code: "not_found", message: "No membership (or out of scope)." });

      let status = membership.status;
      if (membership.stripeSubId) {
        if (action === "pause") await this.billing.pauseSubscription(membership.stripeSubId, true);
        if (action === "resume") await this.billing.pauseSubscription(membership.stripeSubId, false);
        if (action === "cancel") await this.billing.cancelSubscription(membership.stripeSubId, true);
      }
      if (action === "pause") status = "paused";
      if (action === "resume") status = "active";
      if (action === "cancel") status = "cancelled";

      return tx.membership.update({ where: { id }, data: { status } });
    });
  }

  /** Named reports — aggregate over the RLS-visible rows only. */
  report(session: Session, name: string) {
    return this.scope.run(session, async (tx) => {
      switch (name) {
        case "revenue": {
          const paid = await tx.payment.findMany({ where: { state: "paid" } });
          const totalCents = paid.reduce((s, p) => s + p.amountCents, 0);
          return { name, totalCents, count: paid.length };
        }
        case "utilization": {
          const classes = await tx.class.count();
          const bookings = await tx.booking.count({ where: { state: { in: ["booked", "attended"] } } });
          return { name, classes, bookings };
        }
        case "retention": {
          const active = await tx.membership.count({ where: { status: "active" } });
          const total = await tx.membership.count();
          return { name, active, total, rate: total ? active / total : 0 };
        }
        case "demographics": {
          const byTier = await tx.membership.groupBy({ by: ["tier"], _count: { _all: true } });
          return { name, byTier };
        }
        default:
          throw new NotFoundException({ code: "not_found", message: `Unknown report: ${name}.` });
      }
    });
  }
}
