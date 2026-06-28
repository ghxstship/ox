// Operator / CRM / billing. Every list is RLS-scoped (host=floor, coach=roster,
// admin=all) — we never hand-filter; ScopeRunner sets the GUCs and the policies
// return only the visible rows.
import { Injectable, NotFoundException } from "@nestjs/common";
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

  /** Retry a failed payment via Stripe (mock). Moves it back to pending. */
  retryPayment(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const pay = await tx.payment.findUnique({ where: { id } });
      if (!pay) throw new NotFoundException({ code: "not_found", message: "No payment (or out of scope)." });
      const pi = await this.billing.retry(pay.amountCents, pay.kind);
      return tx.payment.update({
        where: { id },
        data: { state: "pending", stripePiId: pi.id },
      });
    });
  }

  memberships(session: Session) {
    return this.scope.run(session, (tx) => tx.membership.findMany({ orderBy: { createdAt: "desc" } }));
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
