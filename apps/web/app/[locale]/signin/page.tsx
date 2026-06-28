// OX web — demo sign-in / identity picker (port of gate.jsx). Picking an
// identity seeds the client session; RBAC then routes by NAV[role].app.
import { unstable_setRequestLocale } from "next-intl/server";
import { SignInView } from "../../../components/auth/SignInView";

export default function SignInPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <SignInView />;
}
