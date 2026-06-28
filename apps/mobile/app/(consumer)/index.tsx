// Home — level/XP (from the user's profile), today's session, quests, feed
// teaser. Live: profile from session, quests via RLS-scoped Supabase read,
// feed teaser from Post. Today's session is the next bookable class.
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, XPBar, Button, Row, Skeleton, EmptyState } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { useSession } from "../../src/session";
import { IdentityHeader } from "../../src/chrome";
import { useMyProgress, useClasses, useFeed } from "../../src/data";
import { xpPct, threshold } from "../../src/xp";
import { date, num } from "@ox/rbac";

export default function Home() {
  const router = useRouter();
  const { session, prefs } = useSession();
  const progress = useMyProgress(session?.userId);
  const classes = useClasses();
  const feed = useFeed();

  const level = session?.level ?? 1;
  const xp = session?.xp ?? 0;
  const pct = xpPct(level, xp);
  const next = classes.data[0];

  return (
    <ScreenScroll>
      <IdentityHeader />
      <Label>Plug in. Level up.</Label>
      <Display>{session?.name ?? "Athlete"}</Display>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Label>Level {level}</Label>
          <Label>{num(xp, { locale: prefs.locale })} / {num(threshold(level), { locale: prefs.locale })} XP</Label>
        </Row>
        <View style={{ height: space.sm }} />
        <XPBar pct={pct} />
      </Card>

      <Card>
        <Label>Today</Label>
        {classes.loading ? (
          <Skeleton height={40} />
        ) : next ? (
          <>
            <Body>{next.title}</Body>
            <Label>{date(next.startsAt, { locale: prefs.locale, dateStyle: undefined, timeStyle: "short" })} · {next.load.toUpperCase()}</Label>
            <View style={{ height: space.sm }} />
            <Button title="Open Tribe" onPress={() => router.push("/(consumer)/tribe")} />
          </>
        ) : (
          <Body style={{ color: color.stone }}>No session queued. Generate one.</Body>
        )}
        <View style={{ height: space.sm }} />
        <Button title="Generate a workout" variant="primary" onPress={() => router.push("/(consumer)/generate")} />
      </Card>

      <Card>
        <Label>Quests</Label>
        {progress.loading ? (
          <Skeleton height={40} />
        ) : progress.data.quests.length === 0 ? (
          <Body style={{ color: color.stone }}>No active quests.</Body>
        ) : (
          progress.data.quests.map((q) => (
            <View key={q.id} style={{ gap: 4, marginTop: space.sm }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Body>{q.name}</Body>
                <Label>{q.current}/{q.target}</Label>
              </Row>
              <XPBar pct={q.target > 0 ? Math.round((q.current / q.target) * 100) : 0} />
            </View>
          ))
        )}
      </Card>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Label>Feed</Label>
          <Button title="Tribe" variant="ghost" onPress={() => router.push("/(consumer)/tribe")} />
        </Row>
        {feed.loading ? (
          <Skeleton height={40} />
        ) : feed.data.length === 0 ? (
          <EmptyState title="Quiet herd" hint="Be the first to post." />
        ) : (
          feed.data.slice(0, 2).map((p) => (
            <View key={p.id} style={{ marginTop: space.sm }}>
              <Label>{p.author?.name ?? "Athlete"}</Label>
              <Body numberOfLines={2}>{p.body}</Body>
            </View>
          ))
        )}
      </Card>
    </ScreenScroll>
  );
}
