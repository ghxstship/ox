// Staff Scheduling / Shifts (11 §B #28, model `Shift` in 11 §C).
//
// Now persisted to the live DB via ScopeRunner so RLS applies. We also scope
// explicitly: host sees their floor; coach sees their own shifts; admin sees all.
// Cover requests flip a flag the schedule grid surfaces.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { type Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";

export type ShiftKind = "class" | "floor" | "open";

@Injectable()
export class StaffService {
  constructor(private readonly scope: ScopeRunner) {}

  private scopeWhere(session: Session): Prisma.ShiftWhereInput {
    if (session.role === "admin") return {};
    if (session.role === "host") return { floorId: session.floorId ?? "__none__" };
    if (session.role === "coach") return { staffId: session.userId };
    return { id: "__none__" };
  }

  list(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.shift.findMany({ where: this.scopeWhere(session), orderBy: { startsAt: "asc" } }),
    );
  }

  create(session: Session, input: { staffId?: string; startsAt: string; endsAt: string; kind?: ShiftKind; floorId?: string }) {
    const floorId =
      session.role === "admin" ? input.floorId ?? session.floorId ?? "" : session.floorId ?? "";
    if (!floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return this.scope.run(session, (tx) =>
      tx.shift.create({
        data: {
          floorId,
          staffId: input.staffId ?? session.userId,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
          kind: input.kind ?? "floor",
          coverRequested: false,
        },
      }),
    );
  }

  requestCover(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const shift = await tx.shift.findFirst({ where: { id, ...this.scopeWhere(session) } });
      if (!shift) throw new NotFoundException({ code: "not_found", message: "No shift." });
      return tx.shift.update({ where: { id }, data: { coverRequested: true } });
    });
  }
}
