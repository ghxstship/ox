import { unstable_setRequestLocale } from "next-intl/server";
import { HostEventView } from "../../../../../components/consumer/HostEventView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <HostEventView />;
}
