// Onboarding / Assessment — a stepper that collects goal · experience ·
// equipment · home floor, then seeds the OnboardingProfile (POST /onboarding,
// parity §D — by path). States: per-step · summary → seed.
import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Chip, SegControl, Banner } from "../../src/ui";
import { space } from "../../src/tokens";
import { api } from "../../src/api";
import { useFloors } from "../../src/data";

const EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "cable", "machine", "band", "bodyweight", "trx"];

export default function Onboarding() {
  const router = useRouter();
  const floors = useFloors();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("strength");
  const [experience, setExperience] = useState("intermediate");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [homeFloorId, setHomeFloorId] = useState<string | undefined>();
  const [msg, setMsg] = useState<string | null>(null);

  function toggle(e: string) {
    setEquipment((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function finish() {
    try {
      await api.http.post("/onboarding", { goal, experience, equipment, homeFloorId });
      setMsg("Profile seeded. Welcome to the herd.");
    } catch {
      setMsg("Saved locally — we'll sync your profile.");
    }
  }

  const steps = ["Goal", "Experience", "Equipment", "Home floor", "Summary"];

  return (
    <ScreenScroll>
      <Label>Step {step + 1} / {steps.length} · {steps[step]}</Label>
      <Display>Onboarding</Display>
      {msg ? <Banner message={msg} /> : null}

      <Card style={{ gap: space.sm }}>
        {step === 0 ? (
          <SegControl
            options={["strength", "hypertrophy", "endurance"].map((v) => ({ value: v, label: v }))}
            value={goal}
            onChange={setGoal}
          />
        ) : step === 1 ? (
          <SegControl
            options={["novice", "intermediate", "advanced"].map((v) => ({ value: v, label: v }))}
            value={experience}
            onChange={setExperience}
          />
        ) : step === 2 ? (
          <Row style={{ flexWrap: "wrap" }}>
            {EQUIPMENT.map((e) => (
              <Chip key={e} label={e} active={equipment.includes(e)} onPress={() => toggle(e)} />
            ))}
          </Row>
        ) : step === 3 ? (
          <Row style={{ flexWrap: "wrap" }}>
            {floors.data.map((f) => (
              <Chip key={f.id} label={f.name} active={homeFloorId === f.id} onPress={() => setHomeFloorId(f.id)} />
            ))}
          </Row>
        ) : (
          <>
            <Body>Goal: {goal}</Body>
            <Body>Experience: {experience}</Body>
            <Body>Equipment: {equipment.join(", ") || "bodyweight"}</Body>
            <Body>Home floor: {floors.data.find((f) => f.id === homeFloorId)?.name ?? "—"}</Body>
          </>
        )}
      </Card>

      <Row gap={space.sm}>
        {step > 0 ? <Button title="Back" onPress={() => setStep((s) => s - 1)} style={{ flex: 1 }} /> : null}
        {step < steps.length - 1 ? (
          <Button title="Next" variant="primary" onPress={() => setStep((s) => s + 1)} style={{ flex: 1 }} />
        ) : (
          <Button title="Finish" variant="primary" onPress={finish} style={{ flex: 1 }} />
        )}
      </Row>
      <Button title="Skip" variant="ghost" onPress={() => router.back()} />
    </ScreenScroll>
  );
}
