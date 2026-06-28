"use client";

// OX web — Train. Exercise library (OXFilterBar + OXExerciseCard) read LIVE from
// Supabase (public discovery; seed only as offline fallback), entry points to the
// Generator / Programs / Analytics, recovery map (OXRecoveryMap), and PRs.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  OXFilterBar,
  OXExerciseCard,
  OXRecoveryMap,
  OXPRChip,
  OXButton,
  OXEmpty,
  OXSkeleton,
} from "@ox/ds";
import { useLive } from "../../lib/useLive";
import { fetchExercises } from "../../lib/supabase";
import { exercises as seedExercises, recovery, prs } from "../../lib/seed";
import { withLocale } from "../../lib/links";
import { ExerciseDemoSheet } from "../parity/ExerciseDemoSheet";

interface ExRow {
  id: string;
  name: string;
  muscles: string;
  equipment: string;
  floors: number;
}

const filterGroups = [
  { key: "muscle", label: "Muscle", options: ["push", "pull", "legs", "core", "full body"] },
  { key: "equipment", label: "Equipment", options: ["barbell", "dumbbell", "kettlebell", "cable", "bodyweight"] },
];

export function TrainView() {
  const t = useTranslations("train");
  const tprog = useTranslations("programs");
  const tanalytics = useTranslations("analytics");
  const router = useRouter();
  const locale = useLocale();

  const lib = useLive(fetchExercises, []);
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [demo, setDemo] = useState<{ id: string; name: string; cue?: string } | null>(null);

  const rows: ExRow[] | null = useMemo(() => {
    if (lib.loading) return null;
    const live = (lib.data ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      muscles: e.muscles.join(" · "),
      equipment: e.equipment.join(", "),
      floors: 0,
    }));
    if (live.length) return live;
    return seedExercises.map((e) => ({ id: e.id, name: e.name, muscles: e.muscles, equipment: e.equipment, floors: e.floors }));
  }, [lib.loading, lib.data]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      const m = filters.muscle;
      const eq = filters.equipment;
      const okM = !m || r.muscles.includes(m.replace(" ", "_")) || r.muscles.includes(m);
      const okE = !eq || r.equipment.includes(eq);
      return okM && okE;
    });
  }, [rows, filters]);

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <div className="ox-row-wrap">
        <OXButton variant="oxide" arrow onClick={() => router.push(withLocale(locale, "/app/train/generate"))}>
          {t("generate")}
        </OXButton>
        <OXButton variant="default" onClick={() => router.push(withLocale(locale, "/app/train/programs"))}>
          {tprog("title")}
        </OXButton>
        <OXButton variant="default" onClick={() => router.push(withLocale(locale, "/app/you/analytics"))}>
          {tanalytics("title")}
        </OXButton>
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("library")}</div>
        <OXFilterBar
          groups={filterGroups}
          value={filters}
          onChange={(key, option) => setFilters((f) => ({ ...f, [key]: option }))}
        />
        {rows === null ? (
          <div className="ox-stack">
            <OXSkeleton height={72} />
            <OXSkeleton height={72} />
            <OXSkeleton height={72} />
          </div>
        ) : filtered.length === 0 ? (
          <OXEmpty title={t("noResult")} />
        ) : (
          <div className="ox-stack" style={{ gap: 8 }}>
            {filtered.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setDemo({ id: x.id, name: x.name, cue: undefined })}
                style={{ border: "none", background: "none", padding: 0, inlineSize: "100%", textAlign: "start", cursor: "pointer" }}
              >
                <OXExerciseCard
                  index={String(i + 1).padStart(2, "0")}
                  name={x.name}
                  muscles={x.muscles}
                  equipment={x.equipment}
                  floors={x.floors}
                  onFind={() => router.push(withLocale(locale, "/app/map"))}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("recovery")}</div>
        <OXRecoveryMap regions={recovery} />
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("prs")}</div>
        <div className="ox-grid-cards">
          {prs.map((p) => (
            <OXPRChip key={p.lift} lift={p.lift} value={p.value} unit={p.unit} delta={`+${p.delta}`} prev={p.prev} history={p.history} />
          ))}
        </div>
      </section>

      {demo && (
        <ExerciseDemoSheet
          open
          onClose={() => setDemo(null)}
          exerciseId={demo.id}
          fallbackName={demo.name}
          fallbackCue={demo.cue}
        />
      )}
    </div>
  );
}
