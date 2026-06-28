import React from "react";

/**
 * OXEmpty — empty-state surface. Big serif mark, serif title (<em> for Oxide),
 * sub line, and an optional action.
 */
export function OXEmpty({ mark, title, sub, action, style, ...rest }) {
  return (
    <div className="ox-empty" style={style} {...rest}>
      {mark && <div className="ox-empty__mark">{mark}</div>}
      <div className="ox-empty__t">{title}</div>
      {sub && <p className="ox-empty__s">{sub}</p>}
      {action}
    </div>
  );
}
