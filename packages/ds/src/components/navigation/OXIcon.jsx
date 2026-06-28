import React from "react";

/* The 19 OX line icons, inlined so OXIcon is self-contained (mirrors
   assets/icons/ox-icons.svg). Line only · 1.5 stroke · no fill. */
const OX_ICON_PATHS = {
  house: "M3 11 L12 4 L21 11 M5 9.5 V20 H19 V9.5 M10 20 V14 H14 V20",
  events: "M3.5 5 H20.5 V21 H3.5 Z M3.5 9 H20.5 M8 3 V7 M16 3 V7 M7 13 H11 M7 17 H15",
  feed: "M12 3 L21 12 L12 21 L3 12 Z M12 8.5 L15.5 12 L12 15.5 L8.5 12 Z",
  wallet: "M3.5 6.5 H18 V5 H4.5 A1 1 0 0 0 3.5 6 V18 A1 1 0 0 0 4.5 19 H20.5 V8.5 H15 A2 2 0 0 0 15 12.5 H20.5",
  profile: "M12 4 A4 4 0 0 1 12 12 A4 4 0 0 1 12 4 M4.5 20 C4.5 15.5 8 14 12 14 C16 14 19.5 15.5 19.5 20",
  search: "M10.5 4 A6.5 6.5 0 0 1 10.5 17 A6.5 6.5 0 0 1 10.5 4 M15.5 15.5 L21 21",
  back: "M14 5 L7 12 L14 19",
  chevron: "M9 5 L16 12 L9 19",
  close: "M5 5 L19 19 M19 5 L5 19",
  add: "M12 4 V20 M4 12 H20",
  like: "M12 20 C5 15 3 11 3 8 A4 4 0 0 1 12 6 A4 4 0 0 1 21 8 C21 11 19 15 12 20 Z",
  comment: "M4 5 H20 V16 H10 L5 20 V16 H4 Z",
  repost: "M5 9 V7 H17 M17 4 L20 7 L17 10 M19 15 V17 H7 M7 20 L4 17 L7 14",
  share: "M5 12 V20 H19 V12 M12 3 V15 M8 7 L12 3 L16 7",
  settings: "M12 9 A3 3 0 0 1 12 15 A3 3 0 0 1 12 9 M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M19 5 L17 7 M7 17 L5 19",
  bell: "M6 10 A6 6 0 0 1 18 10 C18 15 20 17 20 17 H4 C4 17 6 15 6 10 Z M10 20 A2 2 0 0 0 14 20",
  lock: "M5 10 H19 V20 H5 Z M8 10 V7 A4 4 0 0 1 16 7 V10",
  check: "M4 12 L10 18 L20 6",
  external: "M14 4 H20 V10 M20 4 L11 13 M18 14 V20 H4 V6 H10",
  calendar: "M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7",
  clock: "M12 4 A8 8 0 0 1 12 20 A8 8 0 0 1 12 4 M12 7 V12 L16 14",
  pin: "M12 21 C12 21 19 14.5 19 9 A7 7 0 0 0 5 9 C5 14.5 12 21 12 21 Z M12 6.5 A2.5 2.5 0 0 1 12 11.5 A2.5 2.5 0 0 1 12 6.5",
  compass: "M12 3 A9 9 0 0 1 12 21 A9 9 0 0 1 12 3 M15.5 8.5 L13.5 13.5 L8.5 15.5 L10.5 10.5 Z",
  music: "M9 18 A2.5 2.5 0 0 1 4 18 A2.5 2.5 0 0 1 9 18 V6 L20 4 V15 M20 15 A2.5 2.5 0 0 1 15 15 A2.5 2.5 0 0 1 20 15 M9 9 L20 7",
  fitness: "M3 9 V15 M6 7 V17 M6 12 H18 M18 7 V17 M21 9 V15",
  adventure: "M3 19 H21 L15 7 L11 14 L8.5 10 Z M14 6 A1.4 1.4 0 0 1 14 8.8 A1.4 1.4 0 0 1 14 6",
  innovation: "M9 18 H15 M10 21 H14 M12 3 A6 6 0 0 1 16 13.5 C15 14.5 15 16 15 16 H9 C9 16 9 14.5 8 13.5 A6 6 0 0 1 12 3",
  ticket: "M3 7 H21 V10 A2 2 0 0 0 21 14 V17 H3 V14 A2 2 0 0 0 3 10 Z M14 7 V17",
  key: "M14 4 A5 5 0 1 1 9.5 11.5 L4 17 V20 H7 L8.5 18.5 M16 7 L16.5 7",
  edit: "M5 19 H8 L18 9 L15 6 L5 16 Z M13 8 L16 11",
  trash: "M5 7 H19 M9 7 V4 H15 V7 M7 7 L8 20 H16 L17 7",
  download: "M12 4 V15 M7 11 L12 16 L17 11 M5 19 H19",
  upload: "M12 16 V5 M7 10 L12 5 L17 10 M5 19 H19",
  filter: "M4 5 H20 L14 12 V19 L10 17 V12 Z",
  sort: "M7 5 V19 M4 16 L7 19 L10 16 M17 19 V5 M14 8 L17 5 L20 8",
  play: "M7 5 L19 12 L7 19 Z",
  pause: "M8 5 V19 M16 5 V19",
  mail: "M4 6 H20 V18 H4 Z M4 7 L12 13 L20 7",
  globe: "M12 3 A9 9 0 0 1 12 21 A9 9 0 0 1 12 3 M3 12 H21 M12 3 C8 7 8 17 12 21 C16 17 16 7 12 3",
  grid: "M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z",
  menu: "M4 7 H20 M4 12 H20 M4 17 H20",
  more: "M5 12 A0.6 0.6 0 1 0 5.01 12 M12 12 A0.6 0.6 0 1 0 12.01 12 M19 12 A0.6 0.6 0 1 0 19.01 12",
  minus: "M5 12 H19",
  qr: "M4 4 H9 V9 H4 Z M15 4 H20 V9 H15 Z M4 15 H9 V20 H4 Z M15 15 H17 V17 H15 Z M19 15 V17 M15 19 H17 M19 19 V20",
  bag: "M6 8 H18 L17 20 H7 Z M9 8 V6.5 A3 3 0 0 1 15 6.5 V8",
  filledcheck: "M12 3 A9 9 0 0 1 12 21 A9 9 0 0 1 12 3 M8 12 L11 15 L16 9",
  /* ── fitness / activity ── */
  dumbbell: "M3 9 V15 M6 7 V17 M6 12 H18 M18 7 V17 M21 9 V15",
  flame: "M12 21 C7.5 21 5 18 5 14 C5 10 8 8 8 5 C11 7 11 9 11 10 C12 8 13 7 13 4 C16 6 19 9 19 14 C19 18 16.5 21 12 21 Z",
  pulse: "M3 12 H7 L9 6 L13 18 L15 12 H21",
  target: "M12 4 A8 8 0 0 1 12 20 A8 8 0 0 1 12 4 M12 8 A4 4 0 0 1 12 16 A4 4 0 0 1 12 8 M12 11.4 A0.6 0.6 0 1 0 12.01 11.4",
  bolt: "M13 3 L5 13 H11 L10 21 L19 10 H12 Z",
  trophy: "M7 4 H17 V9 A5 5 0 0 1 7 9 Z M7 6 H4 V7 A3 3 0 0 0 7 10 M17 6 H20 V7 A3 3 0 0 1 17 10 M12 14 V18 M8 20 H16 M10 18 H14",
  leaf: "M5 19 C5 11 11 5 19 5 C19 13 13 19 5 19 Z M9 15 L16 8",
  /* ── social / community ── */
  users: "M8 7 A3 3 0 0 1 8 13 A3 3 0 0 1 8 7 M2.5 20 C2.5 16 5 14.5 8 14.5 C11 14.5 13.5 16 13.5 20 M16 8 A2.5 2.5 0 0 0 16 13 M17 14.6 C19.5 15 21.5 16.5 21.5 20",
  send: "M4 12 L20 4 L14 20 L11 13 Z M11 13 L4 12",
  star: "M12 3 L14.6 9 L21 9.6 L16 14 L17.6 20.5 L12 17 L6.4 20.5 L8 14 L3 9.6 L9.4 9 Z",
  bookmark: "M6 4 H18 V21 L12 16 L6 21 Z",
  gift: "M4 9 H20 V12 H4 Z M5 12 H19 V20 H5 Z M12 9 V20 M12 9 C12 9 9 9 8 7 A2 2 0 0 1 12 6 A2 2 0 0 1 16 7 C15 9 12 9 12 9",
  thumbsup: "M7 10 L11 3 C13 3 13 5 12.5 7 L12 9 H19 A2 2 0 0 1 21 11 L19.5 19 A2 2 0 0 1 17.5 20 H7 M7 10 V20 M7 10 H3 V20 H7",
  /* ── feedback / status ── */
  info: "M12 4 A8 8 0 0 1 12 20 A8 8 0 0 1 12 4 M12 7 V7.5 M12 11 V16.5",
  warning: "M12 3 L22 20 H2 Z M12 9 V14 M12 17 V17.5",
  eye: "M2 12 C5 6 9 5 12 5 C15 5 19 6 22 12 C19 18 15 19 12 19 C9 19 5 18 2 12 Z M12 9 A3 3 0 0 1 12 15 A3 3 0 0 1 12 9",
  eyeoff: "M4 5 L20 19 M9 9 A3 3 0 0 0 12 15 M2 12 C4 8.5 6 7 7.5 6.2 M15 7 C18 8.5 20.5 11 22 12 C20.5 14 19 15.5 17 16.5",
  /* ── media / AR ── */
  camera: "M3 7 H7 L9 4 H15 L17 7 H21 V19 H3 Z M12 10 A3.5 3.5 0 0 1 12 17 A3.5 3.5 0 0 1 12 10",
  video: "M3 7 H15 V17 H3 Z M15 11 L21 8 V16 L15 13",
  scan: "M4 8 V4 H8 M16 4 H20 V8 M20 16 V20 H16 M8 20 H4 V16 M4 12 H20",
  mic: "M12 4 A2.5 2.5 0 0 1 14.5 6.5 V11 A2.5 2.5 0 0 1 9.5 11 V6.5 A2.5 2.5 0 0 1 12 4 M6 11 A6 6 0 0 0 18 11 M12 17 V20 M9 20 H15",
  volume: "M4 9 H7 L12 5 V19 L7 15 H4 Z M16 9 A4 4 0 0 1 16 15",
  /* ── game / territory ── */
  shield: "M12 3 L20 6 V11 C20 16 16 19.5 12 21 C8 19.5 4 16 4 11 V6 Z",
  flag: "M6 3 V21 M6 4 H17 L14.5 8 L17 12 H6",
  crown: "M4 8 L7 13 L12 6 L17 13 L20 8 L18 19 H6 Z",
  /* ── system / utility ── */
  refresh: "M19 8 A8 8 0 1 0 20 14 M19 8 V4 M19 8 H15",
  link: "M9 15 L15 9 M10 7 L12 5 A3.5 3.5 0 0 1 17 10 L15 12 M14 17 L12 19 A3.5 3.5 0 0 1 7 14 L9 12",
  copy: "M8 8 H20 V20 H8 Z M5 16 H4 V4 H16 V5",
  phone: "M6 3 H10 L12 8 L9 10 C10 13 11 14 14 15 L16 12 L21 14 V18 A2 2 0 0 1 19 20 C11 20 4 13 4 5 A2 2 0 0 1 6 3",
  location: "M21 3 L3 10 L11 13 L14 21 Z",
  chart: "M4 4 V20 H20 M8 16 V12 M12 16 V8 M16 16 V10",
  expand: "M4 9 V4 H9 M20 9 V4 H15 M4 15 V20 H9 M20 15 V20 H15",
  dollar: "M12 3 V21 M16 7 C16 5 14 4 12 4 C10 4 8 5 8 7.5 C8 10 10 11 12 11 C14 11 16 12 16 14.5 C16 17 14 18 12 18 C10 18 8 17 8 15",
};
const ICON_SIZES = { sm: 18, md: 24, lg: 32 };

/**
 * OXIcon — a self-contained OX line icon (~80 in the set). Line only, 1.5
 * stroke, currentColor, no fill. Wayfinding only.
 */
export function OXIcon({ name, size = "md", title, style, ...rest }) {
  const px = typeof size === "number" ? size : (ICON_SIZES[size] || 24);
  const d = OX_ICON_PATHS[name] || "";
  return (
    <svg
      className="ox-ic"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      style={style}
      {...rest}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}

/** OXAvatar — pill monogram (Oxide ground). `src` overrides the initial. */
export function OXAvatar({ initial, src, size = 40, style, ...rest }) {
  return (
    <span className="ox-avatar" style={{ width: size, height: size, fontSize: size * 0.45, ...style }} {...rest}>
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
    </span>
  );
}

/** OXListRow — app nav row: bordered code/icon square, serif title + sub, trail. */
export function OXListRow({ icon, title, sub, trail, chevron = false, href, onClick, style, ...rest }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag className="ox-listrow" href={href} onClick={onClick} style={{ cursor: href || onClick ? "pointer" : undefined, ...style }} {...rest}>
      {icon != null && <span className="ox-listrow__ic">{icon}</span>}
      <div className="ox-listrow__main">
        <div className="ox-listrow__t">{title}</div>
        {sub && <div className="ox-listrow__s">{sub}</div>}
      </div>
      {trail && <span className="ox-listrow__trail">{trail}</span>}
      {chevron && <span className="ox-listrow__chev" />}
    </Tag>
  );
}

/** OXSetting — label/sub + a right-aligned control (you pass the control). */
export function OXSetting({ title, sub, control, style, ...rest }) {
  return (
    <div className="ox-setting" style={style} {...rest}>
      <div>
        <div className="ox-setting__t">{title}</div>
        {sub && <div className="ox-setting__s">{sub}</div>}
      </div>
      {control}
    </div>
  );
}

/** OXBreadcrumbs — mono caps trail; last entry is current. */
export function OXBreadcrumbs({ trail, style, ...rest }) {
  return (
    <nav className="ox-crumbs" style={style} {...rest}>
      {trail.map((t, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="ox-crumbs__sep">/</span>}
          {i === trail.length - 1 ? (
            <span className="ox-crumbs__here">{t.label}</span>
          ) : (
            <a href={t.href || "#"}>{t.label}</a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/** OXSiteHeader — desktop web header: brand slot + mono nav + optional CTA. */
export function OXSiteHeader({ brand, nav, cta, style, ...rest }) {
  return (
    <header className="ox-siteheader" style={style} {...rest}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>{brand}</div>
      <nav className="ox-siteheader__nav">
        {nav.map((n, i) => (
          <a key={i} href={n.href} className={n.active ? "is-active" : ""}>{n.label}</a>
        ))}
        {cta}
      </nav>
    </header>
  );
}

/** OXSiteFooter — desktop footer column links (on Ink via .ox-on-ink). */
export function OXSiteFooter({ columns, style, ...rest }) {
  return (
    <footer className="ox-sitefooter" style={style} {...rest}>
      {columns.map((c, i) => (
        <div className="ox-sitefooter__col" key={i}>
          <h4>— {c.heading}</h4>
          {c.links.map((l, j) => (
            <a key={j} href={l.href}>{l.label}</a>
          ))}
        </div>
      ))}
    </footer>
  );
}

/** OXPagination — numbered pager (Ink active). */
export function OXPagination({ page, pageCount, total, onPage, style, ...rest }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div className="ox-pagination" style={style} {...rest}>
      {total != null && <span className="ox-pagination__meta">{total} records</span>}
      <div className="ox-pagination__nav">
        <button className="ox-pagination__btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
        {pages.map((p) => (
          <button key={p} className={"ox-pagination__btn" + (p === page ? " is-active" : "")} onClick={() => onPage(p)}>{p}</button>
        ))}
        <button className="ox-pagination__btn" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  );
}
