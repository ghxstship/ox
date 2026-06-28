"use client";
// OX web — Staff Scheduling / Shifts (parity §B·28). A week grid of shifts
// (class · floor · open) with cover-request. coach/host capability. RLS-scoped to
// the floor. Cover requests post to /shifts/:id/cover.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXChip, OXButton, OXEmpty, OXToast } from "@ox/ds";
import { can, scopeLabel } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { useApi } from "../../lib/useApi";
import { floorName } from "../../lib/seed";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Kind = "class" | "floor" | "open";

interface Shift {
  id: string;
  day: string;
  start: string;
  staff: string;
  kind: Kind;
  coverRequested: boolean;
}

const SEED: Shift[] = [
  { id: "sh1", day: "Mon", start: "06:00", staff: "Dom", kind: "class", coverRequested: false },
  { id: "sh2", day: "Mon", start: "12:00", staff: "Iris", kind: "floor", coverRequested: false },
  { id: "sh3", day: "Tue", start: "18:00", staff: "—", kind: "open", coverRequested: false },
  { id: "sh4", day: "Wed", start: "06:00", staff: "Dom", kind: "class", coverRequested: true },
  { id: "sh5", day: "Fri", start: "07:00", staff: "Nat", kind: "class", coverRequested: false },
];

export function StaffView() {
  const t = useTranslations("staff");
  const { session } = useSession();
  const api = useApi();
  const [shifts, setShifts] = useState<Shift[]>(SEED);
  const [toast, setToast] = useState<string | null>(null);

  const allowed = can(session, "roster.view") || can(session, "floor.manage") || session?.role === "admin";
  if (!allowed) {
    return (
      <OXContainer>
        <OXEmpty title={t("empty")} />
      </OXContainer>
    );
  }

  async function requestCover(id: string) {
    setShifts((arr) => arr.map((s) => (s.id === id ? { ...s, coverRequested: true } : s)));
    await api.http.post(`/shifts/${id}/cover`).catch(() => {});
    setToast(t("covered"));
  }

  const kindChip: Record<Kind, "oxide" | "oxide-line" | "ghost"> = { class: "oxide", floor: "oxide-line", open: "ghost" };

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div className="ox-grid-cards" style={{ paddingBlock: 16, gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
        {DAYS.map((day) => {
          const col = shifts.filter((s) => s.day === day);
          return (
            <section key={day} className="ox-stack" style={{ gap: 8, border: "1px solid var(--ox-line)", padding: 12 }}>
              <div className="ox-section-label" style={{ margin: 0 }}>{day}</div>
              {col.length === 0 ? (
                <div className="ox-demo-note">—</div>
              ) : (
                col.map((s) => (
                  <div key={s.id} className="ox-stack" style={{ gap: 4, border: "1px solid var(--ox-line)", padding: 8 }}>
                    <span style={{ fontFamily: "var(--ox-font-mono)", fontSize: 12 }}>{s.start}</span>
                    <span style={{ fontFamily: "var(--ox-font-sans)", fontSize: 13 }}>{s.staff}</span>
                    <OXChip variant={kindChip[s.kind]}>{s.kind === "open" ? t("open") : s.kind === "class" ? t("class") : t("floor")}</OXChip>
                    {s.kind !== "open" &&
                      (s.coverRequested ? (
                        <OXChip variant="ghost">{t("covered")}</OXChip>
                      ) : (
                        <OXButton variant="ghost" size="sm" onClick={() => void requestCover(s.id)}>{t("cover")}</OXButton>
                      ))}
                  </div>
                ))
              )}
            </section>
          );
        })}
      </div>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
