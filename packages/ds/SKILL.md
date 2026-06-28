---
name: ox-design
description: Use this skill to generate well-branded interfaces and assets for OX — a private Miami membership club (music · fitness · adventure · innovation) with an on-chain credential — for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and a UI kit for prototyping. "Beyond the scene."
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, social graphics, decks), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask what they want to build or design, ask a few questions, and act as an expert OX designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are

- `readme.md` — the full brand guide: context, CONTENT FUNDAMENTALS (voice), VISUAL FOUNDATIONS, ICONOGRAPHY, and the manifest. **Read this first.**
- `styles.css` — the one global entry point. Link it and you inherit the whole brand (tokens + components + product layer). Everything is `@import`ed from here.
- `tokens/` — colors · typography · spacing · theming · fonts (CSS custom properties; semantic + base). `tokens/tokens.dtcg.json` is the machine-readable DTCG mirror for tooling.
- `components.css` / `product-theme.css` / `platform.css` — the canonical CSS classes (`.ox-*` brand/app · `.oxp-*` product atoms · `.oxa-*` product organisms).
- `components/` — React wrappers (the public API: `OXMark`, `OXButton`, `OXCard`, `OXCredential`, …). Each has a `.prompt.md` with usage.
- `guidelines/` — foundation specimen cards **plus** the deep-dive prose: `accessibility.md` (measured WCAG audit + RTL/VPAT), `imagery.md` (art direction), `governance.md` (taxonomy, naming, intake/RFC, DoD, versioning), `quality-and-testing.md` (gates + conformance), `component-doc-template.md`.
- `ui_kits/` — `member-app/` (membership mobile app), `web-site/` (public homepage), `operate-admin/` (SaaS console), and `storefront/` (OX Provisions commerce flow); read these to see real screens.
- `templates/` — copy-to-start artifacts: `membership-deck/`, `pitch-cover/`, `email/`, `event-invite/`, `social-post/`, `signage/`, `credential-card/`.
- `assets/` — the mark lockups, the icon sprite (`icons/ox-icons.svg`), the 35-icon `OXIcon` set, and brand exports in `assets/brand/` (favicon, app icon, OG card, avatar).
- `CHANGELOG.md` · `design-system-inventory.md` — version history and the filled 214-item coverage audit.

## Non-negotiables (catchable in review)

- **One accent.** Oxide `#B5552E` is the only chromatic accent, ≤10% of any surface. No second accent, no gradients on brand surfaces (the credential render is the one exception), no pastels, no tropical/turquoise/neon clichés.
- **No pure #000 / #FFF.** Use Ink `#0B0B0A` and Salt `#F6F2E8`.
- **Square + flat.** Radius 0 everywhere except avatars/dots (pill) and the credential corner (10px). No shadows on components (stage shadow for physical mockups only).
- **The mark is type.** "OX" in JetBrains Mono ExtraBold, tracking −4%; wordmark horizontal, flag rotated 90° CW. Never redraw it, never restyle within it.
- **Voice = field notes.** Present tense, first-person plural, no superlatives, names over categories, dates over seasons. No emoji.
- **Accessible by construction.** Body text is Ink (AAA); Oxide as text must be large or use Oxide-deep/-bright. Color is never the only signal. Controls show a 2px Oxide focus ring; dialogs trap+restore focus and close on Esc; hit targets ≥44px. See `guidelines/accessibility.md`.
- **Icons** are line-only, 1.5 stroke, no fill, wayfinding only — and most things should be a word, not an icon. `OXIcon` ships 35; never hand-roll new icon SVGs in a different style.

## Using the components

In an HTML artifact: link `styles.css`, load `_ds_bundle.js`, then read components off `window.OXDesignSystem_7d2a2e` (e.g. `const { OXButton, OXCredential } = window.OXDesignSystem_7d2a2e`). For anything the React wrappers don't cover, use the `.ox-*` / `.oxp-*` / `.oxa-*` classes directly — they're the deeper, canonical surface. Wrap a subtree in a tier scope (`.ox-tier-founder` etc.) or set root `data-ox-mode="dark"` to re-skin.
