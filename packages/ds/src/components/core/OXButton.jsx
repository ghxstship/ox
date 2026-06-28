import React from "react";

/**
 * OXButton — rectangular mono-caps button. Hover flips value (fill ⇄ ground).
 * Variants: default (outline), primary (solid ink), oxide, ghost.
 */
export function OXButton({
  variant = "default",
  size = "md",
  block = false,
  arrow = false,
  href,
  onClick,
  children,
  style,
  ...rest
}) {
  const cls = [
    "ox-btn",
    variant !== "default" && "ox-btn--" + variant,
    size !== "md" && "ox-btn--" + size,
    block && "ox-btn--block",
  ]
    .filter(Boolean)
    .join(" ");
  const inner = (
    <>
      {children}
      {arrow && <span className="ox-arrow">→</span>}
    </>
  );
  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick} style={style} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick} style={style} {...rest}>
      {inner}
    </button>
  );
}
