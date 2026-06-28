import React from "react";

/**
 * OXMeter — capacity / threshold meter. The fill turns Stone (from Oxide)
 * once `current` ≥ `lockAt` (price-lock / threshold reached).
 */
export function OXMeter({ title, current, total, lockAt, openLabel, lockedLabel, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (current / total) * 100));
  const locked = lockAt != null && current >= lockAt;
  return (
    <div className="ox-meter" style={style} {...rest}>
      <div className="ox-meter__head">
        <span className="ox-meter__title">{title}</span>
        <span className="ox-meter__val">{current} / {total}</span>
      </div>
      <div className="ox-meter__bar">
        <span className={"ox-meter__fill" + (locked ? " is-locked" : "")} style={{ width: pct + "%" }}></span>
      </div>
      <div className="ox-meter__meta">
        <span>{locked ? (lockedLabel || "Locked") : (openLabel || "Open")}</span>
        <span>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
