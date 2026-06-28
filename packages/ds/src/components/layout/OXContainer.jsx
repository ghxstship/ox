import React from "react";

/** OXContainer — centered page container; `reading` narrows to 760px. */
export function OXContainer({ reading = false, children, style, ...rest }) {
  return (
    <div className={"ox-container" + (reading ? " ox-container--reading" : "")} style={style} {...rest}>
      {children}
    </div>
  );
}

/** OXGrid — 12-col grid. Children use OXCol or .ox-col-N. */
export function OXGrid({ children, style, ...rest }) {
  return (
    <div className="ox-grid" style={style} {...rest}>
      {children}
    </div>
  );
}

/** OXCol — a grid column spanning `span` of 12 (full-width < 768px). */
export function OXCol({ span = 12, children, style, ...rest }) {
  return (
    <div className={"ox-col-" + span} style={style} {...rest}>
      {children}
    </div>
  );
}

/** OXCover — section cover: mono kicker + oversized serif title (<em> Oxide). */
export function OXCover({ kicker, title, children, style, ...rest }) {
  return (
    <section className="ox-cover" style={style} {...rest}>
      {kicker && <div className="ox-cover__kicker">— {kicker}</div>}
      <h1 className="ox-cover__title">{title}</h1>
      {children}
    </section>
  );
}

/** OXCTABand — Ink CTA band: serif title (<em> bright-Oxide) + action. */
export function OXCTABand({ title, action, style, ...rest }) {
  return (
    <div className="ox-band ox-band--cta" style={style} {...rest}>
      <div className="ox-band__t">{title}</div>
      {action}
    </div>
  );
}

/** OXFeatureGrid — 3-up, 1px-ruled feature grid. */
export function OXFeatureGrid({ children, style, ...rest }) {
  return (
    <div className="ox-featuregrid" style={style} {...rest}>
      {children}
    </div>
  );
}

/** OXSplit — two-column 1fr/1fr split, centered. */
export function OXSplit({ left, right, style, ...rest }) {
  return (
    <div className="ox-split" style={style} {...rest}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
