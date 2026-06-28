// OX web — public personas page (who OX is built for).
import { unstable_setRequestLocale } from "next-intl/server";
import { PersonasView } from "../../../components/marketing/PersonasView";

export default function PersonasPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PersonasView />;
}
