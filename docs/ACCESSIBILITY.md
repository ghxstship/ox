# Accessibility — OX Platform

OX targets **WCAG 2.2 Level AA** and **EN 301 549** conformance, with an
** ARIA Authoring Practices**-aligned component layer. Accessibility is a
release gate (build plan M6), not a backlog item.

## Standards we conform to

| Standard | Scope |
|---|---|
| WCAG 2.2 AA | All web + native surfaces |
| EN 301 549 | EU public-procurement accessibility |
| ADA Title III | US public accommodation |
| Section 508 | US federal (VPAT published — see `VPAT.md`) |
| EAA 2025 (Directive 2019/882) | EU European Accessibility Act |
| ARIA APG | Component interaction patterns |

## How the design system bakes it in

- **Never color alone.** The one-accent rule means status, zones, levels, and
  tiers are tonal copper→stone steps — so every state is *also* labelled with
  text + icon. This satisfies WCAG 1.4.1 (Use of Color) by construction.
- **Contrast.** Ink `#0B0B0A` on paper `#ECE7DA` and the oxide accent are tuned
  to ≥ 4.5:1 for text / ≥ 3:1 for UI; the dark mode (`data-ox-mode="dark"`) is
  certified, not hand-rolled.
- **Focus is visible.** Outlines are never removed; `:focus-visible` rings use
  the accent. `OXModal` owns focus-trap, ESC, and scroll-lock.
- **Targets ≥ 44×44px** (WCAG 2.5.8 Target Size).
- **Motion.** All transitions respect `prefers-reduced-motion`.
- **RTL / i18n.** Layouts use CSS logical properties (`margin-inline`,
  `inset-inline`, …); `dir` is set from the locale (Arabic/Hebrew → RTL).
- **Semantics.** Landmarks (`header/nav/main/footer`), one `h1` per view, ordered
  headings, `aria-*` on every custom widget, a skip-to-content link.

## Internationalization (international compliance)

Every money / weight / distance / number / date display routes through the
single i18n gate in `@ox/rbac` (`money`, `moneyFromCents`, `weight`, `distance`,
`num`, `date`) so locale, currency, and metric↔imperial are honored app-wide.
The web app ships locale-segment routing (`/[locale]/…`) via `next-intl` with
message catalogs; Arabic is included to exercise RTL.

## Testing

- Automated: `axe-core` in CI on key routes; the `_adherence.oxlintrc.json`
  ruleset enforces the design invariants (one accent, square, ruled, type, voice).
- Manual: keyboard-only pass, screen-reader pass (VoiceOver / NVDA), 200% zoom,
  reduced-motion, forced-colors.

## Feedback

Accessibility issues: **accessibility@ox.fit**. We respond within 5 business days.
