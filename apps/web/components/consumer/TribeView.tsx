"use client";

// OX web — Tribe. Tabbed: feed (OXPost + OXHerdThat "Herd that."), leaderboard
// (OXTribeBoard), and classes (OXClassRow + book). Booking is gated by
// can(session, "class.book").
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  OXSegmented,
  OXPost,
  OXHerdThat,
  OXTribeBoard,
  OXClassRow,
  OXEmpty,
  OXToast,
} from "@ox/ds";
import { can, num } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { feed, leaderboard, classes, floorName } from "../../lib/seed";

type Tab = "feed" | "leaderboard" | "classes";

export function TribeView() {
  const t = useTranslations("tribe");
  const tc = useTranslations("common");
  const tb = useTranslations("brand");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const [tab, setTab] = useState<Tab>("feed");
  const [toast, setToast] = useState<string | null>(null);

  const canBook = can(session, "class.book");

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
          rows={leaderboard.map((r) => ({
            rank: r.rank,
            name: r.name,
            xp: num(r.xp, { locale: prefs.locale }),
            initial: r.initial,
            me: r.me,
          }))}
        />
      )}

      {tab === "classes" && (
        <div className="ox-stack" style={{ gap: 8 }}>
          {classes.map((c) => (
            <OXClassRow
              key={c.id}
              time={`${c.day} · ${c.time}`}
              title={c.title}
              floor={floorName(c.floorId)}
              spots={c.cap - c.booked}
              status={c.load}
              onBook={canBook && c.load !== "full" ? () => setToast(`${tc("booked")} · ${c.title}`) : undefined}
            />
          ))}
        </div>
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
