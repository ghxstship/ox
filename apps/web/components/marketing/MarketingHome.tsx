"use client";

// OX web — marketing homepage body. Hero with the tagline, stat strip, three
// pillars, and a CTA band. Composes DS OXContainer/OXCover/OXButton/OXFeatureGrid
// /OXCTABand/OXTicker. One accent, square, ruled, flat.
import { useLocale, useTranslations } from "next-intl";
import {
  OXContainer,
  OXButton,
  OXCard,
  OXFeatureGrid,
  OXCTABand,
  OXTicker,
  OXChip,
  OXMark,
} from "@ox/ds";
import { withLocale } from "../../lib/links";
import { SiteHeader, SiteFooter } from "./SiteChrome";

export function MarketingHome() {
  const t = useTranslations("marketing");
  const tb = useTranslations("brand");
  const locale = useLocale();

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section style={{ background: "var(--ox-ink)", color: "var(--ox-paper)", paddingBlock: "64px 56px" }}>
        <OXContainer>
          <div style={{ maxInlineSize: "44ch" }}>
            <OXChip variant="oxide-line" live>
              {t("kicker")}
            </OXChip>
            <h1
              style={{
                fontFamily: "var(--ox-font-serif)",
                fontSize: "clamp(40px, 8vw, 72px)",
                lineHeight: 0.95,
                marginBlock: "20px 0",
                color: "var(--ox-paper)",
              }}
            >
              {t("heroTitle")}
              <br />
              <em style={{ fontStyle: "italic", color: "var(--ox-oxide)" }}>{t("heroTitleEm")}</em>
            </h1>
            <p
              style={{
                fontFamily: "var(--ox-font-sans)",
                fontSize: 16,
                lineHeight: 1.5,
                color: "var(--ox-salt, #cbc4b8)",
                marginBlock: "24px 0",
                maxInlineSize: "32ch",
              }}
            >
              {t("heroLede")}
            </p>
            <div className="ox-row-wrap" style={{ marginBlockStart: 28 }}>
              <OXButton variant="oxide" size="lg" arrow href={withLocale(locale, "/signin")}>
                {t("startSafari")}
              </OXButton>
              <OXButton variant="ghost" size="lg" href={withLocale(locale, "/personas")}>
                {t("howItWorks")}
              </OXButton>
            </div>
            <div style={{ marginBlockStart: 32, fontFamily: "var(--ox-font-mono)", fontSize: 13, color: "var(--ox-oxide)" }}>
              {tb("tagline")}
            </div>
          </div>
        </OXContainer>
      </section>

      <OXTicker items={["128K members", "32 partner floors", "9 cities", "1.2M quests completed", "Plug in. Level up."]} />

      {/* Pillars */}
      <section style={{ paddingBlock: 48 }}>
        <OXContainer>
          <div className="ox-section-label">{t("personasTitle")}</div>
          <OXFeatureGrid>
            <OXCard
              category="Train"
              title={<>Real <em>programming</em></>}
              description="Generated sessions, set-by-set logging, and PRs that level you up. No fluff — field-tested moves."
              status="01"
            />
            <OXCard
              category="Explore"
              title={<>A living <em>world</em></>}
              description="Plug into any partner floor. Discover scenery, claim territory, and chase the Iron Safari across the city."
              status="02"
            />
            <OXCard
              category="Herd"
              title={<>Your <em>tribe</em></>}
              description="Leaderboards, raids, and a feed that shows up with you. Herd that — the OX co-sign."
              status="03"
            />
          </OXFeatureGrid>
        </OXContainer>
      </section>

      {/* CTA */}
      <section style={{ paddingBlock: "8px 56px" }}>
        <OXContainer>
          <OXCTABand
            title={<>Plug in. <em>Level up.</em></>}
            action={
              <OXButton variant="oxide" size="lg" arrow href={withLocale(locale, "/signin")}>
                {t("startSafari")}
              </OXButton>
            }
          />
          <div style={{ marginBlockStart: 28, display: "grid", placeItems: "center" }}>
            <OXMark as="flag" size={48} />
          </div>
        </OXContainer>
      </section>

      <SiteFooter />
    </>
  );
}
