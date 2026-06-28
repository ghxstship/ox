// Classes & booking. Class rows are RLS-scoped (member=all bookable, coach=own,
// host=floor) — we never hand-filter; the policies do it inside ScopeRunner.
//
// Implements the Booking state machine from 05-state-machines:
//   (none) --book[capacity]--> booked | waitlist
//   waitlist --slot opens--> booked            (auto-promote on cancel)
//   booked --cancel[>cutoff]--> cancelled
//   booked --cancel[<cutoff]--> late_cancel    (penalty fee Payment row)
//   booked --checkin.scan--> attended          (+ roster/attendance realtime)
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";
import { AutomationsService } from "../parity/automations.service";
import { RealtimeBus } from "../realtime/realtime.bus";
import type { CheckinDto, CreateClassDto, UpdateClassDto } from "./classes.dto";

// Cutoff window for a free cancel. Configurable per floor in the real model;
// the live schema carries no per-floor cutoff column, so we read a platform
// default from config (OX_CANCEL_CUTOFF_HOURS) and fall back to 12h (TeamUp parity).
const DEFAULT_CUTOFF_HOURS = 12;
// Late-cancel / no-show penalty fee. Mirrors the operator's penalty policy.
const PENALTY_FEE_CENTS = 1500;

@Injectable()
export class ClassesService {
  private readonly cutoffHours: number;

  constructor(
    private readonly scope: ScopeRunner,
    private readonly bus: RealtimeBus,
    private readonly automations: AutomationsService,
    config: ConfigService,
  ) {
    this.cutoffHours = Number(config.get<string>("OX_CANCEL_CUTOFF_HOURS") ?? DEFAULT_CUTOFF_HOURS);
  }

  list(session: Session, range: { from?: string; to?: string }) {
    const where: Prisma.ClassWhereInput = {};
    if (range.from || range.to) {
      where.startsAt = {};
      if (range.from) (where.startsAt as Prisma.DateTimeFilter).gte = new Date(range.from);
      if (range.to) (where.startsAt as Prisma.DateTimeFilter).lte = new Date(range.to);
    }
    return this.scope.run(session, (tx) =>
      tx.class.findMany({ where, orderBy: { startsAt: "asc" }, include: { _count: { select: { bookings: true } } } }),
    );
  }

  create(session: Session, dto: CreateClassDto) {
    return this.scope.run(session, (tx) =>
      tx.class.create({
        data: {
          title: dto.title,
          floorId: dto.floorId,
          coachId: dto.coachId ?? session.userId,
          startsAt: new Date(dto.startsAt),
          capacity: dto.capacity,
          load: dto.load ?? "open",
          recurRule: dto.recurRule ?? null,
        },
      }),
    );
  }

  update(session: Session, id: string, dto: UpdateClassDto) {
    return this.scope.run(session, async (tx) => {
      const found = await tx.class.findUnique({ where: { id } });
      if (!found) throw new NotFoundException({ code: "not_found", message: "No class." });
      return tx.class.update({
        where: { id },
        data: {
          title: dto.title,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
          capacity: dto.capacity,
          load: dto.load,
          recurRule: dto.recurRule,
        },
      });
    });
  }

  remove(session: Session, id: string) {
    return this.scope.run(session, async (tx) => {
      const found = await tx.class.findUnique({ where: { id } });
      if (!found) throw new NotFoundException({ code: "not_found", message: "No class." });
      await tx.class.delete({ where: { id } });
      return { ok: true };
    });
  }

  /**
   * Generate the next occurrences of a recurring class from its recurRule.
   * Supports a minimal subset of RRULE (FREQ=DAILY|WEEKLY;INTERVAL=n;COUNT=n)
   * which covers the recurring-class-builder parity surface (11 §B #30). Returns
   * computed occurrence timestamps; persistence of materialized rows is the
   * caller's choice (we expose `persist` to write them as real Class rows).
   */
  occurrences(session: Session, classId: string, opts: { count?: number; persist?: boolean }) {
    return this.scope.run(session, async (tx) => {
      const base = await tx.class.findUnique({ where: { id: classId } });
      if (!base) throw new NotFoundException({ code: "not_found", message: "No class." });
      if (!base.recurRule) return { seriesId: classId, occurrences: [base.startsAt] };

      const dates = expandRule(base.recurRule, base.startsAt, opts.count ?? 8);
      if (!opts.persist) return { seriesId: classId, occurrences: dates };

      // Materialize each occurrence as its own Class row (single-occurrence edits
      // then diverge from the series). The first date is the base row itself.
      const created = [];
      for (const at of dates.slice(1)) {
        created.push(
          await tx.class.create({
            data: {
              title: base.title,
              floorId: base.floorId,
              coachId: base.coachId,
              startsAt: at,
              capacity: base.capacity,
              load: base.load,
              recurRule: null, // occurrences are concrete, not recurring
            },
          }),
        );
      }
      return { seriesId: classId, occurrences: dates, created };
    });
  }

  /** Book a class; overflow goes to the waitlist. */
  book(session: Session, classId: string) {
    return this.scope.run(session, async (tx) => {
      const klass = await tx.class.findUnique({ where: { id: classId } });
      if (!klass) throw new NotFoundException({ code: "not_found", message: "No class." });

      const existing = await tx.booking.findUnique({ where: { classId_userId: { classId, userId: session.userId } } });
      if (existing && existing.state !== "cancelled" && existing.state !== "late_cancel") {
        throw new ConflictException({ code: "conflict", message: "Already booked." });
      }

      const booked = await tx.booking.count({ where: { classId, state: "booked" } });
      const full = booked >= klass.capacity;
      const data = {
        state: (full ? "waitlist" : "booked") as Prisma.BookingCreateInput["state"],
        waitlistPos: full ? booked - klass.capacity + 1 : null,
      };
      const booking = await tx.booking.upsert({
        where: { classId_userId: { classId, userId: session.userId } },
        update: data,
        create: { classId, userId: session.userId, ...data },
      });
      this.bus.publish(RealtimeBus.classRoster(classId), "booking.created", {
        bookingId: booking.id,
        userId: session.userId,
        state: booking.state,
      });
      // Fire any floor automations keyed on `booking` (11 §B #26 trigger runner).
      await this.automations.fire(klass.floorId, "booking", {
        bookingId: booking.id,
        classId,
        userId: session.userId,
      });
      return booking;
    });
  }

  /**
   * Cancel a booking. Beyond the cutoff → clean `cancelled`. Inside the cutoff →
   * `late_cancel` plus a penalty-fee Payment row. Either way, a freed seat
   * promotes the first waitlisted booking to `booked`.
   */
  cancel(session: Session, bookingId: string) {
    return this.scope.run(session, async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { class: true } });
      if (!booking) throw new NotFoundException({ code: "not_found", message: "No booking." });
      if (booking.state === "cancelled" || booking.state === "late_cancel") {
        return booking; // idempotent
      }

      const wasBooked = booking.state === "booked";
      const hoursToStart = (booking.class.startsAt.getTime() - Date.now()) / 3_600_000;
      const late = wasBooked && hoursToStart < this.cutoffHours;

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { state: late ? "late_cancel" : "cancelled" },
      });

      let penalty: { id: string; amountCents: number } | null = null;
      if (late) {
        // Penalty fee — a real Payment row the operator's recovery queue can act on.
        const pay = await tx.payment.create({
          data: {
            userId: booking.userId,
            floorId: booking.class.floorId,
            kind: "Late cancel",
            amountCents: PENALTY_FEE_CENTS,
            state: "pending",
          },
        });
        penalty = { id: pay.id, amountCents: pay.amountCents };
      }

      // Waitlist promotion: free a seat only if the cancelled booking held one.
      let promoted: { id: string; userId: string } | null = null;
      if (wasBooked) {
        const next = await tx.booking.findFirst({
          where: { classId: booking.classId, state: "waitlist" },
          orderBy: [{ waitlistPos: "asc" }, { createdAt: "asc" }],
        });
        if (next) {
          const p = await tx.booking.update({
            where: { id: next.id },
            data: { state: "booked", waitlistPos: null },
          });
          promoted = { id: p.id, userId: p.userId };
          this.bus.publish(RealtimeBus.classRoster(booking.classId), "waitlist.promoted", promoted);
        }
      }

      this.bus.publish(RealtimeBus.classRoster(booking.classId), "booking.cancelled", {
        bookingId,
        late,
      });
      return { booking: updated, penalty, promoted };
    });
  }

  roster(session: Session, classId: string) {
    return this.scope.run(session, async (tx) => {
      const klass = await tx.class.findUnique({ where: { id: classId } });
      if (!klass) throw new NotFoundException({ code: "not_found", message: "No class." });
      return tx.booking.findMany({
        where: { classId },
        include: { user: { select: { id: true, name: true, initial: true } } },
        orderBy: { createdAt: "asc" },
      });
    });
  }

  /** Scan a member into class → attended (+XP, streak), emits roster/attendance. */
  checkin(session: Session, classId: string, dto: CheckinDto) {
    return this.scope.run(session, async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { classId_userId: { classId, userId: dto.userId } },
        include: { class: true },
      });
      if (!booking) throw new NotFoundException({ code: "not_found", message: "No booking to check in." });
      const updated = await tx.booking.update({ where: { id: booking.id }, data: { state: "attended" } });

      // Attendance awards a small XP bump (class attended → +XP, per 05).
      const ATTEND_XP = 25;
      const user = await tx.user.update({ where: { id: dto.userId }, data: { xp: { increment: ATTEND_XP } } });
      const nextLevel = 1 + Math.floor(user.xp / 200);
      if (nextLevel !== user.level) {
        await tx.user.update({ where: { id: dto.userId }, data: { level: nextLevel } });
      }

      this.bus.publish(RealtimeBus.classRoster(classId), "checkin", { userId: dto.userId, bookingId: booking.id });
      this.bus.publish(RealtimeBus.floorAttendance(booking.class.floorId), "checkin", {
        userId: dto.userId,
        classId,
      });
      return { booking: updated, xpAwarded: ATTEND_XP };
    });
  }
}

/** Minimal RRULE expander: FREQ=DAILY|WEEKLY, optional INTERVAL, COUNT bounded. */
function expandRule(rule: string, start: Date, max: number): Date[] {
  const parts = Object.fromEntries(
    rule
      .replace(/^RRULE:/i, "")
      .split(";")
      .map((kv) => kv.split("=") as [string, string]),
  );
  const freq = (parts.FREQ ?? "WEEKLY").toUpperCase();
  const interval = Math.max(1, Number(parts.INTERVAL ?? 1));
  const count = Math.min(max, Number(parts.COUNT ?? max));
  const stepDays = freq === "DAILY" ? interval : freq === "WEEKLY" ? interval * 7 : interval * 7;

  const out: Date[] = [];
  for (let i = 0; i < count; i++) {
    out.push(new Date(start.getTime() + i * stepDays * 86_400_000));
  }
  return out;
}
