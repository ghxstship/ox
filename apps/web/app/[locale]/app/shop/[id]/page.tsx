import { unstable_setRequestLocale } from "next-intl/server";
import { ProductView } from "../../../../../components/consumer/ProductView";

export default function Page({ params }: { params: { locale: string; id: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ProductView id={params.id} />;
}
