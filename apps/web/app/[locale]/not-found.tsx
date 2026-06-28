"use client";

// OX web — 404 surface (also the target for unauthorized routes — we 404 rather
// than reveal). Square, ruled, one-accent.
import { OXContainer, OXEmpty, OXButton } from "@ox/ds";
import { useLocale } from "next-intl";
import { withLocale } from "../../lib/links";

export default function NotFound() {
  const locale = useLocale();
  return (
    <OXContainer>
      <div style={{ paddingBlock: 64 }}>
        <OXEmpty
          mark="404"
          title="Off the map"
          sub="This floor is not on your route."
          action={
            <OXButton variant="oxide" href={withLocale(locale, "/")}>
              Back to base
            </OXButton>
          }
        />
      </div>
    </OXContainer>
  );
}
