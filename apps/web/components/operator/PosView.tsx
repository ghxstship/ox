"use client";
// OX web — POS · Desk Sales (parity §B·27). Live catalog grid (products + packs)
// → tap-to-cart → tender (card / cash) → receipt. Host capability (host/admin).
// Selling posts to /pos/sale. RLS-scoped; scope chip shown.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXCard, OXButton, OXChip, OXSegmented, OXEmpty, OXToast, OXListRow } from "@ox/ds";
import { can, scopeLabel, moneyFromCents } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { useLive } from "../../lib/useLive";
import { fetchProducts } from "../../lib/supabase";
import { products as seedProducts, floorName } from "../../lib/seed";

interface Line {
  id: string;
  name: string;
  priceCents: number;
  qty: number;
}

export function PosView() {
  const t = useTranslations("pos");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const api = useApi();
  const live = useLive(fetchProducts, []);

  const catalog = useMemo(() => {
    const rows = live.data ?? [];
    const base = rows.length ? rows.map((p) => ({ id: p.id, name: p.name, priceCents: p.priceCents, collection: p.collection })) : seedProducts.map((p) => ({ id: p.id, name: p.name, priceCents: p.priceCents, collection: p.collection }));
    return [
      ...base,
      { id: "pk_5", name: "5-Class Pack", priceCents: 9000, collection: "Packs" },
      { id: "pk_drop", name: "Drop-in", priceCents: 2500, collection: "Packs" },
    ];
  }, [live.data]);

  const [cart, setCart] = useState<Line[]>([]);
  const [tender, setTender] = useState<"card" | "cash">("card");
  const [toast, setToast] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Line[] | null>(null);

  const allowed = can(session, "floor.manage") || session?.role === "admin";
  if (!allowed) {
    return (
      <OXContainer>
        <OXEmpty title={t("empty")} />
      </OXContainer>
    );
  }

  const total = cart.reduce((s, l) => s + l.priceCents * l.qty, 0);

  function addToCart(item: { id: string; name: string; priceCents: number }) {
    setCart((arr) => {
      const ex = arr.find((l) => l.id === item.id);
      if (ex) return arr.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...arr, { id: item.id, name: item.name, priceCents: item.priceCents, qty: 1 }];
    });
  }

  async function charge() {
    setReceipt(cart);
    setToast(t("sold"));
    await api.http.post("/pos/sale", { items: cart.map((l) => ({ id: l.id, qty: l.qty })), tender, totalCents: total }).catch(() => {});
    setCart([]);
  }

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div className="ox-row-wrap" style={{ alignItems: "start", gap: 18, paddingBlock: 16 }}>
        <section className="ox-stack" style={{ flex: 2, minInlineSize: 280, gap: 10 }}>
          <div className="ox-section-label">{t("catalog")}</div>
          <div className="ox-grid-cards">
            {catalog.map((p) => (
              <button key={p.id} type="button" onClick={() => addToCart(p)} style={{ border: "none", background: "none", padding: 0, textAlign: "start", cursor: "pointer" }}>
                <OXCard category={p.collection} title={<em>{p.name}</em>} status={moneyFromCents(p.priceCents, { locale: prefs.locale, currency: prefs.currency })} meta={<OXChip variant="oxide">+</OXChip>} />
              </button>
            ))}
          </div>
        </section>

        <section className="ox-stack" style={{ flex: 1, minInlineSize: 260, gap: 10, border: "1px solid var(--ox-line)", padding: 14 }}>
          <div className="ox-section-label" style={{ margin: 0 }}>{t("cart")}</div>
          {cart.length === 0 ? (
            <OXEmpty title={t("empty")} />
          ) : (
            cart.map((l) => (
              <OXListRow key={l.id} title={`${l.name} ×${l.qty}`} trail={moneyFromCents(l.priceCents * l.qty, { locale: prefs.locale, currency: prefs.currency })} />
            ))
          )}
          <div className="ox-row-wrap" style={{ justifyContent: "space-between", borderBlockStart: "1px solid var(--ox-line)", paddingBlockStart: 8 }}>
            <span className="ox-section-label" style={{ margin: 0 }}>{t("total")}</span>
            <span style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, color: "var(--ox-oxide)" }}>{moneyFromCents(total, { locale: prefs.locale, currency: prefs.currency })}</span>
          </div>
          <OXSegmented<"card" | "cash"> value={tender} onChange={setTender} options={[{ value: "card", label: t("card") }, { value: "cash", label: t("cash") }]} />
          <OXButton variant="oxide" block arrow onClick={() => void charge()} style={{ opacity: cart.length ? 1 : 0.5 }}>
            {t("charge")}
          </OXButton>
        </section>
      </div>

      {receipt && receipt.length > 0 && (
        <section className="ox-stack" style={{ gap: 6, border: "1px solid var(--ox-oxide)", padding: 14 }}>
          <div className="ox-section-label" style={{ margin: 0 }}>{t("receipt")}</div>
          {receipt.map((l) => (
            <OXListRow key={l.id} title={`${l.name} ×${l.qty}`} trail={moneyFromCents(l.priceCents * l.qty, { locale: prefs.locale, currency: prefs.currency })} />
          ))}
        </section>
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
