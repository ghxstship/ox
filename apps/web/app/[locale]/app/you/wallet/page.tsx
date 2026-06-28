import { unstable_setRequestLocale } from "next-intl/server";
import { WalletView } from "../../../../../components/consumer/WalletView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <WalletView />;
}
