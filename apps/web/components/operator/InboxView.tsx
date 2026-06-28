"use client";

// OX web — operator Inbox / Campaigns (host/admin). Compose a campaign
// (OXComposer) + recent campaign stats (OXKpi). Sending gated by members.view.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXContainer, OXComposer, OXButton, OXKpi, OXSegmented, OXEmpty } from "@ox/ds";
import { can } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";

export function InboxView() {
  const t = useTranslations("ops");
  const { session } = useSession();
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState(false);

  if (!can(session, "members.view")) {
    return (
      <OXContainer>
        <OXEmpty title={t("noMembers")} />
      </OXContainer>
    );
  }

  return (
    <OXContainer>
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: "8px 0 0" }}>{t("campaigns")}</h1>

      <div className="ox-grid-cards" style={{ paddingBlock: 16 }}>
        <OXKpi label="Open rate" value="48%" delta="+3%" trend="up" />
        <OXKpi label="Sent (30d)" value="6" />
        <OXKpi label="Replies" value="112" delta="+18" trend="up" />
      </div>

      <section className="ox-stack" style={{ gap: 12 }}>
        <OXSegmented<"email" | "sms">
          value={channel}
          onChange={setChannel}
          options={[
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS" },
          ]}
        />
        <OXComposer
          value={draft}
          onChange={setDraft}
          placeholder="Write to the herd — terse, present tense, no emoji."
          onSend={() => {
            setSent(true);
            setDraft("");
          }}
        />
        <OXButton variant="oxide" onClick={() => setSent(true)}>
          {t("send")}
        </OXButton>
        {sent && <div className="ox-demo-note">Campaign queued ({channel}).</div>}
      </section>
    </OXContainer>
  );
}
