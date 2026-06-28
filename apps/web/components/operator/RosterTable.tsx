"use client";

// OX web — shared roster table for Members (host/admin) and Clients (coach). Rows
// are RLS-scoped via scope("members", …); status is conveyed with an OXBadge
// (tonal) plus the status word — never colour alone. Levels through num().
import { useTranslations } from "next-intl";
import { OXContainer, OXDataTable, OXBadge, OXChip, OXEmpty } from "@ox/ds";
import { scope, scopeLabel, num } from "@ox/rbac";
import type { Session } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useSession } from "../providers/SessionProvider";
import { members, floorName } from "../../lib/seed";

const statusTone: Record<string, "ok" | "warn" | "danger"> = {
  ok: "ok",
  warn: "warn",
  danger: "danger",
};
const statusLabel: Record<string, string> = {
  ok: "Active",
  warn: "At risk",
  danger: "Lapsed",
};

export function RosterTable({ heading }: { heading: string }) {
  const t = useTranslations("ops");
  const { session } = useSession();
  const { prefs } = usePrefs();

  const scoped = scope("members", members, session as Session);

  const rows = scoped.map((m) => ({
    name: m.name,
    floor: floorName(m.floorId) ?? "—",
    plan: m.plan,
    level: num(m.level, { locale: prefs.locale }),
    status: (
      <span className="ox-row-wrap" style={{ gap: 6 }}>
        <OXBadge tone={statusTone[m.status] ?? "neutral"}>{statusLabel[m.status] ?? m.status}</OXBadge>
      </span>
    ),
  }));

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{heading}</h1>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div style={{ paddingBlock: 16 }}>
        {rows.length === 0 ? (
          <OXEmpty title={t("noMembers")} />
        ) : (
          <OXDataTable
            stickyHeader
            columns={[
              { key: "name", label: "Member" },
              { key: "floor", label: "Floor" },
              { key: "plan", label: "Plan" },
              { key: "level", label: "Level", numeric: true },
              { key: "status", label: "Status" },
            ]}
            rows={rows}
          />
        )}
      </div>
    </OXContainer>
  );
}
