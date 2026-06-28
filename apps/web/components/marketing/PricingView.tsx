"use client";

// OX web — pricing. Tier cards priced through the @ox/rbac money() i18n helper
// (compliance: all currency goes through the gate). Tiers are tonal copper steps.
import { useLocale, useTranslations } from "next-intl";
import { OXContainer, OXCard, OXChip, OXButton, OXTierBadge } from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { withLocale } from "../../lib/links";
import { usePrefs } from "../providers/PrefsProvider";
import { SiteHeader, SiteFooter } from "./SiteChrome";

const tiers = [
  { tier: "compass" as const, name: "Compass", priceCents: 4900, blurb: "Plug into any floor. Generated sessions, the world map, your herd." },
  { tier: "sound" as const, name: "Sound", priceCents: 8900, blurb: "Everything in Compass plus the music layer and curated raids." },
  { tier: "distant" as const, name: "Distant", priceCents: 14900, blurb: "Coaching, programming, and priority raid slots across every city." },
  { tier: "founder" as const, name: "Founder", priceCents: 42000, blurb: "The copper credential, founder drops, and lifetime status." },
];

export function PricingView() {
  const t = useTranslations("marketing");
  const locale = useLocale();
  const { prefs } = usePrefs();

  return (
    <>
      <SiteHeader />
      <OXContainer>
        <div style={{ paddingBlock: "40px 8px" }}>
          <div className="ox-section-label">{t("pricing")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 44, margin: 0 }}>
            {t("pricingTitle")}
          </h1>
        </div>
        <div className="ox-grid-cards" style={{ paddingBlock: 24 }}>
          {tiers.map((tier, i) => (
            <OXCard
              key={tier.tier}
              category={<OXTierBadge tier={tier.tier} number={String(i + 1).padStart(3, "0")} />}
              title={<>{tier.name}</>}
              description={tier.blurb}
              status={moneyFromCents(tier.priceCents, { locale: prefs.locale, currency: prefs.currency })}
              meta={<OXChip variant={i === 3 ? "oxide" : "default"}>{i === 3 ? "Drop" : "/mo"}</OXChip>}
            />
          ))}
        </div>
        <div style={{ paddingBlock: "8px 48px" }}>
          <OXButton variant="oxide" arrow href={withLocale(locale, "/signin")}>
            {t("startSafari")}
          </OXButton>
        </div>
      </OXContainer>
      <SiteFooter />
    </>
  );
}
