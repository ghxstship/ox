import React from "react";

/**
 * OXField — labeled field wrapper (the form spine). Mono-caps label, optional
 * serif-italic hint, control as children, help/error below. State drives color.
 */
export function OXField({ label, hint, help, state = "default", htmlFor, children, style, ...rest }) {
  const cls = ["ox-fld", state === "error" && "is-error", state === "success" && "is-success"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={style} {...rest}>
      <label className="ox-fld__label" htmlFor={htmlFor}>
        <span>{label}</span>
        {hint && <span className="ox-fld__hint">{hint}</span>}
      </label>
      {children}
      {help && <span className="ox-fld__help">{help}</span>}
    </div>
  );
}
