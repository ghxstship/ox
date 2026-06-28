"use client";

import { useTranslations } from "next-intl";

/** Skip-to-content link — first focusable element; jumps to <main id="main">. */
export function SkipLink() {
  const t = useTranslations("common");
  return (
    <a className="ox-skip" href="#main">
      {t("skipToContent")}
    </a>
  );
}
