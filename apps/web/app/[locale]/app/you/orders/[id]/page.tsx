import { unstable_setRequestLocale } from "next-intl/server";
import { OrderView } from "../../../../../../components/consumer/OrderView";

export default function Page({ params }: { params: { locale: string; id: string } }) {
  unstable_setRequestLocale(params.locale);
  return <OrderView id={params.id} />;
}
