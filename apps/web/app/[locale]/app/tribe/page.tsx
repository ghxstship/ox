import { unstable_setRequestLocale } from "next-intl/server";
import { TribeView } from "../../../../components/consumer/TribeView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <TribeView />;
}
