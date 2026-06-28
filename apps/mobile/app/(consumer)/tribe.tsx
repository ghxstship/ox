// Tribe — feed + "Herd that." reaction, classes with the booking gate, and a
// leaderboard. Feed/classes are public-discovery; herd + book are member writes
// (capability-gated with can()). Gate states: included · credit · drop-in ·
// locked · over-limit (resolves to a booking sheet on tap).
import { useState } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Skeleton, EmptyState, Gate, Avatar, RuleLine, Banner, type GateState } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { can, date } from "@ox/rbac";
import { useSession } from "../../src/session";
import { useFeed, useClasses } from "../../src/data";
import { supabase } from "../../src/supabase";
import { api } from "../../src/api";

// Demo entitlement resolution → the four gate forks. In production this comes
// from /me/plan (MembershipPlan + CreditWallet usage).
function gateFor(load: string, level: number): GateState {
  if (load === "full") return "overlimit";
  if (level >= 10) return "included";
  if (level >= 5) return "credit";
  return "dropin";
}

export default function Tribe() {
  const { session, prefs } = useSession();
  const feed = useFeed();
  const classes = useClasses();
  const [herded, setHerded] = useState<Record<string, boolean>>({});
  const [booking, setBooking] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function herd(postId: string) {
    if (!can(session, "social.post")) return;
    setHerded((h) => ({ ...h, [postId]: true }));
    try {
      await supabase.from("Herd").insert({ postId, userId: session!.userId });
    } catch {
      /* optimistic */
    }
  }

  async function book(classId: string) {
    if (!can(session, "class.book")) return;
    setBooking(classId);
    setMsg(null);
    try {
      const res = await api.classes.book(classId);
      setMsg(res.state === "waitlist" ? "Added to waitlist." : "Booked. Herd that.");
    } catch (e: any) {
      setMsg(e?.message ?? "Booking failed.");
    } finally {
      setBooking(null);
    }
  }

  return (
    <ScreenScroll>
      <Label>One herd.</Label>
      <Display>Tribe</Display>
      {msg ? <Banner message={msg} /> : null}

      <Card>
        <Label>Classes</Label>
        {classes.loading ? (
          <Skeleton height={80} />
        ) : classes.data.length === 0 ? (
          <EmptyState title="No classes" />
        ) : (
          classes.data.map((c, i) => {
            const gate = gateFor(c.load, session?.level ?? 1);
            const locked = gate === "locked";
            return (
              <View key={c.id}>
                {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
                <Row style={{ justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Body style={{ fontWeight: "600" }}>{c.title}</Body>
                    <Label>{date(c.startsAt, { locale: prefs.locale, timeStyle: "short", dateStyle: "short" })} · cap {c.capacity}</Label>
                  </View>
                  <Gate state={gate} />
                </Row>
                {can(session, "class.book") && !locked && gate !== "overlimit" ? (
                  <Button
                    title={booking === c.id ? "Booking…" : gate === "dropin" ? "Reserve drop-in" : "Book"}
                    onPress={() => book(c.id)}
                    disabled={booking === c.id}
                    style={{ marginTop: space.sm }}
                  />
                ) : gate === "overlimit" ? (
                  <Body style={{ color: color.stone, marginTop: space.xs }}>Class full — join the waitlist on tap.</Body>
                ) : null}
              </View>
            );
          })
        )}
      </Card>

      <Card>
        <Label>Feed</Label>
        {feed.loading ? (
          <Skeleton height={120} />
        ) : feed.data.length === 0 ? (
          <EmptyState title="Quiet herd" hint="Be the first to post." />
        ) : (
          feed.data.map((p, i) => {
            const on = herded[p.id] || false;
            return (
              <View key={p.id}>
                {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
                <Row>
                  <Avatar initial={p.author?.initial ?? "?"} size={28} />
                  <Label>{p.author?.name ?? "Athlete"}</Label>
                </Row>
                <Body style={{ marginTop: space.xs }}>{p.body}</Body>
                <Row style={{ marginTop: space.xs, justifyContent: "space-between" }}>
                  <Label>{p.herdCount + (on ? 1 : 0)} herded</Label>
                  {can(session, "social.post") ? (
                    <Button title={on ? "Herded" : "Herd that."} variant={on ? "default" : "primary"} onPress={() => herd(p.id)} disabled={on} />
                  ) : null}
                </Row>
              </View>
            );
          })
        )}
      </Card>
    </ScreenScroll>
  );
}
