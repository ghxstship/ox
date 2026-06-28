import { unstable_setRequestLocale } from "next-intl/server";
import { ProgramsView } from "../../../../../components/consumer/ProgramsView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <ProgramsView />;
}
