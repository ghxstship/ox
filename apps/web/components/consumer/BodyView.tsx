"use client";
// OX web — Body Metrics (parity §A·19). Metric trend (OXLineChart), entry sheet
// (POST /me/body), and a progress-photo grid with before/after compare. States:
// empty · entry sheet · before/after compare.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OXLineChart, OXSegmented, OXButton, OXSheet, OXField, OXInput, OXSelect, OXToast, OXEmpty } from "@ox/ds";
import { useApi } from "../../lib/useApi";

interface Metric {
  id: string;
  kind: string;
  value: number;
  at: string;
}

export function BodyView() {
  const t = useTranslations("body");
  const api = useApi();

  const [kind, setKind] = useState("weight");
  const [open, setOpen] = useState(false);
  const [entryKind, setEntryKind] = useState("weight");
  const [entryValue, setEntryValue] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: "m1", kind: "weight", value: 178, at: "2026-05-01" },
    { id: "m2", kind: "weight", value: 176, at: "2026-05-15" },
    { id: "m3", kind: "weight", value: 174, at: "2026-06-01" },
    { id: "m4", kind: "weight", value: 173, at: "2026-06-15" },
    { id: "m5", kind: "waist", value: 33, at: "2026-05-01" },
    { id: "m6", kind: "waist", value: 32, at: "2026-06-15" },
  ]);

  const series = useMemo(() => metrics.filter((m) => m.kind === kind).map((m) => m.value), [metrics, kind]);

  async function addEntry() {
    const v = Number(entryValue);
    if (!v) return;
    setMetrics((arr) => [...arr, { id: `m${Date.now()}`, kind: entryKind, value: v, at: new Date().toISOString().slice(0, 10) }]);
    setEntryValue("");
    setOpen(false);
    setToast(t("saved"));
    await api.http.post("/me/body", { kind: entryKind, value: v, unit: entryKind === "weight" ? "lb" : "in" }).catch(() => {});
  }

  return (
    <div className="ox-page ox-stack">
      <div>
        <div className="ox-section-label">{t("kicker")}</div>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
      </div>

      <OXSegmented<string>
        value={kind}
        onChange={setKind}
        options={[{ value: "weight", label: t("weight") }, { value: "waist", label: t("waist") }, { value: "bodyfat", label: t("bodyfat") }]}
      />

      {series.length === 0 ? <OXEmpty title={t("empty")} /> : <OXLineChart series={series} height={180} />}

      <OXButton variant="oxide" onClick={() => setOpen(true)}>
        {t("addEntry")}
      </OXButton>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("photos")} · {t("compare")}</div>
        <div className="ox-grid-cards">
          {["Before · May 1", "After · Jun 15"].map((label) => (
            <div key={label} style={{ border: "1px solid var(--ox-line)", aspectRatio: "3/4", display: "grid", placeItems: "center", background: "var(--ox-ink)", color: "var(--ox-paper)" }}>
              <span style={{ fontFamily: "var(--ox-font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <OXSheet open={open} onClose={() => setOpen(false)} label={t("entry")}>
        <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320 }}>
          <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, margin: 0 }}>{t("entry")}</h2>
          <OXField label={t("kind")}>
            <OXSelect value={entryKind} onChange={setEntryKind} options={[{ value: "weight", label: t("weight") }, { value: "waist", label: t("waist") }, { value: "bodyfat", label: t("bodyfat") }]} />
          </OXField>
          <OXField label={t("value")}>
            <OXInput value={entryValue} onChange={setEntryValue} placeholder="173" />
          </OXField>
          <OXButton variant="oxide" block onClick={() => void addEntry()}>
            {t("addEntry")}
          </OXButton>
        </div>
      </OXSheet>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
