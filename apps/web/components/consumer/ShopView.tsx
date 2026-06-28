"use client";

// OX web — Shop. Product grid (OXCard) with gated drops dimmed below the member's
// level (level-lock tag, never disabled-and-revealed differently — the lock is
// shown as a tonal status with label + icon). Prices via moneyFromCents().
import { useTranslations } from "next-intl";
import { OXCard, OXChip, OXButton, OXIcon, OXToast } from "@ox/ds";
import { moneyFromCents, num } from "@ox/rbac";
import { useState } from "react";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { products } from "../../lib/seed";

export function ShopView() {
  const t = useTranslations("shop");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const level = session?.level ?? 1;
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
      <div className="ox-grid-cards">
        {products.map((p) => {
          const locked = p.gateLevel > level;
          return (
            <div key={p.id} style={{ opacity: locked ? 0.55 : 1 }}>
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
              {!locked && (
                <OXButton variant="oxide" block onClick={() => setToast(`${t("addToCart")} · ${p.name}`)}>
                  {t("addToCart")}
                </OXButton>
              )}
            </div>
          );
        })}
      </div>
      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
