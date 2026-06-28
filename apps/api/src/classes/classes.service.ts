// Classes & booking. Class rows are RLS-scoped (member=all bookable, coach=own,
// host=floor) — we never hand-filter; the policies do it via supa.forUser(token).
//
// Implements the Booking state machine from 05-state-machines:
//   (none) --book[capacity]--> booked | waitlist
//   waitlist --slot opens--> booked            (auto-promote on cancel)
//   booked --cancel[>cutoff]--> cancelled
//   booked --cancel[<cutoff]--> late_cancel    (penalty fee Payment row)
//   booked --checkin.scan--> attended          (+ roster/attendance realtime)
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Enums, TablesUpdate } from "@ox/supabase/types";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";
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
    private readonly supa: SupaService,
    private readonly bus: RealtimeBus,
    private readonly automations: AutomationsService,
    config: ConfigService,
  ) {
    this.cutoffHours = Number(config.get<string>("OX_CANCEL_CUTOFF_HOURS") ?? DEFAULT_CUTOFF_HOURS);
  }

  async list(session: Session, token: string | undefined, range: { from?: string; to?: string }) {
    const sb = this.supa.forUser(token);
    let q = sb.from("Class").select("*").order("startsAt", { ascending: true });
    if (range.from) q = q.gte("startsAt", new Date(range.from).toISOString());
    if (range.to) q = q.lte("startsAt", new Date(range.to).toISOString());
    const { data: classes, error } = await q;
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return Promise.all(
      (classes ?? []).map(async (klass) => {
        const { count } = await sb
          .from("Booking")
          .select("*", { count: "exact", head: true })
          .eq("classId", klass.id);
        return { ...klass, _count: { bookings: count ?? 0 } };
      }),
    );
  }

  async create(session: Session, token: string | undefined, dto: CreateClassDto) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("Class")
      .insert({
        title: dto.title,
        floorId: dto.floorId,
        coachId: dto.coachId ?? session.userId,
        startsAt: new Date(dto.startsAt).toISOString(),
        capacity: dto.capacity,
        load: (dto.load ?? "open") as Enums<"ClassLoad">,
        recurRule: dto.recurRule ?? null,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async update(session: Session, token: string | undefined, id: string, dto: UpdateClassDto) {
    const sb = this.supa.forUser(token);
    const { data: found } = await sb.from("Class").select("id").eq("id", id).maybeSingle();
    if (!found) throw new NotFoundException({ code: "not_found", message: "No class." });
    const patch: TablesUpdate<"Class"> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.startsAt !== undefined) patch.startsAt = new Date(dto.startsAt).toISOString();
    if (dto.capacity !== undefined) patch.capacity = dto.capacity;
    if (dto.load !== undefined) patch.load = dto.load as Enums<"ClassLoad">;
    if (dto.recurRule !== undefined) patch.recurRule = dto.recurRule;
    const { data, error } = await sb.from("Class").update(patch).eq("id", id).select().single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  async remove(session: Session, token: string | undefined, id: string) {
    const sb = this.supa.forUser(token);
    const { data: found } = await sb.from("Class").select("id").eq("id", id).maybeSingle();
    if (!found) throw new NotFoundException({ code: "not_found", message: "No class." });
    const { error } = await sb.from("Class").delete().eq("id", id);
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return { ok: true };
  }

  /**
   * Generate the next occurrences of a recurring class from its recurRule.
   * Supports a minimal subset of RRULE (FREQ=DAILY|WEEKLY;INTERVAL=n;COUNT=n)
   * which covers the recurring-class-builder parity surface (11 §B #30). Returns
   * computed occurrence timestamps; `persist` writes them as real Class rows.
   */
  async occurrences(session: Session, token: string | undefined, classId: string, opts: { count?: number; persist?: boolean }) {
    const sb = this.supa.forUser(token);
    const { data: base } = await sb.from("Class").select("*").eq("id", classId).maybeSingle();
    if (!base) throw new NotFoundException({ code: "not_found", message: "No class." });
    if (!base.recurRule) return { seriesId: classId, occurrences: [base.startsAt] };

    const dates = expandRule(base.recurRule, new Date(base.startsAt), opts.count ?? 8);
    if (!opts.persist) return { seriesId: classId, occurrences: dates };

    // Materialize each occurrence as its own Class row (single-occurrence edits
    // then diverge from the series). The first date is the base row itself.
    const created = [];
    for (const at of dates.slice(1)) {
      const { data: row, error } = await sb
        .from("Class")
        .insert({
          title: base.title,
          floorId: base.floorId,
          coachId: base.coachId,
          startsAt: at.toISOString(),
          capacity: base.capacity,
          load: base.load,
          recurRule: null, // occurrences are concrete, not recurring
        })
        .select()
        .single();
      if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
      created.push(row);
    }
    return { seriesId: classId, occurrences: dates, created };
  }

  /** Book a class; overflow goes to the waitlist. */
  async book(session: Session, token: string | undefined, classId: string) {
    const sb = this.supa.forUser(token);
    const { data: klass } = await sb.from("Class").select("*").eq("id", classId).maybeSingle();
    if (!klass) throw new NotFoundException({ code: "not_found", message: "No class." });

    const { data: existing } = await sb
      .from("Booking")
      .select("*")
      .eq("classId", classId)
      .eq("userId", session.userId)
      .maybeSingle();
    if (existing && existing.state !== "cancelled" && existing.state !== "late_cancel") {
      throw new ConflictException({ code: "conflict", message: "Already booked." });
    }

    const { count: booked } = await sb
      .from("Booking")
      .select("*", { count: "exact", head: true })
      .eq("classId", classId)
      .eq("state", "booked");
    const bookedCount = booked ?? 0;
    const full = bookedCount >= klass.capacity;
    const row = {
      classId,
      userId: session.userId,
      state: (full ? "waitlist" : "booked") as Enums<"BookingState">,
      waitlistPos: full ? bookedCount - klass.capacity + 1 : null,
    };
    const { data: booking, error } = await sb
      .from("Booking")
      .upsert(row, { onConflict: "classId,userId" })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });

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
  }

  /**
   * Cancel a booking. Beyond the cutoff → clean `cancelled`. Inside the cutoff →
   * `late_cancel` plus a penalty-fee Payment row. Either way, a freed seat
   * promotes the first waitlisted booking to `booked`.
   */
  async cancel(session: Session, token: string | undefined, bookingId: string) {
    const sb = this.supa.forUser(token);
    const { data: booking } = await sb.from("Booking").select("*").eq("id", bookingId).maybeSingle();
    if (!booking) throw new NotFoundException({ code: "not_found", message: "No booking." });
    if (booking.state === "cancelled" || booking.state === "late_cancel") {
      return booking; // idempotent
    }
    const { data: klass } = await sb.from("Class").select("*").eq("id", booking.classId).maybeSingle();
    if (!klass) throw new NotFoundException({ code: "not_found", message: "No class." });

    const wasBooked = booking.state === "booked";
    const hoursToStart = (new Date(klass.startsAt).getTime() - Date.now()) / 3_600_000;
    const late = wasBooked && hoursToStart < this.cutoffHours;

    const { data: updated, error: updErr } = await sb
      .from("Booking")
      .update({ state: late ? "late_cancel" : "cancelled" })
      .eq("id", bookingId)
      .select()
      .single();
    if (updErr) throw new InternalServerErrorException({ code: "internal", message: updErr.message });

    let penalty: { id: string; amountCents: number } | null = null;
    if (late) {
      // Penalty fee — a real Payment row the operator's recovery queue can act on.
      // Minting a Payment is privileged → service() client, scoped explicitly.
      const { data: pay, error: payErr } = await this.supa
        .service()
        .from("Payment")
        .insert({
          userId: booking.userId,
          floorId: klass.floorId,
          kind: "Late cancel",
          amountCents: PENALTY_FEE_CENTS,
          state: "pending",
        })
        .select()
        .single();
      if (payErr) throw new InternalServerErrorException({ code: "internal", message: payErr.message });
      penalty = { id: pay.id, amountCents: pay.amountCents };
    }

    // Waitlist promotion: free a seat only if the cancelled booking held one.
    let promoted: { id: string; userId: string } | null = null;
    if (wasBooked) {
      const { data: next } = await sb
        .from("Booking")
        .select("*")
        .eq("classId", booking.classId)
        .eq("state", "waitlist")
        .order("waitlistPos", { ascending: true })
        .order("createdAt", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (next) {
        const { data: p, error: pErr } = await sb
          .from("Booking")
          .update({ state: "booked", waitlistPos: null })
          .eq("id", next.id)
          .select()
          .single();
        if (pErr) throw new InternalServerErrorException({ code: "internal", message: pErr.message });
        promoted = { id: p.id, userId: p.userId };
        this.bus.publish(RealtimeBus.classRoster(booking.classId), "waitlist.promoted", promoted);
      }
    }

    this.bus.publish(RealtimeBus.classRoster(booking.classId), "booking.cancelled", {
      bookingId,
      late,
    });
    return { booking: updated, penalty, promoted };
  }

  async roster(session: Session, token: string | undefined, classId: string) {
    const sb = this.supa.forUser(token);
    const { data: klass } = await sb.from("Class").select("id").eq("id", classId).maybeSingle();
    if (!klass) throw new NotFoundException({ code: "not_found", message: "No class." });
    const { data: bookings, error } = await sb
      .from("Booking")
      .select("*")
      .eq("classId", classId)
      .order("createdAt", { ascending: true });
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return Promise.all(
      (bookings ?? []).map(async (b) => {
        const { data: user } = await sb.from("User").select("id, name, initial").eq("id", b.userId).maybeSingle();
        return { ...b, user };
      }),
    );
  }

  /** Scan a member into class → attended (+XP, streak), emits roster/attendance. */
  async checkin(session: Session, token: string | undefined, classId: string, dto: CheckinDto) {
    const sb = this.supa.forUser(token);
    const { data: booking } = await sb
      .from("Booking")
      .select("*")
      .eq("classId", classId)
      .eq("userId", dto.userId)
      .maybeSingle();
    if (!booking) throw new NotFoundException({ code: "not_found", message: "No booking to check in." });
    const { data: klass } = await sb.from("Class").select("floorId").eq("id", classId).maybeSingle();

    const { data: updated, error: updErr } = await sb
      .from("Booking")
      .update({ state: "attended" })
      .eq("id", booking.id)
      .select()
      .single();
    if (updErr) throw new InternalServerErrorException({ code: "internal", message: updErr.message });

    // Attendance awards a small XP bump to the scanned member (another user) —
    // privileged write → service() client, scoped explicitly to dto.userId.
    const ATTEND_XP = 25;
    const svc = this.supa.service();
    const { data: user } = await svc.from("User").select("xp, level").eq("id", dto.userId).single();
    const newXp = (user?.xp ?? 0) + ATTEND_XP;
    const nextLevel = 1 + Math.floor(newXp / 200);
    await svc.from("User").update({ xp: newXp, level: nextLevel }).eq("id", dto.userId);

    this.bus.publish(RealtimeBus.classRoster(classId), "checkin", { userId: dto.userId, bookingId: booking.id });
    if (klass?.floorId) {
      this.bus.publish(RealtimeBus.floorAttendance(klass.floorId), "checkin", {
        userId: dto.userId,
        classId,
      });
    }
    return { booking: updated, xpAwarded: ATTEND_XP };
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
