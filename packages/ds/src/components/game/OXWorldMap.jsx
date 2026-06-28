import React from "react";

/* ═══════════════════════════════════════════════════════════════════
 * OX — Game world layer. The Pokémon-GO-style exploration + collection
 * surface, OX-styled: square, ruled, one copper accent, mono glyphs.
 * Device-agnostic so a future AR/XR/VR client renders the same model.
 *   OXWorldMap · OXMapPin · OXSpeciesCard · OXCaptureMoment · OXTeamBar
 * (LevelBadge / XPBar / Streak / QuestRow / SpeciesBadge live in fitness.)
 * ═══════════════════════════════════════════════════════════════════ */

const PIN_GLYPH = { floor: "▣", raid: "◎", wild: "✦", drop: "▼", event: "◆" };

/** OXMapPin — a single pin on the OX map. type: floor·raid·wild·drop·event. */
export function OXMapPin({ type = "floor", label, sub, live = false, active = false, held = null, onClick, style, ...rest }) {
  const cls = "ox-pin ox-pin--" + type + (live ? " is-live" : "") + (active ? " is-active" : "") + (held ? " ox-pin--held-" + held : "");
  return (
    <button className={cls} onClick={onClick} style={style} {...rest}>
      <span className="ox-pin__dot">{PIN_GLYPH[type] || "▣"}</span>
      <span className="ox-pin__lab">{label}{sub ? <i>{sub}</i> : null}</span>
    </button>
  );
}

/** OXWorldMap — stylized exploration map (NOT real GPS). Pins are placed by
 *  normalized x/y (0–1). A "you" marker sits at center; rings imply range. */
export function OXWorldMap({ nodes = [], you = { x: 0.5, y: 0.5 }, activeId, heldOf, onPin, height = 340, style, ...rest }) {
  return (
    <div className="ox-map" style={Object.assign({ height }, style)} {...rest}>
      <div className="ox-map__grid" aria-hidden="true" />
      <span className="ox-map__ring ox-map__ring--1" style={{ left: you.x * 100 + "%", top: you.y * 100 + "%" }} />
      <span className="ox-map__ring ox-map__ring--2" style={{ left: you.x * 100 + "%", top: you.y * 100 + "%" }} />
      <span className="ox-map__you" style={{ left: you.x * 100 + "%", top: you.y * 100 + "%" }} aria-label="You are here" />
      {nodes.map((n) => (
        <div key={n.id} className="ox-map__node" style={{ left: n.x * 100 + "%", top: n.y * 100 + "%" }}>
          <OXMapPin type={n.type} label={n.label} sub={n.sub} live={n.live} active={activeId === n.id} held={heldOf ? heldOf(n) : null} onClick={onPin ? () => onPin(n) : undefined} />
        </div>
      ))}
    </div>
  );
}

/** OXSpeciesCard — a collectible creature in the dex. Earned = glyph + lore;
 *  locked = silhouette. Tier shown by treatment (corner ticks), never color. */
export function OXSpeciesCard({ name, glyph, tier = "common", region, lore, earned = false, onClick, style, ...rest }) {
  const ticks = { common: 1, rare: 2, epic: 3, legendary: 4 }[tier] || 1;
  const cls = "ox-spc" + (earned ? " is-earned" : " is-locked") + " ox-spc--" + tier;
  return (
    <button className={cls} onClick={onClick} style={style} {...rest}>
      <span className="ox-spc__rarity" aria-label={tier}>{Array.from({ length: ticks }).map((_, i) => <i key={i} />)}</span>
      <span className="ox-spc__glyph">{earned ? glyph : "?"}</span>
      <span className="ox-spc__name">{earned ? name : "Undiscovered"}</span>
      <span className="ox-spc__meta">{earned ? region : tier}</span>
    </button>
  );
}

/** OXCaptureMoment — the full-screen capture beat. Fires when a target move
 *  is finished and a new species is summoned. Reveal + XP burst, then save. */
export function OXCaptureMoment({ name, glyph, tier = "rare", region, lore, xp = 120, onConfirm, onDismiss, style, ...rest }) {
  const [phase, setPhase] = React.useState("summon"); // summon → reveal
  React.useEffect(() => { const t = setTimeout(() => setPhase("reveal"), 900); return () => clearTimeout(t); }, []);
  return (
    <div className="ox-cap" style={style} {...rest}>
      <div className={"ox-cap__box ox-cap__box--" + phase}>
        <div className="ox-cap__kick">{phase === "summon" ? "A wild species appears" : tier + " · summoned"}</div>
        <div className="ox-cap__orb"><span className="ox-cap__glyph">{phase === "summon" ? "?" : glyph}</span><span className="ox-cap__pulse" /></div>
        {phase === "reveal" && <>
          <div className="ox-cap__name">{name}</div>
          <div className="ox-cap__region">{region}</div>
          {lore && <p className="ox-cap__lore">{lore}</p>}
          <div className="ox-cap__xp">+{xp} XP · added to your dex</div>
          <div className="ox-cap__row">
            <button className="ox-cap__btn ox-cap__btn--primary" onClick={onConfirm}>Add to dex</button>
            <button className="ox-cap__btn" onClick={onDismiss}>Release</button>
          </div>
        </>}
      </div>
    </div>
  );
}

/** OXTeamBar — the city/global pride standings (team meta). One row per team. */export function OXTeamBar({ teams = [], myTeam, onPick, style, ...rest }) {
  const max = Math.max(1, ...teams.map((t) => t.score || 0));
  const ranked = teams.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
  return (
    <div className="ox-teams" style={style} {...rest}>
      {ranked.map((t, i) => {
        const mine = t.id === myTeam;
        return (
          <button key={t.id} className={"ox-team" + (mine ? " is-mine" : "")} onClick={onPick ? () => onPick(t.id) : undefined}>
            <span className="ox-team__rank">{i + 1}</span>
            <span className="ox-team__glyph">{t.glyph}</span>
            <span className="ox-team__b">
              <span className="ox-team__name">{t.name}{mine ? <em>· your pride</em> : null}</span>
              <span className="ox-team__bar"><span className="ox-team__fill" style={{ width: ((t.score || 0) / max) * 100 + "%" }} /></span>
            </span>
            <span className="ox-team__score">{(t.score || 0).toLocaleString()}</span>
          </button>
        );
      })}
    </div>
  );
}

/** OXFloorControl — a floor's territory state: which pride holds it, defense
 *  meter, and a claim/defend action. mine = your pride holds it. */
export function OXFloorControl({ name, heldName, held = null, defense = 0, you, onClaim, style, ...rest }) {
  const label = held === "mine" ? "Your pride holds this floor" : held === "rival" ? "Held by " + (heldName || "a rival pride") : "Uncontested";
  return (
    <div className={"ox-fctl" + (held ? " ox-fctl--" + held : "")} style={style} {...rest}>
      <div className="ox-fctl__top">
        <span className="ox-fctl__state">{label}</span>
        {heldName && <span className="ox-fctl__pride">{heldName}</span>}
      </div>
      <div className="ox-fctl__bar"><span className="ox-fctl__fill" style={{ width: Math.max(0, Math.min(100, defense)) + "%" }} /></div>
      <div className="ox-fctl__meta">Defense {Math.round(defense)}/100</div>
      {onClaim && <button className="ox-fctl__btn" onClick={onClaim}>{held === "mine" ? "Train here · reinforce" : "Train here · claim for your pride"}</button>}
    </div>
  );
}

/** OXLiveEvent — a map-wide live event (GO-Fest-style): countdown, XP
 *  multiplier, featured species spawns, wave agenda, join. */
export function OXLiveEvent({ title, kicker, live = true, endsIn, multiplier, going, floor, featured = [], bonuses = [], waves = [], joined = false, onJoin, onLeave, compact = false, style, ...rest }) {
  const ends = endsIn != null ? Math.floor(endsIn / 60) + "h " + (endsIn % 60) + "m" : null;
  if (compact) {
    return (
      <button className="ox-live ox-live--compact" onClick={onJoin} style={style} {...rest}>
        <span className={"ox-live__dot" + (live ? " is-live" : "")} />
        <span className="ox-live__cb"><b>{title}</b><i>{multiplier ? multiplier + "× XP · " : ""}{ends ? ends + " left" : ""}</i></span>
        <span className="ox-live__cta">{joined ? "Joined ✓" : "Join →"}</span>
      </button>
    );
  }
  return (
    <div className="ox-live" style={style} {...rest}>
      <div className="ox-live__head">
        <span className={"ox-live__tag" + (live ? " is-live" : "")}>{live ? "● LIVE" : "○ SOON"}</span>
        {multiplier && <span className="ox-live__mult">{multiplier}× XP</span>}
        {ends && <span className="ox-live__ends">{ends} left</span>}
      </div>
      <div className="ox-live__kick">{kicker}</div>
      <div className="ox-live__title">{title}</div>
      <div className="ox-live__floor">{floor}{going != null ? " · " + going + " training now" : ""}</div>

      {bonuses.length > 0 && <ul className="ox-live__bonuses">{bonuses.map((b, i) => <li key={i}>{b}</li>)}</ul>}

      {featured.length > 0 && <>
        <div className="ox-live__lbl">Featured spawns</div>
        <div className="ox-live__spawns">{featured.map((f, i) => <span key={i} className="ox-live__spawn">{f}</span>)}</div>
      </>}

      {waves.length > 0 && <>
        <div className="ox-live__lbl">Today’s waves</div>
        <div className="ox-live__waves">
          {waves.map((w, i) => (
            <div key={i} className={"ox-live__wave" + (w.live ? " is-live" : "")}>
              <span className="ox-live__wt">{w.t}</span>
              <span className="ox-live__wb"><b>{w.name}</b><i>{w.sub}</i></span>
              {w.live && <span className="ox-live__wlive">live</span>}
            </div>
          ))}
        </div>
      </>}

      <button className={"ox-live__join" + (joined ? " is-joined" : "")} onClick={joined ? onLeave : onJoin}>{joined ? "You’re in · leave event" : "Join the event"}</button>
    </div>
  );
}
