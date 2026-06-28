import React from "react";

/**
 * OXLevelBadge — the mono "LV n" chip + optional rank title. The spine of the
 * game layer. Founder/high ranks can invert via `tone="ink"`.
 */
export function OXLevelBadge({ level, rank, tone = "oxide", style, ...rest }) {
  return (
    <span className={"ox-lvl" + (tone === "ink" ? " ox-lvl--ink" : "")} style={style} {...rest}>
      <span className="ox-lvl__b">LV {level}</span>
      {rank && <span className="ox-lvl__r">{rank}</span>}
    </span>
  );
}

/**
 * OXXPBar — progress toward the next level. Copper fill on a warm track, with
 * "current XP" / "to next level" mono meta. `value`/`max` are XP into the level.
 */
export function OXXPBar({ value, max, toNext, compact = false, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={"ox-xpbar" + (compact ? " ox-xpbar--compact" : "")} style={style} {...rest}>
      <div className="ox-xpbar__track"><span className="ox-xpbar__fill" style={{ width: pct + "%" }} /></div>
      {!compact && (
        <div className="ox-xpbar__meta">
          <span>{value.toLocaleString()} XP</span>
          {toNext != null && <span>{toNext.toLocaleString()} to next</span>}
        </div>
      )}
    </div>
  );
}

/** OXStreak — consecutive-day flame count. `active` glows copper. */
export function OXStreak({ days, active = true, style, ...rest }) {
  return (
    <span className={"ox-streak" + (active ? " is-active" : "")} style={style} {...rest}>
      <span className="ox-streak__f">▲</span>
      <span className="ox-streak__n">{days}</span>
      <span className="ox-streak__l">day{days === 1 ? "" : "s"}</span>
    </span>
  );
}

/**
 * OXQuestRow — an objective with progress. Bordered glyph + name + sub, and a
 * current/target in copper. `state`: active | done | locked.
 */
export function OXQuestRow({ glyph, name, sub, current, target, state = "active", onClick, style, ...rest }) {
  const done = state === "done" || (target != null && current >= target);
  const cls = "ox-quest" + (done ? " is-done" : "") + (state === "locked" ? " is-locked" : "");
  return (
    <div className={cls} onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined, ...style }} {...rest}>
      <span className="ox-quest__ic">{done ? "✓" : glyph}</span>
      <div className="ox-quest__main">
        <div className="ox-quest__name">{name}</div>
        {sub && <div className="ox-quest__sub">{sub}</div>}
      </div>
      {target != null && (
        <span className="ox-quest__v"><em>{current}</em> / {target}</span>
      )}
    </div>
  );
}

/**
 * OXChallengeHero — the active-challenge banner (Ink + copper radial). Season,
 * title (<em> for accent), philosophy/sub line, and live status pills.
 */
export function OXChallengeHero({ kicker, title, sub, pills = [], style, ...rest }) {
  return (
    <div className="ox-chero" style={style} {...rest}>
      <div className="ox-chero__bg" aria-hidden="true" />
      <div className="ox-chero__in">
        {kicker && <div className="ox-chero__k">— {kicker}</div>}
        <div className="ox-chero__t">{title}</div>
        {sub && <p className="ox-chero__sub">{sub}</p>}
        {pills.length > 0 && (
          <div className="ox-chero__row">
            {pills.map((p, i) => (
              <span key={i} className={"ox-chero__pill" + (p.on ? " on" : "")}>{p.label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * OXSpeciesBadge — a collectible "species" (equipment) or medal slot. Earned =
 * copper fill + glyph; empty = ruled placeholder. Use in collection grids.
 */
export function OXSpeciesBadge({ glyph, label, earned = false, count, style, ...rest }) {
  return (
    <div className={"ox-species" + (earned ? " is-earned" : "")} style={style} {...rest}>
      <div className="ox-species__slot">{earned ? glyph : ""}{count != null && earned && <span className="ox-species__n">{count}</span>}</div>
      {label && <span className="ox-species__l">{label}</span>}
    </div>
  );
}

/** OXMedal — an achievement medal (earned/locked) with title + date. */
export function OXMedal({ glyph = "◆", title, detail, earned = false, style, ...rest }) {
  return (
    <div className={"ox-medal" + (earned ? " is-earned" : "")} style={style} {...rest}>
      <span className="ox-medal__m">{glyph}</span>
      <div>
        <div className="ox-medal__t">{title}</div>
        {detail && <div className="ox-medal__d">{detail}</div>}
      </div>
    </div>
  );
}
