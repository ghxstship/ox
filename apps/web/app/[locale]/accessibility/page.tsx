// OX web — accessibility statement (WCAG 2.2 AA + EN 301 549). Public.
import { unstable_setRequestLocale } from "next-intl/server";
import { AccessibilityView } from "../../../components/marketing/AccessibilityView";

export default function AccessibilityPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <AccessibilityView />;
}
