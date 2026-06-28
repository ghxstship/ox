"use client";

// OX web — operator Reports. Revenue trend (OXLineChart) + cohort bars (OXBars).
// Scope copy via scopeLabel; coach sees own-roster reports, host one floor,
// admin global.
import { useTranslations } from "next-intl";
import { OXContainer, OXLineChart, OXBars, OXKpi } from "@ox/ds";
import { scopeLabel, num } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { revenueSeries, revenueLabels, floorName } from "../../lib/seed";

const cohort = [
  { label: "Compass", value: 42 },
  { label: "Sound", value: 28 },
  { label: "Distant", value: 16 },
  { label: "Founder", value: 9 },
];

export function ReportsView() {
  const t = useTranslations("ops");
  const { session } = useSession();
  const { prefs } = usePrefs();

  return (
    <OXContainer>
      <div style={{ paddingBlock: "8px 0" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("reports")}</h1>
        <div className="ox-demo-note">{scopeLabel(session, floorName)}</div>
      </div>

      <div className="ox-grid-cards" style={{ paddingBlock: 16 }}>
        <OXKpi label="Retention" value="91%" delta="+2%" trend="up" />
        <OXKpi label="New members" value={num(34, { locale: prefs.locale })} delta="+8" trend="up" />
        <OXKpi label="Avg. visits / wk" value="3.4" delta="+0.2" trend="up" />
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">Revenue trend</div>
        <OXLineChart series={revenueSeries} labels={revenueLabels} height={180} />
      </section>

      <section className="ox-stack" style={{ gap: 10, paddingBlockStart: 16 }}>
        <div className="ox-section-label">Plan cohort</div>
        <OXBars data={cohort} peakIndex={0} />
      </section>
    </OXContainer>
  );
}
