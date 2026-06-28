"use client";
// OX web — Onboarding / Assessment (parity §A·18). A multi-step assessment with
// progress dots (OXOnboardSlide + OXChoice/OXSegmented), skippable + resumable,
// and a summary that POSTs to /onboarding. Steps: goal · experience · equipment ·
// schedule · home floor · summary.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { OXOnboardSlide, OXChoice, OXSegmented, OXButton, OXChip, OXToast } from "@ox/ds";
import { useApi } from "../../lib/useApi";
import { useLive } from "../../lib/useLive";
import { fetchFloors } from "../../lib/supabase";
import { floors as seedFloors } from "../../lib/seed";
import { withLocale } from "../../lib/links";

const EQUIPMENT = ["barbell", "dumbbell", "kettlebell", "cable", "bodyweight"];
const SCHEDULE = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function OnboardingView() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const locale = useLocale();
  const api = useApi();
  const floorsLive = useLive(fetchFloors, []);
  const floors = floorsLive.data && floorsLive.data.length ? floorsLive.data.map((f) => ({ id: f.id, name: f.name })) : seedFloors.map((f) => ({ id: f.id, name: f.name }));

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("strength");
  const [experience, setExperience] = useState("intermediate");
  const [equipment, setEquipment] = useState<string[]>(["barbell"]);
  const [schedule, setSchedule] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [homeFloor, setHomeFloor] = useState(floors[0]?.id ?? "");
  const [done, setDone] = useState(false);

  const total = 6;

  function toggle(list: string[], v: string, set: (x: string[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  async function finish() {
    setDone(true);
    await api.http.post("/onboarding", { goal, experience, equipment, schedule, homeFloorId: homeFloor }).catch(() => {});
    setTimeout(() => router.push(withLocale(locale, "/app")), 1200);
  }

  const slides = [
    {
      kicker: t("goal"),
      title: t("goal"),
      body: (
        <OXSegmented<string> value={goal} onChange={setGoal} options={[{ value: "strength", label: "Strength" }, { value: "hypertrophy", label: "Hypertrophy" }, { value: "conditioning", label: "Conditioning" }, { value: "longevity", label: "Longevity" }]} />
      ),
    },
    {
      kicker: t("experience"),
      title: t("experience"),
      body: <OXSegmented<string> value={experience} onChange={setExperience} options={[{ value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }]} />,
    },
    {
      kicker: t("equipment"),
      title: t("equipment"),
      body: (
        <div className="ox-row-wrap">
          {EQUIPMENT.map((e) => (
            <button key={e} type="button" onClick={() => toggle(equipment, e, setEquipment)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}>
              <OXChip variant={equipment.includes(e) ? "oxide" : "ghost"}>{e}</OXChip>
            </button>
          ))}
        </div>
      ),
    },
    {
      kicker: t("schedule"),
      title: t("schedule"),
      body: (
        <div className="ox-row-wrap">
          {SCHEDULE.map((d) => (
            <button key={d} type="button" onClick={() => toggle(schedule, d, setSchedule)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}>
              <OXChip variant={schedule.includes(d) ? "oxide" : "ghost"}>{d}</OXChip>
            </button>
          ))}
        </div>
      ),
    },
    {
      kicker: t("homeFloor"),
      title: t("homeFloor"),
      body: (
        <div className="ox-stack" style={{ gap: 6 }}>
          {floors.map((f) => (
            <OXChoice key={f.id} type="radio" name="floor" checked={homeFloor === f.id} onChange={() => setHomeFloor(f.id)} label={f.name} />
          ))}
        </div>
      ),
    },
    {
      kicker: t("summary"),
      title: t("summary"),
      body: (
        <div className="ox-stack" style={{ gap: 4 }}>
          <div className="ox-demo-note">{t("goal")}: {goal}</div>
          <div className="ox-demo-note">{t("experience")}: {experience}</div>
          <div className="ox-demo-note">{t("equipment")}: {equipment.join(", ")}</div>
          <div className="ox-demo-note">{t("schedule")}: {schedule.join(", ")}</div>
          <div className="ox-demo-note">{t("homeFloor")}: {floors.find((f) => f.id === homeFloor)?.name}</div>
        </div>
      ),
    },
  ];

  const cur = slides[step]!;

  return (
    <div className="ox-page ox-stack">
      <OXOnboardSlide index={step} total={total} kicker={cur.kicker} title={<em>{cur.title}</em>} action={cur.body} />

      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <OXButton variant="ghost" onClick={() => (step > 0 ? setStep((s) => s - 1) : router.push(withLocale(locale, "/app")))}>
          {step > 0 ? t("back") : t("skip")}
        </OXButton>
        {step < total - 1 ? (
          <OXButton variant="oxide" arrow onClick={() => setStep((s) => s + 1)}>
            {t("next")}
          </OXButton>
        ) : (
          <OXButton variant="oxide" arrow onClick={() => void finish()}>
            {t("finish")}
          </OXButton>
        )}
      </div>

      <OXToast visible={done} tone="success" message={t("done")} />
    </div>
  );
}
