"use client";

// OX web — identity / role switcher + sign out, shown in the app chrome. Picking
// a different demo identity re-runs RBAC routing. Built on the DS OXMenu (which
// is keyboard-operable) inside a small popover.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { NAV } from "@ox/rbac";
import { OXMenu, OXButton, useDismissable } from "@ox/ds";
import { accounts } from "../../lib/seed";
import { useSession } from "../providers/SessionProvider";
import { withLocale } from "../../lib/links";

export function RoleSwitcher() {
  const t = useTranslations("nav");
  const router = useRouter();
  const locale = useLocale();
  const { session, signInDemo, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useDismissable(open, () => setOpen(false));

  if (!session) return null;

  async function choose(userId: string) {
    await signInDemo(userId);
    setOpen(false);
    const role = accounts.find((a) => a.id === userId)?.role;
    if (role) {
      const surface = NAV[role].app;
      router.replace(withLocale(locale, surface === "consumer" ? "/app" : "/ops"));
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <OXButton variant="default" size="sm" onClick={() => setOpen((o) => !o)}>
        {session.initial} · {t("switchRole")}
      </OXButton>
      {open && (
        <div ref={ref} style={{ position: "absolute", insetInlineEnd: 0, insetBlockStart: "calc(100% + 6px)", zIndex: 60, minInlineSize: 220 }}>
          <OXMenu
            onClose={() => setOpen(false)}
            items={[
              ...accounts.map((a) => ({
                key: a.id,
                label: `${a.label} · ${a.role}`,
                onSelect: () => void choose(a.id),
              })),
              { key: "out", label: t("signOut"), danger: true, separatorAfter: false, onSelect: () => { signOut(); router.replace(withLocale(locale, "/signin")); } },
            ]}
          />
        </div>
      )}
    </div>
  );
}
