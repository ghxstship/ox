// Operator Schedule — classes (RLS-scoped: host=floor, coach=own). "Add class"
// is gated by class.manage (host/admin only; coach sees read-only). The
// scope() helper mirrors the server RLS for the visible rows.
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Field, Banner, Skeleton, EmptyState, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api } from "../../src/api";
import { useSession } from "../../src/session";
import { ScopeChip } from "../../src/chrome";
import { useClasses } from "../../src/data";
import { can, scope, date } from "@ox/rbac";

export default function Schedule() {
  const { session, prefs } = useSession();
  const classes = useClasses();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // Client-side mirror of the RLS scope (the server already filtered; this hides
  // anything the API would refuse).
  const rows = scope(
    "classes",
    classes.data.map((c) => ({ ...c, floorId: c.floorId, coachId: c.coachId })),
    session
  );

  async function addClass() {
    setMsg(null);
    try {
      await api.classes.create({ title, floorId: session?.floorId ?? undefined, capacity: 12 });
      setMsg("Class added.");
      setTitle("");
      setAdding(false);
      classes.reload();
    } catch (e: any) {
      setMsg(e?.message ?? "Couldn't add class.");
    }
  }

  return (
    <ScreenScroll>
      <Label>Programming.</Label>
      <Display>Schedule</Display>
      <ScopeChip />
      {msg ? <Banner message={msg} /> : null}

      {can(session, "class.manage") ? (
        adding ? (
          <Card style={{ gap: space.sm }}>
            <Field label="Class title" value={title} onChangeText={setTitle} placeholder="Oxide Strength" />
            <Row gap={space.sm}>
              <Button title="Save" variant="primary" onPress={addClass} disabled={!title} style={{ flex: 1 }} />
              <Button title="Cancel" onPress={() => setAdding(false)} style={{ flex: 1 }} />
            </Row>
          </Card>
        ) : (
          <Button title="Add class" variant="primary" onPress={() => setAdding(true)} />
        )
      ) : (
        <Body style={{ color: color.stone }}>Read-only — you can view but not edit the schedule.</Body>
      )}

      {classes.loading ? (
        <Skeleton height={120} />
      ) : rows.length === 0 ? (
        <EmptyState title="No classes in scope" />
      ) : (
        <Card>
          {rows.map((c, i) => (
            <View key={c.id}>
              {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
              <Row style={{ justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: "600" }}>{c.title}</Body>
                  <Label>{date(c.startsAt, { locale: prefs.locale, dateStyle: "short", timeStyle: "short" })}</Label>
                </View>
                <Label>cap {c.capacity}</Label>
              </Row>
            </View>
          ))}
        </Card>
      )}
    </ScreenScroll>
  );
}
