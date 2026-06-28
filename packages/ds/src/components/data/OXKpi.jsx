import React from "react";

/**
 * OXKpi — a stat card: mono label, big serif value, mono delta (Oxide up /
 * Stone down).
 */
export function OXKpi({ label, value, delta, trend = "up", style, ...rest }) {
  return (
    <div className="ox-kpi" style={style} {...rest}>
      <span className="ox-kpi__label">{label}</span>
      <span className="ox-kpi__value">{value}</span>
      {delta && <span className={"ox-kpi__delta" + (trend === "down" ? " is-down" : "")}>{delta}</span>}
    </div>
  );
}
