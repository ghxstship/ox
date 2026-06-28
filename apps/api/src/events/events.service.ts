// Events / raids — public discovery (Event = public read). RSVP reserves a
// ticket; paid tiers mint a PaymentIntent via BillingService. Check-in awards XP.
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { Session } from "@ox/rbac";
import { randomUUID } from "node:crypto";
import { BillingService } from "../billing/billing.service";
import { SupaService } from "../common/supa.service";
import type { CreateEventDto, RsvpDto } from "./events.dto";

@Injectable()
export class EventsService {
  constructor(
    private readonly supa: SupaService,
    private readonly billing: BillingService,
  ) {}

  async list() {
    const sb = this.supa.forUser();
    const { data: events, error } = await sb.from("Event").select("*").order("startsAt", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return Promise.all(
      (events ?? []).map(async (event) => {
        const { data: tiers } = await sb.from("TicketTier").select("*").eq("eventId", event.id);
        return { ...event, tiers: tiers ?? [] };
      }),
    );
  }

  async get(id: string) {
    const sb = this.supa.forUser();
    const { data: event, error } = await sb.from("Event").select("*").eq("id", id).maybeSingle();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    if (!event) throw new NotFoundException({ code: "not_found", message: "No event." });
    const { data: tiers } = await sb.from("TicketTier").select("*").eq("eventId", id);
    return { ...event, tiers: tiers ?? [] };
  }

  async create(session: Session, token: string | undefined, dto: CreateEventDto) {
    const sb = this.supa.forUser(token);
    const { data: event, error } = await sb
      .from("Event")
      .insert({
        title: dto.title,
        floorId: dto.floorId ?? session.floorId ?? null,
        hostName: dto.hostName,
        startsAt: new Date(dto.startsAt).toISOString(),
        rewardXp: dto.rewardXp ?? 0,
        capacity: dto.capacity ?? null,
        isRaid: dto.isRaid ?? false,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });

    let tiers: unknown[] = [];
    if (dto.tiers?.length) {
      const { data, error: tErr } = await sb
        .from("TicketTier")
        .insert(dto.tiers.map((t) => ({ ...t, eventId: event.id })))
        .select();
      if (tErr) throw new InternalServerErrorException({ code: "internal", message: tErr.message });
      tiers = data ?? [];
    }
    return { ...event, tiers };
  }

  /** Reserve a ticket on a tier. Paid tier → PaymentIntent + Payment(pending). */
  async rsvp(session: Session, token: string | undefined, eventId: string, dto: RsvpDto) {
    const sb = this.supa.forUser(token);
    const { data: tier } = await sb.from("TicketTier").select("*").eq("id", dto.tierId).maybeSingle();
    if (!tier || tier.eventId !== eventId) {
      throw new NotFoundException({ code: "not_found", message: "No such tier." });
    }
    const { data: ticket, error } = await sb
      .from("Ticket")
      .insert({
        eventId,
        tierId: tier.id,
        userId: session.userId,
        state: tier.priceCents > 0 ? "reserved" : "paid",
        qrCode: `ox:tkt:${randomUUID()}`,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });

    let payment: { id: string; clientSecret: string } | null = null;
    if (tier.priceCents > 0) {
      const pi = await this.billing.createPaymentIntent(tier.priceCents, "Ticket");
      // Minting a Payment is privileged → service() client, scoped explicitly.
      const { data: pay, error: payErr } = await this.supa
        .service()
        .from("Payment")
        .insert({
          userId: session.userId,
          floorId: session.floorId ?? "",
          kind: "Ticket",
          amountCents: tier.priceCents,
          state: "pending",
          stripePiId: pi.id,
        })
        .select()
        .single();
      if (payErr) throw new InternalServerErrorException({ code: "internal", message: payErr.message });
      payment = { id: pay.id, clientSecret: pi.clientSecret };
    }
    return { ticket, payment };
  }

  /** Scan a ticket → checked_in, award the event's rewardXp to the attendee. */
  async checkin(session: Session, token: string | undefined, ticketId: string) {
    const sb = this.supa.forUser(token);
    const { data: ticket } = await sb.from("Ticket").select("*").eq("id", ticketId).maybeSingle();
    if (!ticket) throw new NotFoundException({ code: "not_found", message: "No ticket." });
    const { data: event } = await sb.from("Event").select("rewardXp").eq("id", ticket.eventId).maybeSingle();

    const { data: updated, error } = await sb
      .from("Ticket")
      .update({ state: "checked_in", checkedInAt: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });

    const rewardXp = event?.rewardXp ?? 0;
    if (rewardXp > 0) {
      // Awarding XP to the ticket holder (possibly another user) → service().
      const svc = this.supa.service();
      const { data: u } = await svc.from("User").select("xp, level").eq("id", ticket.userId).single();
      const newXp = (u?.xp ?? 0) + rewardXp;
      const nextLevel = 1 + Math.floor(newXp / 200);
      await svc.from("User").update({ xp: newXp, level: nextLevel }).eq("id", ticket.userId);
    }
    return { ticket: updated, xpAwarded: rewardXp };
  }
}
