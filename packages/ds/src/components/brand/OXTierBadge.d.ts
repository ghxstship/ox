import React from "react";

export type OXTier = "founder" | "compass" | "sound" | "distant";

/** OXTierBadge — membership tier badge with member number (Oxide). */
export interface OXTierBadgeProps {
  tier?: OXTier;
  number: string | number;
  style?: React.CSSProperties;
}
export function OXTierBadge(props: OXTierBadgeProps): JSX.Element;
