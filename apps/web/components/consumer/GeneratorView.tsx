"use client";
// OX web — Workout Generator (parity §A·1). Pick goal / focus / minutes /
// equipment, then POST /workouts/generate → an (unsaved) session. States:
// empty (pre-gen) · generating (skeleton) · ready · regenerated (diff note) ·
// no-equipment fallback. Starting the session deep-links into the Player.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  OXSegmented,
  OXChip,
  OXButton,
  OXField,
  OXStepper,
  OXSkeleton,
  OXMeter,
  OXIcon,
  OXEmpty,
} from "@ox/ds";
import type { WorkoutSession } from "@ox/types";
import { useApi } from "../../lib/useApi";
import { useLive, orFallback } from "../../lib/useLive";
import { fetchExercises } from "../../lib/supabase";
import { exercises as seedExercises } from "../../lib/seed";
import { withLocale } from "../../lib/links";

type Goal = "strength" | "hypertrophy" | "conditioning";
type Focus = "push" | "pull" | "legs" | "full_body";
const EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "cable", "bodyweight"];

interface GenMove {
  id: string;
  name: string;
  muscles: string;
  target: string;
}

export function GeneratorView() {
  const t = useTranslations("generate");
  const router = useRouter();
  const locale = useLocale();
  const api = useApi();

  const lib = useLive(fetchExercises, [], []);
  const exercises = useMemo(
    () =>
      orFallback(lib.data, []).length
        ? orFallback(lib.data, []).map((e) => ({ id: e.id, name: e.name, muscles: e.muscles.join(" · "), equipment: e.equipment as string[] }))
        : seedExercises.map((e) => ({ id: e.id, name: e.name, muscles: e.muscles, equipment: [e.equipment] })),
    [lib.data]
  );

  const [goal, setGoal] = useState<Goal>("strength");
  const [focus, setFocus] = useState<Focus>("push");
  const [minutes, setMinutes] = useState(45);
  const [equipment, setEquipment] = useState<string[]>(["barbell", "dumbbell"]);
  const [phase, setPhase] = useState<"empty" | "generating" | "ready">("empty");
  const [moves, setMoves] = useState<GenMove[]>([]);
  const [regenerated, setRegenerated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const noEquipment = equipment.length === 0;

  function toggleEquip(e: string) {
    setEquipment((arr) => (arr.includes(e) ? arr.filter((x) => x !== e) : [...arr, e]));
  }

  function localGenerate(): GenMove[] {
    const eq = noEquipment ? ["bodyweight"] : equipment;
    const pool = exercises.filter((e) => e.equipment.some((x) => eq.includes(x)) || noEquipment);
    const usable = pool.length ? pool : exercises;
    const count = Math.max(3, Math.min(6, Math.round(minutes / 10)));
    const reps = goal === "strength" ? "5 × 5" : goal === "hypertrophy" ? "4 × 10" : "3 × 15";
    return usable.slice(0, count).map((e) => ({ id: e.id, name: e.name, muscles: e.muscles, target: reps }));
  }

  async function generate() {
    setPhase("generating");
    const prevCount = moves.length;
    try {
      const session: WorkoutSession = await api.training.generate({
        goal,
        focus,
        experience: "intermediate",
        equipment: noEquipment ? ["bodyweight"] : equipment,
      });
      const sets = session.sets ?? [];
      if (sets.length) {
        const byEx = new Map<string, number>();
        for (const s of sets) byEx.set(s.exerciseId, (byEx.get(s.exerciseId) ?? 0) + 1);
        const next: GenMove[] = [...byEx.entries()].map(([exId, n]) => {
          const ex = exercises.find((e) => e.id === exId);
          return { id: exId, name: ex?.name ?? exId, muscles: ex?.muscles ?? "", target: `${n} sets` };
        });
        setMoves(next.length ? next : localGenerate());
      } else {
        setMoves(localGenerate());
      }
      setSessionId(session.id ?? null);
    } catch {
      setMoves(localGenerate());
      setSessionId(null);
    }
    setRegenerated(prevCount > 0);
    setPhase("ready");
  }

  return (
    <div className="ox-page ox-stack">
      <div>
        <div className="ox-section-label">{t("kicker")}</div>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
      </div>

      <OXField label={t("goal")}>
        <OXSegmented<Goal>
          value={goal}
          onChange={setGoal}
          options={[
            { value: "strength", label: "Strength" },
            { value: "hypertrophy", label: "Hypertrophy" },
            { value: "conditioning", label: "Conditioning" },
          ]}
        />
      </OXField>

      <OXField label={t("focus")}>
        <OXSegmented<Focus>
          value={focus}
          onChange={setFocus}
          options={[
            { value: "push", label: "Push" },
            { value: "pull", label: "Pull" },
            { value: "legs", label: "Legs" },
            { value: "full_body", label: "Full body" },
          ]}
        />
      </OXField>

      <OXField label={t("minutes")}>
        <OXStepper value={minutes} min={20} max={90} onChange={setMinutes} />
      </OXField>

      <OXField label={t("equipment")} hint={noEquipment ? t("noEquipment") : undefined}>
        <div className="ox-row-wrap">
          {EQUIPMENT.map((e) => {
            const on = equipment.includes(e);
            return (
              <button key={e} type="button" onClick={() => toggleEquip(e)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}>
                <OXChip variant={on ? "oxide" : "ghost"}>
                  {on ? <OXIcon name="check" size="sm" /> : null} {e}
                </OXChip>
              </button>
            );
          })}
        </div>
      </OXField>

      <OXButton variant="oxide" arrow block onClick={() => void generate()}>
        {phase === "ready" ? t("regenerate") : t("generate")}
      </OXButton>

      {phase === "empty" && <OXEmpty title={t("empty")} />}

      {phase === "generating" && (
        <div className="ox-stack">
          <div className="ox-section-label">{t("generating")}</div>
          <OXSkeleton height={64} />
          <OXSkeleton height={64} />
          <OXSkeleton height={64} />
        </div>
      )}

      {phase === "ready" && (
        <section className="ox-stack" style={{ gap: 10 }}>
          <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
            <div className="ox-section-label" style={{ margin: 0 }}>{t("ready")}</div>
            {regenerated && <OXChip variant="oxide-line">{t("diff")}</OXChip>}
          </div>
          <OXMeter title={t("minutes")} current={moves.length} total={6} openLabel={`${minutes} min`} />
          {moves.map((m, i) => (
            <div key={m.id + i} className="ox-row-wrap" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--ox-line)", paddingBlock: 10 }}>
              <span>
                <span style={{ fontFamily: "var(--ox-font-mono)", color: "var(--ox-stone)", marginInlineEnd: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: "var(--ox-font-serif)", fontSize: 17 }}>{m.name}</span>
                <span className="ox-demo-note"> · {m.muscles}</span>
              </span>
              <span style={{ fontFamily: "var(--ox-font-mono)", color: "var(--ox-oxide)" }}>{m.target}</span>
            </div>
          ))}
          <OXButton
            variant="primary"
            arrow
            block
            onClick={() => router.push(withLocale(locale, `/app/train/session/${sessionId ?? "s_generated"}`))}
          >
            {t("start")}
          </OXButton>
        </section>
      )}
    </div>
  );
}
