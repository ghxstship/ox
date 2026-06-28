# 07 · Consuming the OX Design System

> The DS ships in this same project. Don't rebuild primitives — compose these.
> Full specimen grid + docs: the project's **Design System** tab, `readme.md`,
> `SKILL.md`, and per-group `*.prompt.md` files.

## How it loads
- **Bundle:** `_ds_bundle.js` (compiled) exposes every component on
  `window.OXDesignSystem_7d2a2e`. In React:
  `const { OXButton, OXDataTable, OXExercisePlayer } = window.OXDesignSystem_7d2a2e;`
- **Styles/tokens:** `styles.css` (imports `tokens/*.css` + component CSS). Load
  it once at the app root. Tokens are CSS custom properties (`--ox-ink`,
  `--ox-oxide`, `--ox-font-mono`, spacing/`--ox-line`, fitness/level/zone vars).
- **DTCG export:** `tokens.dtcg.json` for a Style-Dictionary pipeline (web vars +
  the React Native token bridge for mobile).
- In a real codebase, package this as `@ox/ds`: ship the compiled components
  (or port them to your component lib 1:1) + the token CSS/JSON.

## The 124 components (by group — pick, don't reinvent)
- **core:** OXButton, OXChip, OXSegmented, OXTabs
- **forms:** OXField, OXInput, OXSelect, OXChoice, OXSwitch
- **data:** OXCard, OXRow, OXTable, OXDataTable, OXKpi, OXMeter, OXBars, OXSparkline, OXLineChart
- **navigation:** OXIcon (79 names), OXAvatar, OXListRow, OXSetting, OXBreadcrumbs, OXSiteHeader, OXSiteFooter, OXPagination
- **overlays:** OXModal (owns focus-trap/ESC/scroll-lock), OXSheet, OXToast, OXFab, OXTooltip, OXMenu, OXPopover, OXAccordion, OXTabset
- **product (SaaS):** OXAppShell, OXBadge, OXTag, OXKbd, OXStat, OXProgress, OXSpinner, OXSteps, OXBanner, OXCommandPalette
- **fitness · game:** OXLevelBadge, OXXPBar, OXStreak, OXQuestRow, OXChallengeHero, OXSpeciesBadge, OXMedal
- **fitness · train:** OXExerciseCard, OXFloorMatch, OXSceneryPicker, OXSetRow, OXMetricRing, OXZoneBar, OXRecoveryMap, OXRestTimer, OXExercisePlayer, OXFilterBar, OXPRChip
- **fitness · social/booking:** OXTribeBoard, OXClassRow, OXBookingCard, OXCoachCard, OXEventCard, OXRaidCard, OXCheckIn, OXHerdThat
- **app/editorial/layout/brand/feedback:** OXCredential, OXOTP (+ Stepper/Notif/Message/Composer/etc.), OXProse, OXContainer/Grid, OXMark, OXAlert, OXEmpty, OXSkeleton … (see manifest)

Exact props: each component's `.d.ts` next to its `.jsx` in `components/`.

## Non-negotiable invariants (lint enforces some — `_adherence.oxlintrc.json`)
- **One accent:** Oxide copper `#B5552E` only. Status/zones/levels = copper→stone
  tonal steps. **No** green/amber/red/blue. Never rely on hue alone — pair with
  label/icon (a11y).
- **Square + ruled + flat:** `border-radius: 0`; separation via 1px `--ox-line`,
  never drop shadows (except the device/stage frame).
- **Type:** display serif (`--ox-font-serif`), UI/labels JetBrains Mono caps
  (`--ox-font-mono`), body serif (`--ox-font-sans`). Use tokens, not literals.
- **Voice:** terse field-notes. Reaction = "Herd that." Tagline = "Plug in. Level up."
- **Dark mode:** `data-ox-mode="dark"` certified — don't hand-roll dark colors.

## Reference implementations to lift from
The prototypes already compose the DS correctly for every screen in `04`:
`ui_kits/ox-mobile/{consumer,admin}.jsx`, `ui_kits/ox-web/{consumer,admin}.jsx`,
plus the shared `ui_kits/_app/` runtime. Read these before writing new UI.
