import { unstable_setRequestLocale } from "next-intl/server";
import { CreditsView } from "../../../../../components/consumer/CreditsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <CreditsView />;
}
