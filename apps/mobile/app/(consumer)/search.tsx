// Global Search — cross-entity (exercises · products · events · floors). Runs
// parallel Supabase discovery queries and groups results. States: empty ·
// grouped results · deep-link on tap.
import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Field, Row, EmptyState, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { supabase } from "../../src/supabase";

interface Group { label: string; rows: { id: string; name: string; href?: string }[] }

export default function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [searched, setSearched] = useState(false);

  async function run(term: string) {
    setQ(term);
    if (term.trim().length < 2) {
      setGroups([]);
      setSearched(false);
      return;
    }
    const like = `%${term}%`;
    const [ex, pr, ev, fl] = await Promise.all([
      supabase.from("Exercise").select("id,name").ilike("name", like).limit(5),
      supabase.from("Product").select("id,name").ilike("name", like).limit(5),
      supabase.from("Event").select("id,title").ilike("title", like).limit(5),
      supabase.from("Floor").select("id,name").ilike("name", like).limit(5),
    ]);
    setGroups([
      { label: "Exercises", rows: (ex.data ?? []).map((r) => ({ id: r.id, name: r.name })) },
      { label: "Shop", rows: (pr.data ?? []).map((r) => ({ id: r.id, name: r.name, href: `/(consumer)/shop/${r.id}` })) },
      { label: "Events", rows: (ev.data ?? []).map((r) => ({ id: r.id, name: r.title, href: `/(consumer)/events/${r.id}` })) },
      { label: "Floors", rows: (fl.data ?? []).map((r) => ({ id: r.id, name: r.name })) },
    ]);
    setSearched(true);
  }

  const hasResults = groups.some((g) => g.rows.length > 0);

  return (
    <ScreenScroll>
      <Label>Find anything.</Label>
      <Display>Search</Display>
      <Field label="Query" value={q} onChangeText={run} autoCapitalize="none" placeholder="Squat, jacket, raid…" />

      {!searched ? null : !hasResults ? (
        <EmptyState title="No matches" hint="Try a different term." />
      ) : (
        groups
          .filter((g) => g.rows.length > 0)
          .map((g) => (
            <Card key={g.label}>
              <Label>{g.label}</Label>
              {g.rows.map((r, i) => (
                <View key={r.id}>
                  {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
                  <Row onTouchEnd={() => r.href && router.push(r.href as any)}>
                    <Body style={{ flex: 1 }}>{r.name}</Body>
                    {r.href ? <Label>Open</Label> : null}
                  </Row>
                </View>
              ))}
            </Card>
          ))
      )}
    </ScreenScroll>
  );
}
