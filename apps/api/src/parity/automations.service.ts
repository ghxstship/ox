// Automation Builder (11 §B #26, models `Automation`/`AutomationRun` in 11 §C).
//
// Rules: { trigger, action, delayHours, enabled } scoped to a floor. A minimal
// trigger runner `fire(floorId, trigger, payload)` is invoked by the rest of the
// API on real events (signup, booking) and records an AutomationRun per enabled
// matching rule. Actions are logged (the real side effect — send email / SMS /
// add tag — plugs in where noted).
//
// Now persisted to the live DB: rule CRUD runs through ScopeRunner (RLS — host
// sees their floor, admin all), with an explicit floor `where`/`data` to keep
// tenants apart even though the API connects with elevated creds. `fire` runs in
// trusted server context (no session — fired by domain events), so it uses the
// bare prisma client and filters by floorId itself.
import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";

export type AutomationTrigger = "signup" | "booking" | "missed_class" | "membership_lapsed";

@Injectable()
export class AutomationsService {
  private readonly log = new Logger("Automations");

  constructor(private readonly scope: ScopeRunner) {}

  private floorFor(session: Session, requested?: string): string {
    if (session.role === "admin") return requested ?? session.floorId ?? "";
    if (!session.floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return session.floorId;
  }

  list(session: Session) {
    return this.scope.run(session, (tx) =>
      tx.automation.findMany({
        where: session.role === "admin" ? undefined : { floorId: session.floorId ?? "__none__" },
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  create(session: Session, input: { trigger: AutomationTrigger; action: string; delayHours?: number; floorId?: string; name?: string }) {
    const floorId = this.floorFor(session, input.floorId);
    return this.scope.run(session, (tx) =>
      tx.automation.create({
        data: {
          floorId,
          name: input.name,
          trigger: input.trigger,
          action: input.action,
          delayHours: input.delayHours ?? 0,
          enabled: true,
        },
      }),
    );
  }

  toggle(session: Session, id: string, enabled?: boolean) {
    return this.scope.run(session, async (tx) => {
      const rule = await tx.automation.findFirst({
        where: { id, ...(session.role === "admin" ? {} : { floorId: session.floorId ?? "__none__" }) },
      });
      if (!rule) throw new NotFoundException({ code: "not_found", message: "No automation." });
      return tx.automation.update({ where: { id }, data: { enabled: enabled ?? !rule.enabled } });
    });
  }

  /**
   * Trigger runner — called from domain events (signup, booking, …). Records an
   * AutomationRun for each enabled rule on the floor matching the trigger and
   * "performs" its action (logged). delayHours would schedule the action in prod.
   * Runs in trusted server context (no user session): uses the bare client and
   * scopes by floorId explicitly.
   */
  async fire(floorId: string, trigger: AutomationTrigger, payload: Record<string, unknown>): Promise<number> {
    const rules = await prisma.automation.findMany({ where: { floorId, trigger, enabled: true } });
    let fired = 0;
    for (const rule of rules) {
      const result = `action=${rule.action} payload=${JSON.stringify(payload)}`;
      await prisma.automationRun.create({ data: { automationId: rule.id, floorId, result } });
      // TODO(side-effect): dispatch the action (email/SMS/tag) here, honoring
      // rule.delayHours via a scheduler (Redis). For now we log the intent.
      this.log.log(`Automation ${rule.id} fired on ${trigger} (floor ${floorId}); ${result}`);
      fired += 1;
    }
    return fired;
  }
}
