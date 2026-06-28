import React from "react";

/**
 * OXSwitch — square toggle; on-state fills Oxide and slides the knob.
 * Controlled via `on` / `onChange`.
 */
export function OXSwitch({ on = false, onChange, style, ...rest }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={"ox-switch" + (on ? " is-on" : "")}
      onClick={() => onChange && onChange(!on)}
      style={style}
      {...rest}
    />
  );
}
