"use client";
// OX web — Contracts / Waivers + e-sign (parity §B·31). Template list → sign flow
// (scroll-to-end unlocks a signature pad) → signed archive. host/admin
// capability (members.view). RLS-scoped. Signing posts to /agreements/:id/sign.
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXChip, OXButton, OXListRow, OXSheet, OXEmpty, OXToast } from "@ox/ds";
import { can, scopeLabel, date } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { SignaturePad } from "../parity/SignaturePad";
import { floorName } from "../../lib/seed";

interface Agreement {
  id: string;
  title: string;
  version: number;
  body: string;
  signedAt?: string;
}

const SEED: Agreement[] = [
  { id: "ag1", title: "Floor Membership Agreement", version: 3, body: "This agreement covers monthly membership terms, billing cadence, cancellation policy, and the floor code of conduct. " },
  { id: "ag2", title: "Liability Waiver", version: 2, body: "I acknowledge the inherent risk of strength training and release the floor host from liability for injury sustained during normal participation. " },
  { id: "ag3", title: "Personal Training Contract", version: 1, body: "Sessions are billed per block, with 24h cancellation. Coaching follows the agreed program. ", signedAt: new Date(Date.now() - 9e8).toISOString() },
];

export function ContractsView() {
  const t = useTranslations("contracts");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const api = useApi();

  const [agreements, setAgreements] = useState<Agreement[]>(SEED);
  const [signing, setSigning] = useState<Agreement | null>(null);
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clearRef = useRef<(() => void) | null>(null);

  const allowed = can(session, "members.view");
  if (!allowed) {
    return (
      <OXContainer>
        <OXEmpty title={t("empty")} />
      </OXContainer>
    );
  }

  function onScroll() {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolledEnd(true);
  }

  function openSign(a: Agreement) {
    setSigning(a);
    setScrolledEnd(false);
    setHasSignature(false);
  }

  async function complete() {
    if (!signing) return;
    setAgreements((arr) => arr.map((a) => (a.id === signing.id ? { ...a, signedAt: new Date().toISOString() } : a)));
    await api.http.post(`/agreements/${signing.id}/sign`, { dataUrl: "signature" }).catch(() => {});
    setSigning(null);
    setToast(t("complete"));
  }

  const templates = agreements.filter((a) => !a.signedAt);
  const archive = agreements.filter((a) => a.signedAt);

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <div className="ox-section-label">{t("kicker")}</div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        </div>
        <OXChip variant="oxide-line">{scopeLabel(session, floorName)}</OXChip>
      </div>

      <section className="ox-stack" style={{ gap: 8, paddingBlock: 16 }}>
        <div className="ox-section-label">{t("templates")}</div>
        {templates.length === 0 ? (
          <OXEmpty title={t("empty")} />
        ) : (
          templates.map((a) => (
            <OXListRow key={a.id} title={a.title} sub={`${t("version")} ${a.version}`} trail={t("sign")} onClick={() => openSign(a)} />
          ))
        )}
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("archive")}</div>
        {archive.length === 0 ? (
          <div className="ox-demo-note">—</div>
        ) : (
          archive.map((a) => (
            <OXListRow key={a.id} title={a.title} sub={`${t("signed")} · ${date(a.signedAt!, { locale: prefs.locale })}`} trail={t("signed")} />
          ))
        )}
      </section>

      <OXSheet open={!!signing} onClose={() => setSigning(null)} label={t("sign")}>
        {signing && (
          <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320, maxInlineSize: 440 }}>
            <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, margin: 0 }}>{signing.title}</h2>
            <div
              ref={scrollRef}
              onScroll={onScroll}
              style={{ maxBlockSize: 160, overflowY: "auto", border: "1px solid var(--ox-line)", padding: 12, fontFamily: "var(--ox-font-sans)", fontSize: 13, lineHeight: 1.6 }}
            >
              {signing.body.repeat(4)}
            </div>
            {!scrolledEnd && <div className="ox-demo-note">{t("signFlow")}</div>}
            {scrolledEnd && (
              <>
                <div className="ox-section-label">{t("sign")}</div>
                <SignaturePad onStrokeStart={() => setHasSignature(true)} registerClear={(fn) => (clearRef.current = fn)} />
                <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
                  <OXButton variant="ghost" size="sm" onClick={() => { clearRef.current?.(); setHasSignature(false); }}>{t("clear")}</OXButton>
                  <OXButton variant="oxide" arrow onClick={() => void complete()} style={{ opacity: hasSignature ? 1 : 0.5 }}>{t("sign")}</OXButton>
                </div>
              </>
            )}
          </div>
        )}
      </OXSheet>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
