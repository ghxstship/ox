"use client";

// OX web — operator console shell (OXAppShell). Sidebar nav is role-aware: coach
// gets the reduced set (Dashboard·Calendar·Clients·Reports); host/admin get full
// (adds Members·Payments·Floor·Campaigns). Topbar shows the RLS scope chip
// (scopeLabel) + role switcher. Capability-gated entries are hidden via can().
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { can, scopeLabel, NAV } from "@ox/rbac";
import { OXAppShell, OXChip, OXMark } from "@ox/ds";
import { useSession } from "../providers/SessionProvider";
import { RoleSwitcher } from "../chrome/RoleSwitcher";
import { withLocale } from "../../lib/links";
import { floorName } from "../../lib/seed";

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("ops");
  const tn = useTranslations("nav");
  const tleads = useTranslations("leads");
  const tauto = useTranslations("automations");
  const tpos = useTranslations("pos");
  const tstaff = useTranslations("staff");
  const tpayroll = useTranslations("payroll");
  const tcontracts = useTranslations("contracts");
  const locale = useLocale();
  const pathname = usePathname();
  const { session } = useSession();
  if (!session) return null;

  const product = session.role === "admin" ? "admin" : "operate";
  const membersLabel = NAV[session.role].membersLabel ?? tn("members");

  function item(label: string, path: string, show = true) {
    if (!show) return null;
    const href = withLocale(locale, path);
    return { label, href, active: pathname === href || pathname.startsWith(href + "/") };
  }

  const primary = [
    item(t("dashboard"), "/ops"),
    item(tn("calendar"), "/ops/calendar"),
    // Coach sees Clients; host/admin see Members.
    can(session, "clients.view") && !can(session, "members.view")
      ? item(membersLabel, "/ops/clients")
      : item(membersLabel, "/ops/members", can(session, "members.view")),
    item(t("reports"), "/ops/reports"),
  ].filter(Boolean);

  const growth = [
    item(tleads("title"), "/ops/leads", can(session, "members.view")),
    item(tauto("title"), "/ops/automations", can(session, "members.view")),
    item(tpos("title"), "/ops/pos", can(session, "floor.manage")),
    item(tstaff("title"), "/ops/staff", can(session, "roster.view") || can(session, "floor.manage")),
  ].filter(Boolean);

  const billing = [
    item(t("payments"), "/ops/payments", can(session, "revenue.view")),
    item(tpayroll("title"), "/ops/payroll", can(session, "revenue.view")),
    item(tn("floor"), "/ops/floor", can(session, "floor.manage")),
    item(tcontracts("title"), "/ops/contracts", can(session, "members.view")),
    item(t("campaigns"), "/ops/inbox", can(session, "members.view")),
  ].filter(Boolean);

  const nav = [
    { group: "Console", items: primary as NonNullable<ReturnType<typeof item>>[] },
    ...(growth.length ? [{ group: "Growth", items: growth as NonNullable<ReturnType<typeof item>>[] }] : []),
    ...(billing.length ? [{ group: "Operate", items: billing as NonNullable<ReturnType<typeof item>>[] }] : []),
  ];

  return (
    <OXAppShell
      product={product}
      appCode="OX OPERATE"
      brand={<OXMark as="wordmark" size={18} />}
      nav={nav}
      topbar={
        <div className="ox-row-wrap" style={{ justifyContent: "space-between", inlineSize: "100%" }}>
          <OXChip variant="oxide-line">
            {t("scope")}: {scopeLabel(session, floorName)}
          </OXChip>
          <RoleSwitcher />
        </div>
      }
    >
      {children}
    </OXAppShell>
  );
}
