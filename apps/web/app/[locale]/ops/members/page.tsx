"use client";

// OX web — operator Members (host/admin). Hidden from coach by the shell nav;
// the table itself is RLS-scoped regardless.
import { useTranslations } from "next-intl";
import { RosterTable } from "../../../../components/operator/RosterTable";

export default function Page() {
  const t = useTranslations("ops");
  return <RosterTable heading={t("members")} />;
}
