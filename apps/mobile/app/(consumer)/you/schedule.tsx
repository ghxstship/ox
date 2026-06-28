// My Schedule — agenda of upcoming bookings + events. Reads classes/events
// (public discovery); a full /me/schedule merge would come from the API. Agenda
// / week toggle. add-to-calendar (.ics) is stubbed (export endpoint).
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Row, SegControl, Skeleton, EmptyState, RuleLine, Button } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { useClasses, useEvents } from "../../../src/data";
import { useSession } from "../../../src/session";
import { date } from "@ox/rbac";

export default function Schedule() {
  const { prefs } = useSession();
  const classes = useClasses();
  const events = useEvents();
  const [view, setView] = useState("agenda");

  const items = [
    ...classes.data.map((c) => ({ id: c.id, title: c.title, at: c.startsAt, kind: "Class" })),
    ...events.data.map((e) => ({ id: e.id, title: e.title, at: e.startsAt, kind: e.isRaid ? "Raid" : "Event" })),
  ].sort((a, b) => +new Date(a.at) - +new Date(b.at));

  return (
    <ScreenScroll>
      <Label>What's next.</Label>
      <Display>Schedule</Display>
      <SegControl
        options={[
          { value: "agenda", label: "Agenda" },
          { value: "week", label: "Week" },
        ]}
        value={view}
        onChange={setView}
      />

      {classes.loading || events.loading ? (
        <Skeleton height={160} />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing booked" hint="Book a class in Tribe." />
      ) : (
        <Card>
          {items.map((it, i) => (
            <View key={it.kind + it.id}>
              {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
              <Row style={{ justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: "600" }}>{it.title}</Body>
                  <Label>{it.kind}</Label>
                </View>
                <Label>{date(it.at, { locale: prefs.locale, dateStyle: "short", timeStyle: "short" })}</Label>
              </Row>
            </View>
          ))}
        </Card>
      )}
      <Button title="Add to calendar (.ics)" onPress={() => { /* GET /me/schedule.ics export */ }} />
    </ScreenScroll>
  );
}
