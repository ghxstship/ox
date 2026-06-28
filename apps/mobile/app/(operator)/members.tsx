// Operator Members / Clients — scoped per role. Coach sees own roster
// (/clients), host/admin see members (/members). RLS scopes the rows
// server-side; the scope chip names it. Search filters client-side.
import { useState, useMemo } from "react";
import { View } from "react-native";
import { ScreenScroll, Card, Label, Display, Body, Row, Field, Avatar, Skeleton, EmptyState, RuleLine } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api, tryApi } from "../../src/api";
import { useSession } from "../../src/session";
import { ScopeChip } from "../../src/chrome";
import { useAsync } from "../../src/data";
import { NAV, num } from "@ox/rbac";
import type { User } from "@ox/types";

export default function Members() {
  const { session, prefs } = useSession();
  const label = session ? NAV[session.role].membersLabel ?? "Members" : "Members";
  const isCoach = session?.role === "coach";

  const { data, loading } = useAsync<User[]>(
    async () =>
      tryApi(async () => {
        const page = isCoach ? await api.ops.clients() : await api.ops.members();
        return page.data;
      }, []),
    [],
    [isCoach]
  );

  const [q, setQ] = useState("");
  const shown = useMemo(
    () => data.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())),
    [data, q]
  );

  return (
    <ScreenScroll>
      <Label>Your people.</Label>
      <Display>{label}</Display>
      <ScopeChip />

      <Field label="Search" value={q} onChangeText={setQ} placeholder="Name" autoCapitalize="none" />

      {loading ? (
        <Skeleton height={160} />
      ) : shown.length === 0 ? (
        <EmptyState title="No one in scope" hint="RLS shows only your rows." />
      ) : (
        <Card>
          {shown.map((u, i) => (
            <View key={u.id}>
              {i > 0 ? <RuleLine style={{ marginVertical: space.sm }} /> : null}
              <Row>
                <Avatar initial={u.initial} size={32} />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: "600" }}>{u.name}</Body>
                  <Label>Level {num(u.level)} · {u.role}</Label>
                </View>
              </Row>
            </View>
          ))}
        </Card>
      )}
    </ScreenScroll>
  );
}
