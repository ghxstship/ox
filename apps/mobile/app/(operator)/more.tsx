// Operator More — payments (revenue.view), admin surfaces (admin only), and
// account. Each row gated by can() — hidden, not disabled, when unauthorized.
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Banner, Skeleton, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api, tryApi } from "../../src/api";
import { useSession } from "../../src/session";
import { ScopeChip } from "../../src/chrome";
import { useAsync } from "../../src/data";
import { can, moneyFromCents } from "@ox/rbac";
import type { Payment } from "@ox/types";

export default function More() {
  const { session, prefs, signOut } = useSession();
  const [showPayments, setShowPayments] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payments = useAsync<Payment[]>(
    async () => (can(session, "revenue.view") ? tryApi(async () => (await api.ops.payments()).data, []) : []),
    []
  );

  async function retry(id: string) {
    setMsg(null);
    try {
      await api.ops.retryPayment(id);
      setMsg("Retry queued.");
      payments.reload();
    } catch (e: any) {
      setMsg(e?.message ?? "Retry failed.");
    }
  }

  return (
    <ScreenScroll>
      <Label>Console.</Label>
      <Display>More</Display>
      <ScopeChip />
      {msg ? <Banner message={msg} /> : null}

      {can(session, "revenue.view") ? (
        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Label>Payments</Label>
            <Button title={showPayments ? "Hide" : "Show"} onPress={() => setShowPayments((s) => !s)} />
          </Row>
          {showPayments ? (
            payments.loading ? (
              <Skeleton height={80} />
            ) : payments.data.length === 0 ? (
              <Body style={{ color: color.stone }}>No payments in scope.</Body>
            ) : (
              payments.data.map((p, i) => (
                <View key={p.id}>
                  {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
                  <Row style={{ justifyContent: "space-between" }}>
                    <View style={{ flex: 1 }}>
                      <Body>{p.kind}</Body>
                      <Label>{p.state}</Label>
                    </View>
                    <Body>{moneyFromCents(p.amountCents, { locale: prefs.locale, currency: prefs.currency })}</Body>
                  </Row>
                  {p.state === "failed" ? <Button title="Retry charge" onPress={() => retry(p.id)} style={{ marginTop: space.xs }} /> : null}
                </View>
              ))
            )
          ) : null}
        </Card>
      ) : null}

      {can(session, "*") ? (
        <Card style={{ gap: space.xs }}>
          <Label>Admin</Label>
          <Body style={{ color: color.stone }}>Floors · Challenges · Staff / RBAC · Analytics</Body>
          <Body style={{ color: color.stone }}>(Console surfaces — host the full builders on web.)</Body>
        </Card>
      ) : null}

      <Card>
        <Label>Account</Label>
        <Body>{session?.name} · {session?.role}</Body>
        <Button title="Sign out" variant="ghost" onPress={signOut} style={{ marginTop: space.sm }} />
      </Card>
    </ScreenScroll>
  );
}
