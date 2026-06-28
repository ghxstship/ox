import { unstable_setRequestLocale } from "next-intl/server";
import { PaymentsView } from "../../../../components/operator/PaymentsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PaymentsView />;
}
