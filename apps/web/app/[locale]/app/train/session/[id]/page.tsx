import { unstable_setRequestLocale } from "next-intl/server";
import { PlayerView } from "../../../../../../components/consumer/PlayerView";

export default function Page({ params }: { params: { locale: string; id: string } }) {
  unstable_setRequestLocale(params.locale);
  return <PlayerView sessionId={params.id} />;
}
