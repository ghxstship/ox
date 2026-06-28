// Automation Builder (11 §B #26, models `Automation`/`AutomationRun` in 11 §C).
//
// Rules: { trigger, action, delayHours, enabled } scoped to a floor. A minimal
// trigger runner `fire(floorId, trigger, payload)` is invoked by the rest of the
// API on real events (signup, booking) and records an AutomationRun per enabled
// matching rule. Actions are logged (the real side effect — send email / SMS /
// add tag — plugs in where noted).
//
// No `Automation` table in the live DB yet, so rules + runs live in memory,
// floor-scoped. Swap for Prisma + ScopeRunner with the same surface later.
import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { randomUUID } from "node:crypto";

export type AutomationTrigger = "signup" | "booking" | "missed_class" | "membership_lapsed";

export interface Automation {
  id: string;
  floorId: string;
  trigger: AutomationTrigger;
  action: string;
  delayHours: number;
  enabled: boolean;
  runs: { id: string; at: string; result: string }[];
}

@Injectable()
export class AutomationsService {
  private readonly log = new Logger("Automations");
  private readonly store = new Map<string, Automation>();

  private visible(session: Session, a: Automation): boolean {
    if (session.role === "admin") return true;
    return Boolean(session.floorId) && a.floorId === session.floorId;
  }

  private floorFor(session: Session, requested?: string): string {
    if (session.role === "admin") return requested ?? session.floorId ?? "";
    if (!session.floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return session.floorId;
  }

  list(session: Session): Automation[] {
    return [...this.store.values()].filter((a) => this.visible(session, a));
  }

  create(session: Session, input: { trigger: AutomationTrigger; action: string; delayHours?: number; floorId?: string }): Automation {
    const rule: Automation = {
      id: `auto_${randomUUID()}`,
      floorId: this.floorFor(session, input.floorId),
      trigger: input.trigger,
      action: input.action,
      delayHours: input.delayHours ?? 0,
      enabled: true,
      runs: [],
    };
    this.store.set(rule.id, rule);
    return rule;
  }

  toggle(session: Session, id: string, enabled?: boolean): Automation {
    const rule = this.store.get(id);
    if (!rule || !this.visible(session, rule)) throw new NotFoundException({ code: "not_found", message: "No automation." });
    rule.enabled = enabled ?? !rule.enabled;
    return rule;
  }

  /**
   * Trigger runner — called from domain events (signup, booking, …). Records an
   * AutomationRun for each enabled rule on the floor matching the trigger and
   * "performs" its action (logged). delayHours would schedule the action in prod.
   */
  async fire(floorId: string, trigger: AutomationTrigger, payload: Record<string, unknown>): Promise<number> {
    let fired = 0;
    for (const rule of this.store.values()) {
      if (rule.floorId !== floorId || rule.trigger !== trigger || !rule.enabled) continue;
      const result = `action=${rule.action} payload=${JSON.stringify(payload)}`;
      rule.runs.push({ id: `run_${randomUUID()}`, at: new Date().toISOString(), result });
      // TODO(side-effect): dispatch the action (email/SMS/tag) here, honoring
      // rule.delayHours via a scheduler (Redis). For now we log the intent.
      this.log.log(`Automation ${rule.id} fired on ${trigger} (floor ${floorId}); ${result}`);
      fired += 1;
    }
    return fired;
  }
}
