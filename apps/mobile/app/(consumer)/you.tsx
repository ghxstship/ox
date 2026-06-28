// You — profile, credential, PRs, recovery, and the entry points into the
// parity surfaces (wallet, credits, plan, body, schedule, shop, events, search,
// onboarding, settings). Profile from session; PRs/recovery RLS-scoped.
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Stat, XPBar, RuleLine, Avatar } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { useSession } from "../../src/session";
import { useMyProgress } from "../../src/data";
import { xpPct } from "../../src/xp";
import { weight, num } from "@ox/rbac";

export default function You() {
  const router = useRouter();
  const { session, prefs, signOut } = useSession();
  const progress = useMyProgress(session?.userId);
  const level = session?.level ?? 1;
  const xp = session?.xp ?? 0;

  return (
    <ScreenScroll>
      <Row>
        <Avatar initial={session?.initial ?? "?"} size={48} />
        <View style={{ flex: 1 }}>
          <Display>{session?.name ?? "Athlete"}</Display>
          <Label>Level {level} · {session?.role}</Label>
        </View>
      </Row>

      {/* Credential — reuse OXCredential pattern (QR + tier + member#). */}
      <Card style={{ gap: space.sm }}>
        <Label>OX Credential</Label>
        <Row style={{ justifyContent: "space-between" }}>
          <Stat label="Level" value={String(level)} />
          <Stat label="XP" value={num(xp, { locale: prefs.locale })} />
          <Stat label="Member" value={session?.initial ?? "—"} />
        </Row>
        <XPBar pct={xpPct(level, xp)} />
        <Button title="Wallet pass" onPress={() => router.push("/(consumer)/you/wallet")} />
      </Card>

      <Card>
        <Label>Personal records</Label>
        {progress.data.prs.length === 0 ? (
          <Body style={{ color: color.stone }}>No PRs yet.</Body>
        ) : (
          progress.data.prs.slice(0, 5).map((pr) => (
            <Row key={pr.id} style={{ justifyContent: "space-between", marginTop: space.xs }}>
              <Body>{pr.lift}</Body>
              <Label>{weight(pr.value, prefs.units, { locale: prefs.locale })}</Label>
            </Row>
          ))
        )}
      </Card>

      <Card>
        <Label>Recovery</Label>
        {progress.data.recovery.length === 0 ? (
          <Body style={{ color: color.stone }}>Fresh.</Body>
        ) : (
          progress.data.recovery.map((r) => (
            <Row key={r.muscle} style={{ justifyContent: "space-between", marginTop: space.xs }}>
              <Body>{r.muscle}</Body>
              <Label>{r.state}</Label>
            </Row>
          ))
        )}
      </Card>

      <Card style={{ gap: space.xs }}>
        <Label>Explore</Label>
        <Button title="Shop" onPress={() => router.push("/(consumer)/shop")} />
        <Button title="Events & raids" onPress={() => router.push("/(consumer)/events")} />
        <Button title="My schedule" onPress={() => router.push("/(consumer)/you/schedule")} />
        <Button title="Class credits" onPress={() => router.push("/(consumer)/you/credits")} />
        <Button title="Plan & entitlements" onPress={() => router.push("/(consumer)/you/plan")} />
        <Button title="Body metrics" onPress={() => router.push("/(consumer)/you/body")} />
        <Button title="Search" onPress={() => router.push("/(consumer)/search")} />
        <Button title="Onboarding" onPress={() => router.push("/(consumer)/onboarding")} />
      </Card>

      <RuleLine />
      <Button title="Settings" onPress={() => router.push("/(consumer)/you/settings")} />
      <Button title="Sign out" variant="ghost" onPress={signOut} />
    </ScreenScroll>
  );
}
