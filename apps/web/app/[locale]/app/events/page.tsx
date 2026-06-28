import { unstable_setRequestLocale } from "next-intl/server";
import { EventsView } from "../../../../components/consumer/EventsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <EventsView />;
}
