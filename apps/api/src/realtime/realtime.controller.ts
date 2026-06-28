// Server-Sent Events for the realtime channels in 03.
//
//   GET /realtime/floor/:id/attendance   floor:{id}:attendance
//   GET /realtime/class/:id/roster       class:{id}:roster
//   GET /realtime/tribe/:id/feed         tribe:{id}:feed
//   GET /realtime/leaderboard/:scope     leaderboard:{scope}
//
// Each subscription is checked against the caller's RLS visibility BEFORE the
// stream opens: we resolve the underlying row through ScopeRunner so a caller who
// can't see the floor/class can't subscribe to its channel. Members can always
// follow public leaderboards and tribe feeds they belong to.
import { Controller, ForbiddenException, MessageEvent, NotFoundException, Param, Sse } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { map, type Observable } from "rxjs";
import { CurrentSession } from "../common/decorators";
import { ScopeRunner } from "../common/scope.runner";
import { RealtimeBus } from "./realtime.bus";

@Controller("realtime")
export class RealtimeController {
  constructor(
    private readonly bus: RealtimeBus,
    private readonly scope: ScopeRunner,
  ) {}

  @Sse("floor/:id/attendance")
  async floorAttendance(@CurrentSession() session: Session, @Param("id") id: string): Promise<Observable<MessageEvent>> {
    await this.assertVisible(session, "floor", id);
    return this.stream(RealtimeBus.floorAttendance(id));
  }

  @Sse("class/:id/roster")
  async classRoster(@CurrentSession() session: Session, @Param("id") id: string): Promise<Observable<MessageEvent>> {
    await this.assertVisible(session, "class", id);
    return this.stream(RealtimeBus.classRoster(id));
  }

  @Sse("tribe/:id/feed")
  async tribeFeed(@CurrentSession() session: Session, @Param("id") id: string): Promise<Observable<MessageEvent>> {
    await this.assertVisible(session, "tribe", id);
    return this.stream(RealtimeBus.tribeFeed(id));
  }

  @Sse("leaderboard/:scope")
  leaderboard(@CurrentSession() _session: Session, @Param("scope") scope: string): Observable<MessageEvent> {
    // Leaderboards are public to any signed-in member.
    return this.stream(RealtimeBus.leaderboard(scope));
  }

  /** Map bus events into the SSE MessageEvent shape. */
  private stream(channel: string): Observable<MessageEvent> {
    return this.bus.observe(channel).pipe(
      map((evt) => ({ type: evt.type, data: JSON.stringify({ data: evt.data, at: evt.at }) }) as MessageEvent),
    );
  }

  /**
   * RLS visibility gate: load the row under the caller's scope. If RLS hides it,
   * findUnique returns null → 404/403. We never hand-filter; the policy decides.
   */
  private assertVisible(session: Session, kind: "floor" | "class" | "tribe", id: string): Promise<void> {
    return this.scope.run(session, async (tx) => {
      if (kind === "floor") {
        const row = await tx.floor.findUnique({ where: { id } });
        if (!row) throw new ForbiddenException({ code: "forbidden", message: "Floor not visible to you." });
      } else if (kind === "class") {
        const row = await tx.class.findUnique({ where: { id } });
        if (!row) throw new ForbiddenException({ code: "forbidden", message: "Class not visible to you." });
      } else {
        const row = await tx.tribe.findUnique({ where: { id } });
        if (!row) throw new NotFoundException({ code: "not_found", message: "No tribe." });
        if (!row.memberIds.includes(session.userId) && session.role !== "admin") {
          throw new ForbiddenException({ code: "forbidden", message: "Not a member of this tribe." });
        }
      }
    });
  }
}
