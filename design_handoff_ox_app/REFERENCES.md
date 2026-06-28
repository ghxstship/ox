# References (live in this project)

The handoff specs (00–08) are self-sufficient as an engineering spec. The
**hi-fi prototypes** they point to live in the project tree — hand Claude Code
the **whole project** so it has the design system + prototypes + these docs.

## Read/lift from
- **Design system:** `tokens/*.css`, `styles.css`, `components/**` (each `*.jsx` + `*.d.ts`), compiled `_ds_bundle.js`, `readme.md`, `SKILL.md`, `tokens.dtcg.json`. Browse the **Design System** tab for the specimen grid.
- **Prototypes (final visuals + interaction):**
  - `ui_kits/ox-mobile/` — `index.html` (gate, RBAC routing, RLS chrome), `consumer.jsx`, `admin.jsx`
  - `ui_kits/ox-web/` — same shape
  - `ui_kits/_app/` — **executable access model**: `data.js` (seed + `CAPS` + `scope()`), `store.js` (session + flows), `gate.jsx` (sign-in)
- **Scope of parity:** `guidelines/app-parity-spec.md` (Fitbod/SweatPals/TeamUp/Alo → OX).

## The prototypes are design references, not the product
They run in-browser on the React DOM build of the DS. Recreate them in the
target stack (01) using `@ox/ds`. The access logic in `_app/data.js` is the
**contract to port to the server** (Postgres RLS + capability checks) — the
client copy is UX-only and must not be trusted in production (see `06`).
