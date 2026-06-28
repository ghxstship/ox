"use client";
// OX web — My Schedule + iCal (parity §A·24). Agenda / week toggle over the
// member's bookings + events (live classes/events from Supabase). Add-to-calendar
// builds a real .ics file client-side and downloads it.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OXSegmented, OXListRow, OXButton, OXEmpty, OXChip, OXToast, OXIcon } from "@ox/ds";
import { date } from "@ox/rbac";
import { usePrefs } from "../providers/PrefsProvider";
import { useLive } from "../../lib/useLive";
import { fetchClasses, fetchEvents } from "../../lib/supabase";
import { classes as seedClasses } from "../../lib/seed";

interface Item {
  id: string;
  title: string;
  when: string;
  whenAt: Date;
  kind: "class" | "event";
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function ScheduleView() {
  const t = useTranslations("schedule");
  const { prefs } = usePrefs();
  const classesLive = useLive(fetchClasses, []);
  const eventsLive = useLive(fetchEvents, []);

  const [view, setView] = useState<"agenda" | "week">("agenda");
  const [toast, setToast] = useState<string | null>(null);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    const cls = classesLive.data && classesLive.data.length ? classesLive.data : [];
    if (cls.length) {
      for (const c of cls) {
        const at = new Date(c.startsAt);
        out.push({ id: c.id, title: c.title, when: date(at, { locale: prefs.locale, weekday: "short", hour: "2-digit", minute: "2-digit" }), whenAt: at, kind: "class" });
      }
    } else {
      for (const c of seedClasses) {
        const at = new Date(Date.now() + 864e5);
        out.push({ id: c.id, title: c.title, when: `${c.day} · ${c.time}`, whenAt: at, kind: "class" });
      }
    }
    for (const e of eventsLive.data ?? []) {
      const at = new Date(e.startsAt);
      out.push({ id: e.id, title: e.title, when: date(at, { locale: prefs.locale, weekday: "short", hour: "2-digit", minute: "2-digit" }), whenAt: at, kind: "event" });
    }
    return out.sort((a, b) => a.whenAt.getTime() - b.whenAt.getTime());
  }, [classesLive.data, eventsLive.data, prefs.locale]);

  function download(item: Item) {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//OX//Schedule//EN",
      "BEGIN:VEVENT",
      `UID:${item.id}@ox.fit`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(item.whenAt)}`,
      `DTEND:${icsDate(new Date(item.whenAt.getTime() + 36e5))}`,
      `SUMMARY:${item.title}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setToast(t("downloaded"));
  }

  const byDay = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of items) {
      const d = DOW[it.whenAt.getDay()]!;
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(it);
    }
    return m;
  }, [items]);

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <OXSegmented<"agenda" | "week"> value={view} onChange={setView} options={[{ value: "agenda", label: t("agenda") }, { value: "week", label: t("week") }]} />

      {items.length === 0 ? (
        <OXEmpty title={t("empty")} />
      ) : view === "agenda" ? (
        <div className="ox-stack" style={{ gap: 6 }}>
          {items.map((it) => (
            <OXListRow
              key={it.id}
              icon={<OXIcon name={it.kind === "event" ? "events" : "fitness"} size="sm" />}
              title={it.title}
              sub={it.when}
              trail={t("addCalendar")}
              onClick={() => download(it)}
            />
          ))}
        </div>
      ) : (
        <div className="ox-stack" style={{ gap: 12 }}>
          {DOW.map((d) => (
            <section key={d} className="ox-stack" style={{ gap: 6 }}>
              <div className="ox-row-wrap" style={{ justifyContent: "space-between" }}>
                <div className="ox-section-label" style={{ margin: 0 }}>{d}</div>
                <OXChip variant="ghost">{(byDay.get(d) ?? []).length}</OXChip>
              </div>
              {(byDay.get(d) ?? []).map((it) => (
                <OXListRow key={it.id} title={it.title} sub={it.when} trail={t("addCalendar")} onClick={() => download(it)} />
              ))}
            </section>
          ))}
        </div>
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </div>
  );
}
