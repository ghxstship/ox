// OX web — next-intl request config. Loads the message catalog for the active
// locale segment; falls back to the default locale for unknown segments.
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, defaultLocale } from "./i18n/config";

export default getRequestConfig(async ({ locale }) => {
  if (!isLocale(locale)) notFound();
  const active = isLocale(locale) ? locale : defaultLocale;
  return {
    locale: active,
    messages: (await import(`./messages/${active}.json`)).default,
  };
});
