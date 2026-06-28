import React from "react";

/**
 * OXChoice — radio or checkbox row. Square box (radios get a pill dot);
 * checked fills Oxide. Serif label + optional sub.
 */
export function OXChoice({ type = "checkbox", name, label, sub, checked, disabled, onChange, style, ...rest }) {
  const boxCls = "ox-choice__box" + (type === "radio" ? " ox-choice__box--radio" : "");
  return (
    <label className="ox-choice" style={style} {...rest}>
      <input
        type={type}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      <span className={boxCls}></span>
      <span className="ox-choice__label">
        {label}
        {sub && <span className="ox-choice__sub">{sub}</span>}
      </span>
    </label>
  );
}
