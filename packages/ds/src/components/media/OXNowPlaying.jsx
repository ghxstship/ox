import React from "react";

/* ═══════════════════════════════════════════════════════════════════
 * OX — Media pairing components. Workout programs paired with playlists;
 * one song per workout; playback via a connected streaming service.
 * One-accent rule holds: Oxide is the only color; services are rendered
 * as neutral OX-styled chips (monogram + name), never their real logos.
 * ═══════════════════════════════════════════════════════════════════ */

const SERVICE_MARK = { spotify: "Sp", apple: "Am", soundcloud: "Sc", tidal: "Td" };
const SERVICE_NAME = { spotify: "Spotify", apple: "Apple Music", soundcloud: "SoundCloud", tidal: "Tidal" };

/** OXServiceBadge — neutral chip for a streaming service (no real logos). */
export function OXServiceBadge({ service = "spotify", connected = false, selected = false, label = true, size = "md", onClick, style, ...rest }) {
  const cls = "ox-svc" + (connected ? " ox-svc--on" : "") + (selected ? " ox-svc--sel" : "") + (size === "sm" ? " ox-svc--sm" : "") + (onClick ? " ox-svc--btn" : "");
  const Tag = onClick ? "button" : "span";
  return (
    <Tag className={cls} onClick={onClick} style={style} {...rest}>
      <span className="ox-svc__mark">{SERVICE_MARK[service] || "♪"}</span>
      {label && <span className="ox-svc__name">{SERVICE_NAME[service] || service}</span>}
      {connected && <span className="ox-svc__dot" aria-label="connected" />}
    </Tag>
  );
}

/** OXCurationBadge — Signature (team) · Featured (co-curated) · Community. */
export function OXCurationBadge({ tier = "community", style, ...rest }) {
  const glyph = tier === "signature" ? "◆" : tier === "featured" ? "✦" : "◇";
  const text = tier === "signature" ? "Signature" : tier === "featured" ? "Featured" : "Community";
  return (
    <span className={"ox-curate ox-curate--" + tier} style={style} {...rest}>
      <span className="ox-curate__g">{glyph}</span>{text}
    </span>
  );
}

/** OXUpvote — upvote toggle with count (the community signal). */
export function OXUpvote({ count = 0, on = false, onToggle, size = "md", style, ...rest }) {
  return (
    <button className={"ox-up" + (on ? " ox-up--on" : "") + (size === "sm" ? " ox-up--sm" : "")} onClick={onToggle} aria-pressed={on} aria-label="Upvote" style={style} {...rest}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5 L20 15 H4 Z" /></svg>
      <b>{count}</b>
    </button>
  );
}

/** OXSongRow — one workout ↔ one song, with the per-workout swap control. */
export function OXSongRow({ index, art, title, artist, dur, bpm, workout, playing = false, locked = false, onSwap, onPlay, style, ...rest }) {
  return (
    <div className={"ox-song" + (playing ? " ox-song--playing" : "")} style={style} {...rest}>
      <button className="ox-song__art" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>
        <span className="ox-song__artmono">{art || (title || "?")[0]}</span>
        <span className="ox-song__play">{playing ? "❙❙" : "▶"}</span>
      </button>
      <div className="ox-song__b">
        {workout && <div className="ox-song__for">{typeof index === "number" ? index + " · " : ""}{workout}</div>}
        <div className="ox-song__t">{title}</div>
        <div className="ox-song__meta">{artist}{bpm ? " · " + bpm + " BPM" : ""}{dur ? " · " + dur : ""}</div>
      </div>
      {onSwap && (
        <button className="ox-song__swap" onClick={onSwap} aria-label="Swap song" disabled={locked}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 9 V7 H17 M17 4 L20 7 L17 10 M19 15 V17 H7 M7 20 L4 17 L7 14" /></svg>
          <span>Swap</span>
        </button>
      )}
    </div>
  );
}

/** OXNowPlaying — the now-playing surface, bound to the CURRENT workout. */
export function OXNowPlaying({ art, title, artist, forWorkout, service = "spotify", progress = 0, elapsed = "0:00", dur = "0:00", playing = true, compact = false, onPlay, onPrev, onNext, style, ...rest }) {
  if (compact) {
    return (
      <div className="ox-np ox-np--compact" style={style} {...rest}>
        <span className="ox-np__art ox-np__art--sm">{art || (title || "?")[0]}</span>
        <div className="ox-np__cb">
          <div className="ox-np__for">Now powering · {forWorkout}</div>
          <div className="ox-np__title">{title}</div>
        </div>
        <button className="ox-np__btn ox-np__play" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "❙❙" : "▶"}</button>
      </div>
    );
  }
  return (
    <div className="ox-np" style={style} {...rest}>
      <div className="ox-np__art">{art || (title || "?")[0]}<span className="ox-np__svc"><OXServiceBadge service={service} label={false} size="sm" /></span></div>
      <div className="ox-np__for">Now powering · <b>{forWorkout}</b></div>
      <div className="ox-np__title">{title}</div>
      <div className="ox-np__artist">{artist}</div>
      <div className="ox-np__bar"><span className="ox-np__fill" style={{ width: Math.max(0, Math.min(100, progress)) + "%" }} /></div>
      <div className="ox-np__time"><span>{elapsed}</span><span>{dur}</span></div>
      <div className="ox-np__transport">
        <button className="ox-np__btn" onClick={onPrev} aria-label="Previous">◀◀</button>
        <button className="ox-np__btn ox-np__play" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "❙❙" : "▶"}</button>
        <button className="ox-np__btn" onClick={onNext} aria-label="Next">▶▶</button>
      </div>
    </div>
  );
}

/** OXPairingCard — a published program+playlist pairing for discovery. */
export function OXPairingCard({ name, author, tier = "community", service = "spotify", tracks, duration, upvotes = 0, upvoted = false, cover, promoted = false, onUpvote, onOpen, style, ...rest }) {
  return (
    <div className={"ox-pair" + (promoted ? " ox-pair--promoted" : "")} style={style} {...rest}>
      <button className="ox-pair__cover" onClick={onOpen} aria-label={"Open " + name}>
        <span className="ox-pair__covermono">{cover || (name || "?")[0]}</span>
        <span className="ox-pair__tier"><OXCurationBadge tier={tier} /></span>
        {promoted && <span className="ox-pair__promo">Trending</span>}
      </button>
      <div className="ox-pair__body">
        <div className="ox-pair__name" onClick={onOpen}>{name}</div>
        <div className="ox-pair__meta">{author ? "by " + author + " · " : ""}{tracks ? tracks + " tracks" : ""}{duration ? " · " + duration : ""}</div>
        <div className="ox-pair__foot">
          <OXServiceBadge service={service} label size="sm" />
          <OXUpvote count={upvotes} on={upvoted} onToggle={onUpvote} size="sm" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── IMMERSIVE LAYER ─────────────────────────
 * Music made native to the training structure, not a parallel stream.
 * ─────────────────────────────────────────────────────────────────── */

// Deterministic energy waveform (so it's stable across renders).
function waveBars(seed, energy, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const s = Math.sin((i + seed) * 0.9) * 0.5 + Math.sin((i + seed) * 2.3) * 0.3;
    out.push(Math.max(0.18, Math.min(1, 0.45 + s * 0.4 + (energy - 3) * 0.1)));
  }
  return out;
}

/** OXCadenceMeter — BPM-fit gauge: song tempo vs the move's target cadence. */
export function OXCadenceMeter({ bpm, target, fit, compact = false, dark = false, style, ...rest }) {
  const f = fit || { pct: 0, label: "—", delta: 0, lock: false, halftime: false };
  const cls = "ox-cad" + (compact ? " ox-cad--compact" : "") + (dark ? " ox-cad--dark" : "") + (f.lock ? " ox-cad--lock" : "");
  return (
    <div className={cls} style={style} {...rest}>
      <div className="ox-cad__top">
        <span className="ox-cad__lbl">{f.label}{f.halftime ? " ½" : ""}</span>
        <span className="ox-cad__bpm">{bpm}<i>bpm</i>{target ? " → " + target : ""}</span>
      </div>
      <div className="ox-cad__track"><span className="ox-cad__fill" style={{ width: Math.max(4, Math.min(100, f.pct)) + "%" }} /><span className="ox-cad__mark" /></div>
    </div>
  );
}

/** OXEnergyArc — the playlist's energy curve across the session's moves. */
export function OXEnergyArc({ steps = [], onJump, style, ...rest }) {
  return (
    <div className="ox-arc" style={style} {...rest}>
      <div className="ox-arc__row">
        {steps.map((s, i) => (
          <button key={i} className={"ox-arc__col" + (s.active ? " ox-arc__col--on" : "") + (s.done ? " ox-arc__col--done" : "")}
            onClick={onJump ? () => onJump(i) : undefined} aria-label={s.label} title={s.label}>
            <span className="ox-arc__bar" style={{ height: (18 + (s.zone || 3) * 14) + "px" }} />
          </button>
        ))}
      </div>
      <div className="ox-arc__cap">Energy arc · warmup → work → finish</div>
    </div>
  );
}

/** OXTrackTimer — now-playing fused with the SET timer. Logging a set drives
 *  the music; rest rides the track's breakdown; the last set auto-cues next. */
export function OXTrackTimer({ art, title, artist, forWorkout, service = "spotify", bpm, target, fit,
  set = 1, sets = 4, resting = false, restLeft = 0, restTotal = 45, playing = true,
  onLogSet, onSkipRest, onPlay, onPrev, onNext, style, ...rest }) {
  const bars = waveBars((title || "x").charCodeAt(0), 4, 28);
  const restPct = restTotal ? Math.round((restLeft / restTotal) * 100) : 0;
  return (
    <div className={"ox-tt" + (resting ? " ox-tt--rest" : "")} style={style} {...rest}>
      <div className="ox-tt__head">
        <span className="ox-tt__art">{art || (title || "?")[0]}</span>
        <div className="ox-tt__meta">
          <div className="ox-tt__for">Now powering · <b>{forWorkout}</b></div>
          <div className="ox-tt__title">{title}</div>
          <div className="ox-tt__artist">{artist} · <OXServiceBadge service={service} label={false} size="sm" /></div>
        </div>
      </div>

      <div className="ox-tt__wave" aria-hidden="true">
        {bars.map((h, i) => <span key={i} className="ox-tt__bar" style={{ height: Math.round(h * 100) + "%", opacity: resting ? 0.28 : (i / bars.length < 0.62 ? 1 : 0.5) }} />)}
        {!resting && <span className="ox-tt__drop" style={{ left: "62%" }}><i>drop</i></span>}
      </div>

      <div className="ox-tt__sets" aria-label={"Set " + set + " of " + sets}>
        {Array.from({ length: sets }).map((_, i) => <span key={i} className={"ox-tt__dot" + (i < set ? " ox-tt__dot--done" : "") + (i === set - 1 && !resting ? " ox-tt__dot--now" : "")} />)}
        <span className="ox-tt__setn">{Math.min(set, sets)}/{sets}</span>
      </div>

      {resting ? (
        <div className="ox-tt__rest">
          <div className="ox-tt__restbar"><span className="ox-tt__restfill" style={{ width: restPct + "%" }} /></div>
          <div className="ox-tt__restrow">
            <span className="ox-tt__restlabel">Rest · breakdown</span>
            <span className="ox-tt__restclock">{Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, "0")}</span>
            <button className="ox-tt__skip" onClick={onSkipRest}>Skip ▸</button>
          </div>
        </div>
      ) : (
        <button className="ox-tt__log" onClick={onLogSet}>
          {set >= sets ? "Finish move · next track ▸" : "Log set " + set + " · " + sets}
        </button>
      )}

      <div className="ox-tt__foot">
        {fit && <OXCadenceMeter bpm={bpm} target={target} fit={fit} dark compact />}
        <div className="ox-tt__transport">
          <button className="ox-np__btn" onClick={onPrev} aria-label="Previous move">◀◀</button>
          <button className="ox-np__btn ox-np__play" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "❙❙" : "▶"}</button>
          <button className="ox-np__btn" onClick={onNext} aria-label="Next move">▶▶</button>
        </div>
      </div>
    </div>
  );
}

/** OXRaidRoom — synced group session: the herd locked to ONE track in
 *  real time. A live "drop" countdown pulses every member at once. */
export function OXRaidRoom({ title, floor, host, going = 0, members = [], art, songTitle, artist, bpm, forWorkout,
  service = "spotify", live = true, playing = true, onLeave, onPlay, onPrev, onNext, style, ...rest }) {
  const [drop, setDrop] = React.useState(12);
  const [hit, setHit] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setDrop((d) => {
        if (d <= 1) { setHit(true); setTimeout(() => setHit(false), 900); return 16; }
        return d - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);
  return (
    <div className={"ox-raid" + (hit ? " ox-raid--hit" : "")} style={style} {...rest}>
      <div className="ox-raid__top">
        <span className={"ox-raid__live" + (live ? " is-live" : "")}>{live ? "● LIVE" : "○ STARTS SOON"}</span>
        <span className="ox-raid__going">{going} in the herd</span>
        {onLeave && <button className="ox-raid__leave" onClick={onLeave}>Leave</button>}
      </div>
      <div className="ox-raid__title">{title}</div>
      <div className="ox-raid__floor">{floor}{host ? " · hosted by " + host : ""}</div>

      <div className="ox-raid__stage">
        <span className="ox-raid__art">{art || (songTitle || "?")[0]}</span>
        <div className="ox-raid__np">
          <div className="ox-raid__for">Everyone is on · <b>{forWorkout}</b></div>
          <div className="ox-raid__song">{songTitle}</div>
          <div className="ox-raid__artist">{artist} · {bpm} BPM · <OXServiceBadge service={service} label={false} size="sm" /></div>
        </div>
      </div>

      <div className="ox-raid__drop">
        <span className="ox-raid__dlabel">{hit ? "DROP" : "Next drop in"}</span>
        <span className="ox-raid__dclock">{hit ? "▼▼▼" : "0:" + String(drop).padStart(2, "0")}</span>
        <span className="ox-raid__sync">in sync</span>
      </div>

      <div className="ox-raid__herd">
        {members.slice(0, 8).map((m, i) => (
          <span key={i} className={"ox-raid__mem" + (m.me ? " ox-raid__mem--me" : "")} title={m.name}>{m.initial}</span>
        ))}
        {going > 8 && <span className="ox-raid__more">+{going - 8}</span>}
      </div>

      <div className="ox-raid__transport">
        <button className="ox-np__btn" onClick={onPrev} aria-label="Previous">◀◀</button>
        <button className="ox-np__btn ox-np__play" onClick={onPlay} aria-label={playing ? "Pause" : "Play"}>{playing ? "❙❙" : "▶"}</button>
        <button className="ox-np__btn" onClick={onNext} aria-label="Next">▶▶</button>
      </div>
      <div className="ox-raid__note">Host controls the deck · the whole herd hears the same drop at the same rep</div>
    </div>
  );
}
