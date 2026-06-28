"use client";
// OX web — Wallet Pass + Ticket Transfer/Gift + Guest pass (parity §A·15/16).
// Reuses OXCredential for the pass (QR strip + tier + member#). States: active ·
// expired · not-eligible · guest-pass issued. Transfer opens a recipient sheet
// (POST /tickets/:id/transfer); guest pass posts to /floors/:id/guestpass.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXCredential, OXButton, OXChip, OXIcon, OXSheet, OXField, OXInput, OXToast, OXListRow } from "@ox/ds";
import { useSession } from "../providers/SessionProvider";
import { useApi } from "../../lib/useApi";

type TransferState = "transferable" | "pending" | "claimed";

export function WalletView() {
  const t = useTranslations("wallet");
  const { session } = useSession();
  const api = useApi();

  const [transferOpen, setTransferOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [tickets, setTickets] = useState<{ id: string; title: string; state: TransferState; to?: string }[]>([
    { id: "tk1", title: "Skyline Sunrise Raid", state: "transferable" },
    { id: "tk2", title: "Beach Bootcamp Festival", state: "pending", to: "@devon" },
  ]);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);

  async function transfer() {
    if (activeTicket) {
      setTickets((arr) => arr.map((tk) => (tk.id === activeTicket ? { ...tk, state: "pending", to: recipient } : tk)));
      await api.http.post(`/tickets/${activeTicket}/transfer`, { recipient }).catch(() => {});
    }
    setTransferOpen(false);
    setRecipient("");
    setToast(t("transferred"));
  }

  async function issueGuest() {
    setToast(t("guestIssued"));
    await api.http.post(`/floors/${session?.floorId ?? "f_pier"}/guestpass`).catch(() => {});
  }

  return (
    <div className="ox-page ox-stack">
      <div>
        <div className="ox-section-label">{t("kicker")}</div>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
      </div>

      <div className="ox-row-wrap">
        <OXChip variant="oxide"><OXIcon name="check" size="sm" /> {t("active")}</OXChip>
      </div>

      <OXCredential
        material="digital"
        memberNumber="014"
        verified
        fields={[
          { label: "Member", value: <em>{session?.name ?? "—"}</em> },
          { label: "Tier", value: "Founder" },
          { label: "Home floor", value: "Pier 9 Iron" },
        ]}
        strip="ox.fit/verify/014 · SCAN AT THE DOOR"
      />

      <OXButton variant="default" onClick={() => void issueGuest()}>
        <OXIcon name="key" size="sm" /> {t("guestPass")}
      </OXButton>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("transfer")}</div>
        {tickets.map((tk) => (
          <OXListRow
            key={tk.id}
            title={tk.title}
            sub={tk.state === "pending" ? `${t("pending")} → ${tk.to}` : tk.state === "claimed" ? t("claimed") : t("transferable")}
            trail={tk.state === "transferable" ? t("send") : tk.state}
            onClick={
              tk.state === "transferable"
                ? () => {
                    setActiveTicket(tk.id);
                    setTransferOpen(true);
                  }
                : undefined
            }
          />
        ))}
      </section>

      <OXSheet open={transferOpen} onClose={() => setTransferOpen(false)} label={t("transfer")}>
        <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320 }}>
          <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 22, margin: 0 }}>{t("transfer")}</h2>
          <OXField label={t("recipient")}>
            <OXInput value={recipient} onChange={setRecipient} placeholder="@handle or email" />
          </OXField>
          <OXButton variant="oxide" block onClick={() => void transfer()}>
            {t("send")}
          </OXButton>
        </div>
      </OXSheet>

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
