"use client";
// OX web — Program Library (parity §A·5). Live programs from Supabase; enroll via
// POST /programs/:id/enroll. States: not-enrolled · enrolled (progress) ·
// completed. Enrollment is tracked client-side and mirrored to the API.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXCard, OXChip, OXButton, OXMeter, OXEmpty, OXToast, OXSkeleton } from "@ox/ds";
import { useApi } from "../../lib/useApi";
import { useLive } from "../../lib/useLive";
import { fetchPrograms } from "../../lib/supabase";

const SEED_PROGRAMS = [
  { id: "pg_531", title: "5/3/1 Strength", weeks: 12, sessionsPerWeek: 4, level: "Intermediate" },
  { id: "pg_hyro", title: "HYROX Prep", weeks: 8, sessionsPerWeek: 5, level: "Advanced" },
  { id: "pg_found", title: "Foundations", weeks: 6, sessionsPerWeek: 3, level: "Beginner" },
];

type State = "not_enrolled" | "enrolled" | "completed";

export function ProgramsView() {
  const t = useTranslations("programs");
  const api = useApi();
  const live = useLive(fetchPrograms, []);

  const programs =
    live.data && live.data.length
      ? live.data.map((p) => ({ id: p.id, title: p.title, weeks: 12, sessionsPerWeek: 4, level: "Intermediate" }))
      : SEED_PROGRAMS;

  const [state, setState] = useState<Record<string, { state: State; week: number }>>({});
  const [toast, setToast] = useState<string | null>(null);

  async function enroll(id: string) {
    setState((s) => ({ ...s, [id]: { state: "enrolled", week: 1 } }));
    setToast(t("enrolledToast"));
    await api.http.post(`/programs/${id}/enroll`).catch(() => {});
  }

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      {live.loading ? (
        <div className="ox-stack">
          <OXSkeleton height={120} />
          <OXSkeleton height={120} />
        </div>
      ) : programs.length === 0 ? (
        <OXEmpty title={t("empty")} />
      ) : (
        <div className="ox-grid-cards">
          {programs.map((p) => {
            const e = state[p.id] ?? { state: "not_enrolled" as State, week: 0 };
            return (
              <div key={p.id} className="ox-stack" style={{ gap: 8 }}>
                <OXCard
                  category={`${p.level} · ${p.weeks} ${t("weeks")}`}
                  title={<em>{p.title}</em>}
                  description={`${p.sessionsPerWeek}× / ${t("week")}`}
                  status={e.state === "completed" ? t("completed") : e.state === "enrolled" ? t("enrolled") : t("notEnrolled")}
                  meta={
                    e.state === "enrolled" ? (
                      <OXChip variant="oxide">{t("week")} {e.week}</OXChip>
                    ) : e.state === "completed" ? (
                      <OXChip variant="oxide-line">{t("completed")}</OXChip>
                    ) : (
                      <OXChip variant="ghost">{t("notEnrolled")}</OXChip>
                    )
                  }
                />
                {e.state === "enrolled" && <OXMeter title={t("progress")} current={e.week} total={p.weeks} openLabel={`${e.week}/${p.weeks}`} />}
                {e.state === "not_enrolled" && (
                  <OXButton variant="oxide" block onClick={() => void enroll(p.id)}>
                    {t("enroll")}
                  </OXButton>
                )}
                {e.state === "enrolled" && (
                  <OXButton
                    variant="default"
                    block
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        [p.id]: e.week >= p.weeks ? { state: "completed", week: p.weeks } : { state: "enrolled", week: e.week + 1 },
                      }))
                    }
                  >
                    {t("week")} +1
                  </OXButton>
                )}
              </div>
            );
          })}
        </div>
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
