"use client";

// OX web — client route guard. Ensures a session exists and that the session's
// role is routed to the right surface (consumer vs operator) per NAV[role].app.
// Unauthorized → redirect (don't reveal). This mirrors the server-side can()/RLS
// guard; the API is the real boundary.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { NAV, type AppSurface } from "@ox/rbac";
import { useSession } from "../providers/SessionProvider";
import { withLocale } from "../../lib/links";

export function RequireSurface({
  surface,
  children,
}: {
  surface: AppSurface;
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (session === null) {
      // Not signed in (post-hydration). Send to the gate.
      router.replace(withLocale(locale, "/signin"));
      return;
    }
    const want = NAV[session.role].app;
    if (want !== surface) {
      router.replace(withLocale(locale, want === "consumer" ? "/app" : "/ops"));
    }
  }, [session, surface, router, locale]);

  if (!session || NAV[session.role].app !== surface) return null;
  return <>{children}</>;
}
