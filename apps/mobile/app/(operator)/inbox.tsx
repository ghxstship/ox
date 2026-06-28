// Operator Inbox — campaign composer (host/admin: revenue.view-adjacent comms).
// POST /campaigns {channel,subject,body}. Coach has no comms capability, so the
// composer is gated. Shows a simple sent log.
import { useState } from "react";
import { ScreenScroll, Card, Label, Display, Body, Button, Field, SegControl, Banner } from "../../src/ui";
import { color, space } from "../../src/tokens";
import { api } from "../../src/api";
import { useSession } from "../../src/session";
import { ScopeChip } from "../../src/chrome";
import { can } from "@ox/rbac";

export default function Inbox() {
  const { session } = useSession();
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Comms = a host/admin action (members.view / revenue.view scope). Coaches see
  // their inbox read-only.
  const canSend = can(session, "members.view") || can(session, "revenue.view");

  async function send() {
    setMsg(null);
    try {
      await api.ops.campaign({ channel, subject: channel === "email" ? subject : undefined, body });
      setSent((s) => [`${channel.toUpperCase()} · ${subject || body.slice(0, 24)}`, ...s]);
      setSubject("");
      setBody("");
      setMsg("Campaign sent.");
    } catch (e: any) {
      setMsg(e?.message ?? "Send failed.");
    }
  }

  return (
    <ScreenScroll>
      <Label>Reach the herd.</Label>
      <Display>Inbox</Display>
      <ScopeChip />
      {msg ? <Banner message={msg} /> : null}

      {canSend ? (
        <Card style={{ gap: space.sm }}>
          <Label>New campaign</Label>
          <SegControl
            options={[
              { value: "email", label: "Email" },
              { value: "sms", label: "SMS" },
            ]}
            value={channel}
            onChange={(v) => setChannel(v as "email" | "sms")}
          />
          {channel === "email" ? <Field label="Subject" value={subject} onChangeText={setSubject} /> : null}
          <Field label="Message" value={body} onChangeText={setBody} multiline style={{ minHeight: 88 }} />
          <Button title="Send" variant="primary" onPress={send} disabled={!body} />
        </Card>
      ) : (
        <Body style={{ color: color.stone }}>Read-only inbox — no campaign capability for your role.</Body>
      )}

      <Card>
        <Label>Sent</Label>
        {sent.length === 0 ? (
          <Body style={{ color: color.stone }}>Nothing sent yet.</Body>
        ) : (
          sent.map((s, i) => <Body key={i} style={{ marginTop: space.xs }}>{s}</Body>)
        )}
      </Card>
    </ScreenScroll>
  );
}
