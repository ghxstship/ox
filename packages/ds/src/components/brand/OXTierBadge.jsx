import React from "react";

/**
 * OXTierBadge — the membership tier badge. Mono caps + Oxide member number.
 * Founder gets the inverse (Ink) register.
 */
export function OXTierBadge({ tier = "compass", number, style, ...rest }) {
  const label = { founder: "Founder", compass: "Compass", sound: "Sound", distant: "Distant" }[tier] || tier;
  return (
    <span className={"ox-tier" + (tier === "founder" ? " ox-tier--founder" : "")} style={style} {...rest}>
      <span>{label}</span>
      <span className="num">{number}</span>
    </span>
  );
}
