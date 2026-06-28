"use client";

// OX web — operator Schedule/Calendar. Classes load LIVE from Supabase
// (RLS-scoped by identity; the DB is the boundary) and render as OXClassRow. Two
// builders, both gated by can(session, "class.manage") (host/admin) and hidden
// (not disabled) otherwise: a single "Add class", and the Recurring Class Series
// builder (parity §B·30) — day picker + time → occurrence preview, with a
// this-vs-all-future scope toggle. Creation posts to /classes and /classes/recur.
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  OXContainer,
  OXClassRow,
  OXButton,
  OXModal,
  OXField,
  OXInput,
  OXSelect,
  OXChip,
  OXSegmented,
  OXListRow,
  OXEmpty,
  OXToast,
} from "@ox/ds";
import { can, scopeLabel, date } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { useApi } from "../../lib/useApi";
import { useLive } from "../../lib/useLive";
import { fetchClasses } from "../../lib/supabase";
import { classes as seedClasses, floorName, floors } from "../../lib/seed";

const LOAD_MAP: Record<string, "open" | "filling" | "full"> = { open: "open", fill: "filling", full: "full" };
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView() {
  const t = useTranslations("ops");
  const tn = useTranslations("nav");
  const tseries = useTranslations("series");
  const { session } = useSession();
  const { prefs } = usePrefs();
  const api = useApi();
  const live = useLive(fetchClasses, []);

  const [open, setOpen] = useState(false);
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [floor, setFloor] = useState(floors[0]!.id);

  // Series builder state
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesFloor, setSeriesFloor] = useState(floors[0]!.id);
  const [seriesTime, setSeriesTime] = useState("06:00");
  const [seriesDays, setSeriesDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [editScope, setEditScope] = useState<"this" | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const canManage = can(session, "class.manage");

  const classes = useMemo(() => {
    const rows = live.data ?? [];
    if (rows.length)
      return rows.map((c) => {
        const at = new Date(c.startsAt);
        return {
          id: c.id,
          time: date(at, { locale: prefs.locale, weekday: "short", hour: "2-digit", minute: "2-digit" }),
          title: c.title,
          floorId: c.floorId,
          spots: c.capacity,
          load: LOAD_MAP[c.load] ?? "open",
        };
      });
    return seedClasses.map((c) => ({ id: c.id, time: `${c.day} · ${c.time}`, title: c.title, floorId: c.floorId, spots: c.cap - c.booked, load: c.load as "open" | "filling" | "full" }));
  }, [live.data, prefs.locale]);

  // Occurrence preview — the next 4 weeks of the selected weekdays.
  const occurrences = useMemo(() => {
    const out: string[] = [];
    const dayIdx = seriesDays.map((d) => DOW.indexOf(d));
    const start = new Date();
    for (let w = 0; w < 4 && out.length < 8; w++) {
      for (let d = 0; d < 7; d++) {
        const day = new Date(start.getTime() + (w * 7 + d) * 864e5);
        const jsDow = (day.getDay() + 6) % 7; // Mon=0
        if (dayIdx.includes(jsDow)) out.push(`${DOW[jsDow]} ${day.toLocaleDateString(prefs.locale, { month: "short", day: "numeric" })} · ${seriesTime}`);
      }
    }
    return out.slice(0, 8);
  }, [seriesDays, seriesTime, prefs.locale]);

  function toggleDay(d: string) {
    setSeriesDays((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  }

  async function createSeries() {
    const rule = `FREQ=WEEKLY;BYDAY=${seriesDays.map((d) => d.slice(0, 2).toUpperCase()).join(",")}`;
    await api.http.post("/classes/recur", { title: seriesTitle, floorId: seriesFloor, time: seriesTime, rule, scope: editScope }).catch(() => {});
    setSeriesOpen(false);
    setToast(tseries("created"));
  }

  async function createSingle() {
    await api.classes.create({ title, floorId: floor }).catch(() => {});
    setOpen(false);
    setToast(t("newClass"));
  }

  return (
    <OXContainer>
      <div className="ox-row-wrap" style={{ justifyContent: "space-between", paddingBlock: "8px 0" }}>
        <div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{tn("calendar")}</h1>
          <div className="ox-demo-note">{scopeLabel(session, floorName)}</div>
        </div>
        {canManage && (
          <div className="ox-row-wrap">
            <OXButton variant="default" onClick={() => setSeriesOpen(true)}>{tseries("newSeries")}</OXButton>
            <OXButton variant="oxide" onClick={() => setOpen(true)}>{t("newClass")}</OXButton>
          </div>
        )}
      </div>

      <div className="ox-stack" style={{ gap: 8, paddingBlock: 16 }}>
        {classes.length === 0 ? (
          <OXEmpty title={t("noMembers")} />
        ) : (
          classes.map((c) => (
            <OXClassRow key={c.id} time={c.time} title={c.title} floor={floorName(c.floorId) ?? undefined} spots={c.spots} status={c.load} />
          ))
        )}
      </div>

      {canManage && (
        <OXModal open={open} onClose={() => setOpen(false)} label={t("newClass")}>
          <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 320 }}>
            <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, margin: 0 }}>{t("newClass")}</h2>
            <OXField label="Title">
              <OXInput value={title} onChange={setTitle} placeholder="Sunrise Sled Push" />
            </OXField>
            <OXField label={tn("floor")}>
              <OXSelect value={floor} onChange={setFloor} options={floors.map((f) => ({ value: f.id, label: f.name }))} />
            </OXField>
            <OXButton variant="oxide" block onClick={() => void createSingle()}>{t("newClass")}</OXButton>
          </div>
        </OXModal>
      )}

      {canManage && (
        <OXModal open={seriesOpen} onClose={() => setSeriesOpen(false)} label={tseries("title")}>
          <div className="ox-stack" style={{ gap: 14, padding: 20, minInlineSize: 340, maxInlineSize: 440 }}>
            <div>
              <div className="ox-section-label">{tseries("kicker")}</div>
              <h2 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 24, margin: 0 }}>{tseries("newSeries")}</h2>
            </div>
            <OXField label={tseries("title2")}>
              <OXInput value={seriesTitle} onChange={setSeriesTitle} placeholder="Sunrise Sled Push" />
            </OXField>
            <OXField label={tseries("floor")}>
              <OXSelect value={seriesFloor} onChange={setSeriesFloor} options={floors.map((f) => ({ value: f.id, label: f.name }))} />
            </OXField>
            <OXField label={tseries("time")}>
              <OXInput value={seriesTime} onChange={setSeriesTime} placeholder="06:00" />
            </OXField>
            <OXField label={tseries("days")}>
              <div className="ox-row-wrap">
                {DOW.map((d) => (
                  <button key={d} type="button" onClick={() => toggleDay(d)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}>
                    <OXChip variant={seriesDays.includes(d) ? "oxide" : "ghost"}>{d}</OXChip>
                  </button>
                ))}
              </div>
            </OXField>

            <OXField label={tseries("preview")}>
              <div className="ox-stack" style={{ gap: 4 }}>
                {occurrences.map((o, i) => (
                  <OXListRow key={i} title={o} />
                ))}
              </div>
            </OXField>

            <OXSegmented<"this" | "all"> value={editScope} onChange={setEditScope} options={[{ value: "this", label: tseries("thisOnly") }, { value: "all", label: tseries("allFuture") }]} />

            <OXButton variant="oxide" block arrow onClick={() => void createSeries()}>{tseries("create")}</OXButton>
          </div>
        </OXModal>
      )}

      <OXToast visible={!!toast} tone="success" message={toast ?? ""} />
    </OXContainer>
  );
}
