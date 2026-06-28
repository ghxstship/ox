import React from "react";

/** OXOTP — code-entry cells; the cell at index = value.length is active. */
export function OXOTP({ length, value = "", style, ...rest }) {
  return (
    <div className="ox-otp" style={style} {...rest}>
      {Array.from({ length }).map((_, i) => (
        <div key={i} className={"ox-otp__cell" + (i === value.length ? " is-active" : "")}>
          {value[i] || ""}
        </div>
      ))}
    </div>
  );
}

/** OXStepper — bordered −/value/+ stepper (44px hits). */
export function OXStepper({ value, min = 0, max = 99, onChange, style, ...rest }) {
  return (
    <div className="ox-stepper" style={style} {...rest}>
      <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <div className="ox-stepper__v">{value}</div>
      <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

/** OXNotif — notification row; `unread` tints the row Oxide. <b> = serif italic. */
export function OXNotif({ body, time, unread = false, style, ...rest }) {
  return (
    <div className={"ox-notif" + (unread ? " is-unread" : "")} style={style} {...rest}>
      {unread && <span className="ox-notif__dot" />}
      <div className="ox-notif__body">
        {body}
        <div className="ox-notif__time">{time}</div>
      </div>
    </div>
  );
}

/** OXMessage — chat bubble (in = raised, out = Ink). */
export function OXMessage({ direction = "in", text, time, style, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: direction === "out" ? "flex-end" : "flex-start" }}>
      <div className={"ox-msg ox-msg--" + direction} style={style} {...rest}>{text}</div>
      {time && <div className="ox-msg__time">{time}</div>}
    </div>
  );
}

/** OXComposer — message composer: input + Oxide send button. */
export function OXComposer({ placeholder = "Message…", value, onChange, onSend, style, ...rest }) {
  return (
    <div className="ox-composer" style={style} {...rest}>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && onSend) onSend(e.target.value); }}
      />
      <button onClick={() => onSend && onSend(value)}>→</button>
    </div>
  );
}

/** OXTxRow — wallet ledger row; `incoming` colors the amount Oxide. */
export function OXTxRow({ title, sub, amount, incoming = false, style, ...rest }) {
  return (
    <div className="ox-txrow" style={style} {...rest}>
      <div>
        <div className="ox-txrow__t">{title}</div>
        {sub && <div className="ox-txrow__s">{sub}</div>}
      </div>
      <span className={"ox-txrow__v" + (incoming ? " is-in" : "")}>{amount}</span>
    </div>
  );
}

/** OXMintState — mint progress: spinner ring → check on done. */
export function OXMintState({ status = "pending", title, sub, style, ...rest }) {
  return (
    <div className="ox-mintstate" style={style} {...rest}>
      <div className={"ox-mintstate__ring" + (status === "done" ? " is-done" : "")}>
        {status === "done" ? "✓" : ""}
      </div>
      <div className="ox-mintstate__t">{title}</div>
      {sub && <div className="ox-empty__s">{sub}</div>}
    </div>
  );
}

/** OXAvatarStack — overlapping monogram avatars. */
export function OXAvatarStack({ initials, max = 4, style, ...rest }) {
  const shown = initials.slice(0, max);
  const extra = initials.length - shown.length;
  return (
    <div className="ox-avatars" style={style} {...rest}>
      {shown.map((c, i) => <span key={i} className="ox-avatar">{c}</span>)}
      {extra > 0 && <span className="ox-avatar" style={{ background: "var(--ox-stone)" }}>+{extra}</span>}
    </div>
  );
}

/** OXAppBanner — app-top banner (Ink, Oxide rule) — e.g. mint window. */
export function OXAppBanner({ label, trail, onClick, style, ...rest }) {
  return (
    <div className="ox-appbanner" onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined, ...style }} {...rest}>
      <span className="ox-appbanner__t">{label}</span>
      {trail && <span style={{ fontFamily: "var(--ox-font-mono)", fontSize: 9, letterSpacing: "0.14em", color: "var(--ox-oxide-bright)" }}>{trail}</span>}
    </div>
  );
}

/** OXSkeleton — shimmer placeholder block. */
export function OXSkeleton({ height = 16, width = "100%", style, ...rest }) {
  return <div className="ox-skel" style={{ height, width, ...style }} {...rest} />;
}

/** OXOnboardSlide — onboarding slide scaffold with progress dots. */
export function OXOnboardSlide({ index, total, kicker, title, body, action, style, ...rest }) {
  return (
    <div className="ox-onb" style={style} {...rest}>
      <div style={{ textAlign: "right" }}><span className="ox-meta">Skip</span></div>
      <div style={{ margin: "auto 0" }}>
        <div className="ox-meta ox-meta--oxide">— {String(index).padStart(2, "0")} · {kicker}</div>
        <div style={{ fontFamily: "var(--ox-font-serif)", fontSize: 48, lineHeight: 0.9, marginTop: 12 }}>{title}</div>
        {body && <p className="ox-body" style={{ marginTop: 16, color: "var(--ox-text-muted)" }}>{body}</p>}
      </div>
      <div>
        <div className="ox-onb__dots" style={{ marginBottom: 20 }}>
          {Array.from({ length: total }).map((_, i) => <span key={i} className={i === index - 1 ? "is-on" : ""} />)}
        </div>
        {action}
      </div>
    </div>
  );
}
