import React from "react";

/**
 * OXTabs — filter tabs with an Oxide underline on the active item.
 * Each item: { label, active?, href? }.
 */
export function OXTabs({ items, style, ...rest }) {
  return (
    <nav className="ox-tabs" style={style} {...rest}>
      {items.map((it, i) => (
        <a key={i} href={it.href || "#"} className={it.active ? "is-active" : ""}>
          {it.label}
        </a>
      ))}
    </nav>
  );
}
