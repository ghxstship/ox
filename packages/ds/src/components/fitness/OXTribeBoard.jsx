import React from "react";

/**
 * OXTribeBoard — ranked tribe leaderboard. rows: [{rank, name, xp, initial,
 * me?}]. The "me" row is highlighted copper. Community + accountability.
 */
export function OXTribeBoard({ rows, unit = "XP", style, ...rest }) {
  return (
    <div className="ox-board" style={style} {...rest}>
      {rows.map((r, i) => (
        <div className={"ox-trow" + (r.me ? " me" : "")} key={i}>
          <span className="ox-trow__r">{r.rank}</span>
          <span className="ox-trow__av">{r.initial || (r.name || "?").charAt(0)}</span>
          <span className="ox-trow__n">{r.name}</span>
          <span className="ox-trow__xp">{typeof r.xp === "number" ? r.xp.toLocaleString() : r.xp}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * OXClassRow — a bookable class on a floor (TeamUp-style). Time, title, coach,
 * spots; `status`: open | filling | full | booked.
 */
export function OXClassRow({ time, title, coach, floor, spots, status = "open", onBook, style, ...rest }) {
  const label = { open: "Book", filling: "Few left", full: "Waitlist", booked: "Booked" }[status];
  return (
    <div className={"ox-class is-" + status} style={style} {...rest}>
      <div className="ox-class__time">{time}</div>
      <div className="ox-class__main">
        <div className="ox-class__title">{title}</div>
        <div className="ox-class__meta">{coach}{floor ? " · " + floor : ""}{spots != null ? " · " + spots + " spots" : ""}</div>
      </div>
      <button className="ox-class__cta" onClick={onBook} disabled={status === "booked"}>{label}</button>
    </div>
  );
}

/**
 * OXBookingCard — a confirmed booking / pass, styled as a premium ticket
 * stub (Dice / TIXR register): status strip + code, big serif title, then
 * scannable time + place lines. `where` accepts "Venue — Locality" and is
 * split automatically (no raw em-dash on screen); or pass `locality` directly.
 */
export function OXBookingCard({ title, when, where, locality, status = "Confirmed", code, style, ...rest }) {
  let venue = where, loc = locality;
  if (!loc && typeof where === "string") {
    const parts = where.split(/\s+[—–·|]\s+/);
    if (parts.length > 1) { venue = parts[0]; loc = parts.slice(1).join(" · "); }
  }
  return (
    <div className="ox-booking" style={style} {...rest}>
      <div className="ox-booking__head">
        <span className="ox-booking__status"><i className="ox-booking__mark" />{status}</span>
        {code && <span className="ox-booking__code">{code}</span>}
      </div>
      <div className="ox-booking__title">{title}</div>
      <div className="ox-booking__rail">
        <div className="ox-booking__line">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
          <span className="ox-booking__when">{when}</span>
        </div>
        <div className="ox-booking__line">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
          <span className="ox-booking__place">
            <span className="ox-booking__venue">{venue}</span>
            {loc && <span className="ox-booking__loc">{loc}</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * OXCoachCard — a coach profile card. Avatar monogram, name, specialty,
 * rating/sessions, optional CTA.
 */
export function OXCoachCard({ name, specialty, meta, initial, action, onClick, style, ...rest }) {
  return (
    <div className="ox-coach" onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined, ...style }} {...rest}>
      <span className="ox-coach__av">{initial || (name || "?").charAt(0)}</span>
      <div className="ox-coach__main">
        <div className="ox-coach__n">{name}</div>
        {specialty && <div className="ox-coach__sp">{specialty}</div>}
        {meta && <div className="ox-coach__meta">{meta}</div>}
      </div>
      {action && <span className="ox-coach__cta">{action}</span>}
    </div>
  );
}

/**
 * OXEventCard — a SweatPals-style meetup / Clubhouse social. Day tag, title
 * (<em>), host, attendees, RSVP. `soft` marks a soft-clubbing (sober) event.
 */
export function OXEventCard({ day, title, host, attendees, soft = false, status = "open", onRsvp, style, ...rest }) {
  return (
    <div className={"ox-event" + (soft ? " ox-event--soft" : "")} style={style} {...rest}>
      <div className="ox-event__head">
        <span className="ox-event__day">{day}</span>
        {soft && <span className="ox-event__tag">Clubhouse · sober</span>}
      </div>
      <div className="ox-event__title">{title}</div>
      <div className="ox-event__foot">
        <span className="ox-event__host">{host}{attendees != null ? " · " + attendees + " going" : ""}</span>
        <button className="ox-event__cta" onClick={onRsvp}>{status === "going" ? "Going ✓" : "RSVP"}</button>
      </div>
    </div>
  );
}

/**
 * OXRaidCard — a group tribe session (GoFest "raid"). Scheduled, capacity,
 * reward XP. The communal, high-stakes training beat.
 */
export function OXRaidCard({ title, when, floor, filled, capacity, rewardXp, onJoin, style, ...rest }) {
  const full = filled >= capacity;
  return (
    <div className="ox-raid" style={style} {...rest}>
      <div className="ox-raid__head">
        <span className="ox-raid__k">— Raid</span>
        {rewardXp != null && <span className="ox-raid__xp">+{rewardXp} XP</span>}
      </div>
      <div className="ox-raid__title">{title}</div>
      <div className="ox-raid__meta">{when}{floor ? " · " + floor : ""}</div>
      <div className="ox-raid__foot">
        <span className="ox-raid__cap"><em>{filled}</em> / {capacity} in</span>
        <button className="ox-raid__cta" onClick={onJoin} disabled={full}>{full ? "Full" : "Join raid"}</button>
      </div>
    </div>
  );
}

/** OXCheckIn — the floor check-in confirmation (QR/geo). Big mono code + floor. */
export function OXCheckIn({ floor, code, xp, style, ...rest }) {
  return (
    <div className="ox-checkin" style={style} {...rest}>
      <div className="ox-checkin__qr">{code || "QR"}</div>
      <div className="ox-checkin__floor">{floor}</div>
      {xp != null && <div className="ox-checkin__xp">+{xp} XP · new floor</div>}
    </div>
  );
}

/**
 * OXHerdThat — the OX reaction / co-sign control ("Herd that" — heard that).
 * The social-stamp on feed posts, raid completions, PRs, and challenge co-signs:
 * the brand's like/cheer. Controlled via `active` + `onToggle`, or uncontrolled
 * (manages its own state). `count` shows how many of the herd co-signed.
 * `size`: sm | md. `withAvatars`: pass `[{initial}]` to stack who herded.
 */
export function OXHerdThat({
  active: activeProp, count = 0, onToggle, size = "md",
  withAvatars, label = "Herd that", style, ...rest
}) {
  const [selfOn, setSelfOn] = React.useState(false);
  const controlled = activeProp != null;
  const active = controlled ? activeProp : selfOn;
  const shown = count + (!controlled && selfOn ? 1 : 0);
  const handle = () => { if (!controlled) setSelfOn((v) => !v); onToggle && onToggle(!active); };
  return (
    <button
      type="button"
      className={"ox-herd is-" + size + (active ? " is-on" : "")}
      aria-pressed={active}
      onClick={handle}
      style={style}
      {...rest}
    >
      <span className={"ox-herd__mark" + (active ? " ox-flash-on" : "")} aria-hidden="true">OX</span>
      <span className="ox-herd__label">{active ? "Herded" : label}</span>
      {withAvatars && withAvatars.length > 0 && (
        <span className="ox-herd__avs" aria-hidden="true">
          {withAvatars.slice(0, 3).map((a, i) => (
            <span className="ox-herd__av" key={i}>{a.initial || "•"}</span>
          ))}
        </span>
      )}
      {shown > 0 && <span className={"ox-herd__count" + (active ? " ox-tick-on" : "")} key={shown}>{shown.toLocaleString()}</span>}
    </button>
  );
}
