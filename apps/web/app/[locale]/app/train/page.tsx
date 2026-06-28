import { unstable_setRequestLocale } from "next-intl/server";
import { TrainView } from "../../../../components/consumer/TrainView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <TrainView />;
}
