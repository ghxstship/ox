// Operator Today — KPIs. Members on floor, revenue, failed payments (recovery
// queue), classes today. All RLS-scoped to the operator's floor server-side.
// Falls back to zeros offline.
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Row, Stat, Banner, Skeleton } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api, tryApi } from "../../src/api";
import { useSession } from "../../src/session";
import { ScopeChip } from "../../src/chrome";
import { useAsync } from "../../src/data";
import { useClasses } from "../../src/data";
import { can, moneyFromCents, num } from "@ox/rbac";
import type { Payment, User } from "@ox/types";

export default function Today() {
  const { session, prefs } = useSession();
  const classes = useClasses();
  const members = useAsync<User[]>(async () => tryApi(async () => (await api.ops.members()).data, []), []);
  const payments = useAsync<Payment[]>(
    async () => (can(session, "revenue.view") ? tryApi(async () => (await api.ops.payments()).data, []) : []),
    []
  );

  const revenue = payments.data.filter((p) => p.state === "paid").reduce((s, p) => s + p.amountCents, 0);
  const failed = payments.data.filter((p) => p.state === "failed");

  return (
    <ScreenScroll>
      <Label>Operator.</Label>
      <Display>Today</Display>
      <ScopeChip />

      {failed.length > 0 && can(session, "revenue.view") ? (
        <Banner tone="danger" message={`${failed.length} failed payment(s) in the recovery queue.`} />
      ) : null}

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Stat label="Members" value={members.loading ? "…" : num(members.data.length)} />
          <Stat label="Classes" value={classes.loading ? "…" : num(classes.data.length)} />
          {can(session, "revenue.view") ? (
            <Stat label="Revenue" value={moneyFromCents(revenue, { locale: prefs.locale, currency: prefs.currency })} />
          ) : null}
        </Row>
      </Card>

      <Card>
        <Label>Floor load</Label>
        {classes.loading ? (
          <Skeleton height={32} />
        ) : (
          classes.data.map((c) => (
            <Row key={c.id} style={{ justifyContent: "space-between", marginTop: space.xs }}>
              <Body>{c.title}</Body>
              <Label>{c.load.toUpperCase()} · cap {c.capacity}</Label>
            </Row>
          ))
        )}
      </Card>

      {can(session, "revenue.view") && failed.length > 0 ? (
        <Card>
          <Label>Recovery queue</Label>
          {failed.map((p) => (
            <Row key={p.id} style={{ justifyContent: "space-between", marginTop: space.xs }}>
              <Body>{p.kind}</Body>
              <Label>{moneyFromCents(p.amountCents, { locale: prefs.locale, currency: prefs.currency })} · failed</Label>
            </Row>
          ))}
        </Card>
      ) : null}
    </ScreenScroll>
  );
}
