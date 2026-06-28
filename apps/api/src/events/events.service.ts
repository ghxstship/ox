// Events / raids — public discovery (Event = public read). RSVP reserves a
// ticket; paid tiers mint a PaymentIntent via BillingService. Check-in awards XP.
import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { randomUUID } from "node:crypto";
import { BillingService } from "../billing/billing.service";
import { ScopeRunner } from "../common/scope.runner";
import type { CreateEventDto, RsvpDto } from "./events.dto";

@Injectable()
export class EventsService {
  constructor(
    private readonly scope: ScopeRunner,
    private readonly billing: BillingService,
  ) {}

  list() {
    return prisma.event.findMany({ include: { tiers: true }, orderBy: { startsAt: "asc" } });
  }

  async get(id: string) {
    const event = await prisma.event.findUnique({ where: { id }, include: { tiers: true } });
    if (!event) throw new NotFoundException({ code: "not_found", message: "No event." });
    return event;
  }

  create(session: Session, dto: CreateEventDto) {
    return this.scope.run(session, (tx) =>
      tx.event.create({
        data: {
          title: dto.title,
          floorId: dto.floorId ?? session.floorId ?? null,
          hostName: dto.hostName,
          startsAt: new Date(dto.startsAt),
          rewardXp: dto.rewardXp ?? 0,
          capacity: dto.capacity ?? null,
          isRaid: dto.isRaid ?? false,
          tiers: dto.tiers?.length ? { create: dto.tiers } : undefined,
        },
        include: { tiers: true },
      }),
    );
  }

  /** Reserve a ticket on a tier. Paid tier → PaymentIntent + Payment(pending). */
  async rsvp(session: Session, eventId: string, dto: RsvpDto) {
    return this.scope.run(session, async (tx) => {
      const tier = await tx.ticketTier.findUnique({ where: { id: dto.tierId } });
      if (!tier || tier.eventId !== eventId) {
        throw new NotFoundException({ code: "not_found", message: "No such tier." });
      }
      const ticket = await tx.ticket.create({
        data: {
          eventId,
          tierId: tier.id,
          userId: session.userId,
          state: tier.priceCents > 0 ? "reserved" : "paid",
          qrCode: `ox:tkt:${randomUUID()}`,
        },
      });

      let payment: { id: string; clientSecret: string } | null = null;
      if (tier.priceCents > 0) {
        const pi = await this.billing.createPaymentIntent(tier.priceCents, "Ticket");
        const pay = await tx.payment.create({
          data: {
            userId: session.userId,
            floorId: session.floorId ?? "",
            kind: "Ticket",
            amountCents: tier.priceCents,
            state: "pending",
            stripePiId: pi.id,
          },
        });
        payment = { id: pay.id, clientSecret: pi.clientSecret };
      }
      return { ticket, payment };
    });
  }

  /** Scan a ticket → checked_in, award the event's rewardXp to the attendee. */
  checkin(session: Session, ticketId: string) {
    return this.scope.run(session, async (tx) => {
      const ticket = await tx.ticket.findUnique({ where: { id: ticketId }, include: { event: true } });
      if (!ticket) throw new NotFoundException({ code: "not_found", message: "No ticket." });
      const updated = await tx.ticket.update({
        where: { id: ticketId },
        data: { state: "checked_in", checkedInAt: new Date() },
      });
      if (ticket.event.rewardXp > 0) {
        await tx.user.update({ where: { id: ticket.userId }, data: { xp: { increment: ticket.event.rewardXp } } });
      }
      return { ticket: updated, xpAwarded: ticket.event.rewardXp };
    });
  }
}
