import { unstable_setRequestLocale } from "next-intl/server";
import { DashboardView } from "../../../components/operator/DashboardView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <DashboardView />;
}
