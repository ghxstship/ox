import { unstable_setRequestLocale } from "next-intl/server";
import { CartView } from "../../../../components/consumer/CartView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <CartView />;
}
