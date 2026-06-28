import { unstable_setRequestLocale } from "next-intl/server";
import { YouView } from "../../../../components/consumer/YouView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <YouView />;
}
