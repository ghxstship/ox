// Automation Builder (11 §B #26, models `Automation`/`AutomationRun` in 11 §C).
//
// Rules: { trigger, action, delayHours, enabled } scoped to a floor. A minimal
// trigger runner `fire(floorId, trigger, payload)` is invoked by the rest of the
// API on real events (signup, booking) and records an AutomationRun per enabled
// matching rule. Actions are logged (the real side effect — send email / SMS /
// add tag — plugs in where noted).
//
// Now persisted to the live DB: rule CRUD reads as the caller (RLS — host sees
// their floor, admin all), with an explicit floor `where`/`data` to keep tenants
// apart even though the API connects with elevated creds. `fire` runs in trusted
// server context (no session — fired by domain events), so it uses the
// service-role client and filters by floorId itself.
import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";

export type AutomationTrigger = "signup" | "booking" | "missed_class" | "membership_lapsed";

@Injectable()
export class AutomationsService {
  private readonly log = new Logger("Automations");

  constructor(private readonly supa: SupaService) {}

  private floorFor(session: Session, requested?: string): string {
    if (session.role === "admin") return requested ?? session.floorId ?? "";
    if (!session.floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return session.floorId;
  }

  list(session: Session, token: string | undefined) {
    let q = this.supa.forUser(token).from("Automation").select("*").order("createdAt", { ascending: false });
    if (session.role !== "admin") q = q.eq("floorId", session.floorId ?? "__none__");
    return q.then((res) => this.supa.unwrap(res, "No automation."));
  }

  create(session: Session, token: string | undefined, input: { trigger: AutomationTrigger; action: string; delayHours?: number; floorId?: string; name?: string }) {
    const floorId = this.floorFor(session, input.floorId);
    return this.supa
      .forUser(token)
      .from("Automation")
      .insert({
        floorId,
        name: input.name,
        trigger: input.trigger,
        action: input.action,
        delayHours: input.delayHours ?? 0,
        enabled: true,
      })
      .select()
      .single()
      .then((res) => this.supa.unwrap(res, "No automation."));
  }

  async toggle(session: Session, token: string | undefined, id: string, enabled?: boolean) {
    const sb = this.supa.forUser(token);
    let lookup = sb.from("Automation").select("*").eq("id", id);
    if (session.role !== "admin") lookup = lookup.eq("floorId", session.floorId ?? "__none__");
    const rule = this.supa.unwrapMaybe(await lookup.maybeSingle());
    if (!rule) throw new NotFoundException({ code: "not_found", message: "No automation." });
    return this.supa.unwrap(
      await sb.from("Automation").update({ enabled: enabled ?? !rule.enabled }).eq("id", id).select().single(),
      "No automation.",
    );
  }

  /**
   * Trigger runner — called from domain events (signup, booking, …). Records an
   * AutomationRun for each enabled rule on the floor matching the trigger and
   * "performs" its action (logged). delayHours would schedule the action in prod.
   * Runs in trusted server context (no user session): uses the service-role
   * client and scopes by floorId explicitly.
   */
  async fire(floorId: string, trigger: AutomationTrigger, payload: Record<string, unknown>): Promise<number> {
    const sb = this.supa.service();
    const rules = this.supa.unwrap(
      await sb.from("Automation").select("*").eq("floorId", floorId).eq("trigger", trigger).eq("enabled", true),
      "No automation.",
    );
    let fired = 0;
    for (const rule of rules) {
      const result = `action=${rule.action} payload=${JSON.stringify(payload)}`;
      this.supa.unwrap(
        await sb.from("AutomationRun").insert({ automationId: rule.id, floorId, result }).select().single(),
        "No automation.",
      );
      // TODO(side-effect): dispatch the action (email/SMS/tag) here, honoring
      // rule.delayHours via a scheduler (Redis). For now we log the intent.
      this.log.log(`Automation ${rule.id} fired on ${trigger} (floor ${floorId}); ${result}`);
      fired += 1;
    }
    return fired;
  }
}
