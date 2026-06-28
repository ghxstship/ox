# OX — Design System

> A social, gamified fitness brand — app-based, no owned gym. OX plugs into the equipment at gyms you already use, tracks your training, and levels you up through challenges and tribes. Equal parts fitness · athleisure · lifestyle. **Plug in. Level up.**

OX is a double entendre — **AUX** (the auxiliary channel you plug into any floor) and **OX** (the word, which read sideways becomes a skull-and-crossbones flag; also the herd you train with). Think **Gymshark × Peloton app × Pokémon Go**. The brand is "luxury rogue energy": editorial, square, ruled, near-monochrome, with a single patinated-copper accent — the opposite of neon wellness apps.

The system began as the OX private-membership brand kit (v4) and was repositioned to gamified fitness; the visual foundation (square, ruled, one-copper-accent, field-notes voice) carried over unchanged — only the hierarchy and product surfaces shifted. The membership-club kits (`member-app`, `web-site`, storefront) are retained as the lifestyle/heritage layer.

This project is the OX design system, compiled into a runtime library that consuming projects link. Everything here derives from the original **OX brand kit (v4)** the client supplied — see Sources.

---

## Sources

The system was ported from an uploaded kit, `OX (4).zip` → `ox-kit/` (a multi-page interactive brand guide that dogfoods its own tokens + components). The raw extracted source is preserved under **`_src/`** in this project for reference:

- `_src/Brand Guide.html` + `_src/guide/01–14 *.html` — the original 14-section interactive guide (Foundations, Brand, Components, Digital/app, Social+Email, Signage, Credentials, App System, Forms/Overlays/Data, Web Editorial, Product Platform, Views, Documents, Data Templates).
- `_src/components.css` (canonical CSS implementation), `_src/components.d.ts` (props contracts), `_src/tokens/*`, `_src/product-theme.css`, `_src/platform.css`.
- `_src/SKILL.md`, `_src/readme.md`, `_src/schemas.json`, `_src/tokens.json`.

No Figma or GitHub repo was provided — the zip was the single source of truth. Fonts load from **Google Fonts** (DM Serif Display, Geist, JetBrains Mono — see Caveats); no font binaries were shipped.

---

## CONTENT FUNDAMENTALS

How OX writes. The voice is **field notes**: present tense, first-person plural ("we"), no superlatives. Names over categories, dates over seasons, specifics over adjectives.

- **Name / mark** — "OX" set in JetBrains Mono ExtraBold, tracking −4%. Horizontal = the wordmark; rotated 90° CW = the flag. One source string, one transform. Never drawn, never another typeface.
- **Tagline** — *Plug in. Level up.* (primary — the product + the game in four words). Rally / social line: *Run with the herd.* Reaction stamp (a real UI control, `OXHerdThat`): *Herd that.* Campaign line, used where a recruit / challenge push wants swagger: *Herd mentality.* (Heritage/lifestyle line *Beyond the scene.* is retained for the membership-club surfaces.) This is the locked working system — flag for final sign-off.
- **Casing** — author sentence case; the system applies UPPERCASE to eyebrows, labels, buttons, table heads via role tokens. Body stays sentence case. DM Serif Display runs in its native case.
- **I vs you** — first-person **plural** ("we cap at 150 and mean it"). Address the member as "you" only in app/transactional UI.
- **Emoji** — never. Unicode is used only as functional glyphs (the live dot ●, mono arrows →). Icons are line-only and wayfinding-only.
- **Numerals** — Roman for editions/editorial (No. VI, MMXXVI); Arabic for data, seats, prices. Dates as "Sat · Mar 14", times 24h ("22:00").
- **Examples** — DO: "Door opens 11. Six hours, one room." · "268 seats left." NOT: "An unforgettable night awaits!" · "Our amazing community of leaders…"

**Pillars (three value props)** — the brand stands on three, equal weight: **1 · Gamified Fitness Training & Adventures** (the engine — plug into any floor, log it, level up, run the Iron Safari), **2 · Social Wellness Experiences** (the herd — tribes, raids, classes, challenges, the *Herd that* co-sign), **3 · Performance Lifestyle & Streetwear** (the wear — OX as an athleisure label you live in, Alo × Gymshark elevation). Each takes a tonal copper position for wayfinding (`--ox-pillar-train` / `-social` / `-lifestyle`) — never a fill larger than a chip or rule. Energy target: **Alo / Gymshark** — premium, confident, kinetic; never loud-neon "wellness app." Five **values**: Community · Accessibility · Diversity · Sustainability · Creativity. Heritage **tiers** (Founder · Compass · Sound · Distant) remain as scope classes; the fitness app uses **levels (LV n) + ranks** instead.

---

## VISUAL FOUNDATIONS

- **Color** — Ink `#0B0B0A` · Paper `#ECE7DA` · Salt `#F6F2E8` · **Oxide `#B5552E`** (the only chromatic accent, ≤10% of any surface) · Stone `#6B6660`. Proportion rule: Paper/Ink carry ≥65%; a second neutral ≤25%; Oxide ≤10%. **No pure #000 or #FFF** — Ink and Salt stand in.
- **The one-accent rule** — Oxide is the *only* chromatic accent. Pillars take tonal positions of the copper family (+ Stone) for wayfinding; tiers and the suite apps take an accent *step* (bright/default/deep) — never a new hue. Life-safety signage colors (ISO green, safety red, ISA blue, caution yellow) are the single documented exemption.
- **Type** — DM Serif Display (display + the italic-Oxide ornament) · Geist 300–700 (body, forms, app UI) · JetBrains Mono 400/500/700/800 (labels, data, the mark). Scale: display 132 → title 96 → h2 64 → spread 38 → lede 22 → body 15 → meta 11/9.
- **Spacing** — 8u base (8 / 16 / 24 / 32 / 48 / 64 / 96 / 140).
- **Corner radius** — **0 everywhere.** Two reserved exceptions: pill (avatars, status dots) and 10px (the credential card corner only). Any other rounded corner is a prohibition.
- **Shadows** — **none on components.** Depth comes from rules and ground shifts. One exception: `--ox-stage-shadow`, used only to stage physical mockups (tickets, badges, cards) and the FAB.
- **Borders / rules** — the structural language: hairline (Ink @14%), 1px Ink (structural), 3px Ink (document masthead), 3px Oxide stamp. Cards are a 1px hairline that darkens to Ink on hover — never a shadow, never a rounded corner.
- **Backgrounds** — flat warm grounds (Paper / Salt / Paper-warm / Ink). No gradients on brand surfaces. The **only** gradient permitted is the credential metal/glass render (copper plate · on-chain glow). Imagery, where used, is warm and dark (copper-toned photo gradients), full-bleed, never tropical/turquoise/neon.
- **Animation** — near-zero. Permitted motion: 120–150ms color/value flips on interactive controls, and 120ms opacity on overlays. No decorative or looping motion on brand content. One ease (`cubic-bezier(0.2,0,0,1)`), one duration (160ms). `prefers-reduced-motion` collapses all to instant.
- **Hover** — value flip (button fill ⇄ ground; card border → Ink; link → Oxide). **Press** — color deepen (Oxide → Oxide-deep); no shrink/scale. **Focus** — 2px Oxide outline, 2px offset, focus-visible only.
- **Transparency / blur** — used sparingly: Oxide tint washes (8% α) as watermarks, rule opacities for hairlines, overlay scrims (Ink @55%). No glassmorphism.
- **Layout** — 1440px desktop canvas, 96px margins, 12-col / 24px gutters; 390px native mobile; 44px minimum hit target. Square, ruled, editorial grids.

See the **Design System** tab for live specimen cards (Colors, Type, Spacing, Brand).

---

## ICONOGRAPHY

Line only · single **1.5** stroke · `currentColor` · 24px grid · **no fills** · square terminals (butt cap, miter join) · one concept per icon · **wayfinding only**. Most things in OX have a word, and the word is better — reach for an icon only where a label won't fit (tab bars, icon buttons, dense rows).

- **Format** — the React **OXIcon** carries the full **79-glyph** set (line only, 1.5 stroke, no fill); the SVG sprite at **`assets/icons/ox-icons.svg`** mirrors it 1:1 (79 `<symbol>`s) for non-React / class-only consumers. Reference with `<svg class="ox-ic"><use href="…/ox-icons.svg#ox-house"/></svg>`; color via `currentColor`, size via `.ox-ic` (24) / `--sm` (18) / `--lg` (32). The OX icon contract (1.5 stroke, no fill, square caps) is applied in `components.css` §16.
- **Emoji** — never. **Unicode glyphs** — only the live dot ● and mono arrows → as functional marks. **No** icon larger than its label, no duotone, no decorative families.
- Other brand assets in `assets/`: the mark lockups (`ox-wordmark.svg`, `ox-flag.svg`, `ox-avatar.svg`, `ox-lockup-horizontal.svg`) — each is **live JetBrains Mono `<text>`** (the mark *is* type); **outline before print**. Pictograms in `assets/pictograms.svg`. CSV bulk-upload templates were left in the source kit.

---

## Index / manifest (root)

```
styles.css            global entry — @import only (link this one file)
tokens/               colors · typography · spacing · theming · fonts · fitness
components.css        the canonical CSS component library (brand + app)
components-fitness.css the gamified-fitness component styles (.ox-lvl, .ox-ex, .ox-floor, …)
product-theme.css     SaaS product atoms/molecules (.oxp-*)
platform.css          SaaS organisms — app shell, views, command palette (.oxa-*)
assets/               mark lockups, icon sprite, pictograms
components/           React wrappers (the public component API)
guidelines/           foundation specimen cards (Design System tab)
ui_kits/              full-screen product recreations
templates/            copy-to-start template folders
_src/                 the original OX kit, extracted for reference
readme.md  ·  SKILL.md
```

**Components** (`window.OXDesignSystem_7d2a2e` — **124 exports** across these groups):
- `brand/` — **OXMark**, OXCode, OXTierBadge
- `core/` — **OXButton**, OXChip, OXSegmented, OXTabs
- `forms/` — **OXField**, OXInput, OXSelect, OXChoice, OXSwitch
- `data/` — **OXCard**, OXRow, OXTable, OXKpi, OXMeter · **OXDataTable**, OXBars, OXSparkline, OXLineChart
- `feedback/` — **OXAlert**, OXTicker, OXEmpty
- `app/` — **OXCredential**, OXPost · OXOTP, OXStepper, OXNotif, OXMessage, OXComposer, OXTxRow, OXMintState, OXAvatarStack, OXAppBanner, OXSkeleton, OXOnboardSlide
- `navigation/` — **OXIcon** (79-glyph self-contained set), OXAvatar, OXListRow, OXSetting, OXBreadcrumbs, OXSiteHeader, OXSiteFooter, OXPagination
- `overlays/` — **OXModal**, OXSheet, OXToast, OXFab, OXTooltip, OXMenu, OXPopover, OXAccordion, OXTabset, OXScrim
- `editorial/` — **OXProse**, OXPullquote, OXFigure, OXReadMore, OXArticleHeader
- `layout/` — **OXContainer**, OXGrid, OXCol, OXCover, OXCTABand, OXFeatureGrid, OXSplit
- `product/` (SaaS) — **OXAppShell**, OXCommandPalette, OXBadge, OXTag, OXKbd, OXStat, OXProgress, OXSpinner, OXSteps, OXBanner
- `fitness/` (gamified fitness — all copper→stone, one accent) — _game:_ **OXLevelBadge**, OXXPBar, OXStreak, OXQuestRow, OXChallengeHero, OXSpeciesBadge, OXMedal · _train:_ **OXExerciseCard**, OXFloorMatch, OXSceneryPicker, OXSetRow, OXMetricRing, OXZoneBar, OXRecoveryMap, OXRestTimer, OXExercisePlayer, OXFilterBar, OXPRChip · _social/booking:_ **OXTribeBoard**, OXClassRow, OXBookingCard, OXCoachCard, OXEventCard, OXRaidCard, OXCheckIn, OXHerdThat
- `media/` (workout↔music pairing — neutral OX service chips, never real logos, one accent) — **OXNowPlaying** (bound to the current workout), OXSongRow (per-workout song + swap), OXServiceBadge (Spotify · Apple Music · SoundCloud · Tidal as neutral chips), OXCurationBadge (**Signature** team · **Featured** co-curated · Community), OXPairingCard, OXUpvote · _immersive layer:_ **OXTrackTimer** (now-playing fused with the set timer — logging a set drives the music, rest rides the breakdown, last set auto-cues next), OXCadenceMeter (song BPM vs move target, half/double-time aware), OXEnergyArc (session intensity curve), OXRaidRoom (synced group session — the herd locked to one track). Styles in `components-media.css`.
- `game/` (Pokémon-GO-style world layer — mono glyphs, rarity by treatment, one accent) — **OXWorldMap** + OXMapPin (explore floors/raids/wild WODs/drops + territory control), OXSpeciesCard (the dex), OXCaptureMoment (capture beat, fires from the track-timer's final set), OXTeamBar (pride/team meta), OXFloorControl (claimable territory), OXLiveEvent (GO-Fest-style live event)
- `xr/` (Horizon 3 · AR/spatial concept — see-through, one accent, **Specs-ready**) — **OXXRFrame** (`device="specs"` targets Snap SPECS / Snap OS: see-through HUD, pinch/look/voice input, EyeConnect), OXARCapture (reticle-lock species capture), OXARFormOverlay (tracked-skeleton form coaching), OXSpatialRaid (the synced raid as a shared spatial session)

**UI kits**:
- `ui_kits/iron-safari/` — **the Member fitness app** (gamified): Safari · Train · Tribe · Clubhouse · You. The exercise→floor→scenery discovery loop, live training + logging, tribes/raids, check-in flow.
- `ui_kits/coach-app/` — **Coach mobile**: roster, client detail, program builder, schedule, earnings.
- `ui_kits/coach-console/` — **Coach web**: roster table, programs, schedule, adherence, payouts.
- `ui_kits/gym-console/` — **Gym / Host web**: floor profile, equipment inventory (the matchmaking source), classes, check-in register, revenue.
- `ui_kits/admin-console/` — **Admin / Org web (OX HQ)**: members, partner floors, the Iron Safari challenge builder, billing, analytics, ⌘K palette.
- `ui_kits/member-app/` — the OX membership mobile app (House · Events · Feed · Wallet · You), interactive, with the on-chain credential + RSVP flow. *(Heritage / lifestyle layer.)*
- `ui_kits/web-site/` — the public marketing/editorial homepage (hero, pillars, events, journal, CTA).
- `ui_kits/operate-admin/` — the OX SaaS suite console (Operate members view): app shell, app switcher, data table, KPIs, co-pilot, ⌘K command palette.
- `ui_kits/storefront/` — **OX Provisions**, the editorial-commerce flow (collection → product → cart → checkout → confirmation), interactive with real cart state.

**Marketing site** (`marketing/` — the public gamified-fitness web, end-to-end; shared `site.css` + `site.js` inject the nav, mobile drawer, footer, active-link state, and scroll-reveal; every page sets `<body data-page="…">`):
- `marketing/index.html` — the **homepage**: hero, stat strip, the idea, three pillars (Train · Belong · Wear), the native-soundtrack feature, persona router, member quote, four-step how-it-works, operator teaser, app CTA.
- `marketing/pricing.html` — **Pricing**: Guest → Compass · Sound · Distant · Founder tiers, pros/partners + operator plans, FAQ.
- `marketing/manifesto.html` — the brand **manifesto** (Train like a beast. Move as a herd.).
- **Persona / segment pages** — `members.html` (members & guests), `trainers.html`, `athletes.html` (athletes & coaches), `creatives.html`, `hosts.html` (community leaders), `enterprise.html` (gyms & enterprise — white-label), plus the "what you do here" pages `lifters.html` (Train), `explorers.html` (Play), `herd.html` (Belong).
- **Company pages** — `about.html` (story · mission · team · numbers), `careers.html` (open roles · benefits · hiring process), `press.html` (fast facts · coverage · boilerplate · founder bios · brand assets), `contact.html` (support · partnerships · press · careers · HQ).
- **Legal / policy pages** — `privacy.html`, `terms.html`, `accessibility.html`, `cookies.html`, built on the long-form **document system** in `site.css` (`.doc-layout` sticky-TOC + numbered `.doc-section`s, `.doc-note` callouts, `.doc-table`). Every footer Company + Legal link now resolves to a real page — no `#` stubs.
  *(The heritage membership homepage stays at `ui_kits/web-site/` — that's the "Beyond the scene" lifestyle layer; `marketing/` is the repositioned gamified-fitness site.)*

**White-label** (`tokens/whitelabel.css` + `whitelabel/`) — the system is multi-tenant ready. Every component reads semantic tokens, so a `--ox-brand-*` input layer rebinds the one accent, grounds, type, and mark; structure (square · flat · ruled · one accent) is preserved. Override on `:root`, scope per-subtree with `[data-ox-brand="slug"]`, or apply at runtime with `whitelabel/apply-brand.js` (`OXBrand.apply(config)`). Tenant configs validate against `whitelabel/brand.schema.json` (`whitelabel/brands/*.json` are worked examples: forge · tide). See the **White-label** card and `guidelines/whitelabel.md`.

**Platform API** (`openapi/`) — the system is OpenAPI-compatible. `openapi/ox-platform.yaml` (OpenAPI 3.1) describes the platform data model; each schema declares the component it backs via `x-ox-component`, so a payload wires straight to `window.OXDesignSystem_7d2a2e`. `GET /tenant/brand` serves the white-label `BrandConfig`. Map + how-to in `openapi/component-bindings.md`; the **Platform API** card surfaces the schema↔component table.

**Templates** (copy-to-start; the consuming-project starting points):
- `templates/iron-safari-challenge/` — a 1080×1350 gamified-fitness challenge / season announcement poster.
- `templates/membership-deck/` — a 5-slide 1920×1080 membership / pitch deck (cover · manifesto · pillars · tiers · close).
- `templates/pitch-cover/` — a 1920×1080 pitch/deck title slide.
- `templates/email/` — a 600px transactional / campaign email (Ink masthead, detail rail, Oxide CTA).
- `templates/event-invite/` — a 1080×1350 event invite poster.
- `templates/social-post/` — a 1080×1080 square social post.
- `templates/signage/` — a 1080×1920 vertical door / wayfinding panel.
- `templates/credential-card/` — the physical member credential, ISO ID-1 front + back.

**Guidelines** (`guidelines/` — prose + specimen cards):
- `fitness-feature-map.md` — the gamified-fitness build blueprint: TeamUp/SweatPals/Fitbod/GoFest → OX roles (Member · Coach · Gym/Host · Admin · Tribe Lead) + feature inventory + surface list.
- `accessibility.md` — measured WCAG audit, focus/keyboard/ARIA rules, review checklist.
- `imagery.md` — art direction & photo treatment; brand asset export table.
- `governance.md` — status taxonomy, naming, contribution, versioning, deprecation.
- `CHANGELOG.md` (root) · `design-system-inventory.md` (root) — the filled 250-item coverage audit.

**Brand asset exports** — `assets/brand/`: `favicon.svg`/`favicon-256.png`, `app-icon.svg`/`.png`, `social-avatar.svg`, `og-card.svg`/`.png`. SVGs are the live-type masters (outline before non-web export).

The CSS library is deeper than the React wrappers — `components.css` also ships the full app system (§8/§10), overlays (§12), prose/editorial (§13), data tables + charts (§14), and web chrome (§15), all as `.ox-*` classes; `product-theme.css` + `platform.css` ship the SaaS suite (`.oxp-*` / `.oxa-*`). Use the classes directly for anything the wrappers don't cover.

---

## Multi-axis theming

Set root `data-*` attributes (or wrap in a tier scope class) to re-skin:
`data-ox-product` (member · operate · admin) · `data-ox-mode` (light · dark) · `data-ox-density` (cozy · compact) · `data-ox-accent` (soft · default · vivid) · `data-ox-type` (editorial · signage). The suite apps are distinguished by an accent *step*, never a new hue. Tier scopes: `.ox-tier-founder` (Ink register) · `-compass` · `-sound` · `-distant`.

---

## Caveats

- **Fonts load from Google Fonts**, exactly as the source kit specifies — no self-hosted binaries were provided, so the compiler reports 0 `@font-face` faces (expected). The `assets/brand/*.png` raster exports were rendered with substitute faces (the webfonts couldn't be embedded at export time) — the **SVG masters are brand-true**; regenerate the PNGs with the real fonts installed for pixel-true output. If you want the webfonts self-hosted for offline/print, send the licensed `.ttf`/`.woff2` files.
- The React layer wraps the full roster — brand, app, navigation, overlays, editorial, layout, data/charts, the SaaS product suite, the gamified-fitness group, the media-pairing group (+ immersive track-timer / cadence / energy-arc / raid layer), the **game world group** (map · dex · capture · territory · live event · pride), and the **XR/spatial group** (AR capture · form coaching · spatial raid) — **124 exports**. The mobile member IA is **Home · Train · Tribe · Map · You**; the web consumer has a **Tribe** destination (Overview · Map · Live · Dex · Quests · Pride · Spatial).
- **AR/XR is Specs-ready, not yet a build.** The `xr/` components target Snap **SPECS** (Snap OS) via a `device="specs"` profile — see-through overlay, pinch/look/voice input, and **EyeConnect** (eye-contact) for shared spatial sessions — with a `phone` fallback. The world model (species, zones, map, raids, territory) is deliberately device-agnostic so a real Snap OS **Lens** (Lens Studio) renders the same data when the time comes. The on-screen AR views are 2D concept renders, not live camera/spatial tracking.ts). The deepest `.oxa-*` organisms (kanban, gantt, slide-over) and the documents/print layer remain class-only. Coverage is tracked item-by-item in `design-system-inventory.md`.
- **Both app kits (`ui_kits/ox-mobile`, `ui_kits/ox-web`) are the live reference build** — RBAC role gate, RLS-scoped data, 100% end-to-end clickthrough, full operator CRUD (programs/plans/equipment/staff), and the **media-pairing** feature: programs paired with playlists, one song per workout, per-workout swap, now-playing tied to the current move, community discovery with upvotes + Signature/Featured tiers, and the Spotify/Apple Music/SoundCloud/Tidal connection flow. Shared runtime in `ui_kits/_app/` (`data.js` = seed + RBAC + RLS + media model; `store.js` = sessions, cart, prefs, social, media, CRUD). gamified layer stays strictly inside the one-accent rule — levels/XP/zones/recovery are all copper→stone tonal steps, never new hues. The tagline system (*Plug in. Level up.* / *Any equipment. One ox.* / *Move as a herd.*) is the locked working set, pending final sign-off.
