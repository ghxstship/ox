"use client";
// OX web — Commerce PDP v2 + Reviews + Size guide (parity §A·10/11). Live product
// from Supabase (public discovery) with size/color pickers, stock states
// (low-stock · sold-out · notify-me), sale price, wishlist toggle (POST
// /me/wishlist/:id), a reviews histogram + write-review sheet, and a fit-finder
// size guide. Add-to-cart posts to /cart/items.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  OXChip,
  OXButton,
  OXIcon,
  OXToast,
  OXSheet,
  OXField,
  OXInput,
  OXSegmented,
  OXTable,
  OXEmpty,
  OXSkeleton,
} from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { useLive } from "../../lib/useLive";
import { fetchProduct } from "../../lib/supabase";
import { products as seedProducts } from "../../lib/seed";

interface Review {
  id: string;
  rating: number;
  body: string;
  fit: string;
}

// Per-size stock (demo): drives low-stock / sold-out / notify-me states.
const STOCK: Record<string, number> = { S: 2, M: 14, L: 0, XL: 6, One: 3, M2: 1 };

export function ProductView({ id }: { id: string }) {
  const t = useTranslations("pdp");
  const { prefs } = usePrefs();
  const api = useApi();
  const live = useLive(() => fetchProduct(id), [id]);

  const product = useMemo(() => {
    if (live.data) return { id: live.data.id, name: live.data.name, collection: live.data.collection, priceCents: live.data.priceCents, sizes: live.data.sizes, colors: live.data.colors };
    const seed = seedProducts.find((p) => p.id === id) ?? seedProducts[0]!;
    return { id: seed.id, name: seed.name, collection: seed.collection, priceCents: seed.priceCents, sizes: seed.sizes, colors: ["Oxide", "Ink"] };
  }, [live.data, id]);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>(product.colors[0] ?? "Oxide");
  const [wished, setWished] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([
    { id: "r1", rating: 5, body: "Square cut, holds up to sled work.", fit: "true" },
    { id: "r2", rating: 4, body: "Runs slightly large.", fit: "large" },
  ]);
  const [draftRating, setDraftRating] = useState("5");
  const [draftBody, setDraftBody] = useState("");
  const [draftFit, setDraftFit] = useState("true");

  const onSale = product.priceCents >= 8000;
  const stock = size ? STOCK[size] ?? 8 : null;
  const soldOut = stock === 0;
  const lowStock = stock !== null && stock > 0 && stock <= 2;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const histogram = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));

  async function addToCart() {
    if (!size) {
      setToast(t("selectSize"));
      return;
    }
    if (soldOut) {
      setToast(t("notified"));
      await api.http.post(`/products/${product.id}/notify`).catch(() => {});
      return;
    }
    setToast(`${t("addToCart")} · ${product.name}`);
    await api.shop.addItem({ productId: product.id, size, qty: 1 }).catch(() => {});
  }

  async function toggleWish() {
    setWished((w) => !w);
    await api.http.post(`/me/wishlist/${product.id}`).catch(() => {});
  }

  function submitReview() {
    setReviews((r) => [{ id: `r${Date.now()}`, rating: Number(draftRating), body: draftBody, fit: draftFit }, ...r]);
    setDraftBody("");
    setWriteOpen(false);
    setToast(t("submitReview"));
  }

  if (live.loading) {
    return (
      <div className="ox-page ox-stack">
        <OXSkeleton height={200} />
        <OXSkeleton height={80} />
      </div>
    );
  }

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="ox-section-label">{product.collection}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>
            <em>{product.name}</em>
          </h1>
        </div>
        <button type="button" aria-label={wished ? t("wishlisted") : t("wishlist")} onClick={() => void toggleWish()} className="ox-hit" style={{ border: "1px solid var(--ox-line)", background: "var(--ox-paper)", cursor: "pointer" }}>
          <OXIcon name={wished ? "filledcheck" : "like"} />
        </button>
      </div>

      <div className="ox-row-wrap" style={{ gap: 10 }}>
        <span style={{ fontFamily: "var(--ox-font-serif)", fontSize: 26, color: "var(--ox-oxide)" }}>
          {moneyFromCents(onSale ? Math.round(product.priceCents * 0.8) : product.priceCents, { locale: prefs.locale, currency: prefs.currency })}
        </span>
        {onSale && <OXChip variant="oxide">{t("sale")}</OXChip>}
      </div>

      <OXField label={t("color")}>
        <OXSegmented<string> value={color} onChange={setColor} options={product.colors.map((c) => ({ value: c, label: c }))} />
      </OXField>

      <OXField label={t("size")} hint={lowStock ? t("lowStock") : soldOut ? t("soldOut") : undefined}>
        <div className="ox-row-wrap">
          {product.sizes.map((s) => {
            const on = size === s;
            const out = (STOCK[s] ?? 8) === 0;
            return (
              <button key={s} type="button" onClick={() => setSize(s)} disabled={out} style={{ border: "none", background: "none", padding: 0, cursor: out ? "not-allowed" : "pointer", opacity: out ? 0.5 : 1 }}>
                <OXChip variant={on ? "oxide" : "ghost"}>
                  {s}
                  {out ? ` · ${t("soldOut")}` : ""}
                </OXChip>
              </button>
            );
          })}
        </div>
      </OXField>

      {lowStock && <OXChip variant="oxide-line"><OXIcon name="bell" size="sm" /> {t("lowStock")} · {stock}</OXChip>}

      <OXButton variant="oxide" arrow block onClick={() => void addToCart()}>
        {soldOut ? t("notifyMe") : t("addToCart")}
      </OXButton>

      <div className="ox-row-wrap">
        <OXButton variant="default" onClick={() => setReviewsOpen(true)}>
          {t("reviews")} · {avgRating}
        </OXButton>
        <OXButton variant="ghost" onClick={() => setWriteOpen(true)}>
          {t("writeReview")}
        </OXButton>
      </div>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("sizeGuide")}</div>
        <OXTable
          columns={[
            { key: "size", label: t("size") },
            { key: "chest", label: "Chest (in)", align: "right" },
            { key: "fit", label: t("fit") },
          ]}
          rows={[
            { size: "S", chest: "36", fit: "Slim" },
            { size: "M", chest: "40", fit: "Regular" },
            { size: "L", chest: "44", fit: "Regular" },
            { size: "XL", chest: "48", fit: "Relaxed" },
          ]}
        />
      </section>

      {/* Reviews sheet — histogram + list */}
      <OXSheet open={reviewsOpen} onClose={() => setReviewsOpen(false)} label={t("reviews")}>
        <div className="ox-stack" style={{ gap: 12, padding: 20, minInlineSize: 320 }}>
          <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, margin: 0 }}>{t("reviews")} · {avgRating}</h2>
          {histogram.map((h) => (
            <div key={h.star} className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--ox-font-mono)" }}>{"★".repeat(h.star)}</span>
              <span style={{ fontFamily: "var(--ox-font-mono)", color: "var(--ox-stone)" }}>{h.n}</span>
            </div>
          ))}
          <hr style={{ border: "none", borderBlockStart: "1px solid var(--ox-line)" }} />
          {reviews.length === 0 ? (
            <OXEmpty title={t("noReviews")} />
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="ox-stack" style={{ gap: 2, borderBottom: "1px solid var(--ox-line)", paddingBlockEnd: 8 }}>
                <span style={{ fontFamily: "var(--ox-font-mono)", color: "var(--ox-oxide)" }}>{"★".repeat(r.rating)}</span>
                <span style={{ fontFamily: "var(--ox-font-sans)" }}>{r.body}</span>
                <span className="ox-demo-note">{t("fit")}: {r.fit}</span>
              </div>
            ))
          )}
        </div>
      </OXSheet>

      {/* Write-review sheet */}
      <OXSheet open={writeOpen} onClose={() => setWriteOpen(false)} label={t("writeReview")}>
        <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320 }}>
          <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, margin: 0 }}>{t("writeReview")}</h2>
          <OXField label={t("rating")}>
            <OXSegmented<string> value={draftRating} onChange={setDraftRating} options={["5", "4", "3", "2", "1"].map((n) => ({ value: n, label: "★".repeat(Number(n)) }))} />
          </OXField>
          <OXField label={t("fit")}>
            <OXSegmented<string> value={draftFit} onChange={setDraftFit} options={[{ value: "small", label: "Small" }, { value: "true", label: "True" }, { value: "large", label: "Large" }]} />
          </OXField>
          <OXField label={t("writeReview")}>
            <OXInput multiline rows={3} value={draftBody} onChange={setDraftBody} placeholder="Terse, present tense." />
          </OXField>
          <OXButton variant="oxide" block onClick={submitReview}>
            {t("submitReview")}
          </OXButton>
        </div>
      </OXSheet>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
