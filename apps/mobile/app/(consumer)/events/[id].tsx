// Event / Ticket — RSVP / ticket tiers / raid join + QR check-in credential.
// States: reserved → paid → checked_in. Event is public; rsvp/join are member
// writes (raid.join). Tiers fetched via the typed client.
import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenScroll, Card, Label, Display, Body, Button, Row, Chip, Banner, Skeleton } from "../../../src/ui";
import { color, space } from "../../../src/tokens";
import { api, tryApi } from "../../../src/api";
import { useSession } from "../../../src/session";
import { useAsync } from "../../../src/data";
import { can, moneyFromCents, date, num } from "@ox/rbac";
import type { EventModel, Ticket } from "@ox/types";

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, prefs } = useSession();
  const { data: ev, loading } = useAsync<EventModel | null>(
    async () => tryApi(() => api.events.get(String(id)), null),
    null,
    [id]
  );
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function rsvp(tierId?: string) {
    setBusy(true);
    setMsg(null);
    try {
      const t = ev?.isRaid && can(session, "raid.join")
        ? await api.raids.join(String(id))
        : await api.events.rsvp(String(id), tierId ? { tierId } : undefined);
      setTicket(t);
      setMsg(t.state === "paid" ? "Ticket secured." : "Reserved — hold expires soon.");
    } catch (e: any) {
      setMsg(e?.message ?? "RSVP failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <ScreenScroll><Skeleton height={200} /></ScreenScroll>;
  if (!ev) return <ScreenScroll><Banner tone="danger" message="Event not found." /></ScreenScroll>;

  return (
    <ScreenScroll>
      <Label>{ev.isRaid ? "Raid" : "Event"}</Label>
      <Display>{ev.title}</Display>
      <Body>{ev.hostName} · {date(ev.startsAt, { locale: prefs.locale })} · +{num(ev.rewardXp)} XP</Body>

      {msg ? <Banner message={msg} /> : null}

      {ticket ? (
        <Card style={{ gap: space.sm }}>
          <Label>Your ticket — {ticket.state}</Label>
          <View style={{ height: 120, borderWidth: 1, borderColor: color.stone, backgroundColor: color.paperWarm, alignItems: "center", justifyContent: "center" }}>
            <Label>{ticket.qrCode}</Label>
          </View>
          <Body style={{ color: color.stone }}>Show at the door for check-in (+{num(ev.rewardXp)} XP).</Body>
        </Card>
      ) : (ev.tiers && ev.tiers.length > 0) ? (
        ev.tiers.map((t) => (
          <Card key={t.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <View>
                <Body style={{ fontWeight: "600" }}>{t.name}</Body>
                <Label>{t.qty > 0 ? `${t.qty} left` : "Sold out"}</Label>
              </View>
              <Body>{moneyFromCents(t.priceCents, { locale: prefs.locale, currency: prefs.currency })}</Body>
            </Row>
            <Button title={busy ? "Reserving…" : "Reserve"} variant="primary" disabled={busy || t.qty <= 0} onPress={() => rsvp(t.id)} style={{ marginTop: space.sm }} />
          </Card>
        ))
      ) : (
        <Button title={busy ? "Working…" : ev.isRaid ? "Join raid" : "RSVP"} variant="primary" disabled={busy} onPress={() => rsvp()} />
      )}
    </ScreenScroll>
  );
}
