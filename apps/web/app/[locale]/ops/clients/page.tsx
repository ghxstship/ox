"use client";

// OX web — operator Clients (coach). Same RLS-scoped roster, scoped to the
// coach's own roster (scope("members") filters by coachId).
import { useTranslations } from "next-intl";
import { RosterTable } from "../../../../components/operator/RosterTable";

export default function Page() {
  const t = useTranslations("nav");
  return <RosterTable heading={t("clients")} />;
}
