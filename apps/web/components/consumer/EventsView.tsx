"use client";

// OX web — Events. OXEventCard for events + OXRaidCard for raids → RSVP / join.
// RSVP gated by can(session, "raid.join") for raids. Events load from the public
// API with a seed fallback.
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OXEventCard, OXRaidCard, OXEmpty, OXToast, OXSkeleton } from "@ox/ds";
import { can } from "@ox/rbac";
import { withFallback } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { useSession } from "../providers/SessionProvider";
import { events as seedEvents, floorName } from "../../lib/seed";

type Ev = (typeof seedEvents)[number];

export function EventsView() {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const api = useApi();
  const { session } = useSession();
  const [rows, setRows] = useState<Ev[] | null>(null);
  const [live, setLive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void withFallback<Ev[]>(
      async () => {
        const page = await api.events.list();
        return page.data.map((e) => ({
          id: e.id,
          day: "—",
          title: e.title,
          host: e.hostName,
          floorId: e.floorId ?? "",
          attendees: 0,
          rewardXp: e.rewardXp,
          isRaid: e.isRaid,
        })) as Ev[];
      },
      seedEvents
    ).then((res) => {
      if (!active) return;
      setRows(res.data);
      setLive(res.live);
    });
    return () => {
      active = false;
    };
  }, [api]);

  const canRaid = can(session, "raid.join");

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>
        {!live && <span className="ox-demo-note">{tc("demoData")}</span>}
      </div>

      {rows === null ? (
        <div className="ox-stack">
          <OXSkeleton height={96} />
          <OXSkeleton height={96} />
        </div>
      ) : rows.length === 0 ? (
        <OXEmpty title={t("noEvents")} />
      ) : (
        <div className="ox-stack" style={{ gap: 10 }}>
          {rows.map((e) =>
            e.isRaid ? (
              <OXRaidCard
                key={e.id}
                title={<em>{e.title}</em>}
                when={e.day}
                floor={e.host}
                filled={(e as { filled?: number }).filled ?? 12}
                capacity={(e as { capacity?: number }).capacity ?? 20}
                rewardXp={e.rewardXp}
                onJoin={canRaid ? () => setToast(`${tc("join")} · ${e.title}`) : undefined}
              />
            ) : (
              <OXEventCard
                key={e.id}
                day={e.day}
                title={<em>{e.title}</em>}
                host={e.host}
                attendees={e.attendees}
                onRsvp={() => setToast(`${tc("rsvp")} · ${e.title}`)}
              />
            )
          )}
        </div>
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
