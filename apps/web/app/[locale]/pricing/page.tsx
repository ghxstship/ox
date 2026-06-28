// OX web — public pricing page. Tonal copper tier cards (never new hues).
import { unstable_setRequestLocale } from "next-intl/server";
import { PricingView } from "../../../components/marketing/PricingView";

export default function PricingPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PricingView />;
}
