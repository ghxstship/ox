"use client";
// OX web — Plan & entitlements + booking gate (parity §A·6). Reads the member's
// live Membership (RLS-scoped) for the tier, then renders entitlement meters
// (classes used, guest passes, floors) and the five gate states via OXGate.
import { useTranslations } from "next-intl";
import { OXMeter, OXChip, OXIcon, OXKpi } from "@ox/ds";
import { date } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useLive } from "../../lib/useLive";
import { fetchMyMembership } from "../../lib/supabase";
import { OXGate, type GateState } from "../parity/OXGate";

const PLAN_BY_TIER: Record<string, { classesPerMonth: number | null; guestPasses: number; floors: number; benefits: string[] }> = {
  compass: { classesPerMonth: 8, guestPasses: 0, floors: 1, benefits: ["8 classes / month", "Home floor"] },
  sound: { classesPerMonth: 12, guestPasses: 1, floors: 2, benefits: ["12 classes / month", "2 floors", "1 guest pass"] },
  distant: { classesPerMonth: 20, guestPasses: 2, floors: 4, benefits: ["20 classes / month", "All city floors", "2 guest passes"] },
  founder: { classesPerMonth: null, guestPasses: 4, floors: 99, benefits: ["Unlimited classes", "All floors", "4 guest passes", "Founder drops"] },
};

const gateOrder: { state: GateState; key: string }[] = [
  { state: "included", key: "included" },
  { state: "credit", key: "credit" },
  { state: "dropin", key: "dropin" },
  { state: "locked", key: "locked" },
  { state: "overlimit", key: "overlimit" },
];

export function PlanView() {
  const t = useTranslations("plan");
  const { prefs } = usePrefs();
  const mem = useLive(fetchMyMembership, []);

  const tier = (mem.data?.tier as string) ?? "founder";
  const plan = PLAN_BY_TIER[tier] ?? PLAN_BY_TIER.founder!;
  const used = 5; // usage meter — would come from /me/plan usage
  const classesTotal = plan.classesPerMonth ?? 30;

  return (
    <div className="ox-page ox-stack">
      <div>
        <div className="ox-section-label">{t("kicker")}</div>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
      </div>

      <div className="ox-grid-cards">
        <OXKpi label={t("tier")} value={<em style={{ textTransform: "capitalize" }}>{tier}</em>} />
        <OXKpi label={t("status")} value={mem.data?.status ?? "active"} />
        <OXKpi label={t("renewsAt")} value={mem.data?.renewsAt ? date(mem.data.renewsAt, { locale: prefs.locale }) : "—"} />
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <OXMeter
          title={t("classesUsed")}
          current={used}
          total={classesTotal}
          lockAt={classesTotal}
          openLabel={`${used} / ${plan.classesPerMonth ?? "∞"}`}
          lockedLabel={t("overlimit")}
        />
        <OXMeter title={t("guestPasses")} current={plan.guestPasses} total={Math.max(plan.guestPasses, 4)} openLabel={String(plan.guestPasses)} />
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("benefits")}</div>
        {plan.benefits.map((b) => (
          <div key={b} className="ox-row-wrap" style={{ gap: 8 }}>
            <OXIcon name="check" size="sm" />
            <span style={{ fontFamily: "var(--ox-font-sans)" }}>{b}</span>
          </div>
        ))}
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">Booking gate</div>
        <div className="ox-row-wrap">
          {gateOrder.map((g) => (
            <OXGate key={g.state} state={g.state} label={t(g.key)} />
          ))}
        </div>
        <OXChip variant="ghost">{t("floors")}: {plan.floors >= 99 ? "All" : plan.floors}</OXChip>
      </section>
    </div>
  );
}
