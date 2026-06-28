"use client";
// OX web — Notification Center (parity §A·17). Grouped notifications (events ·
// herd · drops · coach · billing · game) with unread dots via OXNotif. Mark-all-
// read posts to /me/notifications/read. States: unread · read · empty.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { OXNotif, OXButton, OXChip, OXEmpty, OXSegmented } from "@ox/ds";
import { useApi } from "../../lib/useApi";

interface Notif {
  id: string;
  group: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const SEED: Notif[] = [
  { id: "n1", group: "events", title: "Skyline Sunrise Raid", body: "Two spots left — join the crew.", time: "1H", read: false },
  { id: "n2", group: "herd", title: "Kayla herded your PR", body: "Back squat 185 lb got 34 herds.", time: "3H", read: false },
  { id: "n3", group: "drops", title: "Founder Drop live", body: "Copper Credential Plate is unlocked.", time: "6H", read: true },
  { id: "n4", group: "coach", title: "Dom updated your program", body: "Week 3 deload added.", time: "1D", read: true },
  { id: "n5", group: "billing", title: "Membership renews", body: "Founder tier renews Jul 1.", time: "2D", read: true },
];

const GROUPS = ["all", "events", "herd", "drops", "coach", "billing", "game"];

export function NotificationsView() {
  const t = useTranslations("notifications");
  const api = useApi();
  const [items, setItems] = useState<Notif[]>(SEED);
  const [group, setGroup] = useState("all");

  const filtered = group === "all" ? items : items.filter((n) => n.group === group);
  const unread = items.filter((n) => !n.read).length;

  async function markAll() {
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
    await api.http.post("/me/notifications/read").catch(() => {});
  }

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        {unread > 0 && <OXChip variant="oxide">{unread} {t("unread")}</OXChip>}
      </div>

      <OXSegmented<string> value={group} onChange={setGroup} options={GROUPS.map((g) => ({ value: g, label: g === "all" ? "All" : g }))} />

      <OXButton variant="ghost" onClick={() => void markAll()}>
        {t("markRead")}
      </OXButton>

      {filtered.length === 0 ? (
        <OXEmpty title={t("empty")} />
      ) : (
        <div className="ox-stack" style={{ gap: 8 }}>
          {filtered.map((n) => (
            <OXNotif key={n.id} body={<><strong>{n.title}</strong> · {n.body}</>} time={n.time} unread={!n.read} />
          ))}
        </div>
      )}
    </div>
  );
}
