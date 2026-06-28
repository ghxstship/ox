// Lead / Prospect Pipeline (11 §B #25, model `Lead`/`LeadActivity` in 11 §C).
//
// The live DB has no Lead table yet, so we persist leads in an in-memory store
// keyed by floor — RLS-equivalent scoping is enforced HERE by filtering on the
// caller's floor (host = own floor, admin = all). When the `Lead` table lands,
// swap the store for ScopeRunner + Prisma with the same method surface.
//
// `convert` walks a lead to a real member: it creates a User row (role=member)
// on the lead's floor, then fires the signup automation trigger.
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { randomUUID } from "node:crypto";
import { AutomationsService } from "./automations.service";

export type LeadStage = "lead" | "tour" | "trial" | "member" | "lost";

export interface Lead {
  id: string;
  floorId: string;
  name: string;
  contact: string;
  source: string;
  stage: LeadStage;
  notes?: string;
  valueCents: number;
  activity: { id: string; kind: string; note: string; at: string }[];
  createdAt: string;
}

@Injectable()
export class LeadsService {
  // In-memory store. PRODUCTION: Prisma `Lead`/`LeadActivity` tables (RLS-scoped).
  private readonly store = new Map<string, Lead>();

  constructor(private readonly automations: AutomationsService) {}

  /** Floor scope: admin sees all; host/coach see only their floor. */
  private visible(session: Session, lead: Lead): boolean {
    if (session.role === "admin") return true;
    return Boolean(session.floorId) && lead.floorId === session.floorId;
  }

  private floorFor(session: Session, requested?: string): string {
    if (session.role === "admin") return requested ?? session.floorId ?? "";
    // Non-admins are pinned to their own floor regardless of input.
    if (!session.floorId) throw new ForbiddenException({ code: "forbidden", message: "No floor in scope." });
    return session.floorId;
  }

  list(session: Session, stage?: LeadStage): Lead[] {
    return [...this.store.values()]
      .filter((l) => this.visible(session, l) && (!stage || l.stage === stage))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  create(session: Session, input: { name: string; contact: string; source?: string; floorId?: string; valueCents?: number; notes?: string }): Lead {
    const lead: Lead = {
      id: `lead_${randomUUID()}`,
      floorId: this.floorFor(session, input.floorId),
      name: input.name,
      contact: input.contact,
      source: input.source ?? "walk-in",
      stage: "lead",
      notes: input.notes,
      valueCents: input.valueCents ?? 0,
      activity: [],
      createdAt: new Date().toISOString(),
    };
    this.store.set(lead.id, lead);
    return lead;
  }

  private get(session: Session, id: string): Lead {
    const lead = this.store.get(id);
    if (!lead || !this.visible(session, lead)) {
      throw new NotFoundException({ code: "not_found", message: "No lead (or out of scope)." });
    }
    return lead;
  }

  advance(session: Session, id: string, stage: LeadStage, note?: string): Lead {
    const lead = this.get(session, id);
    lead.stage = stage;
    lead.activity.push({ id: `act_${randomUUID()}`, kind: "stage", note: note ?? `→ ${stage}`, at: new Date().toISOString() });
    return lead;
  }

  /** Convert a lead to a member: create the User, mark won, fire signup automations. */
  async convert(session: Session, id: string): Promise<{ lead: Lead; userId: string }> {
    const lead = this.get(session, id);
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
    lead.stage = "member";
    lead.activity.push({ id: `act_${randomUUID()}`, kind: "convert", note: `Converted to member ${user.id}`, at: new Date().toISOString() });
    await this.automations.fire(lead.floorId, "signup", { userId: user.id, leadId: lead.id });
    return { lead, userId: user.id };
  }
}
