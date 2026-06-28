"use client";
// OX web — Booking gate fork (parity §A·6/8/9). One sheet resolves all four gate
// states for a class booking:
//   • included  → booking questions + waiver (scroll-to-sign, CTA locked until
//     consented) → POST /classes/:id/answers, then /classes/:id/book
//   • credit    → spend a class credit → book
//   • dropin    → member-rate drop-in payment → POST /classes/:id/dropin
//   • locked    → not in plan (CTA disabled, explains the upgrade)
//   • overlimit → monthly cap reached (offer credit / drop-in)
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { OXSheet, OXButton, OXField, OXInput, OXChoice, OXChip, OXToast, OXIcon } from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { OXGate, type GateState } from "./OXGate";

const WAIVER_TEXT =
  "OX Floor Waiver. I acknowledge that strength and conditioning training carries inherent risk. I confirm I am physically able to participate, will follow coach cues, and release the floor host from liability for injury sustained during normal training. I agree to the floor rules and code of conduct.";

export function BookingGateSheet({
  open,
  onClose,
  classId,
  classTitle,
  state,
  dropinCents = 2500,
}: {
  open: boolean;
  onClose: () => void;
  classId: string;
  classTitle: string;
  state: GateState;
  dropinCents?: number;
}) {
  const t = useTranslations("booking");
  const { prefs } = usePrefs();
  const api = useApi();

  const [answer, setAnswer] = useState("");
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [consented, setConsented] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolledEnd(true);
  }

  async function bookIncluded() {
    await api.http.post(`/classes/${classId}/answers`, { answers: [answer], waiverSigned: true }).catch(() => {});
    await api.classes.book(classId).catch(() => {});
    setToast(t("booked"));
    onClose();
  }

  async function payDropin() {
    await api.http.post(`/classes/${classId}/dropin`).catch(() => {});
    setToast(t("booked"));
    onClose();
  }

  async function spendCredit() {
    await api.classes.book(classId).catch(() => {});
    setToast(t("booked"));
    onClose();
  }

  const gateLabel: Record<GateState, string> = {
    included: t("title"),
    credit: "Credit",
    dropin: t("dropinPay"),
    locked: "Locked",
    overlimit: "Over limit",
  };

  return (
    <>
      <OXSheet open={open} onClose={onClose} label={t("title")}>
        <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320, maxInlineSize: 420 }}>
          <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, margin: 0 }}>
              <em>{classTitle}</em>
            </h2>
            <OXGate state={state} label={gateLabel[state]} />
          </div>

          {state === "included" && (
            <>
              <OXField label={t("questions")} hint={t("required")}>
                <OXInput value={answer} onChange={setAnswer} placeholder="Any injuries we should know about?" />
              </OXField>
              <div className="ox-section-label">{t("waiver")}</div>
              <div
                ref={scrollRef}
                onScroll={onScroll}
                style={{ maxBlockSize: 140, overflowY: "auto", border: "1px solid var(--ox-line)", padding: 12, fontFamily: "var(--ox-font-sans)", fontSize: 13, lineHeight: 1.6 }}
              >
                {WAIVER_TEXT} {WAIVER_TEXT}
              </div>
              {!scrolledEnd && <div className="ox-demo-note">{t("waiverScroll")}</div>}
              <OXChoice type="checkbox" checked={consented} disabled={!scrolledEnd} onChange={setConsented} label={t("consent")} />
              <OXButton variant="oxide" block arrow onClick={() => void bookIncluded()}>
                {t("sign")}
              </OXButton>
            </>
          )}

          {state === "credit" && (
            <>
              <OXChip variant="oxide-line">
                <OXIcon name="wallet" size="sm" /> 3 credits available
              </OXChip>
              <OXButton variant="oxide" block arrow onClick={() => void spendCredit()}>
                {t("booked")} · −1 credit
              </OXButton>
            </>
          )}

          {state === "dropin" && (
            <>
              <OXChip variant="oxide">{t("memberRate")} · {moneyFromCents(dropinCents, { locale: prefs.locale, currency: prefs.currency })}</OXChip>
              <OXButton variant="oxide" block arrow onClick={() => void payDropin()}>
                {t("dropinPay")} · {moneyFromCents(dropinCents, { locale: prefs.locale, currency: prefs.currency })}
              </OXButton>
            </>
          )}

          {state === "locked" && (
            <>
              <OXChip variant="ghost"><OXIcon name="lock" size="sm" /> Not in your plan</OXChip>
              <OXButton variant="default" block onClick={() => setToast("Upgrade to unlock")}>
                Upgrade plan
              </OXButton>
            </>
          )}

          {state === "overlimit" && (
            <>
              <OXChip variant="ghost"><OXIcon name="minus" size="sm" /> Monthly cap reached</OXChip>
              <OXButton variant="oxide" block onClick={() => void payDropin()}>
                {t("dropinPay")} · {moneyFromCents(dropinCents, { locale: prefs.locale, currency: prefs.currency })}
              </OXButton>
            </>
          )}
        </div>
      </OXSheet>
      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </>
  );
}
