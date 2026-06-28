import { unstable_setRequestLocale } from "next-intl/server";
import { LeadsView } from "../../../../components/operator/LeadsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <LeadsView />;
}
