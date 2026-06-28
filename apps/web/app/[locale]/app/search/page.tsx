import { unstable_setRequestLocale } from "next-intl/server";
import { SearchView } from "../../../../components/consumer/SearchView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <SearchView />;
}
