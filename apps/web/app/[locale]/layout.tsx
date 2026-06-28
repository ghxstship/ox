// OX web — root locale layout. Sets <html lang dir>, loads the three OX Google
// fonts mapped onto the --ox-font-* tokens, imports the DS stylesheet, mounts the
// skip link + accessible <main>, and wraps the tree in the session / prefs /
// white-label providers.
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";

import "@ox/ds/styles.css";
import "../globals.css";

import { locales, dirFor, intlLocale, isLocale } from "../../i18n/config";
import { AppProviders } from "../../components/providers/AppProviders";
import { SkipLink } from "../../components/chrome/SkipLink";

// Fonts → CSS variables consumed by the DS --ox-font-* tokens.
const serif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--ox-font-serif",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--ox-font-mono",
});
// Geist ships as its own package (not in next/font/google on Next 14.2). It
// exposes the `--font-geist-sans` variable; globals.css aliases --ox-font-sans
// to it so the DS body-type token resolves to Geist.
const sans = GeistSans;

export const metadata: Metadata = {
  title: "OX — Plug in. Level up.",
  description:
    "OX is the gamified adventure-fitness platform. Real training, a living world map, your herd, and a soundtrack that moves with you.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  unstable_setRequestLocale(locale);

  const messages = await getMessages();
  const dir = dirFor(locale);

  return (
    <html lang={locale} dir={dir} className={`${serif.variable} ${mono.variable} ${sans.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SkipLink />
          <AppProviders initialLocale={intlLocale[locale]}>
            <main id="main" tabIndex={-1}>
              {children}
            </main>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
