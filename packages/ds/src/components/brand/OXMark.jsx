import React from "react";

/**
 * OXMark — the OX mark. One source string "OX", JetBrains Mono ExtraBold,
 * tracking −4%. `wordmark` = horizontal; `flag` = rotated 90° CW.
 * Never drawn, never another typeface.
 */
export function OXMark({ as = "wordmark", size = 40, color, style, ...rest }) {
  const s = { fontSize: typeof size === "number" ? size + "px" : size, color, ...style };
  if (as === "flag") {
    return (
      <span className="ox-flag" style={s} {...rest}>
        <span>OX</span>
      </span>
    );
  }
  return (
    <span className="ox-wordmark" style={s} {...rest}>
      OX
    </span>
  );
}
