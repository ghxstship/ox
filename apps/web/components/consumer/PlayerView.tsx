"use client";

// OX web — set-logger Player. OXExercisePlayer for the current move, OXSetRow per
// set (toggle done), OXRestTimer between sets, OXToast on finish (+XP). Weights
// render through the @ox/rbac weight() i18n helper (member units).
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  OXExercisePlayer,
  OXSetRow,
  OXRestTimer,
  OXButton,
  OXToast,
} from "@ox/ds";
import { weight } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { sessionPlan } from "../../lib/seed";

const REST_TOTAL = 90;

export function PlayerView({ sessionId }: { sessionId: string }) {
  const t = useTranslations("player");
  const locale = useLocale();
  const { prefs } = usePrefs();

  const plan = sessionPlan; // sessionId would key the API fetch in production
  const [exIndex, setExIndex] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(REST_TOTAL);
  const [finished, setFinished] = useState(false);

  const ex = plan.exercises[exIndex]!;

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

  const setsDone = useMemo(
    () => ex.sets.filter((_, i) => done[`${ex.id}:${i}`]).length,
    [ex, done]
  );

  function toggleSet(i: number) {
    const key = `${ex.id}:${i}`;
    setDone((d) => ({ ...d, [key]: !d[key] }));
    if (!done[key]) {
      setResting(true);
      setRestLeft(REST_TOTAL);
    }
  }

  function next() {
    if (exIndex < plan.exercises.length - 1) setExIndex((i) => i + 1);
    else setFinished(true);
  }

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 28, margin: 0 }}>{t("title")}</h1>

      <OXExercisePlayer
        name={<em>{ex.name}</em>}
        setIndex={setsDone}
        setTotal={ex.sets.length}
        target={ex.target}
        cue={ex.cue}
        phase={resting ? "rest" : "work"}
        timer={resting ? `${restLeft}s` : undefined}
        onPrev={exIndex > 0 ? () => setExIndex((i) => i - 1) : undefined}
        onNext={next}
      />

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

      <section className="ox-stack" style={{ gap: 6 }}>
        {ex.sets.map((s, i) => (
          <OXSetRow
            key={i}
            index={i + 1}
            weight={weight(s.weight, prefs.units, { locale: prefs.locale })}
            reps={s.reps}
            done={!!done[`${ex.id}:${i}`]}
            onToggle={() => toggleSet(i)}
          />
        ))}
      </section>

      <OXButton variant="oxide" arrow block onClick={next}>
        {exIndex < plan.exercises.length - 1 ? t("logSet") : t("finish")}
      </OXButton>

      <OXToast
        visible={finished}
        tone="success"
        message={`${t("finished")} · +${240} ${t("xpAwarded")}`}
      />
    </div>
  );
}
