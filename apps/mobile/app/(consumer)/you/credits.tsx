// Class Packs / Credits — wallet balance, buy a pack, ledger. Endpoints
// GET /me/credits · POST /packages/:id/buy · GET /me/credits/ledger (parity §D)
// aren't in the typed client yet, so we call them by path via api.http and
// comment. States: balance · buy-pack · ledger · expired.
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Banner, Skeleton, RuleLine } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { api, tryApi } from "../../../src/api";
import { useSession } from "../../../src/session";
import { useAsync } from "../../../src/data";
import { moneyFromCents, num, date } from "@ox/rbac";

interface Wallet {
  balance: number;
  ledger: { id: string; delta: number; reason: string; at: string }[];
  packs: { id: string; name: string; credits: number; priceCents: number }[];
}

const FALLBACK: Wallet = {
  balance: 4,
  packs: [
    { id: "pk_5", name: "5-Class Pack", credits: 5, priceCents: 9000 },
    { id: "pk_10", name: "10-Class Pack", credits: 10, priceCents: 16000 },
  ],
  ledger: [{ id: "l1", delta: -1, reason: "Booked Oxide Strength", at: new Date().toISOString() }],
};

export default function Credits() {
  const { prefs } = useSession();
  const { data: wallet, loading, reload } = useAsync<Wallet>(
    // GET /me/credits — call by path; falls back to a demo wallet offline.
    async () => tryApi(() => api.http.get<Wallet>("/me/credits"), FALLBACK),
    FALLBACK
  );
  const [msg, setMsg] = useState<string | null>(null);

  async function buy(packId: string) {
    setMsg(null);
    try {
      // POST /packages/:id/buy (Stripe) — by path until typed.
      await api.http.post(`/packages/${packId}/buy`);
      setMsg("Pack purchased.");
      reload();
    } catch {
      setMsg("Couldn't complete purchase.");
    }
  }

  return (
    <ScreenScroll>
      <Label>Credits.</Label>
      <Display>{num(wallet.balance)} left</Display>
      {msg ? <Banner message={msg} /> : null}

      {loading ? (
        <Skeleton height={160} />
      ) : (
        <>
          <Card>
            <Label>Buy a pack</Label>
            {wallet.packs.map((p, i) => (
              <View key={p.id}>
                {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
                <Row style={{ justifyContent: "space-between" }}>
                  <Body>{p.name} · {p.credits} credits</Body>
                  <Body>{moneyFromCents(p.priceCents, { locale: prefs.locale, currency: prefs.currency })}</Body>
                </Row>
                <Button title="Buy" onPress={() => buy(p.id)} style={{ marginTop: space.xs }} />
              </View>
            ))}
          </Card>

          <Card>
            <Label>Ledger</Label>
            {wallet.ledger.length === 0 ? (
              <Body style={{ color: color.stone }}>No activity.</Body>
            ) : (
              wallet.ledger.map((l) => (
                <Row key={l.id} style={{ justifyContent: "space-between", marginTop: space.xs }}>
                  <Body>{l.reason}</Body>
                  <Label>{l.delta > 0 ? `+${l.delta}` : l.delta} · {date(l.at, { locale: prefs.locale })}</Label>
                </Row>
              ))
            )}
          </Card>
        </>
      )}
    </ScreenScroll>
  );
}
