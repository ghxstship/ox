import { unstable_setRequestLocale } from "next-intl/server";
import { PosView } from "../../../../components/operator/PosView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PosView />;
}
