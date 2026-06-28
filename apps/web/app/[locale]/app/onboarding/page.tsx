import { unstable_setRequestLocale } from "next-intl/server";
import { OnboardingView } from "../../../../components/consumer/OnboardingView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <OnboardingView />;
}
