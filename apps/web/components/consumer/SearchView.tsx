"use client";
// OX web — Global Search (parity §A·23). A cross-entity index built live from
// Supabase public-discovery tables (floors · classes · exercises · products ·
// events). Results group by type; selecting a row deep-links. States: empty ·
// grouped results · deep-link.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { OXInput, OXListRow, OXEmpty, OXIcon } from "@ox/ds";
import { useLive } from "../../lib/useLive";
import { fetchFloors, fetchClasses, fetchExercises, fetchProducts, fetchEvents } from "../../lib/supabase";
import { withLocale } from "../../lib/links";

interface Hit {
  group: string;
  label: string;
  sub: string;
  href: string;
}

export function SearchView() {
  const t = useTranslations("search");
  const router = useRouter();
  const locale = useLocale();

  const floors = useLive(fetchFloors, []);
  const classes = useLive(fetchClasses, []);
  const exercises = useLive(fetchExercises, []);
  const products = useLive(fetchProducts, []);
  const events = useLive(fetchEvents, []);

  const [q, setQ] = useState("");

  const index: Hit[] = useMemo(() => {
    const out: Hit[] = [];
    for (const f of floors.data ?? []) out.push({ group: t("floors"), label: f.name, sub: f.scenery, href: "/app/map" });
    for (const c of classes.data ?? []) out.push({ group: t("classes"), label: c.title, sub: c.load, href: "/app/tribe" });
    for (const e of exercises.data ?? []) out.push({ group: t("exercises"), label: e.name, sub: e.muscles.join(" · "), href: "/app/train" });
    for (const p of products.data ?? []) out.push({ group: t("products"), label: p.name, sub: p.collection, href: `/app/shop/${p.id}` });
    for (const ev of events.data ?? []) out.push({ group: t("events"), label: ev.title, sub: ev.hostName, href: "/app/events" });
    return out;
  }, [floors.data, classes.data, exercises.data, products.data, events.data, t]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.trim().toLowerCase();
    return index.filter((h) => h.label.toLowerCase().includes(needle) || h.sub.toLowerCase().includes(needle));
  }, [q, index]);

  const grouped = useMemo(() => {
    const m = new Map<string, Hit[]>();
    for (const r of results) {
      if (!m.has(r.group)) m.set(r.group, []);
      m.get(r.group)!.push(r);
    }
    return [...m.entries()];
  }, [results]);

  return (
    <div className="ox-page ox-stack">
      <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 32, margin: 0 }}>{t("title")}</h1>

      <div className="ox-row-wrap" style={{ gap: 8 }}>
        <OXIcon name="search" />
        <div style={{ flex: 1 }}>
          <OXInput value={q} onChange={setQ} placeholder={t("placeholder")} />
        </div>
      </div>

      {!q.trim() ? (
        <OXEmpty title={t("empty")} />
      ) : results.length === 0 ? (
        <OXEmpty title={t("noResults")} />
      ) : (
        grouped.map(([group, hits]) => (
          <section key={group} className="ox-stack" style={{ gap: 6 }}>
            <div className="ox-section-label">{group}</div>
            {hits.map((h, i) => (
              <OXListRow key={group + i} title={h.label} sub={h.sub} chevron onClick={() => router.push(withLocale(locale, h.href))} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
