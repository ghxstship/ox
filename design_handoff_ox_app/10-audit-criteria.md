# 10 · Audit Criteria — "is the upgrade done?"

> The objective gate for the v1.12 upgrade. Each criterion has an **ID**, a **pass condition**, and **how to verify**. The upgrade is **complete** only when every `MUST` gate passes; `SHOULD` gates are tracked, not blocking. IDs are referenced from `09-upgrade-guide.md`.
>
> Verify in this order. Most checks are a `grep`, a render, or a generator run — not opinion.

## How to score

- **MUST** — blocking. Any red = upgrade not done.
- **SHOULD** — quality bar. Log reds as follow-ups; don't ship more than 2 open.
- Record each as ✅ pass / ⚠️ partial / ❌ fail with the evidence (command output, screenshot, PR link). Sign-off table at the bottom.

---

## 1 · DS sync & version  (MUST)

| ID | Pass condition | How to verify |
|---|---|---|
| `BC-0` | App consumes OX DS **v1.12.0** sources (or compiled bundle of that version) | `CHANGELOG.md` top entry is `1.12.0`; `_ds_manifest.json` namespace `OXDesignSystem_7d2a2e`; bundled CSS contains `--ox-brand-accent` |
| `SYNC-1` | No forked/edited copy of DS tokens or components diverges from source | Diff app's `@ox/ds` against this project's `styles.css`/`tokens/`/`components/`; only additive overrides allowed |

## 2 · Brand contract  (MUST)

| ID | Pass condition | How to verify |
|---|---|---|
| `BC-1` | `OXPost` uses **line icons**, no filled heart/dingbats | Render a post; inspect — the like/comment/repost marks are `<svg>` with `fill="none"`, `stroke="currentColor"`. `grep -nP '[♥↩⇄✎]' src/` returns nothing in component code |
| `BC-2` | No filled-glyph/dingbat icons anywhere in app UI | `grep -rnP '[♥♡✎✓✕✗★☆◆●]' src/components` → only the approved `●` live-dot and pedagogical/spec contexts remain; functional ticks use `OXIcon` |
| `BC-3` | **One** `OXIcon` implementation, mirroring `assets/icons/ox-icons.svg` 1:1 | Exactly one icon module exports `OXIcon`; the duplicate is deleted; icon count matches the sprite |
| `BC-4` | Tier vocabulary is **consistent** across code, copy, and `.ox-tier-*` scopes | `grep -rn` the tier names; one canonical set (or an explicit alias map). No screen shows `compass` while another shows `Orchestrator` for the same tier |
| `BC-5` | No hardcoded brand hex in components | `grep -rnP '#(0B0B0A\|ECE7DA\|F6F2E8\|B5552E\|E4DDCB)' src` → only the credential gradient + SVG assets; everything else is `var(--ox-*)` / Tailwind token |
| `BC-6` | Muted text uses the Stone token, not ink-opacity | `grep -rn 'ink/[0-9]' src` → none for text/border color (use `text-stone` / `--ox-text-muted`) |
| `BC-7` | Type stays on the scale | No `fontSize` literals off the scale (9/10/13/15/22/38/96/132); fluid `clamp()` mins/maxes anchor to tokens |
| `BC-8` | Square + flat preserved | `grep -rn 'border-radius' src` → only `0`, `--ox-radius-pill` (avatars/dots), `--ox-radius-credential`. No `box-shadow` on components except `--ox-stage-shadow`/FAB |
| `BC-9` | One accent only | No second chromatic hue for status/zones/charts; status/zones are copper→stone tonal steps (life-safety ISO pictograms exempt) |

## 3 · White-label  (MUST)

| ID | Pass condition | How to verify |
|---|---|---|
| `WL-1` | A tenant brand reaches the CSS vars **before first paint** (no flash) | Load a branded route with network throttled; the accent is the tenant's from frame 1. SSR inline `<style>` or pre-hydration `OXBrand.apply()` present |
| `WL-2` | Brand sourced from `GET /tenant/brand`, validated against `brand.schema.json` | Network shows the call; an invalid config is rejected at the edge (test with a bad hex) |
| `WL-3` | Overriding only `--ox-brand-*` re-skins the **whole** library | Switch tenant; buttons, chips, cards, meters, posts all recolor — no component hardcodes the accent |
| `WL-4` | White-label exposes **no** structural inputs | Brand config has no radius/shadow/second-accent fields; `brand.schema.json` `additionalProperties:false` holds |
| `WL-5` | Composes with mode/density/tier | A tenant + `data-ox-mode="dark"` + `data-ox-density="compact"` + a `.ox-tier-*` scope all render correctly together |
| `WL-6` (SHOULD) | ≥2 real tenants demonstrated, each one accent, structure intact | Render two production tenants side by side; visually distinct, same skeleton |

## 4 · OpenAPI / contracts  (MUST)

| ID | Pass condition | How to verify |
|---|---|---|
| `API-1` | Types + client **generated** from `openapi/ox-platform.yaml` | `@ox/types`/`@ox/api-client` are generator output; regenerate is a build step; no hand-maintained duplicates |
| `API-2` | `x-ox-component` bindings honored — API fields flow into the named props | Spot-check 5 schemas from `component-bindings.md` (e.g. `Progress→OXXPBar`); fields aren't renamed without a documented map |
| `API-3` | Spec passes a 3.1 linter in CI | `redocly lint openapi/ox-platform.yaml` (or `spectral`) exits 0 in the pipeline |
| `API-4` (SHOULD) | `GET /tenant/brand` returns a schema-valid `BrandConfig` | Hit the endpoint; response validates against `BrandConfig`/`brand.schema.json` |

## 5 · Accessibility  (MUST unless noted)

| ID | Pass condition | How to verify |
|---|---|---|
| `A11Y-1` | Body/secondary text meets WCAG **AA** contrast | Run axe/Lighthouse on key screens; no contrast violations; copper-as-text only large or deepened |
| `A11Y-2` | Interactive targets **≥44px** | Inspect the pillar slider thumb and icon buttons; hit area ≥44px (`--ox-touch-min`) |
| `A11Y-3` | No hover-only affordances | Keyboard-only pass: every hover-driven panel is reachable/operable via click + focus |
| `A11Y-4` | Focus visible, dialogs trap+restore, Esc closes | Tab through; 2px copper focus ring present; modal traps focus, restores on close |
| `A11Y-5` | Reduced motion honored | `prefers-reduced-motion` collapses transitions to instant |
| `A11Y-6` (SHOULD) | `lang`/`dir` at root; landmarks + skip link on web | Inspect document; axe landmarks pass |

## 6 · Marketing  (SHOULD)

| ID | Pass condition | How to verify |
|---|---|---|
| `MK-1` | All footer Company + Legal links resolve to real pages | Click every footer link; zero `#`/404; legal pages use the `.doc-*` system |
| `MK-2` | Pages render clean (no console errors), responsive, dark-mode safe | Load each at 390/768/1440; console clean; OS dark mode legible |

## 7 · Build & regression  (MUST)

| ID | Pass condition | How to verify |
|---|---|---|
| `BUILD-1` | App builds + typechecks with the regenerated types | `pnpm build && pnpm typecheck` exit 0 |
| `BUILD-2` | E2E happy paths green | Existing Playwright/e2e suite passes (session log → finish, book, RSVP, checkout) |
| `BUILD-3` | Design-system check clean (if the DS project travels with the app) | `check_design_system` → "No issues found" |

---

## Sign-off

| Gate group | Owner | Result | Evidence |
|---|---|---|---|
| 1 · DS sync & version | | ☐ | |
| 2 · Brand contract | | ☐ | |
| 3 · White-label | | ☐ | |
| 4 · OpenAPI / contracts | | ☐ | |
| 5 · Accessibility | | ☐ | |
| 6 · Marketing | | ☐ | |
| 7 · Build & regression | | ☐ | |

**Upgrade is COMPLETE when:** every MUST gate is ✅ and no more than two SHOULD gates remain ⚠️ (each with a tracked follow-up). Attach this filled table to the upgrade PR.

---

### Quick grep harness (paste into the repo root)

```bash
echo "BC-1/2 filled glyphs:"; grep -rnP '[♥♡✎✕✗★☆◆]' src/components || echo "  clean"
echo "BC-5 hardcoded brand hex:"; grep -rnP '#(0B0B0A|ECE7DA|F6F2E8|B5552E)' src | grep -v credential || echo "  clean"
echo "BC-6 ink-opacity text:"; grep -rn 'ink/[0-9]' src || echo "  clean"
echo "BC-8 radius/shadow:"; grep -rn 'border-radius\|box-shadow' src | grep -vE '0|pill|credential|stage' || echo "  clean"
echo "WL brand vars present:"; grep -rn '\-\-ox-brand-' src | head -1 || echo "  MISSING"
echo "API spec lint:"; npx --yes @redocly/cli lint openapi/ox-platform.yaml
```
