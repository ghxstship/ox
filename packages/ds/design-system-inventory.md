# Design System Inventory — Master Template

> Generic, item-level inventory & coverage checklist for any Claude Design system.
> Copy this file into a new project, fill the **Status** column, and use it as an audit, blueprint, handoff catalog, or migration manifest.

## How to use

1. Fill in **System metadata** below.
2. For every item, set a **Status** and (for migrations) map **Old → New**.
3. Track coverage: count `present` vs `missing` to see your gaps.

**Status legend**

- `present` — Exists, production-ready, documented
- `partial` — Exists but incomplete (missing states, a11y, docs, or themes)
- `missing` — Required but absent — a gap to close
- `planned` — On the roadmap, not yet built
- `deprecated` — Being removed — do not adopt
- `n/a` — Not applicable to this system

## System metadata

| Field | Value |
|---|---|
| system | OX — social, gamified fitness (app-based; plugs into partner-gym equipment) |
| version | 1.12.0 |
| namespace | OXDesignSystem_7d2a2e |
| owner | OX Brand & Product |
| audited | 2026-06-26 |
| sourceProject | OX brand kit (v4) — `OX (4).zip` → `_src/`; repositioned to social/gamified fitness |
| targetProject | OX Design System (this project) |

## Coverage summary — v1.2.0

**250 items across 11 layers** · **187 present · 35 partial · 15 missing · 6 planned · 7 n/a** (≈75% production-ready, 89% present-or-partial).

This audit uses the expanded ATLVS master template (adds the **Quality & Testing** layer, the **E-commerce/storefront** kit + flow, DTCG token pipeline, RFC/DoD governance, and RTL/i18n a11y items). Versus the prior 214-item audit, OX added: the storefront kit + flow, `tokens/tokens.dtcg.json`, expanded governance (intake, RFC, DoD, semver, release cadence, codemods, Figma-parity), `guidelines/quality-and-testing.md`, `guidelines/component-doc-template.md`, and RTL/lang-dir/VPAT a11y documentation.

The 15 `missing` are out-of-scope form/media primitives (combobox, slider, date/time pickers, rich-text, signature, tree view, carousel, import/upload, file viewer) — none on the brand, token, voice, or core layers. The 6 `planned` are honest CI/conformance gaps (axe automation, visual-regression, screen-reader matrix, high-contrast mode, RTL + logical properties). The 35 `partial` are mostly CSS-organism-only or compose-from-primitives patterns.

Status legend below.

---

## ◆  Design Tokens

_Primitive + semantic variables. Every visual decision should resolve to a token, not a hard-coded value._

### Color

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Brand / primary accent | present |  |  | Oxide #B5552E — single chromatic accent, ≤10% of any surface |
| Secondary / product accents | present |  |  | No new hues — suite apps + tiers take copper STEPS |
| Neutral ramp (surfaces & backgrounds) | present |  |  | Ink→Salt warm ramp; no pure #000/#FFF |
| Text / ink scale | present |  |  | Ink, Ink-soft, Stone, Stone-soft |
| Semantic — success | present |  |  | oxp-badge--ok (muted functional green) |
| Semantic — warning | present |  |  | oxp-badge--warn |
| Semantic — danger / error | present |  |  | oxp-badge--danger + field error state |
| Semantic — info | present |  |  | oxp-badge--info / oxp-banner--info |
| Border / divider | present |  |  | rule / rule-soft / ink / strong (3px) / accent |
| Overlay / scrim | present |  |  | --ox-scrim Ink @55% |
| Focus ring | present |  |  | 2px Oxide focus-visible; Oxide-bright on Ink |
| Chart / categorical palette | partial |  |  | Single-series Oxide-on-neutral; one-accent rule forbids categorical |
| Data-viz sequential / diverging | n/a |  |  | Sequences via Oxide→Stone opacity, not hues |
| Gradient definitions | present |  |  | Forbidden except credential render + photo placeholder |
| Interaction state layers (hover / press / selected / disabled) | present |  |  | Value-flip / deepen / Oxide / 40% |
| Colorblind-safe categorical palette | present |  |  | By design: color never sole signal (shape+label); accessibility.md |

### Typography

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Font-family tokens | present |  |  | --ox-font-serif/-sans/-mono |
| Type scale (display → caption) | present |  |  | 132→9; Type cards |
| Font-weight scale | present |  |  | Geist 300–700, JetBrains 400/500/700/800 |
| Line-height scale | present |  |  | --ox-lead-tight…loose |
| Letter-spacing / tracking | present |  |  | --ox-track-* |
| Paragraph & heading spacing | present |  |  | typography.css + prose |
| Mono / code style | present |  |  | JetBrains Mono |

### Spacing & Layout

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Space scale | present |  |  | 8u base xs→3xl |
| Radius scale | present |  |  | 0 default; pill + 10px credential only |
| Border-width scale | present |  |  | 1px / ink / 3px-strong |
| Breakpoints | present |  |  | sm480/md768/lg1024/xl1440 |
| Container / max-widths | present |  |  | canvas 1440 / reading 760 / app 390 |
| Grid columns & gutters | present |  |  | 12-col / 24px / 96px margin |
| Z-index layers | present |  |  | base→toast (0–60) |
| Aspect ratios | present |  |  | square/portrait/photo/wide/credential |
| Stacking ladder (named z-index tokens) | present |  |  | --ox-z-base…toast; never hard-code |

### Motion

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Duration scale | present |  |  | instant/fast120/base160/slow240 |
| Easing curves | present |  |  | standard + in/out |
| Transition presets | present |  |  | --ox-transition / -fast / -colors |
| Keyframe / animation library | partial |  |  | Near-zero by policy — value/opacity only |
| Reduced-motion fallbacks | present |  |  | prefers-reduced-motion → 0 |

### Elevation & Effects

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Shadow / elevation scale | present |  |  | none on components; --ox-stage-shadow for mockups |
| Blur / glass | n/a |  |  | No glassmorphism |
| Opacity scale | present |  |  | rule/scrim/disabled + Oxide tint 8% |
| Backdrop tokens | present |  |  | --ox-scrim |

### Extended / Optional Token Sets

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| AI surface tokens | present |  |  | oxa-copilot organism |
| Signage / wayfinding tokens | present |  |  | data-ox-type=signage + signage template |
| Trend / skin variant tokens | present |  |  | data-ox-accent soft/vivid |
| Density tokens | present |  |  | data-ox-density compact |

---

## A  Fonts

_Each face: weights, styles, fallback stack, license, loading strategy, self-hosted files._

### Type Faces

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Heading / display face | present |  |  | DM Serif Display (Google Fonts) |
| Body / text face | present |  |  | Geist (Google Fonts) |
| Mono / code face | present |  |  | JetBrains Mono (Google Fonts) |
| Brand / signature face | present |  |  | JetBrains Mono ExtraBold — the mark IS type |
| Utility / signage face | present |  |  | JetBrains Mono (signage register) |
| Fallback stacks defined | present |  |  | Georgia / system-ui / monospace |
| @font-face declarations present | partial |  |  | Loaded via Google Fonts @import, not @font-face binaries |
| Variable-font axes documented | n/a |  |  | Static weights used |
| Self-hosted font files committed | missing |  |  | Google Fonts by design — send licensed files to self-host |
| Font licenses recorded | present |  |  | All three OFL (Google Fonts) |

---

## ◑  Themes & Modes

_Token overrides keyed by data-attributes or class. One token map per theme._

### Modes

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Light mode | present |  |  | Default register |
| Dark mode | present |  |  | data-ox-mode=dark — certified, has card |
| High-contrast mode | planned |  |  | Ink/Paper already AAA; dedicated HC map pending |
| Density modes (comfortable / compact) | present |  |  | data-ox-density |

### Theme Variants

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Per-product / per-tenant themes | present |  |  | data-ox-product member/operate/admin + white-label `--ox-brand-*` layer (tokens/whitelabel.css · OXBrand.apply) |
| Accent variants (soft / vivid) | present |  |  | data-ox-accent |
| Trend / skin variants | present |  |  | data-ox-type editorial/signage |
| Theme-switching mechanism | present |  |  | Root data-* + tier scope classes |
| Token map verified per theme | partial |  |  | Light/dark/product verified; high-contrast pending |

---

## ▣  Core Component Library

_Reusable, themeable primitives & patterns. Each needs states, a11y, docs, and a spec card._

### Access & Identity

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Auth card | partial |  |  | OTP + onboarding pieces; no single auth-card component |
| Role / permission control | partial |  |  | Tier badges + token-gating in app kit; no RBAC control |
| Invite row | present |  |  | OXListRow / OXRow |
| Onboarding stepper | present |  |  | OXOnboardSlide + OXSteps |
| Avatar / avatar group | present |  |  | OXAvatar, OXAvatarStack |

### Primitives

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Button | present |  |  | OXButton — 4 variants, 3 sizes, block, arrow |
| Button group / split button | partial |  |  | OXSegmented covers grouped; no split button |
| Badge | present |  |  | OXBadge (5 tones) |
| Tag / chip | present |  |  | OXTag, OXChip |
| Divider | present |  |  | Rule system / .ox-* borders |
| Tooltip | present |  |  | OXTooltip |
| Icon system | present |  |  | OXIcon — 35 line icons + 19-icon sprite |

### Forms & Inputs

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Text input | present |  |  | OXInput |
| Textarea | present |  |  | OXInput multiline |
| Select | present |  |  | OXSelect |
| Combobox / autocomplete | missing |  |  | Not yet built |
| Checkbox | present |  |  | OXChoice type=checkbox |
| Radio group | present |  |  | OXChoice type=radio |
| Switch / toggle | present |  |  | OXSwitch |
| Slider | missing |  |  | Not yet built |
| Number input | present |  |  | OXStepper |
| Date picker | missing |  |  | Not yet built |
| Date-range picker | missing |  |  | Not yet built |
| Time picker | missing |  |  | Not yet built |
| Pin / code input | present |  |  | OXOTP |
| Field wrapper (label / help / error) | present |  |  | OXField |
| Rich-text editor | missing |  |  | Not yet built |
| Signature / drawing | missing |  |  | Not yet built |
| Form panel & validation | partial |  |  | Field states wired; no multi-field panel component |

### Data & Visualization

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Data table | present |  |  | OXTable + OXDataTable (sortable/selectable) |
| Data view (switchable layouts) | partial |  |  | OXTabset + kit views; no dedicated switcher |
| Description list | present |  |  | Credential/field rows pattern |
| Stat card | present |  |  | OXKpi, OXStat |
| Bar chart | present |  |  | OXBars |
| Line / area chart | present |  |  | OXLineChart |
| Donut / pie chart | missing |  |  | One-accent system; not built |
| Sparkline | present |  |  | OXSparkline |
| Calendar | partial |  |  | calendar icon + event lists; no calendar grid |
| Gantt / timeline | partial |  |  | .oxa-gantt CSS organism (class-only) |
| Kanban board | partial |  |  | .oxa-board CSS organism (class-only) |
| Meter / gauge | present |  |  | OXMeter |
| Steps | present |  |  | OXSteps |
| Tabs | present |  |  | OXTabs + OXTabset |

### Feedback & Status

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Banner / inline alert | present |  |  | OXAlert, OXBanner |
| Toast / snackbar | present |  |  | OXToast (role=status) |
| Empty state | present |  |  | OXEmpty |
| Skeleton loaders | present |  |  | OXSkeleton |
| Spinner | present |  |  | OXSpinner |
| Progress bar | present |  |  | OXProgress |

### Navigation & Shell

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| App shell | present |  |  | OXAppShell (per-product) |
| Sidebar | present |  |  | OXAppShell side / .oxa__side |
| Top bar | present |  |  | OXAppShell topbar / OXSiteHeader |
| Breadcrumb | present |  |  | OXBreadcrumbs |
| Pagination | present |  |  | OXPagination |
| Segmented control | present |  |  | OXSegmented |
| Bottom nav (mobile) | present |  |  | OXTabBar (member app) |
| Tree view | missing |  |  | Not yet built |
| Filter bar | present |  |  | Chip-filter pattern in kits |
| Bulk-action bar | partial |  |  | Selection in OXDataTable; no dedicated bar |
| Command palette | present |  |  | OXCommandPalette (⌘K) |
| App switcher | present |  |  | .oxa__switch (MBR/OPS/ADM) |

### Overlay & Disclosure

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Dialog / modal | present |  |  | OXModal — focus-trap, ESC, restore |
| Drawer / sheet | present |  |  | OXSheet (+ .oxa-slideover) |
| Popover | present |  |  | OXPopover |
| Menu / dropdown | present |  |  | OXMenu — arrow-key roving |
| Accordion | present |  |  | OXAccordion |
| Confirm dialog | partial |  |  | Compose via OXModal; no preset |
| Tour / coachmarks | missing |  |  | Not yet built |
| Share sheet | partial |  |  | OXSheet + share icon; no preset |

### CRUD, I/O & Sharing

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Export menu | present |  |  | OXMenu pattern in console kit |
| Import panel | missing |  |  | Not yet built |
| Upload zone | missing |  |  | Not yet built |
| Scan / capture | partial |  |  | QR pattern in credential + storefront; no capture component |
| File viewer | missing |  |  | Not yet built |
| Record header | present |  |  | OXArticleHeader / content-head |

### Media

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Media card | present |  |  | OXCard + OXFigure + storefront card |
| Media player | partial |  |  | play/pause icons + post media; no player component |
| Track / list row | present |  |  | OXListRow, OXRow |
| Carousel | missing |  |  | Not yet built |
| Gallery | partial |  |  | Feature grid / figure / storefront grid |

### Layout & Containers

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Card | present |  |  | OXCard, OXContainer, OXFeatureGrid |
| Grid / stack helpers | present |  |  | OXGrid, OXCol, OXSplit |
| Container | present |  |  | OXContainer |
| Coordinate / matrix layout | partial |  |  | Feature/pillar grids; no matrix component |

---

## ❖  Kits & Extensions

_Composed bundles for a surface or vertical. Each: its own components + templates + status._

### Horizontal Kits

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Brand kit | present |  |  | Marks, voice, color, type, imagery, icon set |
| UI / component-gallery kit | present |  |  | 77 components / 11 groups + spec cards |
| Web-app / console kit | present |  |  | ui_kits/operate-admin |
| Mobile-app kit | present |  |  | ui_kits/member-app |
| Marketing-website kit | present |  |  | ui_kits/web-site |
| Email kit | present |  |  | templates/email |
| Social-media kit | present |  |  | templates/social-post + event-invite |
| Document kit | partial |  |  | .ox-prose / editorial classes; no dedicated doc kit |
| Signage / wayfinding kit | present |  |  | templates/signage + data-ox-type |
| Sales / pitch kit | present |  |  | templates/membership-deck + pitch-cover |
| Empty / error-states kit | partial |  |  | OXEmpty; no full error-states kit |
| E-commerce / storefront kit | present |  |  | ui_kits/storefront (OX Provisions) — full flow |

### Vertical Extensions

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Vertical extension A (industry-specific) | present |  |  | Membership/club domain (credential, tiers, pillars) |
| Vertical extension B | n/a |  |  | Single vertical |
| Vertical extension C | n/a |  |  | Single vertical |
| Extension component-naming convention | present |  |  | OX prefix; ox-/oxp-/oxa- classes |
| Extension → core dependency map | present |  |  | readme manifest |

---

## ▤  Templates / Starting Points

_Ready-to-copy page & flow scaffolds consumers start from._

### Page & Flow Templates

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Landing / marketing page | present |  |  | ui_kits/web-site (reference) |
| Dashboard / console | present |  |  | ui_kits/operate-admin |
| Mobile-app shell | present |  |  | ui_kits/member-app |
| Auth flow (sign-in / up / reset) | partial |  |  | OTP/onboarding pieces; no full auth template |
| Settings / preferences | present |  |  | You tab + OXSetting rows |
| Onboarding flow | present |  |  | OXOnboardSlide |
| Pitch / case-study deck | present |  |  | templates/membership-deck (5 slides) |
| Transactional & campaign email | present |  |  | templates/email |
| Social graphics set | present |  |  | templates/social-post + event-invite |
| Document / report | partial |  |  | Editorial prose classes; no report template |
| Empty / error / 404 states | partial |  |  | OXEmpty; no 404 template |
| Storefront flow (collection / product / cart / checkout / confirmation) | present |  |  | ui_kits/storefront — all 5 stages, interactive |

---

## ✦  Brand Assets

_Source-of-truth marks, icons and imagery direction._

### Identity

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Primary logo | present |  |  | The mark (wordmark + flag) — live JetBrains Mono |
| Logo variants (mono / white / dark) | present |  |  | Reversible on Ink/Paper/Oxide; one-color |
| App icon | present |  |  | assets/brand/app-icon.svg+png |
| Favicon set | present |  |  | assets/brand/favicon.svg + favicon-256.png |
| Wordmark | present |  |  | assets/ox-wordmark.svg |
| Sub-brand / product marks | present |  |  | OXCode + suite codes (MBR/OPS/ADM) + OX Provisions |
| Clear-space & min-size rules | present |  |  | readme/brand cards (min 10px) |

### Visual Library

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Icon set | present |  |  | 35 line icons (OXIcon) + sprite |
| Illustration / spot art | n/a |  |  | OX uses type + photography |
| Imagery / photo direction | present |  |  | guidelines/imagery.md + art-direction card |
| OG / social share card | present |  |  | assets/brand/og-card.svg+png |
| Pattern / texture library | partial |  |  | Copper photo-gradient placeholder; no texture set |

---

## §  Guidelines & Governance

_The rules that keep the system coherent as it scales._

### Documentation

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Brand guidelines | present |  |  | readme.md (content + visual foundations) |
| Design principles | present |  |  | readme + governance |
| Naming conventions | present |  |  | guidelines/governance.md |
| Component status taxonomy | present |  |  | governance.md (stable/partial/planned/deprecated) |
| Do / don’t usage guidance | present |  |  | Do/Dont card + per-group prompts |
| Data model | n/a |  |  | Design system, not an app schema |
| IA / navigation plan | present |  |  | App tabs + console nav documented in kits |
| Status-tone mapping | present |  |  | Badge tones + accessibility |
| Per-component usage docs (anatomy / do-don’t / states) | present |  |  | Name.prompt.md per component + component-doc-template.md |
| Keyboard & ARIA spec per component | present |  |  | accessibility.md component sections + prompts |
| Component documentation template | present |  |  | guidelines/component-doc-template.md |

### Process

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Contribution / governance model | present |  |  | guidelines/governance.md |
| Versioning & changelog | present |  |  | CHANGELOG.md + semver policy |
| Audit / review cadence | present |  |  | governance.md (per-release + quarterly) |
| Deprecation policy | present |  |  | governance.md |
| RFC / proposal process | present |  |  | governance.md → Intake & RFC |
| Component intake & triage | present |  |  | governance.md → Intake & RFC |
| Definition-of-Done checklist | present |  |  | governance.md + quality-and-testing.md |
| Semantic-versioning policy | present |  |  | governance.md → Release cadence & semver |
| Release cadence | present |  |  | governance.md → Release cadence |
| Codemods / migration scripts | partial |  |  | Policy + recipes documented; no scripts shipped yet |
| Design ↔ code (Figma) parity | partial |  |  | No Figma library supplied; code is source of truth (governance.md) |
| Token pipeline (DTCG export) | present |  |  | tokens/tokens.dtcg.json + governance note |

---

## ✓  Quality & Testing

_Automated gates and conformance evidence. A status label is only trustworthy if these run on every change._

### Automated Gates

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Lint / token-adherence rules | present |  |  | _adherence.oxlintrc.json (compiler-generated) |
| Token contrast CI (every theme × mode) | partial |  |  | Matrix computed + documented; CI runner not wired |
| Automated a11y scan (axe) per component | planned |  |  | Manual checklist today; axe pending a runner |
| Interaction / keyboard tests | partial |  |  | Manual against WAI-ARIA patterns; no automated suite |
| Type-contract (.d.ts ↔ impl) checks | present |  |  | Compiler validates each jsx against its .d.ts |
| Visual-regression snapshots | planned |  |  | Spec cards are the snapshot surface; runner pending |
| Bundle-size budget | partial |  |  | React-only, no deps, inline styles; no enforced budget gate |

### Conformance Evidence

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| WCAG conformance statement (VPAT) | partial |  |  | AA self-assessed in quality-and-testing.md; not third-party audited |
| Per-component a11y annotations | present |  |  | In prompts + accessibility.md |
| Contrast matrix artifact | present |  |  | accessibility.md + contrast card (measured) |
| Reduced-motion verification | present |  |  | prefers-reduced-motion → 0; documented |
| Screen-reader test matrix | planned |  |  | Roles wired; recorded SR pass pending |

### Documentation Coverage

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Per-component usage docs | present |  |  | Name.prompt.md |
| Keyboard & ARIA spec per component | present |  |  | accessibility.md component sections + prompts |
| Prop / API reference (.d.ts) | present |  |  | Name.d.ts per component |
| Live spec card per component | present |  |  | @dsCard per directory |
| Maturity / stability label | present |  |  | governance taxonomy, tracked in inventory |

---

## “  Voice & Copy

_How the product speaks — consistency at the word level._

### Voice & Conventions

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Tone of voice | present |  |  | Field notes — present tense, 1st-person plural; readme |
| Capitalization / casing rules | present |  |  | Sentence-case authored; role tokens apply caps |
| Terminology glossary | present |  |  | Pillars, tiers, credential, house — readme |
| Microcopy patterns (buttons / errors / empty) | present |  |  | Voice card + component prompts |
| Date / number / currency formatting | present |  |  | Roman editorial / Arabic data; 24h times |
| Inclusive language | present |  |  | Values include accessibility + diversity |
| Localization readiness | partial |  |  | LTR/English only; RTL planned (accessibility.md) |

---

## ◉  Accessibility

_Baseline every token, component and template must meet._

### Standards

| Item | Status | Old → New (migration) | Owner | Notes |
|---|---|---|---|---|
| Color contrast (AA / AAA) | present |  |  | Measured audit in accessibility.md + card |
| Focus visibility | present |  |  | 2px Oxide focus-visible ring, global |
| Keyboard navigation | present |  |  | Modal/menu/tabset roving + trap |
| Screen-reader / ARIA semantics | present |  |  | dialog/menu/tab/status roles wired |
| Reduced motion | present |  |  | prefers-reduced-motion → 0 |
| Target sizes (≥44px) | present |  |  | --ox-touch-min enforced |
| Form labels & error association | partial |  |  | OXField tie-in; aria-describedby author-set |
| Semantic structure / landmarks | present |  |  | header/nav/main/footer; skip link |
| Skip links | present |  |  | .ox-skip in web kit |
| RTL support | planned |  |  | LTR only; logical-properties path documented |
| Logical properties (RTL-ready CSS) | planned |  |  | New components author logical props; migration pending (accessibility.md) |
| i18n / localization readiness | partial |  |  | LTR/English; direction-neutral mark + mono labels |
| lang / dir attributes | present |  |  | Set lang/dir at root; documented in accessibility.md |
| Conformance statement (VPAT / WCAG level) | partial |  |  | AA self-assessed; audit pending |

---

<sub>OX coverage audit · v1.2.0 · 2026-06-26 · filled from the ATLVS Master Design-System Inventory Template (250 items / 11 layers).</sub>
