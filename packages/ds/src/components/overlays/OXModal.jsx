import React from "react";

/* ─── useDismissable ──────────────────────────────────────────────────
 * The OX overlay behaviour contract, in one hook: when `open`, it locks
 * body scroll, traps Tab focus inside the panel, moves focus in on open and
 * restores it on close, and calls onClose on Escape. Returns the panel ref.
 */
export function useDismissable(open, onClose) {
  const ref = React.useRef(null);
  const restoreRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;

    // lock body scroll without layout shift
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sbw > 0) document.body.style.paddingRight = sbw + "px";

    const node = ref.current;
    const SEL = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
    // move focus in
    const focusables = node ? [...node.querySelectorAll(SEL)] : [];
    (focusables[0] || node)?.focus?.();

    function onKey(e) {
      if (e.key === "Escape") { e.stopPropagation(); onClose && onClose(); return; }
      if (e.key !== "Tab" || !node) return;
      const f = [...node.querySelectorAll(SEL)].filter((el) => el.offsetParent !== null);
      if (f.length === 0) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}

/** OXScrim — the dimming overlay behind sheets/modals. */
export function OXScrim({ onClick, style, ...rest }) {
  return <div className="ox-scrim" onClick={onClick} style={style} {...rest} />;
}

/**
 * OXModal — centered dialog with an Ink hairline border. Renders nothing when
 * `open` is false. Owns the full dismiss contract (scroll-lock, focus-trap,
 * focus-restore, Escape, scrim-click) via useDismissable. Pass `label` (or
 * `labelledBy`) for the accessible name.
 */
export function OXModal({ open, onClose, label, labelledBy, children, style, ...rest }) {
  const ref = useDismissable(open, onClose);
  if (!open) return null;
  return (
    <>
      <OXScrim onClick={onClose} />
      <div
        ref={ref}
        className="ox-modal"
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={style}
        {...rest}
      >
        {children}
      </div>
    </>
  );
}

/** OXSheet — bottom sheet with a grab handle. Same dismiss contract as OXModal. */
export function OXSheet({ open, onClose, label, labelledBy, children, style, ...rest }) {
  const ref = useDismissable(open, onClose);
  if (!open) return null;
  return (
    <>
      <OXScrim onClick={onClose} />
      <div
        ref={ref}
        className="ox-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={style}
        {...rest}
      >
        <div className="ox-sheet__grab" />
        {children}
      </div>
    </>
  );
}

/** OXToast — Ink toast with an Oxide left rule. Announced via role=status. */
export function OXToast({ message, visible = true, style, ...rest }) {
  if (!visible) return null;
  return (
    <div className="ox-toast" role="status" aria-live="polite" style={style} {...rest}>
      <span className="ox-toast__t">{message}</span>
    </div>
  );
}

/** OXFab — floating action button (the one pill + stage-shadow exception). */
export function OXFab({ icon = "+", onClick, style, ...rest }) {
  return (
    <button className="ox-fab" onClick={onClick} style={style} {...rest}>
      {icon}
    </button>
  );
}

/** OXTooltip — Ink tip with a downward arrow. Position with `style`. */
export function OXTooltip({ label, style, ...rest }) {
  return (
    <span className="ox-tooltip" role="tooltip" style={style} {...rest}>
      {label}
    </span>
  );
}

/**
 * OXMenu — dropdown menu. items: { label, key?, icon?, danger?, separatorAfter?, onSelect? }.
 * Arrow keys rove between items; Enter/Space selects; Escape calls onClose.
 */
export function OXMenu({ items, onClose, style, ...rest }) {
  const ref = React.useRef(null);
  function onKeyDown(e) {
    const btns = ref.current ? [...ref.current.querySelectorAll('[role="menuitem"]')] : [];
    const idx = btns.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); (btns[idx + 1] || btns[0])?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (btns[idx - 1] || btns[btns.length - 1])?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); btns[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); btns[btns.length - 1]?.focus(); }
    else if (e.key === "Escape") { e.preventDefault(); onClose && onClose(); }
  }
  return (
    <div className="ox-menu" role="menu" ref={ref} onKeyDown={onKeyDown} style={style} {...rest}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <button
            className={"ox-menu__item" + (it.danger ? " ox-menu__item--danger" : "")}
            role="menuitem"
            onClick={it.onSelect}
          >
            {it.icon && <span>{it.icon}</span>}
            <span>{it.label}</span>
            {it.key && <span className="ox-menu__key">{it.key}</span>}
          </button>
          {it.separatorAfter && <div className="ox-menu__sep" />}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * OXPopover — anchored panel (caller positions via `style`). role=dialog.
 */
export function OXPopover({ title, children, style, ...rest }) {
  return (
    <div className="ox-popover" role="dialog" style={style} {...rest}>
      {title && <div className="ox-popover__title">{title}</div>}
      {children}
    </div>
  );
}

/**
 * OXAccordion — disclosure list. items: { title, body }. Self-manages open
 * rows; `multiple` allows several open; `defaultOpen` seeds indices.
 */
export function OXAccordion({ items, multiple = false, defaultOpen = [], style, ...rest }) {
  const [open, setOpen] = React.useState(() => new Set(defaultOpen));
  function toggle(i) {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }
  return (
    <div className="ox-accordion" style={style} {...rest}>
      {items.map((it, i) => {
        const isOpen = open.has(i);
        return (
          <div className="ox-accordion__item" key={i}>
            <button className="ox-accordion__trigger" aria-expanded={isOpen} onClick={() => toggle(i)}>
              <span>{it.title}</span>
              <span className="ox-accordion__sign">+</span>
            </button>
            <div className="ox-accordion__panel" hidden={!isOpen}>
              <div className="ox-accordion__inner">{it.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * OXTabset — true tab panels (role=tablist). tabs: { label, panel }.
 * Controlled if `value`/`onChange` given, else self-managed. Arrow keys rove
 * between tabs (manual activation); Home/End jump to ends.
 */
export function OXTabset({ tabs, value, onChange, idBase = "oxtab", style, ...rest }) {
  const [internal, setInternal] = React.useState(0);
  const active = value != null ? value : internal;
  const listRef = React.useRef(null);
  function set(i) {
    if (onChange) onChange(i);
    else setInternal(i);
  }
  function onKeyDown(e) {
    let next = null;
    if (e.key === "ArrowRight") next = (active + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (active - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next != null) {
      e.preventDefault();
      set(next);
      listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
    }
  }
  return (
    <div style={style} {...rest}>
      <div className="ox-tabset__list" role="tablist" ref={listRef} onKeyDown={onKeyDown}>
        {tabs.map((t, i) => (
          <button
            key={i}
            id={`${idBase}-tab-${i}`}
            className="ox-tabset__tab"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${idBase}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => set(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="ox-tabset__panel"
        role="tabpanel"
        id={`${idBase}-panel-${active}`}
        aria-labelledby={`${idBase}-tab-${active}`}
        tabIndex={0}
      >
        {tabs[active] && tabs[active].panel}
      </div>
    </div>
  );
}
