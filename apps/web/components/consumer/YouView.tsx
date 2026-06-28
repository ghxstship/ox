"use client";

// OX web — You. Profile header, the OXCredential card, PRs (OXPRChip), recovery
// (OXRecoveryMap), and settings (locale / units / currency) that drive the
// @ox/rbac i18n helpers everywhere. Changing locale also switches the route
// locale (messages + <html dir>). Orders render via moneyFromCents().
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  OXCredential,
  OXPRChip,
  OXRecoveryMap,
  OXSetting,
  OXSelect,
  OXAvatar,
  OXListRow,
  OXIcon,
  OXEmpty,
} from "@ox/ds";
import { moneyFromCents } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { prs, recovery } from "../../lib/seed";
import { currencyOptions, unitOptions } from "../../lib/prefs";
import { withLocale } from "../../lib/links";
import { locales, localeLabel, intlLocale, type AppLocale } from "../../i18n/config";

const seedOrders = [
  { id: "o1", name: "Oxide Hoodie", at: "Apr 12", totalCents: 8800 },
  { id: "o2", name: "Herd Tee ×2", at: "Mar 02", totalCents: 7600 },
];

export function YouView() {
  const t = useTranslations("you");
  const tplan = useTranslations("plan");
  const tcredits = useTranslations("credits");
  const twallet = useTranslations("wallet");
  const tnotif = useTranslations("notifications");
  const tbody = useTranslations("body");
  const tsched = useTranslations("schedule");
  const thealth = useTranslations("health");
  const tanalytics = useTranslations("analytics");
  const tgift = useTranslations("gift");
  const router = useRouter();
  const pathname = usePathname();
  const routeLocale = useLocale();
  const { session } = useSession();
  const { prefs, setPrefs } = usePrefs();

  function switchRouteLocale(next: string) {
    // Keep the i18n helpers and the route in sync.
    setPrefs({ locale: intlLocale[next as AppLocale] });
    const parts = pathname.split("/");
    parts[1] = next;
    router.push(parts.join("/"));
  }

  return (
    <div className="ox-page ox-stack">
      <div className="ox-row-wrap">
        <OXAvatar initial={session?.initial ?? "?"} size={48} />
        <div>
          <h1 style={{ fontFamily: "var(--ox-font-serif)", fontSize: 28, margin: 0 }}>{session?.name ?? t("title")}</h1>
          <div className="ox-demo-note">Pathfinder · LV {session?.level ?? 1}</div>
        </div>
      </div>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("credential")}</div>
        <OXCredential
          material="digital"
          memberNumber="014"
          verified
          fields={[
            { label: "Member", value: <em>{session?.name ?? "—"}</em> },
            { label: "Tier", value: "Founder" },
            { label: "Home floor", value: "Pier 9 Iron" },
          ]}
          strip="ox.fit/verify/014 · ON-CHAIN"
        />
      </section>

      <section className="ox-stack" style={{ gap: 6 }}>
        <div className="ox-section-label">Account</div>
        {[
          { href: "/app/you/plan", icon: "ticket" as const, label: tplan("title") },
          { href: "/app/you/credits", icon: "wallet" as const, label: tcredits("title") },
          { href: "/app/you/wallet", icon: "qr" as const, label: twallet("title") },
          { href: "/app/you/notifications", icon: "bell" as const, label: tnotif("title") },
          { href: "/app/you/body", icon: "fitness" as const, label: tbody("title") },
          { href: "/app/you/schedule", icon: "calendar" as const, label: tsched("title") },
          { href: "/app/you/connections", icon: "globe" as const, label: thealth("title") },
          { href: "/app/you/analytics", icon: "grid" as const, label: tanalytics("title") },
          { href: "/app/shop/gift", icon: "events" as const, label: tgift("title") },
        ].map((row) => (
          <OXListRow
            key={row.href}
            icon={<OXIcon name={row.icon} size="sm" />}
            title={row.label}
            chevron
            onClick={() => router.push(withLocale(routeLocale, row.href))}
          />
        ))}
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("prs")}</div>
        <div className="ox-grid-cards">
          {prs.map((p) => (
            <OXPRChip key={p.lift} lift={p.lift} value={p.value} unit={p.unit} delta={`+${p.delta}`} prev={p.prev} history={p.history} />
          ))}
        </div>
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("recovery")}</div>
        <OXRecoveryMap regions={recovery} />
      </section>

      <section className="ox-stack" style={{ gap: 10 }}>
        <div className="ox-section-label">{t("settings")}</div>
        <OXSetting
          title={t("locale")}
          control={
            <OXSelect
              value={routeLocale}
              onChange={switchRouteLocale}
              options={locales.map((l) => ({ value: l, label: localeLabel[l as AppLocale] }))}
            />
          }
        />
        <OXSetting
          title={t("units")}
          control={
            <OXSelect value={prefs.units} onChange={(v) => setPrefs({ units: v as "kg" | "lb" })} options={unitOptions} />
          }
        />
        <OXSetting
          title={t("currency")}
          control={<OXSelect value={prefs.currency} onChange={(v) => setPrefs({ currency: v })} options={currencyOptions} />}
        />
      </section>

      <section className="ox-stack" style={{ gap: 8 }}>
        <div className="ox-section-label">{t("orders")}</div>
        {seedOrders.length === 0 ? (
          <OXEmpty title={t("noOrders")} />
        ) : (
          seedOrders.map((o) => (
            <OXListRow
              key={o.id}
              title={o.name}
              sub={o.at}
              trail={moneyFromCents(o.totalCents, { locale: prefs.locale, currency: prefs.currency })}
              chevron
              onClick={() => router.push(withLocale(routeLocale, `/app/you/orders/${o.id}`))}
            />
          ))
        )}
      </section>
    </div>
  );
}
