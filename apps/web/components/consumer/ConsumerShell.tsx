"use client";

// OX web — consumer (member) shell: sticky top chrome (mark, scope chip, cart,
// role switcher) + bottom tab bar (Home·Train·Tribe·Map·You + Shop·Events).
// Tabs use aria-current; the scope chip renders scopeLabel(session).
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { scopeLabel } from "@ox/rbac";
import { OXMark, OXChip, OXIcon } from "@ox/ds";
import { useSession } from "../providers/SessionProvider";
import { RoleSwitcher } from "../chrome/RoleSwitcher";
import { withLocale } from "../../lib/links";
import { floorName } from "../../lib/seed";

const tabs = [
  { key: "home", path: "/app", icon: "house" as const },
  { key: "train", path: "/app/train", icon: "fitness" as const },
  { key: "tribe", path: "/app/tribe", icon: "feed" as const },
  { key: "map", path: "/app/map", icon: "compass" as const },
  { key: "you", path: "/app/you", icon: "profile" as const },
  { key: "shop", path: "/app/shop", icon: "grid" as const },
  { key: "events", path: "/app/events", icon: "events" as const },
];

export function ConsumerShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { session } = useSession();

  function isActive(path: string) {
    const full = withLocale(locale, path);
    if (path === "/app") return pathname === full;
    return pathname.startsWith(full);
  }

  return (
    <div style={{ minBlockSize: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="ox-appbar">
        <Link href={withLocale(locale, "/app")} aria-label="OX home" style={{ display: "inline-flex" }}>
          <OXMark as="wordmark" size={20} />
        </Link>
        <div className="ox-row-wrap">
          {session && (
            <OXChip variant="oxide-line">
              {scopeLabel(session, floorName)}
            </OXChip>
          )}
          <Link href={withLocale(locale, "/app/search")} aria-label="Search" className="ox-hit" style={{ display: "inline-grid", placeItems: "center" }}>
            <OXIcon name="search" />
          </Link>
          <Link href={withLocale(locale, "/app/cart")} aria-label={t("shop")} className="ox-hit" style={{ display: "inline-grid", placeItems: "center" }}>
            <OXIcon name="wallet" />
          </Link>
          <RoleSwitcher />
        </div>
      </header>

      <div style={{ flex: 1 }}>{children}</div>

      <nav className="ox-tabbar" aria-label="Primary">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={withLocale(locale, tab.path)}
            aria-current={isActive(tab.path) ? "page" : undefined}
          >
            <OXIcon name={tab.icon} size="sm" />
            <span>{t(tab.key)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
