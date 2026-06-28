"use client";
// OX web — Order Tracking + Returns (parity §A·12). A vertical timeline composed
// from OXSteps (the DS has no OXTimeline primitive — compose, don't invent):
// placed → packed → shipped → delivered. Start-return opens a sheet → POST
// /orders/:id/return.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXSteps, OXButton, OXChip, OXSheet, OXField, OXSelect, OXToast, OXListRow } from "@ox/ds";
import { moneyFromCents, date } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";

const STAGES = ["placed", "packed", "shipped", "delivered"] as const;
type Stage = (typeof STAGES)[number];

export function OrderView({ id }: { id: string }) {
  const t = useTranslations("orders");
  const { prefs } = usePrefs();
  const api = useApi();

  // Demo order — in production this is GET /me/orders/:id/tracking.
  const order = {
    id,
    placedAt: new Date(Date.now() - 4 * 864e5).toISOString(),
    totalCents: 8800,
    trackingNo: "OX-9F2K-2207",
    items: [
      { name: "Oxide Hoodie", size: "L", priceCents: 8800 },
    ],
  };
  const currentStage: Stage = "shipped";
  const currentIdx = STAGES.indexOf(currentStage);

  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState("size");
  const [toast, setToast] = useState<string | null>(null);

  async function startReturn() {
    setReturnOpen(false);
    setToast(t("returnStarted"));
    await api.http.post(`/orders/${id}/return`, { reason }).catch(() => {});
  }

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="ox-section-label">{t("title")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 28, margin: 0 }}>#{order.id}</h1>
        </div>
        <OXChip variant="oxide-line">{order.trackingNo}</OXChip>
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("tracking")}</div>
        <OXSteps steps={STAGES.map((s, i) => ({ label: t(s), state: i < currentIdx ? "done" : i === currentIdx ? "now" : undefined }))} />
        <div className="ox-demo-note">{t("placed")} · {date(order.placedAt, { locale: prefs.locale })}</div>
      </section>

      <section className="ox-stack" style={{ gap: 6 }}>
        <div className="ox-section-label">Items</div>
        {order.items.map((it, i) => (
          <OXListRow key={i} title={it.name} sub={`Size ${it.size}`} trail={moneyFromCents(it.priceCents, { locale: prefs.locale, currency: prefs.currency })} />
        ))}
      </section>

      <OXButton variant="default" onClick={() => setReturnOpen(true)}>
        {t("startReturn")}
      </OXButton>

      <OXSheet open={returnOpen} onClose={() => setReturnOpen(false)} label={t("startReturn")}>
        <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320 }}>
          <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, margin: 0 }}>{t("startReturn")}</h2>
          <OXField label={t("reason")}>
            <OXSelect
              value={reason}
              onChange={setReason}
              options={[
                { value: "size", label: "Wrong size" },
                { value: "defect", label: "Defective" },
                { value: "changed", label: "Changed mind" },
              ]}
            />
          </OXField>
          <OXButton variant="oxide" block onClick={() => void startReturn()}>
            {t("startReturn")}
          </OXButton>
        </div>
      </OXSheet>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
