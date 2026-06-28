# 09 · Upgrade & Implementation Guide

> **Use this when a build already exists** (e.g. the `ghxstship/ox` app) and must be brought up to **OX DS v1.12.0**. For a green-field build, follow `08-build-plan.md` instead — this doc is the *delta*.
>
> Every task below is: **What → Why → Do (file pointers) → Done-when**. The matching pass/fail gates live in `10-audit-criteria.md`; the IDs (`BC-1`, `WL-2`, …) cross-reference that file.

## 0 · What changed (v1.11 → v1.12)

| Area | Change | Section |
|---|---|---|
| Brand contract | `OXPost` like/comment/repost moved off filled-glyph/dingbat chars (`♥ ↩ ⇄`) to OX line icons | A |
| White-label | New `--ox-brand-*` input layer (`tokens/whitelabel.css`) + runtime `OXBrand.apply()` + `brand.schema.json` | B |
| Contracts | OpenAPI 3.1 spec (`openapi/ox-platform.yaml`) with `x-ox-component` bindings; `GET /tenant/brand` | C |
| Marketing | Full `marketing/` site (home · pricing · 9 segments · 4 company · 4 legal) on a `.doc-*` system | D |
| Tokens | `brand` group added to `tokens/tokens.dtcg.json` | B |

A target app that predates v1.12 will also carry the **drift findings** in §E — fix those in the same pass.

---

## A · Adopt the DS upgrade

**A1 — Re-sync the design-system source.**
- *Why:* the app consumes `@ox/ds`; it must be the v1.12 sources, not a fork.
- *Do:* lift these verbatim into your `@ox/ds` package (or re-vendor the compiled `_ds_bundle.js`): `styles.css`, all `tokens/*.css` **including the new `tokens/whitelabel.css`**, `components*.css`, `product-theme.css`, `platform.css`, `components/**`, `tokens/tokens.dtcg.json`. Confirm `styles.css` imports `tokens/whitelabel.css` **after** `theming.css` and **before** the component CSS.
- *Done-when:* `BC-0`, the app's bundled CSS contains `--ox-brand-accent`, and `grep -r '\-\-ox-brand-' dist/` is non-empty.

**A2 — Apply the `OXPost` icon fix.**
- *Why:* a filled heart violates the line-only/no-fill icon contract.
- *Do:* if you ported `OXPost` into your own component lib, replace the `♥ / ↩ / ⇄` text nodes with inline OX line icons (line only, 1.5 stroke, `currentColor`, no fill) — see `components/app/OXPost.jsx` for the exact paths (`like`, `comment`, `repost`). The `is-on` state recolors to accent; **never** fill the heart.
- *Done-when:* `BC-1`.

---

## B · White-label integration

**B1 — Decide the brand-resolution path.**
- *Why:* a tenant's brand must reach the CSS variables before first paint to avoid a flash.
- *Do:* pick one —
  - **SSR (preferred for Next.js):** resolve the tenant on the server, emit the `--ox-brand-*` overrides as an inline `<style>:root{…}</style>` (or a `data-ox-brand="slug"` on `<html>` when using a built-in scope) in the document head. No flash.
  - **Runtime:** include `whitelabel/apply-brand.js` and call `OXBrand.apply(brandConfig)` as early as possible (before hydration paints content).
- *Done-when:* `WL-1`.

**B2 — Source the tenant brand from the API.**
- *Why:* brand is data, not a build constant.
- *Do:* fetch `GET /v1/tenant/brand` → `BrandConfig` (schema in `openapi/ox-platform.yaml`, mirrored by `whitelabel/brand.schema.json`). Validate against the schema at the edge. Feed it to B1.
- *Done-when:* `WL-2`.

**B3 — Keep structure locked.**
- *Why:* white-label changes accent/grounds/type/mark only — never radius, elevation, or the one-accent rule.
- *Do:* do **not** expose radius/shadow/second-accent as tenant inputs. Tenant accent ramps that omit `accentDeep`/`accentBright` derive them via `OXBrand.deriveRamp()` — don't hand-pick a second hue.
- *Done-when:* `WL-3`, `WL-4`.

**B4 — Compose with the other axes.**
- *Do:* verify a tenant + `data-ox-mode="dark"` + `data-ox-density="compact"` all coexist on the same root. Tier scopes (`.ox-tier-*`) still apply within a tenant.
- *Done-when:* `WL-5`.

---

## C · OpenAPI / contract integration

**C1 — Generate types + client from the spec.**
- *Why:* the spec is the source of truth; hand-written types drift.
- *Do:* run a 3.1-aware generator against `openapi/ox-platform.yaml` (e.g. `openapi-typescript` for types, `openapi-fetch`/`orval` for a client) into `@ox/api-client` / `@ox/types`. Wire it into the build so the types regenerate on spec change.
- *Done-when:* `API-1`.

**C2 — Honor the `x-ox-component` bindings.**
- *Why:* the contract guarantees a payload maps 1:1 to a DS component; that guarantee is only real if the app preserves field names.
- *Do:* when binding screens (`04-routes-and-screens.md`), pass API fields straight into the component props named in `openapi/component-bindings.md` (e.g. `Progress → OXLevelBadge/OXXPBar/OXStreak`). Don't rename in a view-model unless you map back.
- *Done-when:* `API-2`.

**C3 — Lint the spec in CI.**
- *Do:* add `redocly lint openapi/ox-platform.yaml` (or `spectral lint`) to the pipeline. The spec authored here is 3.1 but has **not** been machine-linted in the design tool — lint it once on import and fix anything it flags before relying on generated types.
- *Done-when:* `API-3`.

---

## D · Marketing site

**D1 — Recreate or vendor `marketing/`.**
- *Why:* the public site is now part of the system.
- *Do:* port the `marketing/` pages into your web app's routing (each maps to a route), or serve them as static. Keep the shared `site.css` `.doc-*` document system for legal/policy pages. Ensure footer Company + Legal links resolve (no `#`).
- *Done-when:* `MK-1`.

---

## E · Drift remediation (findings in the live app)

These were observed in `ghxstship/ox@main` and must be fixed during the upgrade. File paths are that repo's.

**E1 — Filled-glyph icons → OX line icons.**
- *Where:* `src/components/ox/index.tsx` (`OXPost` `♥`/`✎`, `OXSearch` `⌕`, `OXMintState` `✓`/`!`), `src/components/oxf/fitness.tsx` (`✓` medals), `src/components/oxf/actions-client.tsx` (inline `✓` in button copy).
- *Do:* replace with `OXIcon` line glyphs (`like`, `comment`, `search`, `check`). Sanctioned to keep: `→`, `·`. Tolerable as functional mono but prefer `OXIcon`: `‹ › ↑ ↓ ▾ × +`.
- *Done-when:* `BC-2`.

**E2 — Unify the two `OXIcon` implementations.**
- *Where:* `src/components/ox/extended.tsx` (external `<use>` sprite, 19 names) vs `src/components/oxf/icon.tsx` (inline, 24 symbols, diverging).
- *Do:* keep **one** source of truth that mirrors the DS `OXIcon` / `assets/icons/ox-icons.svg` 1:1. Delete the duplicate; re-point imports.
- *Done-when:* `BC-3`.

**E3 — Resolve the tier-taxonomy drift.**
- *Where:* README + `forms/tier-picker.tsx` use **Founder · Orchestrator · Gladiator · Navigator · Aviator**; `ox/index.tsx` (`OXTier`/`OXTierBadge`/`OXTierScope`) uses **founder · compass · sound · distant**.
- *Do:* pick one canonical tier vocabulary across code, copy, and the `.ox-tier-*` scope classes; map the other at the boundary. The DS scope classes are `founder/compass/sound/distant` — align names or add an explicit alias layer.
- *Done-when:* `BC-4`.

**E4 — Tokenize hardcoded brand hex.**
- *Where:* `src/components/marketing/threshold.tsx` `background: '#ECE7DA'`.
- *Do:* `var(--ox-paper)` / `bg-paper`. (Credential gradient hexes stay — documented exception.)
- *Done-when:* `BC-5`.

**E5 — Replace ink-opacity text with the Stone token.**
- *Where:* `text-ink/65`, `/70`, `border-ink/60` in `pillars.tsx`, `values.tsx`, `tier-picker.tsx`.
- *Do:* use `text-stone` / `--ox-text-muted` for muted text; reserve ink for full-strength. Keeps the measured AA contrast.
- *Done-when:* `BC-6`, `A11Y-1`.

**E6 — Hit target ≥44px.**
- *Where:* `forms/pillar-slider.tsx` thumb `h-4 w-4` (16px).
- *Do:* expand the thumb's hit area to ≥44px (transparent padding or a larger control). Honor `--ox-touch-min`.
- *Done-when:* `A11Y-2`.

**E7 — No hover-only content swaps.**
- *Where:* `pillars.tsx` / `values.tsx` set active panel on `onMouseEnter`.
- *Do:* make click/focus the canonical trigger; hover is enhancement only. Ensure keyboard operability.
- *Done-when:* `A11Y-3`.

**E8 — Keep type on the scale.**
- *Where:* off-scale `clamp()` mins/maxes and `fontSize: 44/28/20` literals.
- *Do:* anchor fluid clamps to scale tokens (38 → 96); avoid off-step literals.
- *Done-when:* `BC-7`.

---

## Suggested sequence

1. **A** (re-sync + icon fix) — unblocks everything; ~0.5 day.
2. **E** (drift remediation) — mechanical, high-confidence; ~1 day.
3. **C** (contracts) — generate types, wire CI lint; ~1 day.
4. **B** (white-label) — brand resolution + API source; ~1–2 days.
5. **D** (marketing) — port/serve; ~1 day.
6. Run the full `10-audit-criteria.md` gate; fix reds; sign off.
