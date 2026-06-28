// OX web — locale negotiation. next-intl prefixes every route with the active
// locale segment and redirects "/" → "/<negotiated-locale>".
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Run on everything except Next internals, API routes, and static assets.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
