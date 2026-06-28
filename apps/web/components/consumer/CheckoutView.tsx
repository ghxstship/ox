"use client";
// OX web — Checkout v2 (parity §A·13/14). Address book, shipping radios, promo /
// access code, tax math, place order (POST /checkout). States: empty-address ·
// method-select · tax math · placed.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { OXField, OXInput, OXChoice, OXButton, OXChip, OXToast, OXEmpty, OXSheet } from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { products as seedProducts } from "../../lib/seed";
import { withLocale } from "../../lib/links";

interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  region: string;
  postal: string;
  country: string;
}

const SHIPPING = [
  { id: "standard", label: "Standard", costCents: 500, etaDays: 5 },
  { id: "express", label: "Express", costCents: 1500, etaDays: 2 },
];

const PROMOS: Record<string, number> = { HERD10: 10, FOUNDER: 20 };

export function CheckoutView() {
  const t = useTranslations("checkout");
  const { prefs } = usePrefs();
  const router = useRouter();
  const locale = useLocale();
  const api = useApi();

  const [addresses, setAddresses] = useState<Address[]>([
    { id: "a1", label: "Home", line1: "9 Pier Rd", city: "San Francisco", region: "CA", postal: "94111", country: "US" },
  ]);
  const [addrId, setAddrId] = useState<string | null>("a1");
  const [shipId, setShipId] = useState("standard");
  const [promo, setPromo] = useState("");
  const [appliedPct, setAppliedPct] = useState(0);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Address, "id">>({ label: "", line1: "", city: "", region: "", postal: "", country: "US" });

  const items = useMemo(() => [
    { ...seedProducts[0]!, qty: 1 },
    { ...seedProducts[1]!, qty: 1 },
  ], []);

  const subtotal = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
  const ship = SHIPPING.find((s) => s.id === shipId)!;
  const discount = Math.round((subtotal * appliedPct) / 100);
  const taxable = subtotal - discount;
  const tax = Math.round(taxable * 0.0875);
  const total = taxable + ship.costCents + tax;

  function applyPromo() {
    const pct = PROMOS[promo.trim().toUpperCase()];
    if (pct) {
      setAppliedPct(pct);
      setPromoMsg(t("promoApplied"));
    } else {
      setAppliedPct(0);
      setPromoMsg(t("promoInvalid"));
    }
  }

  function addAddress() {
    const id = `a${Date.now()}`;
    setAddresses((a) => [...a, { id, ...draft }]);
    setAddrId(id);
    setAddOpen(false);
    setDraft({ label: "", line1: "", city: "", region: "", postal: "", country: "US" });
  }

  async function place() {
    setPlaced(true);
    await api.shop.checkout({ address: addresses.find((a) => a.id === addrId), shipping: shipId }).catch(() => {});
    setTimeout(() => router.push(withLocale(locale, "/app/you/orders/o_new")), 1200);
  }

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
          <div className="ox-section-label" style={{ margin: 0 }}>{t("address")}</div>
          <OXButton variant="ghost" size="sm" onClick={() => setAddOpen(true)}>{t("addAddress")}</OXButton>
        </div>
        {addresses.length === 0 ? (
          <OXEmpty title={t("noAddress")} />
        ) : (
          addresses.map((a) => (
            <OXChoice
              key={a.id}
              type="radio"
              name="address"
              checked={addrId === a.id}
              onChange={() => setAddrId(a.id)}
              label={`${a.label} · ${a.line1}`}
              sub={`${a.city}, ${a.region} ${a.postal} · ${a.country}`}
            />
          ))
        )}
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("shipping")}</div>
        {SHIPPING.map((s) => (
          <OXChoice
            key={s.id}
            type="radio"
            name="shipping"
            checked={shipId === s.id}
            onChange={() => setShipId(s.id)}
            label={`${s.label} · ${moneyFromCents(s.costCents, { locale: prefs.locale, currency: prefs.currency })}`}
            sub={`${s.etaDays} days`}
          />
        ))}
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("promo")}</div>
        <div className="ox-row-wrap">
          <OXInput value={promo} onChange={setPromo} placeholder="HERD10" />
          <OXButton variant="default" onClick={applyPromo}>{t("applyPromo")}</OXButton>
          {appliedPct > 0 && <OXChip variant="oxide">-{appliedPct}%</OXChip>}
        </div>
        {promoMsg && <div className="ox-demo-note">{promoMsg}</div>}
      </section>

      <section className="ox-stack" style={{ gap: 6, borderBlockStart: "1px solid var(--ox-line)", paddingBlockStart: 12 }}>
        {[
          { k: t("subtotal"), v: subtotal },
          ...(discount ? [{ k: t("discount"), v: -discount }] : []),
          { k: t("shippingCost"), v: ship.costCents },
          { k: t("tax"), v: tax },
        ].map((r) => (
          <div key={r.k} className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
            <span className="ox-demo-note">{r.k}</span>
            <span style={{ fontFamily: "var(--ox-font-mono)" }}>{moneyFromCents(r.v, { locale: prefs.locale, currency: prefs.currency })}</span>
          </div>
        ))}
        <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
          <span className="ox-section-label" style={{ margin: 0 }}>{t("total")}</span>
          <span style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, color: "var(--ox-oxide)" }}>
            {moneyFromCents(total, { locale: prefs.locale, currency: prefs.currency })}
          </span>
        </div>
      </section>

      <OXButton variant="oxide" arrow block onClick={() => void place()}>
        {t("placeOrder")}
      </OXButton>

      <OXSheet open={addOpen} onClose={() => setAddOpen(false)} label={t("addAddress")}>
        <div className="ox-stack" style={{ gap: 12, padding: 20, minInlineSize: 320 }}>
          <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, margin: 0 }}>{t("addAddress")}</h2>
          <OXField label={t("label")}><OXInput value={draft.label} onChange={(v) => setDraft((d) => ({ ...d, label: v }))} /></OXField>
          <OXField label={t("line1")}><OXInput value={draft.line1} onChange={(v) => setDraft((d) => ({ ...d, line1: v }))} /></OXField>
          <OXField label={t("city")}><OXInput value={draft.city} onChange={(v) => setDraft((d) => ({ ...d, city: v }))} /></OXField>
          <div className="ox-row-wrap">
            <OXField label={t("region")} style={{ flex: 1 }}><OXInput value={draft.region} onChange={(v) => setDraft((d) => ({ ...d, region: v }))} /></OXField>
            <OXField label={t("postal")} style={{ flex: 1 }}><OXInput value={draft.postal} onChange={(v) => setDraft((d) => ({ ...d, postal: v }))} /></OXField>
          </div>
          <OXButton variant="oxide" block onClick={addAddress}>{t("addAddress")}</OXButton>
        </div>
      </OXSheet>

      <OXToast visible={placed} tone="success" message={t("placed")} />
    </div>
  );
}
