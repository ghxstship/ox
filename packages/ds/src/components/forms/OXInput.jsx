import React from "react";

/**
 * OXInput — ruled (underlined) text input set in serif. Pairs with OXField.
 * `state` adds error/success underline; `multiline` renders a textarea.
 */
export function OXInput({ value, placeholder, state, multiline = false, rows = 3, onChange, style, ...rest }) {
  const cls = "ox-control";
  if (multiline) {
    return (
      <textarea
        className={cls}
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={state === "disabled"}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={style}
        {...rest}
      />
    );
  }
  return (
    <input
      className={cls}
      value={value}
      placeholder={placeholder}
      disabled={state === "disabled"}
      onChange={(e) => onChange && onChange(e.target.value)}
      style={style}
      {...rest}
    />
  );
}
