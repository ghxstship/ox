import { unstable_setRequestLocale } from "next-intl/server";
import { FloorView } from "../../../../components/operator/FloorView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <FloorView />;
}
