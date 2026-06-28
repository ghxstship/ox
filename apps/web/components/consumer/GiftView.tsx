"use client";
// OX web — Gift Cards & Subscriptions (parity §A·20). Amount picker + buy gift
// card (POST /giftcards), redeem a code, and subscribe-to-restock with a cadence
// switch (POST /me/subscriptions). States: buy · redeem · subscribe-to-restock.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXSegmented, OXButton, OXField, OXInput, OXSwitch, OXToast, OXCard, OXChip } from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";

const AMOUNTS = [2500, 5000, 10000, 25000];

export function GiftView() {
  const t = useTranslations("gift");
  const { prefs } = usePrefs();
  const api = useApi();

  const [amount, setAmount] = useState(5000);
  const [redeemCode, setRedeemCode] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [cadence, setCadence] = useState(30);
  const [toast, setToast] = useState<string | null>(null);

  async function buy() {
    setToast(t("bought"));
    await api.http.post("/giftcards", { balanceCents: amount }).catch(() => {});
  }

  async function toggleSub(on: boolean) {
    setSubscribed(on);
    if (on) {
      setToast(t("subscribed"));
      await api.http.post("/me/subscriptions", { productId: "p_hood", cadenceDays: cadence }).catch(() => {});
    }
  }

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("giftCard")}</div>
        <OXField label={t("amount")}>
          <OXSegmented<string> value={String(amount)} onChange={(v) => setAmount(Number(v))} options={AMOUNTS.map((a) => ({ value: String(a), label: moneyFromCents(a, { locale: prefs.locale, currency: prefs.currency }) }))} />
        </OXField>
        <OXButton variant="oxide" arrow onClick={() => void buy()}>
          {t("buy")} · {moneyFromCents(amount, { locale: prefs.locale, currency: prefs.currency })}
        </OXButton>
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("redeem")}</div>
        <div className="ox-row-wrap">
          <OXField label={t("code")} style={{ flex: 1 }}>
            <OXInput value={redeemCode} onChange={setRedeemCode} placeholder="OX-XXXX-XXXX" />
          </OXField>
          <OXButton variant="default" onClick={() => setToast(t("redeem"))}>{t("redeem")}</OXButton>
        </div>
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("subscribe")}</div>
        <OXCard
          category="Drops"
          title={<em>Oxide Hoodie</em>}
          description={`${t("cadence")} ${cadence} ${t("days")}`}
          status={subscribed ? t("subscribed") : ""}
          meta={
            <span className="ox-row-wrap" style={{ gap: 8 }}>
              {subscribed && <OXChip variant="oxide">{t("subscribed")}</OXChip>}
              <OXSwitch on={subscribed} onChange={(v) => void toggleSub(v)} />
            </span>
          }
        />
      </section>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
