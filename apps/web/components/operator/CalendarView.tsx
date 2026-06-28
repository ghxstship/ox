"use client";

// OX web — operator Schedule/Calendar. Classes (RLS-scoped via scope("classes"))
// as OXClassRow. "Add class" appears only when can(session, "class.manage")
// (host/admin) — hidden, not disabled. Add opens an OXModal (DS owns focus-trap).
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  OXContainer,
  OXClassRow,
  OXButton,
  OXModal,
  OXField,
  OXInput,
  OXSelect,
  OXEmpty,
} from "@ox/ds";
import { can, scope, scopeLabel } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { classes, floorName, floors } from "../../lib/seed";

export function CalendarView() {
  const t = useTranslations("ops");
  const tn = useTranslations("nav");
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [floor, setFloor] = useState(floors[0]!.id);

  const scoped = scope("classes", classes, session);
  const canManage = can(session, "class.manage");

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{tn("calendar")}</h1>
          <div className="ox-demo-note">{scopeLabel(session, floorName)}</div>
        </div>
        {canManage && (
          <OXButton variant="oxide" onClick={() => setOpen(true)}>
            {t("newClass")}
          </OXButton>
        )}
      </div>

      <div className="ox-stack" style={{ gap: 8, paddingBlock: 16 }}>
        {scoped.length === 0 ? (
          <OXEmpty title={t("noMembers")} />
        ) : (
          scoped.map((c) => (
            <OXClassRow
              key={c.id}
              time={`${c.day} · ${c.time}`}
              title={c.title}
              floor={floorName(c.floorId)}
              spots={c.cap - c.booked}
              status={c.load}
            />
          ))
        )}
      </div>

      {canManage && (
        <OXModal open={open} onClose={() => setOpen(false)} label={t("newClass")}>
          <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320 }}>
            <h2 id="addclass-h" style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, margin: 0 }}>
              {t("newClass")}
            </h2>
            <OXField label="Title">
              <OXInput value={title} onChange={setTitle} placeholder="Sunrise Sled Push" />
            </OXField>
            <OXField label={tn("floor")}>
              <OXSelect value={floor} onChange={setFloor} options={floors.map((f) => ({ value: f.id, label: f.name }))} />
            </OXField>
            <OXButton variant="oxide" block onClick={() => setOpen(false)}>
              {t("newClass")}
            </OXButton>
          </div>
        </OXModal>
      )}
    </OXContainer>
  );
}
