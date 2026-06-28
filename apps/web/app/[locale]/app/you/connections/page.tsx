import { unstable_setRequestLocale } from "next-intl/server";
import { ConnectionsView } from "../../../../../components/consumer/ConnectionsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ConnectionsView />;
}
