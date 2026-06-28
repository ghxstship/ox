"use client";

// OX web — locale switcher. Swaps the locale segment on the current path so the
// whole app (including <html dir> for RTL) re-renders in the chosen language.
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { OXSelect } from "@ox/ds";
import { locales, localeLabel, type AppLocale } from "../../i18n/config";

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const active = useLocale();

  function onChange(next: string) {
    // pathname is /<locale>/rest — replace the first segment.
    const parts = pathname.split("/");
    parts[1] = next;
    router.push(parts.join("/") || `/${next}`);
  }

  return (
    <OXSelect
      value={active}
      onChange={onChange}
      options={locales.map((l) => ({ value: l, label: localeLabel[l as AppLocale] }))}
      style={{ minWidth: 120 }}
    />
  );
}
