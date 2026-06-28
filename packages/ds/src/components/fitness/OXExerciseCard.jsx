import React from "react";

/**
 * OXExerciseCard — the unit of discovery. A move + the equipment it needs +
 * "N floors near you". `index` numbers it in a day's stack.
 */
export function OXExerciseCard({ index, name, equipment, floors, muscles, onFind, style, ...rest }) {
  return (
    <div className="ox-ex" onClick={onFind} style={{ cursor: onFind ? "pointer" : undefined, ...style }} {...rest}>
      {index != null && <span className="ox-ex__n">{index}</span>}
      <div className="ox-ex__main">
        <div className="ox-ex__name">{name}</div>
        {equipment && <div className="ox-ex__eq">{equipment}</div>}
        {muscles && <div className="ox-ex__mu">{muscles}</div>}
      </div>
      {floors != null && <span className="ox-ex__find">{floors} floors →</span>}
    </div>
  );
}

/**
 * OXFloorMatch — a gym ("floor") that can host the move. Distance, name, why
 * (equipment match + scenery tag), optional new-floor XP flag.
 */
export function OXFloorMatch({ distance, name, has, scenery, xp, isHome = false, onClick, style, ...rest }) {
  return (
    <div className="ox-floor" onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined, ...style }} {...rest}>
      <span className="ox-floor__d">{distance}</span>
      <div className="ox-floor__m">
        <div className="ox-floor__n">{name}</div>
        <div className="ox-floor__sc">
          {has}{scenery && <> · <b>{scenery}</b></>}{isHome && " · your home floor"}
        </div>
      </div>
      {xp != null && <span className="ox-floor__x">New · +{xp}</span>}
    </div>
  );
}

/**
 * OXSceneryPicker — "change your perspective". Same move, filter floors by
 * environment. Controlled via `value`/`onChange`.
 */
export function OXSceneryPicker({ options, value, onChange, title, sub, style, ...rest }) {
  return (
    <div className="ox-scenery" style={style} {...rest}>
      {title && <div className="ox-scenery__t">{title}</div>}
      {sub && <div className="ox-scenery__s">{sub}</div>}
      <div className="ox-scenery__row">
        {options.map((o) => (
          <button
            key={o}
            className={"ox-env" + (o === value ? " on" : "")}
            onClick={() => onChange && onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/** OXSetRow — one logged set: index, weight × reps, RPE, done state. */
export function OXSetRow({ index, weight, reps, rpe, done = false, onToggle, style, ...rest }) {
  return (
    <div className={"ox-set" + (done ? " is-done" : "")} style={style} {...rest}>
      <span className="ox-set__n">{index}</span>
      <span className="ox-set__wr"><em>{weight}</em> {weight ? "lb" : ""} × {reps}</span>
      {rpe != null && <span className="ox-set__rpe">RPE {rpe}</span>}
      <button className="ox-set__chk" aria-pressed={done} onClick={onToggle}>{done ? "✓" : ""}</button>
    </div>
  );
}

/**
 * OXMetricRing — effort / recovery dial. `value` 0–100 fills copper; center
 * shows value + label, with optional side metrics.
 */
export function OXMetricRing({ value, label, size = 132, metrics = [], style, ...rest }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  const c = size / 2;
  return (
    <div className="ox-ring-wrap" style={style} {...rest}>
      <div className="ox-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--ox-paper-warm)" strokeWidth="10" />
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--ox-oxide)" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={off} />
        </svg>
        <div className="ox-ring__c">
          <span className="ox-ring__n">{value}</span>
          {label && <span className="ox-ring__l">{label}</span>}
        </div>
      </div>
      {metrics.length > 0 && (
        <div className="ox-ring-meta">
          {metrics.map((m, i) => (
            <div key={i}><div className="k">{m.label}</div><div className="v">{m.value}</div></div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * OXZoneBar — time-in-zone. zones: [{label, value, zone:1-5}]. Fill color is
 * the tonal copper→stone zone step (var(--ox-zone-N)). Wayfinding by position.
 */
export function OXZoneBar({ zones, style, ...rest }) {
  const max = Math.max(...zones.map((z) => z.value), 1);
  return (
    <div className="ox-zones" style={style} {...rest}>
      {zones.map((z, i) => (
        <div className="ox-zrow" key={i}>
          <span className="ox-zlab">{z.label}</span>
          <div className="ox-ztrack"><span className="ox-zfill" style={{ width: (z.value / max) * 100 + "%", background: `var(--ox-zone-${z.zone})` }} /></div>
          <span className="ox-zval">{z.display != null ? z.display : z.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * OXRecoveryMap — readiness as a labeled list of body regions, each tinted by
 * recovery intensity (fresh → spent). Honest, not a literal anatomy SVG.
 * regions: [{ name, state: "fresh"|"light"|"worked"|"spent" }].
 */
export function OXRecoveryMap({ regions, style, ...rest }) {
  return (
    <div className="ox-recovery" style={style} {...rest}>
      {regions.map((r, i) => (
        <div className="ox-recovery__r" key={i}>
          <span className="ox-recovery__dot" style={{ background: `var(--ox-recovery-${r.state})` }} />
          <span className="ox-recovery__n">{r.name}</span>
          <span className="ox-recovery__s">{r.state}</span>
        </div>
      ))}
    </div>
  );
}

/** OXRestTimer — between-set countdown. `seconds` remaining of `total`. */
export function OXRestTimer({ seconds, total = 90, running = true, onSkip, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div className="ox-rest" style={style} {...rest}>
      <div className="ox-rest__top">
        <span className="ox-rest__l">Rest</span>
        <span className="ox-rest__t">{mm}:{ss}</span>
        {onSkip && <button className="ox-rest__skip" onClick={onSkip}>Skip →</button>}
      </div>
      <div className="ox-rest__track"><span className="ox-rest__fill" style={{ width: pct + "%" }} /></div>
    </div>
  );
}

/**
 * OXExercisePlayer — step-by-step follow-along (Gymshark/Fitbod parity). The
 * exercise's demo frame (drop an <image-slot>/<video> as children), a built-in
 * set timer, current set of total, and cue text. `phase`: "work" | "rest".
 * Slot media via children; the chrome (timer, cues, controls) is the component.
 */
export function OXExercisePlayer({
  name, setIndex = 1, setTotal = 4, target, cue, phase = "work",
  timer, onPrev, onNext, onLog, children, style, ...rest
}) {
  return (
    <div className={"ox-player is-" + phase} style={style} {...rest}>
      <div className="ox-player__stage">
        {children || <span className="ox-player__ph">▶ demo</span>}
        {timer && <span className="ox-player__timer">{timer}</span>}
      </div>
      <div className="ox-player__bar">
        <span className="ox-player__set">Set {setIndex} / {setTotal}</span>
        <span className="ox-player__name">{name}</span>
        {target && <span className="ox-player__target">{target}</span>}
      </div>
      {cue && <div className="ox-player__cue">{cue}</div>}
      <div className="ox-player__ctrls">
        <button className="ox-player__nav" onClick={onPrev} aria-label="Previous">←</button>
        <button className="ox-player__log" onClick={onLog}>Log set</button>
        <button className="ox-player__nav" onClick={onNext} aria-label="Next">→</button>
      </div>
    </div>
  );
}

/**
 * OXFilterBar — the discovery filter (Gymshark "filter by type, duration,
 * equipment, target muscle"). groups: [{key, label, options:[...] }]. Controlled
 * via `value` (a {groupKey: option} map) + `onChange(groupKey, option)`.
 * Renders as horizontally-scrolling chip rows — one row per group.
 */
export function OXFilterBar({ groups, value = {}, onChange, style, ...rest }) {
  return (
    <div className="ox-filters" style={style} {...rest}>
      {groups.map((g) => (
        <div className="ox-filters__row" key={g.key}>
          <span className="ox-filters__lab">{g.label}</span>
          <div className="ox-filters__chips">
            {g.options.map((o) => {
              const on = value[g.key] === o;
              return (
                <button
                  key={o}
                  className={"ox-fchip" + (on ? " on" : "")}
                  aria-pressed={on}
                  onClick={() => onChange && onChange(g.key, on ? null : o)}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * OXPRChip — a personal-record achievement stamp (Strava-style: a record
 * mark block, the new max as hero, and an explicit comparison to your previous
 * best). `lift`, `value`, optional `delta` (auto-strips a leading "+"),
 * `prev` (else inferred from `history`), and a mono sparkline of recent maxes
 * (`history`). `fresh` flags a brand-new PR (copper stamp).
 */
export function OXPRChip({ lift, value, unit = "lb", delta, prev, history, fresh = false, style, ...rest }) {
  let spark = null;
  if (history && history.length > 1) {
    const min = Math.min(...history), max = Math.max(...history), span = max - min || 1;
    const w = 56, h = 18;
    const pts = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - min) / span) * h}`).join(" ");
    spark = <svg className="ox-pr__spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
  }
  let previous = prev;
  if (previous == null && history && history.length > 1) previous = history[history.length - 2];
  const deltaText = delta == null ? null : String(delta).replace(/^\+/, "");
  return (
    <div className={"ox-pr" + (fresh ? " is-fresh" : "")} style={style} {...rest}>
      <div className="ox-pr__mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 20h18" /><path d="M6 20v-5M12 20V9M18 20V4" /></svg>
      </div>
      <div className="ox-pr__body">
        <div className="ox-pr__top">
          <span className="ox-pr__kind">{fresh ? "Personal Record" : "Season Best"}</span>
          <span className="ox-pr__lift">{lift}</span>
        </div>
        <div className="ox-pr__val">
          <em>{value}</em><span className="ox-pr__unit">{unit}</span>
          {deltaText != null && (
            <span className="ox-pr__delta"><svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1.5 9 8.5 1 8.5Z" fill="currentColor" /></svg>{deltaText}</span>
          )}
        </div>
        {(previous != null || spark) && (
          <div className="ox-pr__foot">
            {previous != null ? <span className="ox-pr__prev">Prev {previous} {unit}</span> : <span />}
            {spark}
          </div>
        )}
      </div>
    </div>
  );
}
