"use client";

import { useTranslations } from "next-intl";
import { OXContainer, OXProse } from "@ox/ds";
import { SiteHeader, SiteFooter } from "./SiteChrome";

export function AccessibilityView() {
  const t = useTranslations("a11y");
  return (
    <>
      <SiteHeader />
      <OXContainer reading>
        <div style={{ paddingBlock: "40px 8px" }}>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 44, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXProse>
          <p>{t("intro")}</p>
          <h2>{t("standards")}</h2>
          <ul>
            <li>WCAG 2.2 Level AA (Web Content Accessibility Guidelines).</li>
            <li>EN 301 549 (the European accessibility standard for ICT).</li>
          </ul>
          <h2>{t("features")}</h2>
          <ul>
            <li>Skip-to-content link and semantic landmarks on every screen.</li>
            <li>Visible focus rings — outlines are never removed.</li>
            <li>Minimum 44&times;44px touch targets on interactive chrome.</li>
            <li>Status is conveyed by text and icon, never colour alone (one-accent system).</li>
            <li>Keyboard-operable menus and modals with focus trapping and Escape to dismiss.</li>
            <li>Full right-to-left (RTL) support via CSS logical properties.</li>
            <li>Respects the <code>prefers-reduced-motion</code> setting.</li>
          </ul>
          <h2>{t("contact")}</h2>
          <p>
            Found a barrier? Email <a href="mailto:access@ox.fit">access@ox.fit</a> and we will respond within
            five working days.
          </p>
        </OXProse>
        <div style={{ blockSize: 48 }} />
      </OXContainer>
      <SiteFooter />
    </>
  );
}
