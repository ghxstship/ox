// Set Logger v2 — the Player. Log sets (weight/reps/RPE), mark done, rest timer
// between sets, finish → XP via /workouts/:id/finish. States: working · resting
// · set-done · finished (+XP). Each logged set posts to /workouts/:id/sets.
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScreenScroll,
  Card,
  Label,
  Display,
  Body,
  Button,
  Row,
  Field,
  Banner,
  RuleLine,
  SegControl,
} from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { api } from "../../../src/api";
import { useSession } from "../../../src/session";
import { useExercises } from "../../../src/data";
import { weight as fmtWeight } from "@ox/rbac";

interface LocalSet {
  index: number;
  exerciseId: string;
  weight: string;
  reps: string;
  rpe: string;
  done: boolean;
}

const REST_SECONDS = 90;

export default function Player() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { prefs } = useSession();
  const { data: exercises } = useExercises();
  const firstExercise = exercises[0]?.id ?? "";

  const [sets, setSets] = useState<LocalSet[]>([
    { index: 0, exerciseId: firstExercise, weight: "135", reps: "5", rpe: "7", done: false },
  ]);
  const [rest, setRest] = useState(0);
  const [xp, setXp] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Seed the first set's exercise once the library loads.
  useEffect(() => {
    if (firstExercise && sets[0] && !sets[0].exerciseId) {
      setSets((prev) => prev.map((s, i) => (i === 0 ? { ...s, exerciseId: firstExercise } : s)));
    }
  }, [firstExercise]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rest countdown.
  useEffect(() => {
    if (rest <= 0) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [rest]);

  function update(i: number, patch: Partial<LocalSet>) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addSet() {
    setSets((prev) => [
      ...prev,
      { index: prev.length, exerciseId: prev[prev.length - 1]?.exerciseId ?? firstExercise, weight: "", reps: "", rpe: "", done: false },
    ]);
  }

  async function markDone(i: number) {
    const s = sets[i];
    if (!s) return;
    update(i, { done: true });
    setRest(REST_SECONDS);
    try {
      await api.training.logSet(String(id), {
        exerciseId: s.exerciseId,
        index: s.index,
        weight: s.weight ? Number(s.weight) : undefined,
        reps: Number(s.reps) || 0,
        rpe: s.rpe ? Number(s.rpe) : undefined,
        done: true,
      });
    } catch {
      // Keep the local UI state; the set is logged optimistically.
    }
  }

  async function finish() {
    setBusy(true);
    setErr(null);
    try {
      const done = await api.training.finish(String(id));
      setXp(done.xpAwarded ?? 0);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't finish — saved locally.");
      setXp(0);
    } finally {
      setBusy(false);
    }
  }

  if (xp !== null) {
    return (
      <ScreenScroll>
        <Label>Session complete.</Label>
        <Display>+{xp} XP</Display>
        <Body>Herd that. Recovery updated for the muscles you worked.</Body>
        <Button title="Back to Train" variant="primary" onPress={() => router.replace("/(consumer)/train")} />
      </ScreenScroll>
    );
  }

  const exName = (eid: string) => exercises.find((e) => e.id === eid)?.name ?? "Exercise";

  return (
    <ScreenScroll>
      <Label>Working</Label>
      <Display>Session</Display>
      {err ? <Banner tone="danger" message={err} /> : null}

      {rest > 0 ? (
        <Card>
          <Label>Resting</Label>
          <Display>{Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}</Display>
          <Button title="Skip rest" onPress={() => setRest(0)} />
        </Card>
      ) : null}

      {sets.map((s, i) => (
        <Card key={i} style={{ gap: space.sm }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Label>Set {s.index + 1}</Label>
            <Label>{s.done ? "DONE" : "WORKING"}</Label>
          </Row>
          <Body style={{ fontWeight: "600" }}>{exName(s.exerciseId)}</Body>
          <SegControl
            options={exercises.slice(0, 3).map((e) => ({ value: e.id, label: e.name.split(" ")[0] ?? e.name }))}
            value={s.exerciseId}
            onChange={(v) => update(i, { exerciseId: v })}
          />
          <Row gap={space.sm}>
            <View style={{ flex: 1 }}>
              <Field label={`Weight (${prefs.units})`} keyboardType="numeric" value={s.weight} onChangeText={(v) => update(i, { weight: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Reps" keyboardType="numeric" value={s.reps} onChangeText={(v) => update(i, { reps: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="RPE" keyboardType="numeric" value={s.rpe} onChangeText={(v) => update(i, { rpe: v })} />
            </View>
          </Row>
          {s.weight ? (
            <Label>{fmtWeight(Number(s.weight), prefs.units, { locale: prefs.locale })} × {s.reps || 0}</Label>
          ) : null}
          {!s.done ? <Button title="Log set" variant="primary" onPress={() => markDone(i)} /> : null}
        </Card>
      ))}

      <RuleLine />
      <Button title="Add set" onPress={addSet} />
      <Button title={busy ? "Finishing…" : "Finish · award XP"} variant="primary" disabled={busy} onPress={finish} />
    </ScreenScroll>
  );
}
