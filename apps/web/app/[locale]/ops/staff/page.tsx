import { unstable_setRequestLocale } from "next-intl/server";
import { StaffView } from "../../../../components/operator/StaffView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <StaffView />;
}
