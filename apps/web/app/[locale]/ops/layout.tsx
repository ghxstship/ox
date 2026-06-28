// OX web — operator console layout. Guards the operator surface (coach/host/
// admin) and wraps every ops screen in the OXAppShell-based chrome.
import { unstable_setRequestLocale } from "next-intl/server";
import { RequireSurface } from "../../../components/auth/RequireSurface";
import { OperatorShell } from "../../../components/operator/OperatorShell";

export default function OpsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  return (
    <RequireSurface surface="operator">
      <OperatorShell>{children}</OperatorShell>
    </RequireSurface>
  );
}
