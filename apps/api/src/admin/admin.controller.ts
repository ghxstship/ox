// Admin-only console. Every route requires the "*" capability (admin). With "*"
// granted, RLS returns the global set, so these are unfiltered platform views.
import { Controller, Get } from "@nestjs/common";
import { Capability, CurrentSession } from "../common/decorators";
import { ScopeRunner } from "../common/scope.runner";
import type { Session } from "../common/session";

@Controller("admin")
export class AdminController {
  constructor(private readonly scope: ScopeRunner) {}

  @Get("floors")
  @Capability("*")
  floors(@CurrentSession() session: Session) {
    return this.scope.run(session, (tx) =>
      tx.floor.findMany({ include: { equipment: true, _count: { select: { classes: true, members: true } } } }),
    );
  }

  @Get("challenges")
  @Capability("*")
  challenges(@CurrentSession() session: Session) {
    return this.scope.run(session, (tx) =>
      tx.challenge.findMany({ include: { _count: { select: { entries: true } } }, orderBy: { startsAt: "asc" } }),
    );
  }

  @Get("staff")
  @Capability("*")
  staff(@CurrentSession() session: Session) {
    return this.scope.run(session, (tx) =>
      tx.user.findMany({
        where: { role: { in: ["coach", "host", "admin"] } },
        select: { id: true, name: true, initial: true, role: true, floorId: true },
        orderBy: { role: "asc" },
      }),
    );
  }

  @Get("analytics")
  @Capability("*")
  analytics(@CurrentSession() session: Session) {
    return this.scope.run(session, async (tx) => {
      const [floors, members, classes, paidAgg, openMemberships] = await Promise.all([
        tx.floor.count(),
        tx.user.count({ where: { role: "member" } }),
        tx.class.count(),
        tx.payment.aggregate({ where: { state: "paid" }, _sum: { amountCents: true } }),
        tx.membership.count({ where: { status: "active" } }),
      ]);
      return {
        floors,
        members,
        classes,
        revenueCents: paidAgg._sum.amountCents ?? 0,
        activeMemberships: openMemberships,
      };
    });
  }
}
