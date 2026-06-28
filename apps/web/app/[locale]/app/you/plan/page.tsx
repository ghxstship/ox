import { unstable_setRequestLocale } from "next-intl/server";
import { PlanView } from "../../../../../components/consumer/PlanView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PlanView />;
}
