import React from "react";

/** OXAlert — single-line Oxide-edged alert bar with a leading dot. */
export function OXAlert({ children, style, ...rest }) {
  return (
    <div className="ox-alert" style={style} {...rest}>
      {children}
    </div>
  );
}
