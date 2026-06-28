"use client";
// OX web — Class packs / credits (parity §A·7). Credit balance meter, buyable
// packs (POST /packages/:id/buy via api-client http), and the credit ledger.
// Buying a pack appends to the ledger and bumps the balance optimistically.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXCard, OXMeter, OXButton, OXChip, OXToast, OXEmpty } from "@ox/ds";
import { moneyFromCents, date } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";

interface Pack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  expiryDays: number;
}
interface Ledger {
  id: string;
  delta: number;
  reason: string;
  at: string;
}

const PACKS: Pack[] = [
  { id: "pk_5", name: "5-Class Pack", credits: 5, priceCents: 9000, expiryDays: 60 },
  { id: "pk_10", name: "10-Class Pack", credits: 10, priceCents: 16000, expiryDays: 90 },
  { id: "pk_20", name: "20-Class Pack", credits: 20, priceCents: 28000, expiryDays: 120 },
];

export function CreditsView() {
  const t = useTranslations("credits");
  const { prefs } = usePrefs();
  const api = useApi();

  const [balance, setBalance] = useState(3);
  const [ledger, setLedger] = useState<Ledger[]>([
    { id: "l1", delta: 5, reason: "5-Class Pack", at: new Date(Date.now() - 6e8).toISOString() },
    { id: "l2", delta: -1, reason: "Sunrise Sled Push", at: new Date(Date.now() - 3e8).toISOString() },
    { id: "l3", delta: -1, reason: "Rooftop HIIT", at: new Date(Date.now() - 1e8).toISOString() },
  ]);
  const [toast, setToast] = useState<string | null>(null);

  async function buy(p: Pack) {
    setBalance((b) => b + p.credits);
    setLedger((l) => [{ id: `l${Date.now()}`, delta: p.credits, reason: p.name, at: new Date().toISOString() }, ...l]);
    setToast(`${t("bought")} · ${p.name}`);
    await api.http.post(`/packages/${p.id}/buy`).catch(() => {});
  }

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <OXMeter title={t("balance")} current={balance} total={Math.max(balance, 10)} openLabel={`${balance} ${t("credits")}`} />

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("buyPack")}</div>
        <div className="ox-grid-cards">
          {PACKS.map((p) => (
            <div key={p.id}>
              <OXCard
                category={`${p.credits} ${t("credits")}`}
                title={<em>{p.name}</em>}
                description={`${t("expiresAt")} · ${p.expiryDays}d`}
                status={moneyFromCents(p.priceCents, { locale: prefs.locale, currency: prefs.currency })}
                meta={<OXChip variant="oxide">{p.credits} ×</OXChip>}
              />
              <OXButton variant="oxide" block onClick={() => void buy(p)}>
                {t("buyPack")}
              </OXButton>
            </div>
          ))}
        </div>
      </section>

      <section className="ox-stack" style={{ gap: 6 }}>
        <div className="ox-section-label">{t("ledger")}</div>
        {ledger.length === 0 ? (
          <OXEmpty title={t("noLedger")} />
        ) : (
          ledger.map((l) => (
            <div key={l.id} className="ox-row-wrap" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--ox-line)", paddingBlock: 10 }}>
              <span>
                <span style={{ fontFamily: "var(--ox-font-sans)" }}>{l.reason}</span>
                <span className="ox-demo-note"> · {date(l.at, { locale: prefs.locale })}</span>
              </span>
              <span style={{ fontFamily: "var(--ox-font-mono)", color: l.delta > 0 ? "var(--ox-oxide)" : "var(--ox-stone)" }}>
                {l.delta > 0 ? "+" : ""}
                {l.delta}
              </span>
            </div>
          ))
        )}
      </section>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
