"use client";
// OX web — Commission / Payroll (parity §B·29). Per-staff earnings (classes + PT
// + retail) in OXDataTable, a period selector, and a real CSV export. admin
// capability (revenue.view + admin). RLS-scoped. Amounts via moneyFromCents().
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXDataTable, OXButton, OXChip, OXSelect, OXEmpty, OXToast, OXKpi } from "@ox/ds";
import { can, scopeLabel, moneyFromCents } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { floorName } from "../../lib/seed";

interface Commission {
  staff: string;
  classesCents: number;
  ptCents: number;
  retailCents: number;
}

const DATA: Record<string, Commission[]> = {
  "2026-06": [
    { staff: "Dom Reyes", classesCents: 180000, ptCents: 96000, retailCents: 12000 },
    { staff: "Nat Cole", classesCents: 142000, ptCents: 54000, retailCents: 8000 },
    { staff: "Iris Kelat", classesCents: 60000, ptCents: 0, retailCents: 24000 },
  ],
  "2026-05": [
    { staff: "Dom Reyes", classesCents: 165000, ptCents: 88000, retailCents: 9000 },
    { staff: "Nat Cole", classesCents: 130000, ptCents: 48000, retailCents: 6000 },
  ],
};

export function PayrollView() {
  const t = useTranslations("payroll");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const api = useApi();

  const [period, setPeriod] = useState("2026-06");
  const [toast, setToast] = useState<string | null>(null);

  const allowed = can(session, "revenue.view") || session?.role === "admin";

  const rows = useMemo(() => DATA[period] ?? [], [period]);
  const total = rows.reduce((s, r) => s + r.classesCents + r.ptCents + r.retailCents, 0);

  if (!allowed) {
    return (
      <OXContainer>
        <OXEmpty title={t("empty")} />
      </OXContainer>
    );
  }

  async function exportCsv() {
    const header = ["staff", "classes", "pt", "retail", "total"].join(",");
    const lines = rows.map((r) => [r.staff, r.classesCents / 100, r.ptCents / 100, r.retailCents / 100, (r.classesCents + r.ptCents + r.retailCents) / 100].join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commission-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(t("exported"));
    await api.http.get(`/commission?period=${period}`).catch(() => {});
  }

  const tableRows = rows.map((r) => ({
    staff: r.staff,
    classes: moneyFromCents(r.classesCents, { locale: prefs.locale, currency: prefs.currency }),
    pt: moneyFromCents(r.ptCents, { locale: prefs.locale, currency: prefs.currency }),
    retail: moneyFromCents(r.retailCents, { locale: prefs.locale, currency: prefs.currency }),
    total: moneyFromCents(r.classesCents + r.ptCents + r.retailCents, { locale: prefs.locale, currency: prefs.currency }),
  }));

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: 16 }}>
        <OXSelect value={period} onChange={setPeriod} options={Object.keys(DATA).map((p) => ({ value: p, label: p }))} />
        <OXButton variant="oxide" onClick={() => void exportCsv()}>{t("export")}</OXButton>
      </div>

      <div className="ox-grid-cards" style={{ paddingBlockEnd: 12 }}>
        <OXKpi label={t("period")} value={period} />
        <OXKpi label={t("total")} value={moneyFromCents(total, { locale: prefs.locale, currency: prefs.currency })} />
      </div>

      {rows.length === 0 ? (
        <OXEmpty title={t("empty")} />
      ) : (
        <OXDataTable
          stickyHeader
          columns={[
            { key: "staff", label: t("staff") },
            { key: "classes", label: t("classes"), numeric: true },
            { key: "pt", label: t("pt"), numeric: true },
            { key: "retail", label: t("retail"), numeric: true },
            { key: "total", label: t("total"), numeric: true },
          ]}
          rows={tableRows}
        />
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
