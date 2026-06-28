"use client";

// OX web — Home. Level/XP (OXLevelBadge + OXXPBar + OXStreak), today's session
// (OXBookingCard + start CTA), quests (OXQuestRow), and a feed teaser (OXPost).
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  OXLevelBadge,
  OXXPBar,
  OXStreak,
  OXQuestRow,
  OXBookingCard,
  OXButton,
  OXPost,
  OXEmpty,
} from "@ox/ds";
import { num } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { quests, feed, sessionPlan } from "../../lib/seed";
import { withLocale } from "../../lib/links";

export function HomeView() {
  const t = useTranslations("home");
  const locale = useLocale();
  const { session } = useSession();
  const { prefs } = usePrefs();

  const level = session?.level ?? 1;
  const xp = session?.xp ?? 0;
  const toNext = 200;

  return (
    <div className="ox-page ox-stack">
      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
          <OXLevelBadge level={level} rank="Pathfinder" />
          <OXStreak days={6} active />
        </div>
        <OXXPBar value={xp % 2600} max={2600} toNext={toNext} />
        <div className="ox-demo-note">
          {t("level")} {num(level, { locale: prefs.locale })} · {num(xp, { locale: prefs.locale })} XP · {num(toNext, { locale: prefs.locale })} {t("nextLevel")}
        </div>
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("todaySession")}</div>
        <OXBookingCard
          title={<em>{sessionPlan.title}</em>}
          when="Today · 18:30"
          where="Pier 9 Iron"
          locality="Oceanfront"
          status="Ready"
          code="SLED"
        />
        <Link href={withLocale(locale, `/app/train/session/${sessionPlan.id}`)}>
          <OXButton variant="oxide" arrow block>
            {t("todaySession")}
          </OXButton>
        </Link>
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("quests")}</div>
        {quests.length === 0 ? (
          <OXEmpty title={t("noQuests")} />
        ) : (
          quests.map((q) => (
            <OXQuestRow key={q.id} name={q.name} sub={q.sub} current={q.current} target={q.target} state={q.state} />
          ))
        )}
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("feedTeaser")}</div>
        {feed.slice(0, 2).map((p) => (
          <OXPost key={p.id} author={p.author} handle={p.handle} time={p.time} body={p.body} likes={p.likes} comments={p.comments} />
        ))}
        <Link href={withLocale(locale, "/app/tribe")}>
          <OXButton variant="ghost" block>
            {t("feedTeaser")}
          </OXButton>
        </Link>
      </section>
    </div>
  );
}
