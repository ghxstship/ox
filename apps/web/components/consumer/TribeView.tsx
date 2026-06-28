"use client";

// OX web — Tribe. Tabbed: feed (live Posts via Supabase + OXHerdThat "Herd
// that."), leaderboard (OXTribeBoard), and classes (live Classes → OXClassRow).
// Booking is gated by can(session, "class.book") and resolves the four gate
// states through BookingGateSheet (Included→waiver, Drop-in→pay, Credit→wallet).
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  OXSegmented,
  OXPost,
  OXHerdThat,
  OXTribeBoard,
  OXClassRow,
  OXEmpty,
} from "@ox/ds";
import { can, num } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useLive } from "../../lib/useLive";
import { fetchPosts, fetchClasses, fetchAllUsers } from "../../lib/supabase";
import { feed as seedFeed, leaderboard as seedBoard, classes as seedClasses, floorName } from "../../lib/seed";
import { BookingGateSheet } from "../parity/BookingGateSheet";
import type { GateState } from "../parity/OXGate";

type Tab = "feed" | "leaderboard" | "classes";

const LOAD_MAP: Record<string, "open" | "filling" | "full"> = { open: "open", fill: "filling", full: "full" };

export function TribeView() {
  const t = useTranslations("tribe");
  const tb = useTranslations("brand");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const [tab, setTab] = useState<Tab>("feed");
  const [gate, setGate] = useState<{ id: string; title: string; state: GateState } | null>(null);

  const postsLive = useLive(fetchPosts, []);
  const classesLive = useLive(fetchClasses, []);
  const usersLive = useLive(fetchAllUsers, []);

  const canBook = can(session, "class.book");

  const feed = useMemo(() => {
    const live = postsLive.data ?? [];
    if (live.length) return live.map((p, i) => ({ id: p.id, author: `Member ${p.userId.slice(-3)}`, handle: `@member · LV ${10 + i}`, time: "·", body: p.body, likes: 0, comments: 0 }));
    return seedFeed;
  }, [postsLive.data]);

  const board = useMemo(() => {
    const live = (usersLive.data ?? []).filter((u) => u.xp != null).sort((a, b) => b.xp - a.xp).slice(0, 5);
    if (live.length) return live.map((u, i) => ({ rank: i + 1, name: u.name, xp: u.xp, initial: u.initial, me: u.id === session?.userId }));
    return seedBoard;
  }, [usersLive.data, session?.userId]);

  const classes = useMemo(() => {
    const live = classesLive.data ?? [];
    if (live.length)
      return live.map((c) => {
        const at = new Date(c.startsAt);
        return {
          id: c.id,
          time: `${at.toLocaleDateString(prefs.locale, { weekday: "short" })} · ${at.toLocaleTimeString(prefs.locale, { hour: "2-digit", minute: "2-digit" })}`,
          title: c.title,
          floorId: c.floorId,
          spots: c.capacity,
          load: LOAD_MAP[c.load] ?? "open",
        };
      });
    return seedClasses.map((c) => ({ id: c.id, time: `${c.day} · ${c.time}`, title: c.title, floorId: c.floorId, spots: c.cap - c.booked, load: c.load }));
  }, [classesLive.data, prefs.locale]);

  // Demo gate states cycle to exercise all four forks.
  const GATES: GateState[] = ["included", "credit", "dropin", "overlimit"];

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <OXSegmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "feed", label: t("feed") },
          { value: "leaderboard", label: t("leaderboard") },
          { value: "classes", label: t("classes") },
        ]}
      />

      {tab === "feed" &&
        (feed.length === 0 ? (
          <OXEmpty title={t("noFeed")} />
        ) : (
          <div className="ox-stack" style={{ gap: 8 }}>
            {feed.map((p) => (
              <div key={p.id} className="ox-stack" style={{ gap: 6 }}>
                <OXPost author={p.author} handle={p.handle} time={p.time} body={p.body} likes={p.likes} comments={p.comments} />
                <OXHerdThat count={p.likes} label={tb("herd")} />
              </div>
            ))}
          </div>
        ))}

      {tab === "leaderboard" && (
        <OXTribeBoard
          unit="XP"
          rows={board.map((r) => ({
            rank: r.rank,
            name: r.name,
            xp: num(typeof r.xp === "number" ? r.xp : Number(r.xp), { locale: prefs.locale }),
            initial: r.initial,
            me: r.me,
          }))}
        />
      )}

      {tab === "classes" && (
        <div className="ox-stack" style={{ gap: 8 }}>
          {classes.map((c, i) => (
            <OXClassRow
              key={c.id}
              time={c.time}
              title={c.title}
              floor={floorName(c.floorId) ?? undefined}
              spots={c.spots}
              status={c.load}
              onBook={canBook && c.load !== "full" ? () => setGate({ id: c.id, title: c.title, state: GATES[i % GATES.length]! }) : undefined}
            />
          ))}
        </div>
      )}

      {gate && (
        <BookingGateSheet
          open
          onClose={() => setGate(null)}
          classId={gate.id}
          classTitle={gate.title}
          state={gate.state}
        />
      )}
    </div>
  );
}
