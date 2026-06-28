"use client";

// OX web — operator Dashboard. KPIs (OXKpi), revenue (OXLineChart), floor load
// (OXBars), with RLS-scoped copy (scopeLabel). Revenue value goes through the
// @ox/rbac money() i18n helper. Coach sees a roster-scoped view; host one floor;
// admin global.
import { useTranslations } from "next-intl";
import { OXKpi, OXLineChart, OXBars, OXBanner, OXContainer } from "@ox/ds";
import { scope, scopeLabel, money, num } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { tx, revenueSeries, revenueLabels, floorLoadBars, floorName, members } from "../../lib/seed";

export function DashboardView() {
  const t = useTranslations("ops");
  const { session } = useSession();
  const { prefs } = usePrefs();

  // RLS mirror: the same data, scoped to what this identity may see.
  const scopedTx = scope("tx", tx, session);
  const scopedMembers = scope("members", members, session);
  const revenueCents = scopedTx.reduce((s, r) => s + r.amountCents, 0);

  return (
    <OXContainer>
      <div style={{ paddingBlock: "8px 0" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("dashboard")}</h1>
        <div className="ox-demo-note">{scopeLabel(session, floorName)}</div>
      </div>

      <OXBanner tone="info">{t("scope")}: {scopeLabel(session, floorName)}</OXBanner>

      <div className="ox-grid-cards" style={{ paddingBlock: 16 }}>
        <OXKpi label={t("revenue")} value={money(revenueCents / 100, { locale: prefs.locale, currency: prefs.currency, cents: false })} delta="+12%" trend="up" />
        <OXKpi label={t("activeMembers")} value={num(scopedMembers.length, { locale: prefs.locale })} delta="+3" trend="up" />
        <OXKpi label={t("floorLoad")} value="78%" delta="-4%" trend="down" />
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("revenue")}</div>
        <OXLineChart series={revenueSeries} labels={revenueLabels} height={180} />
      </section>

      <section className="ox-stack" style={{ gap: 10, paddingBlockStart: 16 }}>
        <div className="ox-section-label">{t("floorLoad")}</div>
        <OXBars data={floorLoadBars} peakIndex={4} />
      </section>
    </OXContainer>
  );
}
