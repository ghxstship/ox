"use client";

// OX web — Cart / checkout. Line items + total + checkout CTA. Empty state via
// OXEmpty. All money through moneyFromCents() (i18n gate). Demo line items.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXButton, OXEmpty, OXToast } from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { products } from "../../lib/seed";

export function CartView() {
  const t = useTranslations("shop");
  const { prefs } = usePrefs();
  const [items, setItems] = useState(() => [
    { ...products[0]!, size: "M", qty: 1 },
    { ...products[1]!, size: "L", qty: 1 },
  ]);
  const [placed, setPlaced] = useState(false);

  const totalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="ox-page">
        <OXEmpty title={t("emptyCart")} />
      </div>
    );
  }

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("cart")}</h1>
      <section className="ox-stack" style={{ gap: 0 }}>
        {items.map((i, idx) => (
          <div
            key={i.id}
            className="ox-row-wrap"
            style={{ justifyContent: "space-between", borderBottom: "1px solid var(--ox-line)", paddingBlock: 12 }}
          >
            <span style={{ fontFamily: "var(--ox-font-sans)" }}>
              {i.name} <span className="ox-demo-note">· {t("size")} {i.size} · ×{i.qty}</span>
            </span>
            <span className="ox-row-wrap" style={{ gap: 12 }}>
              <span style={{ fontFamily: "var(--ox-font-mono)", color: "var(--ox-oxide)" }}>
                {moneyFromCents(i.priceCents * i.qty, { locale: prefs.locale, currency: prefs.currency })}
              </span>
              <button
                type="button"
                aria-label={`Remove ${i.name}`}
                className="ox-hit"
                onClick={() => setItems((arr) => arr.filter((_, k) => k !== idx))}
                style={{ border: "1px solid var(--ox-line)", background: "var(--ox-paper)", cursor: "pointer", fontFamily: "var(--ox-font-mono)", fontSize: 12 }}
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </section>

      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <span className="ox-section-label" style={{ margin: 0 }}>
          {t("total")}
        </span>
        <span style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, color: "var(--ox-oxide)" }}>
          {moneyFromCents(totalCents, { locale: prefs.locale, currency: prefs.currency })}
        </span>
      </div>

      <OXButton variant="oxide" arrow block onClick={() => setPlaced(true)}>
        {t("checkout")}
      </OXButton>

      <OXToast visible={placed} tone="success" message={t("checkout")} />
    </div>
  );
}
