import React from "react";

/**
 * OXChip — small mono-caps chip. Variants: default (outline), solid, oxide,
 * oxide-line, ghost. `live` prepends the Oxide status dot.
 */
export function OXChip({ variant = "default", live = false, children, style, ...rest }) {
  const cls = [
    "ox-chip",
    variant !== "default" && "ox-chip--" + variant,
    live && "ox-chip--live",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} style={style} {...rest}>
      {children}
    </span>
  );
}
