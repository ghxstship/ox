// Home — level, XP, today's session. Reads progress from @ox/api-client when
// the API is up; falls back to the seed identity (Mara) so it renders standalone.
import { ScrollView } from "react-native";
import { Screen, Card, Label, Display, Body, XPBar } from "../src/ui";
import { moneyFromCents } from "@ox/rbac";

export default function Home() {
  const mara = { name: "Mara Vance", level: 14, xp: 2480, nextAt: 3000 };
  const pct = Math.round((mara.xp / mara.nextAt) * 100);
  return (
    <ScrollView style={{ flex: 1 }}>
      <Screen>
        <Label>Plug in. Level up.</Label>
        <Display>{mara.name}</Display>
        <Card>
          <Label>Level {mara.level}</Label>
          <XPBar pct={pct} />
          <Body>{mara.xp} / {mara.nextAt} XP</Body>
        </Card>
        <Card>
          <Label>Today</Label>
          <Body>Lower · Oxide Strength — 5 lifts queued. Pier 9 Iron.</Body>
        </Card>
        <Card>
          <Label>Drop</Label>
          <Body>Founder Drop Jacket — {moneyFromCents(24000)} · unlocks at LV 10.</Body>
        </Card>
      </Screen>
    </ScrollView>
  );
}
