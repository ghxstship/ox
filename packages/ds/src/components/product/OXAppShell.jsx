import React from "react";

/** OXBadge — product status badge. tone: ok|warn|danger|info|neutral. */
export function OXBadge({ tone = "neutral", children, style, ...rest }) {
  return (
    <span className={"oxp-badge oxp-badge--" + tone} style={style} {...rest}>
      {children}
    </span>
  );
}

/** OXTag — quiet metadata tag. */
export function OXTag({ children, style, ...rest }) {
  return <span className="oxp-tag" style={style} {...rest}>{children}</span>;
}

/** OXKbd — keyboard key cap. */
export function OXKbd({ children, style, ...rest }) {
  return <kbd className="oxp-kbd" style={style} {...rest}>{children}</kbd>;
}

/** OXStat — product stat: big serif number + mono label + optional delta. */
export function OXStat({ value, label, delta, style, ...rest }) {
  return (
    <div className="oxp-stat" style={style} {...rest}>
      <span className="oxp-stat__n">{value}</span>
      <span className="oxp-stat__l">{label}</span>
      {delta && <span className="oxp-stat__d">{delta}</span>}
    </div>
  );
}

/** OXProgress — thin progress bar (0–100). */
export function OXProgress({ value = 0, style, ...rest }) {
  return (
    <div className="oxp-progress" style={style} {...rest}>
      <span className="oxp-progress__fill" style={{ width: Math.max(0, Math.min(100, value)) + "%" }} />
    </div>
  );
}

/** OXSpinner — small Oxide spinner. */
export function OXSpinner({ style, ...rest }) {
  return <span className="oxp-spinner" style={style} {...rest} />;
}

/** OXSteps — horizontal step tracker. steps: { label, state? "done"|"now" }. */
export function OXSteps({ steps, style, ...rest }) {
  return (
    <div className="oxp-steps" style={style} {...rest}>
      {steps.map((s, i) => (
        <div key={i} className={"oxp-steps__s" + (s.state ? " is-" + s.state : "")}>
          <span className="oxp-steps__n">{String(i + 1).padStart(2, "0")} · {s.label}</span>
          <span className="oxp-steps__bar" />
        </div>
      ))}
    </div>
  );
}

/** OXBanner — product inline banner. tone: info|ok|warn|danger. */
export function OXBanner({ tone = "info", children, style, ...rest }) {
  return (
    <div className={"oxp-banner oxp-banner--" + tone} style={style} {...rest}>
      {children}
    </div>
  );
}

/**
 * OXAppShell — the SaaS console shell: sidebar (brand + nav) + topbar + content.
 * Re-skins per app via `product` (member|operate|admin → an accent step).
 */
export function OXAppShell({ product = "member", appCode = "MBR", brand, nav = [], topbar, children, style, ...rest }) {
  return (
    <div className="oxa" data-ox-product={product} style={{ height: "100%", ...style }} {...rest}>
      <aside className="oxa__side">
        <div className="oxa__brand">
          <span className="ox-flag" style={{ fontSize: 22 }}><span>OX</span></span>
          {brand}
          <span className="oxa__appcode" style={{ marginLeft: "auto" }}>{appCode}</span>
        </div>
        <nav className="oxa__nav">
          {nav.map((g, gi) => (
            <React.Fragment key={gi}>
              {g.group && <div className="oxa__navgroup">{g.group}</div>}
              {(g.items || []).map((it, ii) => (
                <a key={ii} href={it.href || "#"} className={"oxa__navitem" + (it.active ? " is-active" : "")}>
                  {it.label}
                  {it.badge && <span className="oxp-badge oxp-badge--neutral">{it.badge}</span>}
                </a>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>
      <div className="oxa__main">
        {topbar && <div className="oxa__topbar">{topbar}</div>}
        <div className="oxa__content">{children}</div>
      </div>
    </div>
  );
}

/** OXCommandPalette — ⌘K palette. items: { label, kbd?, icon? }. */
export function OXCommandPalette({ placeholder = "Search or run a command…", items = [], style, ...rest }) {
  return (
    <div className="oxa__cmdk" style={style} {...rest}>
      <input placeholder={placeholder} />
      {items.map((it, i) => (
        <div className="oxa__cmdk__row" key={i}>
          {it.icon && <span>{it.icon}</span>}
          <span>{it.label}</span>
          {it.kbd && <span className="oxp-kbd">{it.kbd}</span>}
        </div>
      ))}
    </div>
  );
}
