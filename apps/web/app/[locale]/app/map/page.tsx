import { unstable_setRequestLocale } from "next-intl/server";
import { MapView } from "../../../../components/consumer/MapView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <MapView />;
}
