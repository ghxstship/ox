// OX web — public marketing homepage. Hero "Plug in. Level up." + pillars +
// CTA, using DS layout/brand components. Unauthenticated.
import { unstable_setRequestLocale } from "next-intl/server";
import { MarketingHome } from "../../components/marketing/MarketingHome";

export default function HomePage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <MarketingHome />;
}
