import React from "react";

/**
 * OXRow — a list row: mono index, serif title + sub, mono action.
 */
export function OXRow({ index, title, sub, action, onClick, style, ...rest }) {
  return (
    <div className="ox-row" onClick={onClick} style={style} {...rest}>
      <span className="ox-row__n">{index}</span>
      <div>
        <div className="ox-row__title">{title}</div>
        {sub && <div className="ox-row__sub">{sub}</div>}
      </div>
      {action && <span className="ox-row__action">{action}</span>}
    </div>
  );
}
