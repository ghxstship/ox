"use client";

import { useTranslations } from "next-intl";
import { OXContainer, OXCard, OXFeatureGrid } from "@ox/ds";
import { SiteHeader, SiteFooter } from "./SiteChrome";

const personas = [
  { who: "Member", title: "The explorer", body: "Books, trains, logs sets, and chases the Iron Safari. Earns XP and species on every floor." },
  { who: "Coach", title: "The programmer", body: "Owns a roster and their own classes. Builds programs and tracks client progress." },
  { who: "Host", title: "The floor", body: "Runs one partner floor — its members, schedule, equipment, and revenue." },
  { who: "Admin", title: "OX HQ", body: "Operates every floor: billing, analytics, challenges, and the platform itself." },
];

export function PersonasView() {
  const t = useTranslations("marketing");
  return (
    <>
      <SiteHeader />
      <OXContainer>
        <div style={{ paddingBlock: "40px 8px" }}>
          <div className="ox-section-label">{t("personas")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 44, margin: 0 }}>
            {t("personasTitle")}
          </h1>
        </div>
        <div style={{ paddingBlock: 24 }}>
          <OXFeatureGrid>
            {personas.map((p) => (
              <OXCard key={p.who} category={p.who} title={<em>{p.title}</em>} description={p.body} />
            ))}
          </OXFeatureGrid>
        </div>
      </OXContainer>
      <SiteFooter />
    </>
  );
}
