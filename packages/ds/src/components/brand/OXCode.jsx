import React from "react";

/**
 * OXCode — a mono location / pillar code chip, bordered in currentColor.
 * e.g. "MIA", "MUS-VI". Wayfinding only.
 */
export function OXCode({ children, style, ...rest }) {
  return (
    <span className="ox-code" style={style} {...rest}>
      {children}
    </span>
  );
}
