import { unstable_setRequestLocale } from "next-intl/server";
import { InboxView } from "../../../../components/operator/InboxView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <InboxView />;
}
