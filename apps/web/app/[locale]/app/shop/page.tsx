import { unstable_setRequestLocale } from "next-intl/server";
import { ShopView } from "../../../../components/consumer/ShopView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ShopView />;
}
