// Train — exercise library with filters (muscle/equipment), recovery map,
// PRs, and entries into the generator + set-logger. Library is public-discovery
// (Supabase); recovery/PRs are RLS-scoped to the member.
import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Body, Button, Row, Chip, Skeleton, EmptyState, Field } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { useSession } from "../../src/session";
import { useExercises, useMyProgress } from "../../src/data";
import { weight, date } from "@ox/rbac";

const MUSCLES = ["push", "pull", "legs", "core", "arms", "back", "chest", "glutes", "full_body"];
const EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "cable", "machine", "band", "bodyweight", "trx"];

export default function Train() {
  const router = useRouter();
  const { session, prefs } = useSession();
  const [muscle, setMuscle] = useState<string | undefined>();
  const [equipment, setEquipment] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const exercises = useExercises({ muscle, equipment, q: q || undefined });
  const progress = useMyProgress(session?.userId);

  return (
    <ScreenScroll>
      <Label>The work is the reward.</Label>
      <Button title="Generate a workout" variant="primary" onPress={() => router.push("/(consumer)/generate")} />

      <Card>
        <Label>Recovery</Label>
        {progress.loading ? (
          <Skeleton height={32} />
        ) : progress.data.recovery.length === 0 ? (
          <Body style={{ color: color.stone }}>Fresh across the board.</Body>
        ) : (
          <Row style={{ flexWrap: "wrap", marginTop: space.xs }}>
            {progress.data.recovery.map((r) => (
              <Chip key={r.muscle} label={`${r.muscle} · ${r.state}`} active={r.state === "spent"} />
            ))}
          </Row>
        )}
      </Card>

      {progress.data.prs.length > 0 ? (
        <Card>
          <Label>Personal records</Label>
          {progress.data.prs.slice(0, 4).map((pr) => (
            <Row key={pr.id} style={{ justifyContent: "space-between", marginTop: space.xs }}>
              <Body>{pr.lift}</Body>
              <Label>{weight(pr.value, prefs.units, { locale: prefs.locale })} · {date(pr.at, { locale: prefs.locale })}</Label>
            </Row>
          ))}
        </Card>
      ) : null}

      <Field label="Search" value={q} onChangeText={setQ} placeholder="Filter exercises" autoCapitalize="none" />

      <View style={{ gap: space.xs }}>
        <Label>Muscle</Label>
        <Row style={{ flexWrap: "wrap" }}>
          {MUSCLES.map((m) => (
            <Chip key={m} label={m} active={muscle === m} onPress={() => setMuscle(muscle === m ? undefined : m)} />
          ))}
        </Row>
      </View>

      <View style={{ gap: space.xs }}>
        <Label>Equipment</Label>
        <Row style={{ flexWrap: "wrap" }}>
          {EQUIPMENT.map((e) => (
            <Chip key={e} label={e} active={equipment === e} onPress={() => setEquipment(equipment === e ? undefined : e)} />
          ))}
        </Row>
      </View>

      {exercises.loading ? (
        <Skeleton height={120} />
      ) : exercises.data.length === 0 ? (
        <EmptyState title="No matches" hint="Loosen a filter." />
      ) : (
        exercises.data.map((ex) => (
          <Card key={ex.id}>
            <Body style={{ fontWeight: "600" }}>{ex.name}</Body>
            <Label>{ex.muscles.join(" · ")}</Label>
            {ex.cue ? <Body style={{ color: color.stone, marginTop: space.xs }}>{ex.cue}</Body> : null}
            <Row style={{ flexWrap: "wrap", marginTop: space.xs }}>
              {ex.equipment.map((eq) => (
                <Chip key={eq} label={eq} />
              ))}
            </Row>
          </Card>
        ))
      )}
    </ScreenScroll>
  );
}
