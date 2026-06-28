// OX web — consumer Home: level/XP, today's session, quests, feed teaser.
import { unstable_setRequestLocale } from "next-intl/server";
import { HomeView } from "../../../components/consumer/HomeView";

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <HomeView />;
}
