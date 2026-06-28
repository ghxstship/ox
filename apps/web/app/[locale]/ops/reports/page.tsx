import { unstable_setRequestLocale } from "next-intl/server";
import { ReportsView } from "../../../../components/operator/ReportsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ReportsView />;
}
