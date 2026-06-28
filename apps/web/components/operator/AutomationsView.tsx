"use client";
// OX web — Automation Builder (parity §B·26). Rule list (trigger → action with a
// delay), enable toggle (OXSwitch), and a run-history readout. Capability-gated
// to host/admin (members.view); RLS-scoped to the floor. Toggle writes to
// /automations/:id/toggle.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXSetting, OXSwitch, OXChip, OXButton, OXListRow, OXEmpty, OXToast, OXField, OXSelect } from "@ox/ds";
import { can, scopeLabel, date } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { floorName } from "../../lib/seed";

interface Automation {
  id: string;
  trigger: string;
  action: string;
  delayHours: number;
  enabled: boolean;
  runs: { at: string; result: string }[];
}

const TRIGGERS = ["signup", "trial_end", "no_show", "birthday", "milestone"];
const ACTIONS = ["send_email", "send_sms", "create_task", "grant_credit"];

const SEED: Automation[] = [
  { id: "au1", trigger: "signup", action: "send_email", delayHours: 0, enabled: true, runs: [{ at: new Date(Date.now() - 36e5).toISOString(), result: "sent" }] },
  { id: "au2", trigger: "trial_end", action: "send_sms", delayHours: 24, enabled: true, runs: [{ at: new Date(Date.now() - 9e7).toISOString(), result: "sent" }] },
  { id: "au3", trigger: "no_show", action: "create_task", delayHours: 2, enabled: false, runs: [] },
];

export function AutomationsView() {
  const t = useTranslations("automations");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const api = useApi();

  const [autos, setAutos] = useState<Automation[]>(SEED);
  const [toast, setToast] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState(TRIGGERS[0]!);
  const [newAction, setNewAction] = useState(ACTIONS[0]!);

  const allowed = can(session, "members.view");
  if (!allowed) {
    return (
      <OXContainer>
        <OXEmpty title={t("empty")} />
      </OXContainer>
    );
  }

  async function toggle(id: string, on: boolean) {
    setAutos((arr) => arr.map((a) => (a.id === id ? { ...a, enabled: on } : a)));
    await api.http.post(`/automations/${id}/toggle`).catch(() => {});
  }

  async function add() {
    const id = `au${Date.now()}`;
    setAutos((arr) => [...arr, { id, trigger: newTrigger, action: newAction, delayHours: 0, enabled: true, runs: [] }]);
    await api.http.post("/automations", { trigger: newTrigger, action: newAction, delayHours: 0 }).catch(() => {});
    setToast(t("add"));
  }

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <div className="ox-stack" style={{ gap: 10, paddingBlock: 16 }}>
        {autos.map((a) => (
          <div key={a.id} className="ox-stack" style={{ gap: 6, border: "1px solid var(--ox-line)", padding: 12 }}>
            <OXSetting
              title={`${a.trigger} → ${a.action}`}
              sub={a.delayHours ? `+${a.delayHours}h` : "immediate"}
              control={<OXSwitch on={a.enabled} onChange={(v) => void toggle(a.id, v)} />}
            />
            <div className="ox-section-label" style={{ margin: 0 }}>{t("history")} · {a.runs.length} {t("runs")}</div>
            {a.runs.map((r, i) => (
              <OXListRow key={i} title={r.result} sub={date(r.at, { locale: prefs.locale, dateStyle: "medium", timeStyle: "short" })} />
            ))}
          </div>
        ))}
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("add")}</div>
        <div className="ox-row-wrap">
          <OXField label={t("trigger")} style={{ flex: 1 }}>
            <OXSelect value={newTrigger} onChange={setNewTrigger} options={TRIGGERS.map((x) => ({ value: x, label: x }))} />
          </OXField>
          <OXField label={t("action")} style={{ flex: 1 }}>
            <OXSelect value={newAction} onChange={setNewAction} options={ACTIONS.map((x) => ({ value: x, label: x }))} />
          </OXField>
        </div>
        <OXButton variant="oxide" onClick={() => void add()}>{t("add")}</OXButton>
      </section>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
