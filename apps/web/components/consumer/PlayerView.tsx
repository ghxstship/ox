"use client";
// OX web — Set-Logger v2 (parity §A·3). The Player: OXExercisePlayer for the
// current move, an editable set grid (weight / reps / RPE via OXSetRow + inline
// inputs), OXRestTimer between sets, auto-progress (clean low-RPE final set →
// PR-hit celebrate), deload suggestion, finish → POST /workouts/:id/finish → XP
// toast. Each completed set posts to /workouts/:id/sets. Weights render through
// the @ox/rbac weight() i18n helper.
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  OXExercisePlayer,
  OXSetRow,
  OXRestTimer,
  OXButton,
  OXToast,
  OXInput,
  OXChip,
  OXIcon,
  OXBanner,
} from "@ox/ds";
import { weight } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { sessionPlan } from "../../lib/seed";

const REST_TOTAL = 90;

interface SetState {
  weight: number;
  reps: number;
  rpe: number;
  done: boolean;
}

export function PlayerView({ sessionId }: { sessionId: string }) {
  const t = useTranslations("player");
  const { prefs } = usePrefs();
  const api = useApi();

  const plan = sessionPlan;
  const [exIndex, setExIndex] = useState(0);
  const [sets, setSets] = useState<Record<string, SetState[]>>(() => {
    const init: Record<string, SetState[]> = {};
    for (const ex of plan.exercises) init[ex.id] = ex.sets.map((s) => ({ weight: s.weight, reps: s.reps, rpe: 8, done: false }));
    return init;
  });
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(REST_TOTAL);
  const [finished, setFinished] = useState(false);
  const [prHit, setPrHit] = useState<string | null>(null);
  const [deload, setDeload] = useState(false);

  const ex = plan.exercises[exIndex]!;
  const exSets = sets[ex.id] ?? [];

  useEffect(() => {
    if (!resting) return;
    if (restLeft <= 0) {
      setResting(false);
      setRestLeft(REST_TOTAL);
      return;
    }
    const id = setTimeout(() => setRestLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resting, restLeft]);

  const setsDone = useMemo(() => exSets.filter((s) => s.done).length, [exSets]);

  function patchSet(i: number, patch: Partial<SetState>) {
    setSets((all) => ({ ...all, [ex.id]: all[ex.id]!.map((s, k) => (k === i ? { ...s, ...patch } : s)) }));
  }

  function toggleSet(i: number) {
    const cur = exSets[i]!;
    const becomingDone = !cur.done;
    patchSet(i, { done: becomingDone });
    if (becomingDone) {
      // Persist the set (best-effort; offline-safe).
      void api.training
        .logSet(sessionId, { exerciseId: ex.id, index: i, weight: cur.weight, reps: cur.reps, rpe: cur.rpe, done: true })
        .catch(() => {});
      // Auto-progress: a clean low-RPE final set at top load = a PR.
      if (cur.rpe <= 7 && i === exSets.length - 1) {
        const best = Math.max(...exSets.map((s) => s.weight));
        if (cur.weight >= best) setPrHit(ex.name);
      }
      // Deload heuristic: repeated high RPE.
      if (exSets.filter((s, k) => (k === i ? true : s.done) && (k === i ? cur.rpe : s.rpe) >= 9).length >= 2) setDeload(true);
      setResting(true);
      setRestLeft(REST_TOTAL);
    }
  }

  function addSet() {
    const last = exSets[exSets.length - 1];
    setSets((all) => ({ ...all, [ex.id]: [...all[ex.id]!, { weight: (last?.weight ?? 45) + 5, reps: last?.reps ?? 5, rpe: 8, done: false }] }));
  }

  function next() {
    setDeload(false);
    setPrHit(null);
    if (exIndex < plan.exercises.length - 1) setExIndex((i) => i + 1);
    else {
      void api.training.finish(sessionId).catch(() => {});
      setFinished(true);
    }
  }

  const lastExercise = exIndex >= plan.exercises.length - 1;

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 28, margin: 0 }}>{t("title")}</h1>
        <OXChip variant="oxide-line">{`${exIndex + 1} / ${plan.exercises.length}`}</OXChip>
      </div>

      <OXExercisePlayer
        name={<em>{ex.name}</em>}
        setIndex={setsDone}
        setTotal={exSets.length}
        target={ex.target}
        cue={ex.cue}
        phase={resting ? "rest" : "work"}
        timer={resting ? `${restLeft}s` : undefined}
        onPrev={exIndex > 0 ? () => setExIndex((i) => i - 1) : undefined}
        onNext={next}
      />

      {prHit && (
        <OXBanner tone="ok">
          <OXIcon name="check" size="sm" /> {t("prHit")} · {prHit}
        </OXBanner>
      )}
      {deload && <OXBanner tone="warn">{t("deload")}</OXBanner>}

      {resting && (
        <OXRestTimer
          seconds={restLeft}
          total={REST_TOTAL}
          running
          onSkip={() => {
            setResting(false);
            setRestLeft(REST_TOTAL);
          }}
        />
      )}

      <section className="ox-stack" style={{ gap: 8 }}>
        {exSets.map((s, i) => (
          <div key={i} className="ox-stack" style={{ gap: 6, borderBottom: "1px solid var(--ox-line)", paddingBlockEnd: 8 }}>
            <OXSetRow
              index={i + 1}
              weight={weight(s.weight, prefs.units, { locale: prefs.locale })}
              reps={s.reps}
              rpe={s.rpe}
              done={s.done}
              onToggle={() => toggleSet(i)}
            />
            {!s.done && (
              <div className="ox-row-wrap" style={{ gap: 8 }}>
                <label style={{ flex: 1, minInlineSize: 90 }}>
                  <span className="ox-section-label" style={{ margin: 0 }}>{t("weight")}</span>
                  <OXInput value={String(s.weight)} onChange={(v) => patchSet(i, { weight: Number(v) || 0 })} />
                </label>
                <label style={{ flex: 1, minInlineSize: 70 }}>
                  <span className="ox-section-label" style={{ margin: 0 }}>{t("reps")}</span>
                  <OXInput value={String(s.reps)} onChange={(v) => patchSet(i, { reps: Number(v) || 0 })} />
                </label>
                <label style={{ flex: 1, minInlineSize: 70 }}>
                  <span className="ox-section-label" style={{ margin: 0 }}>{t("rpe")}</span>
                  <OXInput value={String(s.rpe)} onChange={(v) => patchSet(i, { rpe: Math.min(10, Number(v) || 0) })} />
                </label>
              </div>
            )}
          </div>
        ))}
        <OXButton variant="ghost" onClick={addSet}>
          <OXIcon name="add" size="sm" /> {t("addSet")}
        </OXButton>
      </section>

      <OXButton variant="oxide" arrow block onClick={next}>
        {lastExercise ? t("finish") : t("nextExercise")}
      </OXButton>

      <OXToast visible={finished} tone="success" message={`${t("finished")} · +240 ${t("xpAwarded")}`} />
    </div>
  );
}
