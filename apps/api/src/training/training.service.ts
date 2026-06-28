// Training — exercise library + workout sessions. Sessions are owner-scoped:
// every read/write runs AS the caller via supa.forUser(token) so RLS guarantees
// self-only rows.
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import type { Enums, Tables } from "@ox/supabase";
import type { Session } from "@ox/rbac";
import { SupaService } from "../common/supa.service";
import type { GenerateWorkoutDto, LogSetDto, StartWorkoutDto } from "./training.dto";

@Injectable()
export class TrainingService {
  constructor(private readonly supa: SupaService) {}

  /** Exercise library — public, filterable. Exercises carry no tenant scope. */
  async exercises(opts: { q?: string; muscle?: string; equipment?: string }) {
    let q = this.supa.forUser().from("Exercise").select("*").order("name", { ascending: true });
    if (opts.q) q = q.ilike("name", `%${opts.q}%`);
    if (opts.muscle) q = q.contains("muscles", [opts.muscle]);
    if (opts.equipment) q = q.contains("equipment", [opts.equipment]);
    const { data, error } = await q;
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /** Plan a session from focus + available gear. Returns a planned (unsaved) shape. */
  async generate(dto: GenerateWorkoutDto) {
    let q = this.supa.forUser().from("Exercise").select("*").limit(8);
    if (dto.focus) q = q.contains("muscles", [dto.focus]);
    if (dto.equipment?.length) q = q.overlaps("equipment", dto.equipment);
    const { data: pool, error } = await q;
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    const reps = dto.experience === "advanced" ? 5 : dto.experience === "new" ? 12 : 8;
    return {
      focus: dto.focus,
      goal: dto.goal ?? "build",
      planned: (pool ?? []).map((ex, i) => ({
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
  async start(session: Session, token: string | undefined, dto: StartWorkoutDto) {
    const { data, error } = await this.supa
      .forUser(token)
      .from("WorkoutSession")
      .insert({
        userId: session.userId,
        floorId: dto.floorId ?? session.floorId ?? null,
        scenery: (dto.scenery as Enums<"Scenery">) ?? null,
        startedAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /** Append a set to a session. RLS rejects sessions the caller doesn't own. */
  async logSet(session: Session, token: string | undefined, sessionId: string, dto: LogSetDto) {
    const sb = this.supa.forUser(token);
    const { data: owned } = await sb.from("WorkoutSession").select("id").eq("id", sessionId).maybeSingle();
    if (!owned) throw new NotFoundException({ code: "not_found", message: "No session." });
    const { data, error } = await sb
      .from("SetLog")
      .insert({
        sessionId,
        exerciseId: dto.exerciseId,
        index: dto.index,
        weight: dto.weight ?? null,
        reps: dto.reps,
        rpe: dto.rpe ?? null,
        done: dto.done ?? true,
      })
      .select()
      .single();
    if (error) throw new InternalServerErrorException({ code: "internal", message: error.message });
    return data;
  }

  /**
   * Finish a session: close it out, award XP, refresh PRs + Recovery.
   * "Herd that." XP scales with volume. All rows are the caller's own, so the
   * scoped client (RLS) is sufficient.
   */
  async finish(session: Session, token: string | undefined, sessionId: string) {
    const sb = this.supa.forUser(token);
    const { data: ws } = await sb.from("WorkoutSession").select("*").eq("id", sessionId).maybeSingle();
    if (!ws) throw new NotFoundException({ code: "not_found", message: "No session." });

    const { data: sets, error: setsErr } = await sb.from("SetLog").select("*").eq("sessionId", sessionId);
    if (setsErr) throw new InternalServerErrorException({ code: "internal", message: setsErr.message });
    const setRows = (sets ?? []) as Tables<"SetLog">[];

    const volume = setRows.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0);
    const xpAwarded = Math.max(40, Math.round(volume / 100));

    const { data: finished, error: finErr } = await sb
      .from("WorkoutSession")
      .update({ endedAt: new Date().toISOString(), xpAwarded })
      .eq("id", sessionId)
      .select()
      .single();
    if (finErr) throw new InternalServerErrorException({ code: "internal", message: finErr.message });

    // Bump the member's XP/level (the caller's own row).
    const { data: user } = await sb.from("User").select("xp, level").eq("id", session.userId).single();
    const newXp = (user?.xp ?? 0) + xpAwarded;
    const nextLevel = 1 + Math.floor(newXp / 200);
    await sb.from("User").update({ xp: newXp, level: nextLevel }).eq("id", session.userId);

    // PR refresh: best top-set weight per exercise this session.
    const prs: { lift: string; value: number }[] = [];
    const exerciseIds = [...new Set(setRows.map((s) => s.exerciseId))];
    for (const exId of exerciseIds) {
      const top = Math.max(...setRows.filter((s) => s.exerciseId === exId).map((s) => s.weight ?? 0));
      if (top <= 0) continue;
      const { data: ex } = await sb.from("Exercise").select("name").eq("id", exId).maybeSingle();
      const lift = ex?.name ?? exId;
      const { data: existing } = await sb
        .from("PR")
        .select("*")
        .eq("userId", session.userId)
        .eq("lift", lift)
        .order("value", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!existing || top > existing.value) {
        await sb.from("PR").insert({ userId: session.userId, lift, value: top, unit: "lb" });
        prs.push({ lift, value: top });
      }
    }

    // Recovery: trained muscles drop to "worked".
    let muscles: string[] = [];
    if (exerciseIds.length) {
      const { data: trained } = await sb.from("Exercise").select("muscles").in("id", exerciseIds);
      muscles = [...new Set((trained ?? []).flatMap((e) => e.muscles))];
      for (const muscle of muscles) {
        await sb
          .from("Recovery")
          .upsert(
            { userId: session.userId, muscle: muscle as Enums<"Muscle">, state: "worked" },
            { onConflict: "userId,muscle" },
          );
      }
    }

    return { session: finished, xpAwarded, newPRs: prs, recoveryTouched: muscles };
  }
}
