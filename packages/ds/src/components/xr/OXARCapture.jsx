import React from "react";

/* ═══════════════════════════════════════════════════════════════════
 * OX — XR / spatial layer (Horizon 3 · concept). The AR/VR render of the
 * same device-agnostic world model: capture, form coaching, spatial raids.
 *   OXXRFrame · OXARCapture · OXARFormOverlay · OXSpatialRaid
 *
 * Built Specs-ready: the `device="specs"` profile targets Snap's SPECS AR
 * glasses (Snap OS) — see-through overlay, pinch/voice/look input, and
 * EyeConnect (eye-contact) for shared spatial sessions. One-accent rule
 * holds: sparse copper on a clear world, never filling the view.
 * ═══════════════════════════════════════════════════════════════════ */

const DEVICE = {
  specs:   { name: "SPECS · Snap OS", fov: "51° FOV", input: "Pinch to select · Look to aim · Say “capture”", seethrough: true },
  headset: { name: "Headset · spatial", fov: "Room-scale", input: "Trigger to select · Gaze to aim", seethrough: false },
  phone:   { name: "Phone AR", fov: "Camera", input: "Tap to capture", seethrough: false },
};

/** OXXRFrame — the HUD framing for an XR view. `device` picks the profile
 *  (specs = see-through AR glasses). Wrap any AR scene in it. */
export function OXXRFrame({ device = "specs", status, eyeConnect = false, hint, children, style, ...rest }) {
  const d = DEVICE[device] || DEVICE.specs;
  return (
    <div className={"ox-xr ox-xr--" + device + (d.seethrough ? " is-seethrough" : "")} style={style} {...rest}>
      <div className="ox-xr__hud">
        <span className="ox-xr__dev"><i className="ox-xr__rec" />{d.name}</span>
        <span className="ox-xr__fov">{status || d.fov}</span>
      </div>
      <span className="ox-xr__bracket ox-xr__bracket--tl" /><span className="ox-xr__bracket ox-xr__bracket--tr" />
      <span className="ox-xr__bracket ox-xr__bracket--bl" /><span className="ox-xr__bracket ox-xr__bracket--br" />
      {eyeConnect && <div className="ox-xr__eye">EyeConnect · look at a herdmate to sync</div>}
      <div className="ox-xr__scene">{children}</div>
      <div className="ox-xr__foot">{hint || d.input}</div>
    </div>
  );
}

/** OXARCapture — capture a species in the world. A reticle locks on the
 *  anchored creature; pinch / look / "capture" to add it to the dex. */
export function OXARCapture({ name, glyph, tier = "rare", region, device = "specs", locked: lockedProp, onCapture, onClose, style, ...rest }) {
  const [locked, setLocked] = React.useState(!!lockedProp);
  React.useEffect(() => { const t = setTimeout(() => setLocked(true), 1100); return () => clearTimeout(t); }, []);
  return (
    <OXXRFrame device={device} status="Capturing" hint={locked ? "Pinch or say “capture”" : "Hold steady · acquiring lock"} style={style} {...rest}>
      <div className="ox-arc2">
        <div className="ox-arc2__world" aria-hidden="true" />
        <div className={"ox-arc2__target" + (locked ? " is-locked" : "")}>
          <span className="ox-arc2__retic" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="ox-arc2__glyph">{glyph}</span>
          <span className="ox-arc2__ring" />
        </div>
        <div className="ox-arc2__tag">
          <span className="ox-arc2__name">{name}</span>
          <span className="ox-arc2__meta">{tier} · {region}{locked ? " · LOCKED" : " · acquiring…"}</span>
        </div>
        <div className="ox-arc2__row">
          <button className="ox-arc2__btn ox-arc2__btn--primary" disabled={!locked} onClick={onCapture}>{locked ? "Capture" : "Acquiring…"}</button>
          {onClose && <button className="ox-arc2__btn" onClick={onClose}>Exit</button>}
        </div>
      </div>
    </OXXRFrame>
  );
}

/** OXARFormOverlay — AR form coaching: a tracked side-view skeleton with a
 *  bar path, live cues, rep/tempo/zone readout. Snap's “real-time form”. */
export function OXARFormOverlay({ move = "Back Squat", rep = 3, reps = 5, tempo = "3-1-1", zone = 4, device = "specs",
  cues = [{ text: "Brace", ok: true }, { text: "Knees out", ok: true }, { text: "Depth", ok: false }], onClose, style, ...rest }) {
  // joint coords in a 100×130 viewBox (side view, mid-squat)
  const J = { head: [50, 12], sh: [53, 28], hip: [57, 58], knee: [44, 82], ankle: [53, 108], bar: [52, 28] };
  const seg = (a, b) => <line x1={J[a][0]} y1={J[a][1]} x2={J[b][0]} y2={J[b][1]} />;
  return (
    <OXXRFrame device={device} status={"Form · " + move} hint="Coaching overlay · stay present" style={style} {...rest}>
      <div className="ox-form2">
        <div className="ox-form2__view">
          <svg className="ox-form2__skel" viewBox="0 0 100 130" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <line className="ox-form2__barpath" x1={J.bar[0]} y1="20" x2={J.bar[0]} y2="118" />
            <g className="ox-form2__bones">{seg("head", "sh")}{seg("sh", "hip")}{seg("hip", "knee")}{seg("knee", "ankle")}</g>
            {Object.keys(J).filter((k) => k !== "bar").map((k) => <circle key={k} className="ox-form2__joint" cx={J[k][0]} cy={J[k][1]} r="3.4" />)}
            <circle className="ox-form2__bar" cx={J.bar[0]} cy={J.bar[1]} r="5" />
          </svg>
          {cues.map((c, i) => (
            <span key={i} className={"ox-form2__cue" + (c.ok ? " is-ok" : " is-flag")} style={{ top: (18 + i * 30) + "%" }}>{c.ok ? "✓" : "!"} {c.text}</span>
          ))}
        </div>
        <div className="ox-form2__hud">
          <div className="ox-form2__rep"><b>{rep}</b><span>/ {reps} reps</span></div>
          <div className="ox-form2__stat">Tempo <b>{tempo}</b></div>
          <div className="ox-form2__stat">Zone <b>Z{zone}</b></div>
          {onClose && <button className="ox-form2__exit" onClick={onClose}>Exit</button>}
        </div>
      </div>
    </OXXRFrame>
  );
}

/** OXSpatialRaid — the synced raid as a shared spatial session. Herdmates
 *  placed at depth; one shared track; a live drop pulses everyone. On Specs,
 *  joined via EyeConnect (eye contact). */
export function OXSpatialRaid({ title, members = [], songTitle, forWorkout, going = 0, device = "specs", playing = true, onLeave, style, ...rest }) {
  const [hit, setHit] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => { setHit(true); setTimeout(() => setHit(false), 700); }, 5000);
    return () => clearInterval(t);
  }, [playing]);
  // place avatars across a receding floor
  const placed = members.slice(0, 7).map((m, i, a) => {
    const n = a.length, t = n > 1 ? i / (n - 1) : 0.5;
    const depth = 0.35 + Math.abs(t - 0.5) * 0.9;       // center = closest
    return { m, left: 10 + t * 80, top: 70 - depth * 26, scale: 1.1 - depth * 0.5 };
  });
  return (
    <OXXRFrame device={device} status="Spatial raid" eyeConnect={device === "specs"} hint="Host drives the deck · the herd hears one drop" style={style} {...rest}>
      <div className={"ox-spr" + (hit ? " is-hit" : "")}>
        <div className="ox-spr__floor" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="ox-spr__track">Now powering · <b>{forWorkout}</b><i>{songTitle}</i></div>
        <div className="ox-spr__stage">
          {placed.map(({ m, left, top, scale }, i) => (
            <span key={i} className={"ox-spr__av" + (m.me ? " is-me" : "")} style={{ left: left + "%", top: top + "%", transform: "translate(-50%,-50%) scale(" + scale.toFixed(2) + ")" }}>{m.initial}</span>
          ))}
        </div>
        <div className="ox-spr__drop">{hit ? "▼ DROP" : going + " in the herd · in sync"}</div>
        {onLeave && <button className="ox-spr__leave" onClick={onLeave}>Leave session</button>}
      </div>
    </OXXRFrame>
  );
}
