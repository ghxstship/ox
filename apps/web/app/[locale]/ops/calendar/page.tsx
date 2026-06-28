import { unstable_setRequestLocale } from "next-intl/server";
import { CalendarView } from "../../../../components/operator/CalendarView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <CalendarView />;
}
