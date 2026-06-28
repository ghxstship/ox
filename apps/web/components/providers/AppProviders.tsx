"use client";

// OX web — composes the client providers (session → prefs → brand). Brand needs
// the session token to resolve the tenant brand, so it sits inside Session.
import { SessionProvider, useSession } from "./SessionProvider";
import { PrefsProvider } from "./PrefsProvider";
import { BrandProvider } from "./BrandProvider";

function BrandWithToken({ children }: { children: React.ReactNode }) {
  const { token } = useSession();
  return <BrandProvider token={token}>{children}</BrandProvider>;
}

export function AppProviders({
  initialLocale,
  children,
}: {
  initialLocale?: string;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <PrefsProvider initialLocale={initialLocale}>
        <BrandWithToken>{children}</BrandWithToken>
      </PrefsProvider>
    </SessionProvider>
  );
}
