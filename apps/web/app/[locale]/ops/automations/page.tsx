import { unstable_setRequestLocale } from "next-intl/server";
import { AutomationsView } from "../../../../components/operator/AutomationsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <AutomationsView />;
}
