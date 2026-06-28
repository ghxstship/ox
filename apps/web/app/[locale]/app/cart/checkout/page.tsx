import { unstable_setRequestLocale } from "next-intl/server";
import { CheckoutView } from "../../../../../components/consumer/CheckoutView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <CheckoutView />;
}
