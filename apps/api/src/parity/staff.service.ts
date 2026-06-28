// Staff Scheduling / Shifts (11 §B #28, models `Shift`/`Availability` in 11 §C).
//
// No Shift table in the live DB, so shifts are held in an in-memory store scoped
// by floor (host sees their floor; coach sees their own shifts; admin sees all).
// Cover requests flip a flag the schedule grid surfaces. Same surface ports to
// Prisma + ScopeRunner when the tables land.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { randomUUID } from "node:crypto";

export type ShiftKind = "class" | "floor" | "open";

export interface Shift {
  id: string;
  floorId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  kind: ShiftKind;
  coverRequested: boolean;
}

@Injectable()
export class StaffService {
  private readonly store = new Map<string, Shift>();

  private visible(session: Session, s: Shift): boolean {
    if (session.role === "admin") return true;
    if (session.role === "host") return s.floorId === session.floorId;
    if (session.role === "coach") return s.staffId === session.userId;
    return false;
  }

  list(session: Session): Shift[] {
    return [...this.store.values()]
      .filter((s) => this.visible(session, s))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  create(session: Session, input: { staffId?: string; startsAt: string; endsAt: string; kind?: ShiftKind; floorId?: string }): Shift {
    const floorId =
      session.role === "admin" ? input.floorId ?? session.floorId ?? "" : session.floorId ?? "";
    if (!floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    const shift: Shift = {
      id: `shift_${randomUUID()}`,
      floorId,
      staffId: input.staffId ?? session.userId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      kind: input.kind ?? "floor",
      coverRequested: false,
    };
    this.store.set(shift.id, shift);
    return shift;
  }

  requestCover(session: Session, id: string): Shift {
    const shift = this.store.get(id);
    if (!shift || !this.visible(session, shift)) throw new NotFoundException({ code: "not_found", message: "No shift." });
    shift.coverRequested = true;
    return shift;
  }
}
