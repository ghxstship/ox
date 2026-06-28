"use client";
// OX web — Member-Hosted Event (parity §A·21). Create form + capacity stepper;
// submit moves draft → pending-review (POST /events). States: draft ·
// pending-review · published.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXField, OXInput, OXSelect, OXStepper, OXButton, OXChip, OXToast } from "@ox/ds";
import { useApi } from "../../lib/useApi";
import { useLive } from "../../lib/useLive";
import { fetchFloors } from "../../lib/supabase";
import { floors as seedFloors } from "../../lib/seed";

type Status = "draft" | "pending" | "published";

export function HostEventView() {
  const t = useTranslations("hosted");
  const api = useApi();
  const floorsLive = useLive(fetchFloors, []);
  const floors = floorsLive.data && floorsLive.data.length ? floorsLive.data.map((f) => ({ id: f.id, name: f.name })) : seedFloors.map((f) => ({ id: f.id, name: f.name }));

  const [title, setTitle] = useState("");
  const [floor, setFloor] = useState(floors[0]?.id ?? "");
  const [when, setWhen] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [status, setStatus] = useState<Status>("draft");
  const [toast, setToast] = useState<string | null>(null);

  async function submit() {
    setStatus("pending");
    setToast(t("submitted"));
    await api.events.create({ title, floorId: floor, capacity, startsAt: when }).catch(() => {});
  }

  const statusChip = status === "published" ? "oxide" : status === "pending" ? "oxide-line" : "ghost";

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant={statusChip}>{t(status)}</OXChip>
      </div>

      <OXField label={t("name")}>
        <OXInput value={title} onChange={setTitle} placeholder="Sunrise Bootcamp" />
      </OXField>
      <OXField label={t("where")}>
        <OXSelect value={floor} onChange={setFloor} options={floors.map((f) => ({ value: f.id, label: f.name }))} />
      </OXField>
      <OXField label={t("when")}>
        <OXInput value={when} onChange={setWhen} placeholder="Sat · 07:00" />
      </OXField>
      <OXField label={t("capacity")}>
        <OXStepper value={capacity} min={4} max={200} onChange={setCapacity} />
      </OXField>

      <OXButton variant="oxide" arrow block onClick={() => void submit()}>
        {t("submit")}
      </OXButton>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
