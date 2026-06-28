// Entitlements + Booking Gate — the plan view. /me/plan (parity §D) returns
// entitlements + usage meters; called by path until typed. Renders the gate
// states (included · credit · drop-in · locked · over-limit) as legend + meters.
import { ScreenScroll, Card, Label, Display, Body, Row, XPBar, Gate, Skeleton } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { api, tryApi } from "../../../src/api";
import { useAsync } from "../../../src/data";
import { num } from "@ox/rbac";

interface Plan {
  tier: string;
  classesPerMonth: number | null;
  used: number;
  guestPasses: number;
  floorsIncluded: number;
  benefits: string[];
}

const FALLBACK: Plan = {
  tier: "Charged",
  classesPerMonth: 12,
  used: 7,
  guestPasses: 2,
  floorsIncluded: 1,
  benefits: ["Unlimited open gym", "Member shop pricing", "Priority booking"],
};

export default function PlanScreen() {
  const { data: plan, loading } = useAsync<Plan>(
    async () => tryApi(() => api.http.get<Plan>("/me/plan"), FALLBACK),
    FALLBACK
  );

  const pct = plan.classesPerMonth ? Math.round((plan.used / plan.classesPerMonth) * 100) : 0;

  return (
    <ScreenScroll>
      <Label>What's included.</Label>
      <Display>{plan.tier}</Display>

      {loading ? (
        <Skeleton height={160} />
      ) : (
        <>
          <Card style={{ gap: space.sm }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Label>Classes this month</Label>
              <Label>{num(plan.used)} / {plan.classesPerMonth ? num(plan.classesPerMonth) : "∞"}</Label>
            </Row>
            <XPBar pct={pct} />
            {plan.classesPerMonth && plan.used >= plan.classesPerMonth ? (
              <Row><Gate state="overlimit" /></Row>
            ) : null}
          </Card>

          <Card>
            <Label>Benefits</Label>
            {plan.benefits.map((b) => (
              <Body key={b} style={{ marginTop: space.xs }}>· {b}</Body>
            ))}
            <Body style={{ color: color.stone, marginTop: space.sm }}>
              {num(plan.guestPasses)} guest passes · {num(plan.floorsIncluded)} floor(s) included
            </Body>
          </Card>

          <Card style={{ gap: space.xs }}>
            <Label>Gate legend</Label>
            <Row style={{ flexWrap: "wrap", gap: space.sm }}>
              <Gate state="included" />
              <Gate state="credit" />
              <Gate state="dropin" />
              <Gate state="locked" />
              <Gate state="overlimit" />
            </Row>
          </Card>
        </>
      )}
    </ScreenScroll>
  );
}
