"use client";

// OX web — Train. Exercise library (OXFilterBar + OXExerciseCard), a session
// generator, recovery map (OXRecoveryMap), and PRs (OXPRChip). Exercises load
// from the API with a seed fallback (demo note when offline).
import { useEffect, useMemo, useState } from "react";
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
import { withFallback } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { exercises as seedExercises, recovery, prs, sessionPlan } from "../../lib/seed";
import { withLocale } from "../../lib/links";

type ExRow = (typeof seedExercises)[number];

const filterGroups = [
  { key: "muscle", label: "Muscle", options: ["push", "pull", "legs", "core", "full body"] },
  { key: "equipment", label: "Equipment", options: ["barbell", "dumbbell", "kettlebell", "cable", "bodyweight"] },
];

export function TrainView() {
  const t = useTranslations("train");
  const tc = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const api = useApi();

  const [rows, setRows] = useState<ExRow[] | null>(null);
  const [live, setLive] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let active = true;
    void withFallback<ExRow[]>(
      async () => {
        const page = await api.training.exercises();
        return page.data.map((e) => ({
          id: e.id,
          name: e.name,
          muscles: e.muscles.join(" · "),
          equipment: e.equipment.join(", "),
          floors: 0,
        }));
      },
      seedExercises
    ).then((res) => {
      if (!active) return;
      setRows(res.data);
      setLive(res.live);
    });
    return () => {
      active = false;
    };
  }, [api]);

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
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        {!live && <span className="ox-demo-note">{tc("demoData")}</span>}
      </div>

      <OXButton
        variant="oxide"
        arrow
        onClick={() => router.push(withLocale(locale, `/app/train/session/${sessionPlan.id}`))}
      >
        {t("generate")}
      </OXButton>

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
              <OXExerciseCard
                key={x.id}
                index={String(i + 1).padStart(2, "0")}
                name={x.name}
                muscles={x.muscles}
                equipment={x.equipment}
                floors={x.floors}
                onFind={() => router.push(withLocale(locale, "/app/map"))}
              />
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
    </div>
  );
}
