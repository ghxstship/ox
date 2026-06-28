import { unstable_setRequestLocale } from "next-intl/server";
import { GeneratorView } from "../../../../../components/consumer/GeneratorView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <GeneratorView />;
}
