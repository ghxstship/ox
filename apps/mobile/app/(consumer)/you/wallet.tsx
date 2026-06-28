// Wallet Pass — the OXCredential reused: QR + tier + member#. Membership read
// via the typed client (RLS-scoped). States: active · expired · not-eligible.
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Row, Stat, Banner, Skeleton } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { api, tryApi } from "../../../src/api";
import { useSession } from "../../../src/session";
import { useAsync } from "../../../src/data";
import { date } from "@ox/rbac";
import type { Membership } from "@ox/types";

export default function Wallet() {
  const { session, prefs } = useSession();
  const { data: memberships, loading } = useAsync<Membership[]>(
    // /me/wallet (parity §D) is the pass endpoint; fall back to memberships.
    async () => tryApi(async () => {
      const page = await api.ops.memberships();
      return page.data;
    }, []),
    []
  );
  const active = memberships.find((m) => m.status === "active") ?? memberships[0];

  return (
    <ScreenScroll>
      <Label>Tap in.</Label>
      <Display>Wallet</Display>

      {loading ? (
        <Skeleton height={220} />
      ) : !active ? (
        <Banner message="No membership — visit a floor to get a guest pass." />
      ) : (
        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Label>OX Credential</Label>
            <Label>{active.status}</Label>
          </Row>
          <View style={{ height: 140, borderWidth: 1, borderColor: color.stone, backgroundColor: color.paperWarm, alignItems: "center", justifyContent: "center" }}>
            <Label>QR · {session?.userId}</Label>
          </View>
          <Row style={{ justifyContent: "space-between" }}>
            <Stat label="Tier" value={String(active.tier)} />
            <Stat label="Member" value={session?.initial ?? "—"} />
            <Stat label="Renews" value={active.renewsAt ? date(active.renewsAt, { locale: prefs.locale }) : "—"} />
          </Row>
          {active.addOns.length > 0 ? <Body style={{ color: color.stone }}>Add-ons: {active.addOns.join(", ")}</Body> : null}
        </Card>
      )}
    </ScreenScroll>
  );
}
