import { unstable_setRequestLocale } from "next-intl/server";
import { ContractsView } from "../../../../components/operator/ContractsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ContractsView />;
}
