"use client";
// OX web — Lead / Prospect Pipeline (parity §B·25). Stage columns (lead · tour ·
// trial · member · lost), cards advance through the pipeline, a weighted total
// reflects stage probability, and won/lost are terminal. Capability-gated to
// host/admin (members.view); every action is RLS-scoped to the operator's floor
// (scope chip shown). Writes hit /leads/:id/stage · /leads/:id/convert.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXChip, OXButton, OXKpi, OXEmpty, OXToast, OXBanner, OXListRow } from "@ox/ds";
import { can, scopeLabel, moneyFromCents } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { floorName } from "../../lib/seed";

const STAGES = ["lead", "tour", "trial", "member", "lost"] as const;
type Stage = (typeof STAGES)[number];
const PROB: Record<Stage, number> = { lead: 0.1, tour: 0.3, trial: 0.6, member: 1, lost: 0 };

interface Lead {
  id: string;
  name: string;
  contact: string;
  source: string;
  stage: Stage;
  valueCents: number;
  floorId: string;
}

const SEED: Lead[] = [
  { id: "ld1", name: "Priya Shah", contact: "priya@mail.com", source: "Instagram", stage: "lead", valueCents: 18000, floorId: "f_pier" },
  { id: "ld2", name: "Theo Ng", contact: "theo@mail.com", source: "Walk-in", stage: "tour", valueCents: 24000, floorId: "f_pier" },
  { id: "ld3", name: "Sam Kerr", contact: "sam@mail.com", source: "Referral", stage: "trial", valueCents: 18000, floorId: "f_pier" },
  { id: "ld4", name: "Nora Vale", contact: "nora@mail.com", source: "Event", stage: "member", valueCents: 42000, floorId: "f_pier" },
];

export function LeadsView() {
  const t = useTranslations("leads");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const api = useApi();

  const [leads, setLeads] = useState<Lead[]>(SEED);
  const [toast, setToast] = useState<string | null>(null);

  const allowed = can(session, "members.view");

  const scoped = useMemo(() => {
    if (!session) return [];
    if (session.role === "admin") return leads;
    if (session.role === "host") return leads.filter((l) => l.floorId === session.floorId);
    return leads;
  }, [leads, session]);

  const weightedTotal = useMemo(() => scoped.reduce((s, l) => s + l.valueCents * PROB[l.stage], 0), [scoped]);

  if (!allowed) {
    return (
      <OXContainer>
        <OXEmpty title={t("empty")} />
      </OXContainer>
    );
  }

  async function advance(id: string) {
    setLeads((arr) =>
      arr.map((l) => {
        if (l.id !== id) return l;
        const i = STAGES.indexOf(l.stage);
        const next = STAGES[Math.min(i + 1, STAGES.length - 2)]!; // never auto-advance into "lost"
        return { ...l, stage: next };
      })
    );
    await api.http.post(`/leads/${id}/stage`).catch(() => {});
    setToast(t("advance"));
  }

  async function markLost(id: string) {
    setLeads((arr) => arr.map((l) => (l.id === id ? { ...l, stage: "lost" } : l)));
    await api.http.post(`/leads/${id}/stage`, { stage: "lost" }).catch(() => {});
    setToast(t("markLost"));
  }

  async function convert(id: string) {
    setLeads((arr) => arr.map((l) => (l.id === id ? { ...l, stage: "member" } : l)));
    await api.http.post(`/leads/${id}/convert`).catch(() => {});
    setToast(t("convert"));
  }

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant="oxide-line">{t("stage")}: {scopeLabel(session, floorName)}</OXChip>
      </div>

      <OXBanner tone="info">
        {t("weightedTotal")}: {moneyFromCents(Math.round(weightedTotal), { locale: prefs.locale, currency: prefs.currency })}
      </OXBanner>

      <div className="ox-grid-cards" style={{ paddingBlock: 16, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {STAGES.map((stage) => {
          const col = scoped.filter((l) => l.stage === stage);
          return (
            <section key={stage} className="ox-stack" style={{ gap: 8, border: "1px solid var(--ox-line)", padding: 12 }}>
              <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
                <div className="ox-section-label" style={{ margin: 0 }}>{t(stage)}</div>
                <OXChip variant="ghost">{col.length}</OXChip>
              </div>
              {col.length === 0 ? (
                <div className="ox-demo-note">—</div>
              ) : (
                col.map((l) => (
                  <div key={l.id} className="ox-stack" style={{ gap: 6, border: "1px solid var(--ox-line)", padding: 10 }}>
                    <OXListRow title={l.name} sub={`${l.source} · ${l.contact}`} trail={moneyFromCents(l.valueCents, { locale: prefs.locale, currency: prefs.currency })} />
                    {stage !== "member" && stage !== "lost" && (
                      <div className="ox-row-wrap" style={{ gap: 6 }}>
                        <OXButton variant="oxide" size="sm" onClick={() => void advance(l.id)}>{t("advance")}</OXButton>
                        <OXButton variant="default" size="sm" onClick={() => void convert(l.id)}>{t("convert")}</OXButton>
                        <OXButton variant="ghost" size="sm" onClick={() => void markLost(l.id)}>{t("markLost")}</OXButton>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>
          );
        })}
      </div>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
