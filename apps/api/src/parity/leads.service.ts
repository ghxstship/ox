// Lead / Prospect Pipeline (11 §B #25, model `Lead`/`LeadActivity` in 11 §C).
//
// Now persisted to the live DB. Lead + LeadActivity CRUD reads as the caller
// so the RLS policies (is_operator() AND floorId=app_floor()) apply; we ALSO pass
// floorId explicitly on writes and add an explicit floor `where` on reads so
// tenants never leak even though the API connects with elevated creds.
//
// The schema keeps scalar FKs only (no nav relations), so a lead's activity is
// fetched with a second query and stitched onto the returned shape — the same
// `{ ...lead, activity }` surface the in-memory store exposed.
//
// `convert` walks a lead to a real member: it creates a User row (role=member)
// on the lead's floor, then fires the signup automation trigger. Minting the User
// is privileged, so it runs through the service-role client.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { OxSupabase } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";
import { AutomationsService } from "./automations.service";

export type LeadStage = "lead" | "tour" | "trial" | "member" | "lost";

@Injectable()
export class LeadsService {
  constructor(
    private readonly supa: SupaService,
    private readonly automations: AutomationsService,
  ) {}

  private floorFor(session: Session, requested?: string): string {
    if (session.role === "admin") return requested ?? session.floorId ?? "";
    // Non-admins are pinned to their own floor regardless of input.
    if (!session.floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return session.floorId;
  }

  private async withActivity(sb: OxSupabase, lead: { id: string }) {
    const activity = this.supa.unwrap(
      await sb.from("LeadActivity").select("*").eq("leadId", lead.id).order("at", { ascending: true }),
      "No lead (or out of scope).",
    );
    return { ...lead, activity };
  }

  async list(session: Session, token: string | undefined, stage?: LeadStage) {
    const sb = this.supa.forUser(token);
    let q = sb.from("Lead").select("*").order("createdAt", { ascending: false });
    if (session.role !== "admin") q = q.eq("floorId", session.floorId ?? "__none__");
    if (stage) q = q.eq("stage", stage);
    const leads = this.supa.unwrap(await q, "No lead (or out of scope).");
    return Promise.all(leads.map((l) => this.withActivity(sb, l)));
  }

  async create(session: Session, token: string | undefined, input: { name: string; contact: string; source?: string; floorId?: string; valueCents?: number; notes?: string }) {
    const floorId = this.floorFor(session, input.floorId);
    const sb = this.supa.forUser(token);
    const lead = this.supa.unwrap(
      await sb
        .from("Lead")
        .insert({
          floorId,
          name: input.name,
          contact: input.contact,
          source: input.source ?? "walk_in",
          stage: "lead",
          notes: input.notes,
          valueCents: input.valueCents ?? 0,
        })
        .select()
        .single(),
      "No lead (or out of scope).",
    );
    return { ...lead, activity: [] };
  }

  private async fetch(sb: OxSupabase, session: Session, id: string) {
    let q = sb.from("Lead").select("*").eq("id", id);
    if (session.role !== "admin") q = q.eq("floorId", session.floorId ?? "__none__");
    const lead = this.supa.unwrapMaybe(await q.maybeSingle());
    if (!lead) throw new NotFoundException({ code: "not_found", message: "No lead (or out of scope)." });
    return lead;
  }

  async advance(session: Session, token: string | undefined, id: string, stage: LeadStage, note?: string) {
    const sb = this.supa.forUser(token);
    const lead = await this.fetch(sb, session, id);
    this.supa.unwrap(
      await sb
        .from("LeadActivity")
        .insert({ leadId: lead.id, floorId: lead.floorId, kind: "stage", note: note ?? `→ ${stage}` })
        .select()
        .single(),
      "No lead (or out of scope).",
    );
    const updated = this.supa.unwrap(
      await sb.from("Lead").update({ stage }).eq("id", lead.id).select().single(),
      "No lead (or out of scope).",
    );
    return this.withActivity(sb, updated);
  }

  /** Convert a lead to a member: create the User, mark won, fire signup automations. */
  async convert(session: Session, token: string | undefined, id: string): Promise<{ lead: unknown; userId: string }> {
    const sb = this.supa.forUser(token);
    const svc = this.supa.service();
    const lead = await this.fetch(sb, session, id);
    const email = lead.contact.includes("@") ? lead.contact.toLowerCase() : `${id}@leads.ox.fit`;
    const existing = this.supa.unwrapMaybe(await svc.from("User").select("*").eq("email", email).maybeSingle());
    const user =
      existing ??
      this.supa.unwrap(
        await svc
          .from("User")
          .insert({
            name: lead.name,
            email,
            initial: lead.name.slice(0, 1).toUpperCase(),
            role: "member",
            floorId: lead.floorId,
            homeFloorId: lead.floorId,
          })
          .select()
          .single(),
        "No lead (or out of scope).",
      );
    this.supa.unwrap(
      await sb
        .from("LeadActivity")
        .insert({ leadId: lead.id, floorId: lead.floorId, kind: "convert", note: `Converted to member ${user.id}` })
        .select()
        .single(),
      "No lead (or out of scope).",
    );
    const updated = this.supa.unwrap(
      await sb.from("Lead").update({ stage: "member" }).eq("id", lead.id).select().single(),
      "No lead (or out of scope).",
    );
    const withActivity = await this.withActivity(sb, updated);
    await this.automations.fire(lead.floorId, "signup", { userId: user.id, leadId: id });
    return { lead: withActivity, userId: user.id };
  }
}
