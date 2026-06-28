// Events — public discovery of events + raids. Tap → detail (RSVP / join raid).
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Chip, Skeleton, EmptyState } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { useEvents } from "../../../src/data";
import { useSession } from "../../../src/session";
import { date, num } from "@ox/rbac";

export default function Events() {
  const router = useRouter();
  const { prefs } = useSession();
  const events = useEvents();

  return (
    <ScreenScroll>
      <Label>Iron Safari.</Label>
      <Display>Events</Display>

      {events.loading ? (
        <Skeleton height={160} />
      ) : events.data.length === 0 ? (
        <EmptyState title="Nothing nearby" />
      ) : (
        events.data.map((e) => (
          <Card key={e.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: "600" }}>{e.title}</Body>
                <Label>{e.hostName} · {date(e.startsAt, { locale: prefs.locale })}</Label>
              </View>
              {e.isRaid ? <Chip label="Raid" active /> : <Chip label={`+${num(e.rewardXp)} XP`} />}
            </Row>
            <Button title={e.isRaid ? "Join raid" : "RSVP"} onPress={() => router.push(`/(consumer)/events/${e.id}`)} style={{ marginTop: space.sm }} />
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}
