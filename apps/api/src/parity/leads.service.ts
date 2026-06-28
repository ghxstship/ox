// Lead / Prospect Pipeline (11 §B #25, model `Lead`/`LeadActivity` in 11 §C).
//
// Now persisted to the live DB. Lead + LeadActivity CRUD runs through ScopeRunner
// so the RLS policies (is_operator() AND floorId=app_floor()) apply; we ALSO pass
// floorId explicitly on writes and add an explicit floor `where` on reads so
// tenants never leak even though the API connects with elevated creds.
//
// The schema keeps scalar FKs only (no nav relations), so a lead's activity is
// fetched with a second query and stitched onto the returned shape — the same
// `{ ...lead, activity }` surface the in-memory store exposed.
//
// `convert` walks a lead to a real member: it creates a User row (role=member)
// on the lead's floor, then fires the signup automation trigger.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma, type Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";
import { AutomationsService } from "./automations.service";

export type LeadStage = "lead" | "tour" | "trial" | "member" | "lost";

@Injectable()
export class LeadsService {
  constructor(
    private readonly scope: ScopeRunner,
    private readonly automations: AutomationsService,
  ) {}

  private floorFor(session: Session, requested?: string): string {
    if (session.role === "admin") return requested ?? session.floorId ?? "";
    // Non-admins are pinned to their own floor regardless of input.
    if (!session.floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return session.floorId;
  }

  /** Floor scope clause: admin sees all; host/coach see only their floor. */
  private floorWhere(session: Session): Prisma.LeadWhereInput {
    return session.role === "admin" ? {} : { floorId: session.floorId ?? "__none__" };
  }

  private async withActivity(tx: Prisma.TransactionClient, lead: { id: string }) {
    const activity = await tx.leadActivity.findMany({ where: { leadId: lead.id }, orderBy: { at: "asc" } });
    return { ...lead, activity };
  }

  async list(session: Session, stage?: LeadStage) {
    return this.scope.run(session, async (tx) => {
      const leads = await tx.lead.findMany({
        where: { ...this.floorWhere(session), ...(stage ? { stage } : {}) },
        orderBy: { createdAt: "desc" },
      });
      return Promise.all(leads.map((l) => this.withActivity(tx, l)));
    });
  }

  create(session: Session, input: { name: string; contact: string; source?: string; floorId?: string; valueCents?: number; notes?: string }) {
    const floorId = this.floorFor(session, input.floorId);
    return this.scope.run(session, async (tx) => {
      const lead = await tx.lead.create({
        data: {
          floorId,
          name: input.name,
          contact: input.contact,
          source: input.source ?? "walk_in",
          stage: "lead",
          notes: input.notes,
          valueCents: input.valueCents ?? 0,
        },
      });
      return { ...lead, activity: [] };
    });
  }

  private async fetch(tx: Prisma.TransactionClient, session: Session, id: string) {
    const lead = await tx.lead.findFirst({ where: { id, ...this.floorWhere(session) } });
    if (!lead) throw new NotFoundException({ code: "not_found", message: "No lead (or out of scope)." });
    return lead;
  }

  advance(session: Session, id: string, stage: LeadStage, note?: string) {
    return this.scope.run(session, async (tx) => {
      const lead = await this.fetch(tx, session, id);
      await tx.leadActivity.create({
        data: { leadId: lead.id, floorId: lead.floorId, kind: "stage", note: note ?? `→ ${stage}` },
      });
      const updated = await tx.lead.update({ where: { id: lead.id }, data: { stage } });
      return this.withActivity(tx, updated);
    });
  }

  /** Convert a lead to a member: create the User, mark won, fire signup automations. */
  async convert(session: Session, id: string): Promise<{ lead: unknown; userId: string }> {
    const result = await this.scope.run(session, async (tx) => {
      const lead = await this.fetch(tx, session, id);
      const email = lead.contact.includes("@") ? lead.contact.toLowerCase() : `${id}@leads.ox.fit`;
      const existing = await prisma.user.findUnique({ where: { email } });
      const user =
        existing ??
        (await prisma.user.create({
          data: {
            name: lead.name,
            email,
            initial: lead.name.slice(0, 1).toUpperCase(),
            role: "member",
            floorId: lead.floorId,
            homeFloorId: lead.floorId,
          },
        }));
      await tx.leadActivity.create({
        data: { leadId: lead.id, floorId: lead.floorId, kind: "convert", note: `Converted to member ${user.id}` },
      });
      const updated = await tx.lead.update({ where: { id: lead.id }, data: { stage: "member" } });
      const withActivity = await this.withActivity(tx, updated);
      return { lead: withActivity, userId: user.id, floorId: lead.floorId };
    });
    await this.automations.fire(result.floorId, "signup", { userId: result.userId, leadId: id });
    return { lead: result.lead, userId: result.userId };
  }
}
