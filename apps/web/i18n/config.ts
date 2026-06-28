// OX web — shared locale config. Single source of truth for the locale list,
// the default, and RTL membership (used by middleware, the layout dir, and the
// locale switcher).
export const locales = ["en", "es", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

/** Locales that render right-to-left — drives <html dir> + CSS logical props. */
export const rtlLocales: AppLocale[] = ["ar"];

export function isLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}

export function dirFor(locale: string): "ltr" | "rtl" {
  return rtlLocales.includes(locale as AppLocale) ? "rtl" : "ltr";
}

/** Map an app locale to a BCP-47 tag for Intl (money/date/number formatting). */
export const intlLocale: Record<AppLocale, string> = {
  en: "en-US",
  es: "es-ES",
  ar: "ar",
};

export const localeLabel: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  ar: "العربية",
};
