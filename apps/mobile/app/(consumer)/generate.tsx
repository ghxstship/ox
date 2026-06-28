// Workout Generator — POST /workouts/generate. Pick focus / experience / goal /
// equipment, generate a session server-side, then start it and open the Player.
// States: empty (pre-gen) · generating · ready · error · no-equipment fallback.
import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Chip, SegControl, Banner, Skeleton } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api } from "../../src/api";
import type { WorkoutSession } from "@ox/types";

const FOCUS = ["push", "pull", "legs", "full_body"];
const EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "cable", "machine", "band", "bodyweight", "trx"];

export default function Generate() {
  const router = useRouter();
  const [focus, setFocus] = useState("full_body");
  const [experience, setExperience] = useState("intermediate");
  const [goal, setGoal] = useState("strength");
  const [equipment, setEquipment] = useState<string[]>(["barbell", "dumbbell"]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<WorkoutSession | null>(null);

  function toggleEq(e: string) {
    setEquipment((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function generate() {
    setErr(null);
    setBusy(true);
    setResult(null);
    try {
      const session = await api.training.generate({ focus, equipment, experience, goal });
      setResult(session);
    } catch (e: any) {
      setErr(e?.message ?? "Generation failed. Check the API.");
    } finally {
      setBusy(false);
    }
  }

  async function startSession() {
    if (!result) return;
    setBusy(true);
    try {
      // Use the generated session if it has an id, else start a fresh one.
      const sess = result.id ? result : await api.training.start({});
      router.replace(`/(consumer)/session/${sess.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't start session.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenScroll>
      <Label>Plug in.</Label>
      <Display>Generate</Display>

      {err ? <Banner tone="danger" message={err} /> : null}

      <Card style={{ gap: space.sm }}>
        <Label>Focus</Label>
        <SegControl options={FOCUS.map((f) => ({ value: f, label: f }))} value={focus} onChange={setFocus} />
        <Label>Experience</Label>
        <SegControl
          options={["novice", "intermediate", "advanced"].map((v) => ({ value: v, label: v }))}
          value={experience}
          onChange={setExperience}
        />
        <Label>Goal</Label>
        <SegControl
          options={["strength", "hypertrophy", "endurance"].map((v) => ({ value: v, label: v }))}
          value={goal}
          onChange={setGoal}
        />
        <Label>Equipment</Label>
        <Row style={{ flexWrap: "wrap" }}>
          {EQUIPMENT.map((e) => (
            <Chip key={e} label={e} active={equipment.includes(e)} onPress={() => toggleEq(e)} />
          ))}
        </Row>
        {equipment.length === 0 ? <Body style={{ color: color.stone }}>No equipment — we'll build a bodyweight session.</Body> : null}
        <Button title={busy ? "Generating…" : "Generate"} variant="primary" disabled={busy} onPress={generate} />
      </Card>

      {busy && !result ? <Skeleton height={120} /> : null}

      {result ? (
        <Card style={{ gap: space.sm }}>
          <Label>Ready</Label>
          <Body>{(result.sets?.length ?? 0)} sets queued · {focus.replace("_", " ")}.</Body>
          <View style={{ gap: space.xs }}>
            {(result.sets ?? []).slice(0, 6).map((s, i) => (
              <Row key={s.id ?? i} style={{ justifyContent: "space-between" }}>
                <Body>Set {s.index + 1}</Body>
                <Label>{s.reps} reps</Label>
              </Row>
            ))}
          </View>
          <Button title="Start session" variant="primary" disabled={busy} onPress={startSession} />
          <Button title="Regenerate" onPress={generate} disabled={busy} />
        </Card>
      ) : null}
    </ScreenScroll>
  );
}
