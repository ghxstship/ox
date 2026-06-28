import React from "react";

/**
 * OXSegmented — segmented switcher (edition / pillar / tier). Active segment
 * fills Oxide. Controlled via `value` / `onChange`.
 */
export function OXSegmented({ options, value, onChange, style, ...rest }) {
  return (
    <div className="ox-seg" style={style} role="tablist" {...rest}>
      {options.map((o) => (
        <button
          key={o.value}
          className={o.value === value ? "is-active" : ""}
          aria-selected={o.value === value}
          onClick={() => onChange && onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
