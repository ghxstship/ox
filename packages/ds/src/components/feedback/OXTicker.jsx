import React from "react";

/**
 * OXTicker — the Oxide marquee strip. Items joined by a dim "·" delimiter.
 * Heavy mono caps on copper.
 */
export function OXTicker({ items, style, ...rest }) {
  return (
    <div className="ox-ticker" style={style} {...rest}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <span>{it}</span>
          {i < items.length - 1 && <span className="dot">·</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
