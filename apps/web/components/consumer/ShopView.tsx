"use client";

// OX web — Shop. Live product grid (Supabase public discovery; seed fallback)
// with gated drops dimmed below the member's level (level-lock shown as a tonal
// status with label + icon, never hue alone). Cards deep-link to the PDP v2
// (/app/shop/:id). Prices via moneyFromCents().
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { OXCard, OXChip, OXIcon, OXSkeleton, OXEmpty } from "@ox/ds";
import { moneyFromCents, num } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useLive } from "../../lib/useLive";
import { fetchProducts } from "../../lib/supabase";
import { products as seedProducts } from "../../lib/seed";
import { withLocale } from "../../lib/links";

export function ShopView() {
  const t = useTranslations("shop");
  const router = useRouter();
  const locale = useLocale();
  const { session } = useSession();
  const { prefs } = usePrefs();
  const level = session?.level ?? 1;
  const live = useLive(fetchProducts, []);

  const products = useMemo(() => {
    const rows = live.data ?? [];
    if (rows.length) return rows.map((p) => ({ id: p.id, name: p.name, collection: p.collection, priceCents: p.priceCents, sizes: p.sizes, gateLevel: p.gateLevel }));
    return seedProducts;
  }, [live.data]);

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      {live.loading ? (
        <div className="ox-grid-cards">
          <OXSkeleton height={160} />
          <OXSkeleton height={160} />
          <OXSkeleton height={160} />
        </div>
      ) : products.length === 0 ? (
        <OXEmpty title={t("emptyCart")} />
      ) : (
        <div className="ox-grid-cards">
          {products.map((p) => {
            const locked = p.gateLevel > level;
            return (
              <button
                key={p.id}
                type="button"
                disabled={locked}
                onClick={() => router.push(withLocale(locale, `/app/shop/${p.id}`))}
                style={{ border: "none", background: "none", padding: 0, textAlign: "start", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.55 : 1 }}
              >
                <OXCard
                  category={p.collection}
                  title={<em>{p.name}</em>}
                  description={`${t("size")}: ${p.sizes.join(" · ")}`}
                  status={moneyFromCents(p.priceCents, { locale: prefs.locale, currency: prefs.currency })}
                  meta={
                    locked ? (
                      <OXChip variant="ghost">
                        <OXIcon name="lock" size="sm" /> {t("gated", { level: num(p.gateLevel, { locale: prefs.locale }) })}
                      </OXChip>
                    ) : (
                      <OXChip variant="oxide">{p.collection}</OXChip>
                    )
                  }
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
