"use client";

// OX web — Map. Stylized exploration map (OXWorldMap, not GPS) + a floor list
// (OXFloorMatch with scenery + XP). Distances render via the @ox/rbac distance()
// helper-friendly seed (already localized strings here for the demo).
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXWorldMap, OXFloorMatch, OXChip, OXEmpty, type OXMapNode } from "@ox/ds";
import { floorMatches } from "../../lib/seed";

const nodes: OXMapNode[] = [
  { id: "f_pier", type: "floor", label: "Pier 9 Iron", sub: "Oceanfront", x: 0.3, y: 0.6, live: true },
  { id: "f_roof", type: "floor", label: "Skyline Strength", sub: "Rooftop", x: 0.62, y: 0.32 },
  { id: "f_forge", type: "raid", label: "The Forge", sub: "Strongman Open", x: 0.8, y: 0.7, live: true },
  { id: "drop1", type: "drop", label: "Founder Drop", x: 0.45, y: 0.2 },
];

export function MapView() {
  const t = useTranslations("map");
  const [active, setActive] = useState<string>("f_pier");

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("discover")}</div>
        <OXWorldMap
          nodes={nodes}
          you={{ x: 0.3, y: 0.62 }}
          activeId={active}
          onPin={(n) => setActive(n.id)}
          height={260}
        />
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
          <div className="ox-section-label">{t("nearby")}</div>
          <OXChip variant="oxide-line" live>
            Iron Safari
          </OXChip>
        </div>
        {floorMatches.length === 0 ? (
          <OXEmpty title={t("noFloors")} />
        ) : (
          floorMatches.map((f) => (
            <OXFloorMatch
              key={f.name}
              distance={f.distance}
              name={f.name}
              has={f.has}
              scenery={f.scenery}
              xp={f.xp}
              isHome={f.isHome}
            />
          ))
        )}
      </section>
    </div>
  );
}
