import { unstable_setRequestLocale } from "next-intl/server";
import { GiftView } from "../../../../../components/consumer/GiftView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <GiftView />;
}
