"use client";

// OX web — operator Floor & Equipment (host · floor.manage). Equipment inventory
// as OXListRow + OXSwitch toggles; gated by can(session, "floor.manage").
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXListRow, OXSwitch, OXEmpty, OXChip } from "@ox/ds";
import { can, scopeLabel } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { floorName } from "../../lib/seed";

const seedEquipment = [
  { id: "eq_sled", name: "Sled", count: 2, online: true },
  { id: "eq_rack", name: "Power Rack", count: 4, online: true },
  { id: "eq_kb", name: "Kettlebells", count: 12, online: true },
  { id: "eq_plunge", name: "Cold Plunge", count: 1, online: false },
];

export function FloorView() {
  const tn = useTranslations("nav");
  const { session } = useSession();
  const [equipment, setEquipment] = useState(seedEquipment);

  if (!can(session, "floor.manage")) {
    return (
      <OXContainer>
        <OXEmpty title="No floor in scope." />
      </OXContainer>
    );
  }

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{tn("floor")}</h1>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div className="ox-stack" style={{ gap: 0, paddingBlock: 16 }}>
        {equipment.map((e) => (
          <OXListRow
            key={e.id}
            title={e.name}
            sub={`×${e.count}`}
            trail={e.online ? "Online" : "Offline"}
            icon={
              <OXSwitch
                on={e.online}
                onChange={(v) => setEquipment((arr) => arr.map((x) => (x.id === e.id ? { ...x, online: v } : x)))}
              />
            }
          />
        ))}
      </div>
    </OXContainer>
  );
}
