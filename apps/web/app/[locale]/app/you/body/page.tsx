import { unstable_setRequestLocale } from "next-intl/server";
import { BodyView } from "../../../../../components/consumer/BodyView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <BodyView />;
}
