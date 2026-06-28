// Classes & booking. Class rows are RLS-scoped (member=all bookable, coach=own,
// host=floor) — we never hand-filter; the policies do it inside ScopeRunner.
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";
import type { CheckinDto, CreateClassDto, UpdateClassDto } from "./classes.dto";

@Injectable()
export class ClassesService {
  constructor(private readonly scope: ScopeRunner) {}

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

  /** Book a class; overflow goes to the waitlist. */
  book(session: Session, classId: string) {
    return this.scope.run(session, async (tx) => {
      const klass = await tx.class.findUnique({ where: { id: classId }, include: { _count: { select: { bookings: true } } } });
      if (!klass) throw new NotFoundException({ code: "not_found", message: "No class." });

      const existing = await tx.booking.findUnique({ where: { classId_userId: { classId, userId: session.userId } } });
      if (existing && existing.state !== "cancelled") {
        throw new ConflictException({ code: "conflict", message: "Already booked." });
      }

      const booked = await tx.booking.count({ where: { classId, state: "booked" } });
      const full = booked >= klass.capacity;
      const data = {
        state: (full ? "waitlist" : "booked") as Prisma.BookingCreateInput["state"],
        waitlistPos: full ? booked - klass.capacity + 1 : null,
      };
      return tx.booking.upsert({
        where: { classId_userId: { classId, userId: session.userId } },
        update: data,
        create: { classId, userId: session.userId, ...data },
      });
    });
  }

  cancel(session: Session, bookingId: string) {
    return this.scope.run(session, async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) throw new NotFoundException({ code: "not_found", message: "No booking." });
      // Late-cancel penalty would apply within the cutoff window (see 05); stubbed.
      return tx.booking.update({ where: { id: bookingId }, data: { state: "cancelled" } });
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

  checkin(session: Session, classId: string, dto: CheckinDto) {
    return this.scope.run(session, async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { classId_userId: { classId, userId: dto.userId } },
      });
      if (!booking) throw new NotFoundException({ code: "not_found", message: "No booking to check in." });
      return tx.booking.update({ where: { id: booking.id }, data: { state: "attended" } });
    });
  }
}
