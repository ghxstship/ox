import { unstable_setRequestLocale } from "next-intl/server";
import { ScheduleView } from "../../../../../components/consumer/ScheduleView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ScheduleView />;
}
