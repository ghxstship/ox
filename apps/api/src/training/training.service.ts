// Training — exercise library + workout sessions. Sessions are owner-scoped:
// every read/write goes through ScopeRunner so RLS guarantees self-only rows.
import { Injectable, NotFoundException } from "@nestjs/common";
import { prisma, Prisma, type Equipment, type Muscle } from "@ox/db";
import type { Session } from "@ox/rbac";
import { ScopeRunner } from "../common/scope.runner";
import type { GenerateWorkoutDto, LogSetDto, StartWorkoutDto } from "./training.dto";

@Injectable()
export class TrainingService {
  constructor(private readonly scope: ScopeRunner) {}

  /** Exercise library — public, filterable. Exercises carry no tenant scope. */
  exercises(opts: { q?: string; muscle?: string; equipment?: string }) {
    const where: Prisma.ExerciseWhereInput = {};
    if (opts.q) where.name = { contains: opts.q, mode: "insensitive" };
    if (opts.muscle) where.muscles = { has: opts.muscle as Muscle };
    if (opts.equipment) where.equipment = { has: opts.equipment as Equipment };
    return prisma.exercise.findMany({ where, orderBy: { name: "asc" } });
  }

  /** Plan a session from focus + available gear. Returns a planned (unsaved) shape. */
  async generate(dto: GenerateWorkoutDto) {
    const where: Prisma.ExerciseWhereInput = {};
    if (dto.focus) where.muscles = { has: dto.focus as Muscle };
    if (dto.equipment?.length) where.equipment = { hasSome: dto.equipment };
    const pool = await prisma.exercise.findMany({ where, take: 8 });
    const reps = dto.experience === "advanced" ? 5 : dto.experience === "new" ? 12 : 8;
    return {
      focus: dto.focus,
      goal: dto.goal ?? "build",
      planned: pool.map((ex, i) => ({
        exerciseId: ex.id,
        name: ex.name,
        cue: ex.cue,
        sets: 3,
        reps,
        index: i,
      })),
    };
  }

  /** Start a logged session for the caller. */
  start(session: Session, dto: StartWorkoutDto) {
    return this.scope.run(session, (tx) =>
      tx.workoutSession.create({
        data: {
          userId: session.userId,
          floorId: dto.floorId ?? session.floorId ?? null,
          scenery: (dto.scenery as Prisma.WorkoutSessionCreateInput["scenery"]) ?? null,
          startedAt: new Date(),
        },
      }),
    );
  }

  /** Append a set to a session. RLS rejects sessions the caller doesn't own. */
  async logSet(session: Session, sessionId: string, dto: LogSetDto) {
    return this.scope.run(session, async (tx) => {
      const owned = await tx.workoutSession.findUnique({ where: { id: sessionId } });
      if (!owned) throw new NotFoundException({ code: "not_found", message: "No session." });
      return tx.setLog.create({
        data: {
          sessionId,
          exerciseId: dto.exerciseId,
          index: dto.index,
          weight: dto.weight ?? null,
          reps: dto.reps,
          rpe: dto.rpe ?? null,
          done: dto.done ?? true,
        },
      });
    });
  }

  /**
   * Finish a session: close it out, award XP, refresh PRs + Recovery.
   * "Herd that." XP scales with volume.
   */
  async finish(session: Session, sessionId: string) {
    return this.scope.run(session, async (tx) => {
      const ws = await tx.workoutSession.findUnique({ where: { id: sessionId }, include: { sets: true } });
      if (!ws) throw new NotFoundException({ code: "not_found", message: "No session." });

      const volume = ws.sets.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0);
      const xpAwarded = Math.max(40, Math.round(volume / 100));

      const finished = await tx.workoutSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date(), xpAwarded },
      });

      // Bump the member's XP/level.
      const user = await tx.user.update({
        where: { id: session.userId },
        data: { xp: { increment: xpAwarded } },
      });
      const nextLevel = 1 + Math.floor(user.xp / 200);
      if (nextLevel !== user.level) {
        await tx.user.update({ where: { id: session.userId }, data: { level: nextLevel } });
      }

      // PR refresh: best top-set weight per exercise this session.
      const prs: { lift: string; value: number }[] = [];
      const exerciseIds = [...new Set(ws.sets.map((s) => s.exerciseId))];
      for (const exId of exerciseIds) {
        const top = Math.max(...ws.sets.filter((s) => s.exerciseId === exId).map((s) => s.weight ?? 0));
        if (top <= 0) continue;
        const ex = await tx.exercise.findUnique({ where: { id: exId } });
        const lift = ex?.name ?? exId;
        const existing = await tx.pR.findFirst({
          where: { userId: session.userId, lift },
          orderBy: { value: "desc" },
        });
        if (!existing || top > existing.value) {
          await tx.pR.create({ data: { userId: session.userId, lift, value: top, unit: "lb" } });
          prs.push({ lift, value: top });
        }
      }

      // Recovery: trained muscles drop to "worked".
      const trained = await tx.exercise.findMany({ where: { id: { in: exerciseIds } } });
      const muscles = [...new Set(trained.flatMap((e) => e.muscles))];
      for (const muscle of muscles) {
        await tx.recovery.upsert({
          where: { userId_muscle: { userId: session.userId, muscle } },
          update: { state: "worked" },
          create: { userId: session.userId, muscle, state: "worked" },
        });
      }

      return { session: finished, xpAwarded, newPRs: prs, recoveryTouched: muscles };
    });
  }
}
