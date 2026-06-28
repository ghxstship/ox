import { unstable_setRequestLocale } from "next-intl/server";
import { PayrollView } from "../../../../components/operator/PayrollView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PayrollView />;
}
