import { unstable_setRequestLocale } from "next-intl/server";
import { AnalyticsView } from "../../../../../components/consumer/AnalyticsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <AnalyticsView />;
}
