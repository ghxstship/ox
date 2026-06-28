// OX web — consumer (member) surface layout. Guards the surface (member only)
// and wraps every consumer screen in the shell chrome.
import { unstable_setRequestLocale } from "next-intl/server";
import { RequireSurface } from "../../../components/auth/RequireSurface";
import { ConsumerShell } from "../../../components/consumer/ConsumerShell";

export default function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  return (
    <RequireSurface surface="consumer">
      <ConsumerShell>{children}</ConsumerShell>
    </RequireSurface>
  );
}
