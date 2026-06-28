# Handoff: OX — Full-Stack App (Consumer + Operator, Mobile + Web)

> **Goal of this package:** give an engineer (or Claude Code) everything needed to
> build the OX platform **in one pass** — schema, API, routes, screens, state
> machines, roles, and the design system — without guessing. Read the files in
> order; each is self-sufficient and cross-referenced.

## What OX is
App-based, gamified social fitness + lifestyle. **OX owns no gym** — it plugs into
existing floors (partner gyms) and their equipment, tracks workouts, and layers
progression (XP/levels), social (tribes, raids, "Herd that"), events, and a
streetwear store on top. Three value props: **Gamified Fitness Training &
Adventures · Social Wellness Experiences · Performance Lifestyle & Streetwear.**

Benchmarks for feature parity: **Fitbod** (training), **SweatPals** (events/community),
**TeamUp** (operator management), **Alo** (shop). Full parity map: `../guidelines/app-parity-spec.md`.

## About the design files
The HTML in `references/` are **design references** — prototypes showing intended
look and behavior, built on the OX design system. They are **not** the production
app. Recreate them in the target stack (below) using the OX DS, which ships as a
compiled bundle + tokens in this same project. Fidelity: **high** — colors, type,
spacing, and component behavior are final. Match them pixel-faithfully.

## Read in this order
1. `01-architecture.md` — stack, monorepo layout, shared packages.
2. `02-data-model.md` — every entity, field, enum, relation (Prisma-ready).
3. `03-api.md` — the endpoint surface by domain, auth, payloads.
4. `04-routes-and-screens.md` — every route (consumer + admin, mobile + web), the DS components each uses, data bindings, and empty/loading/error states.
5. `05-state-machines.md` — booking, checkout, payment, workout session, ticketing, XP/level, challenge.
6. `06-roles-and-permissions.md` — RBAC matrix across Member / Coach / Host / Admin.
7. `07-design-system.md` — how to consume the OX DS (bundle, namespace, tokens, 124 components, the one-accent rule).
8. `08-build-plan.md` — the one-pass build order, milestones, seed data, acceptance.
9. `09-upgrade-guide.md` — **upgrading an existing build to DS v1.12** (white-label, OpenAPI, the icon fix, and live-app drift remediation). Explicit What→Why→Do→Done-when tasks.
10. `10-audit-criteria.md` — **the objective gate**: pass/fail criteria (with how-to-verify) that define "upgrade complete," plus a sign-off table and a grep harness.
11. `11-parity-surfaces.md` — **the gap-closing delta**: all 31 benchmark-parity screens (consumer + operator), the new data models / API / DS primitives / store actions behind them, and where they slot into the build plan (M3.5 / M4.5). Build `01`–`08` first, then layer this in.

> **Upgrading, not building from scratch?** Start at `09` then `10`; treat `01`–`08` as reference. **Green-field?** Use `01`–`08`, then `11` for full feature parity; `09`/`10` still define the acceptance bar.

## Bundled references (`references/`)
Self-contained copies of the working prototypes these docs describe:
- `references/ox-mobile/` — consumer app (`index.html`) + the parity screens (`parity.jsx`, `parity2.jsx`, `parity3.jsx`).
- `references/ox-web/` — operator console (`index.html`) + operator parity (`parityweb.jsx`).
- `references/_app/` — the shared runtime (`data.js` seed/RBAC/RLS, `store.js` actions, `gate.jsx` auth) the prototypes run on; mirror its shape in `02`/`03`.
- `references/boards/` — the P0/P1/P2 spec boards (each surface's default + listed states, on-brand).
- `references/parity-surfaces.card.html` — surface → live screen → entry-point index.

These are **design references**, not the production app — recreate them in the target stack per `04`/`11`.

## Non-negotiable design invariants (apply everywhere)
- **One accent only.** Oxide copper `#B5552E` is the *sole* chromatic accent. Status/zones/levels are tonal steps of copper→stone, never new hues (no green/red/blue HR ramp). 
- **Square, ruled, no shadow.** `border-radius: 0`. Elevation = 1px rules, never drop shadows. 
- **Type:** display = **DM Serif Display**, UI/labels = **JetBrains Mono** caps, body/forms/app UI = **Geist**. All three load from Google Fonts; tokens (`--ox-font-serif` / `--ox-font-mono` / `--ox-font-sans`) carry the exact stacks — use the tokens, not literals.
- **Copy voice:** terse, field-notes, outcomes-over-aesthetics. Reaction verb is **"Herd that."**; rally line **"Run with the herd."**; primary tagline **"Plug in. Level up."**

## Design-system source files to copy (the shippable `@ox/ds`)
The DS lives in this project root; lift these verbatim (or port 1:1 into your component lib):
- **Tokens / global CSS** — `styles.css` (entry; `@import`s the rest), `tokens/*.css` (colors · typography · spacing · theming · motion · fitness · fonts), `tokens/tokens.dtcg.json` (Style-Dictionary / RN bridge).
- **Component CSS** — `components.css`, `components-fitness.css`, `components-media.css`, `components-game.css`, `components-xr.css`, `product-theme.css`, `platform.css`.
- **React components** — `components/<group>/*.jsx` + co-located `*.d.ts` (props contracts) + `*.prompt.md` (usage). 124 exports; or consume the compiled `_ds_bundle.js` on `window.OXDesignSystem_7d2a2e`.
- **Assets** — `assets/icons/ox-icons.svg` (79-glyph sprite, mirrors `OXIcon`), `assets/pictograms.svg`, `assets/brand/*` (favicon · app-icon · social-avatar · OG), mark lockups in `assets/`.
- **White-label** — `tokens/whitelabel.css` (the `--ox-brand-*` input layer), `whitelabel/apply-brand.js` (runtime applier), `whitelabel/brand.schema.json` (tenant config contract), `whitelabel/brands/*.json` (examples). Guide: `guidelines/whitelabel.md`.
- **Platform API** — `openapi/ox-platform.yaml` (OpenAPI 3.1; schemas carry `x-ox-component` bindings), `openapi/component-bindings.md` (schema↔component map). Generate `@ox/types` + `@ox/api-client` from the spec.
- **Docs** — `readme.md`, `SKILL.md`, `guidelines/*` (accessibility · governance · imagery · quality-and-testing · whitelabel), `CHANGELOG.md`, `design-system-inventory.md`.
- **Reference runtime** — `ui_kits/_app/{data,store}.js` (seed · RBAC · RLS · media model · store) is the working data layer the prototypes run on; mirror its shape in `02-data-model.md`/`03-api.md`.

## Target stack (recommended — see 01 for detail)
- **Monorepo** (Turborepo/pnpm). **Web:** Next.js (App Router) + React + TypeScript. **Mobile:** Expo / React Native + TypeScript. **Shared:** `@ox/ds` (this design system), `@ox/types` (from `02-data-model`), `@ox/api-client`.
- **Backend:** Node (NestJS or tRPC + Fastify), **Postgres + Prisma**, Redis (queues/realtime), S3 media. **Auth:** OTP/passkey (component `OXOTP` exists). **Payments:** Stripe (Connect for partner-floor payouts).
- If a stack already exists, conform to it; the DS, schema, and API contracts are framework-agnostic.
