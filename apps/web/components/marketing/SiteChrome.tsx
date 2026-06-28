"use client";

// OX web — public marketing chrome (header + footer) using DS OXSiteHeader /
// OXSiteFooter / OXMark. Square, ruled, one-accent. Links carry the locale.
import { useLocale, useTranslations } from "next-intl";
import { OXSiteHeader, OXSiteFooter, OXMark, OXButton } from "@ox/ds";
import { withLocale } from "../../lib/links";
import { LocaleSwitcher } from "../chrome/LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations("marketing");
  const locale = useLocale();
  return (
    <OXSiteHeader
      brand={<OXMark as="wordmark" size={22} />}
      nav={[
        { label: t("pricing"), href: withLocale(locale, "/pricing") },
        { label: t("personas"), href: withLocale(locale, "/personas") },
        { label: t("accessibility"), href: withLocale(locale, "/accessibility") },
      ]}
      cta={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <LocaleSwitcher />
          <OXButton variant="oxide" size="sm" href={withLocale(locale, "/signin")}>
            {t("signIn")}
          </OXButton>
        </span>
      }
    />
  );
}

export function SiteFooter() {
  const t = useTranslations("marketing");
  const locale = useLocale();
  return (
    <OXSiteFooter
      columns={[
        {
          heading: "OX",
          links: [
            { label: t("pricing"), href: withLocale(locale, "/pricing") },
            { label: t("personas"), href: withLocale(locale, "/personas") },
          ],
        },
        {
          heading: t("company"),
          links: [
            { label: t("accessibility"), href: withLocale(locale, "/accessibility") },
            { label: t("signIn"), href: withLocale(locale, "/signin") },
          ],
        },
      ]}
    />
  );
}
