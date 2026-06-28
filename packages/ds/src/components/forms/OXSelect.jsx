import React from "react";

/**
 * OXSelect — native select styled to the ruled, serif field language with an
 * Oxide caret. Options: { value, label, disabled? }.
 */
export function OXSelect({ options, value, disabled = false, onChange, style, ...rest }) {
  return (
    <div className="ox-select" style={style}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
