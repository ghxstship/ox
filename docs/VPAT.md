# VPAT® — Voluntary Product Accessibility Template

**Product:** OX Platform (web + mobile)
**VPAT Version:** 2.5 (WCAG 2.2 / Section 508 / EN 301 549)
**Date:** 2026-06-28
**Contact:** accessibility@ox.fit

This is the conformance scaffold. Each criterion below is evaluated against the
shipping build; "Supports / Partially Supports / Does Not Support / Not
Applicable" is filled per release as part of the M6 hardening gate.

## Conformance levels
- Supports — meets the criterion without exceptions.
- Partially Supports — meets it with some exceptions.
- Does Not Support — does not meet it.

## Table 1 — WCAG 2.2 Level A & AA (summary)

| Criterion | Level | Conformance | Remarks |
|---|---|---|---|
| 1.1.1 Non-text Content | A | Supports | Icons (`OXIcon`) carry `aria-label`; decorative art is `aria-hidden`. |
| 1.3.1 Info and Relationships | A | Supports | Semantic landmarks + heading order; tables use `OXDataTable` headers. |
| 1.4.1 Use of Color | A | Supports | One-accent rule forces text+icon labelling of every state. |
| 1.4.3 Contrast (Minimum) | AA | Supports | Ink/paper/accent tuned ≥ 4.5:1. |
| 1.4.10 Reflow | AA | Supports | Logical-property layouts reflow at 320px / 400% zoom. |
| 1.4.11 Non-text Contrast | AA | Supports | 1px rules + accent ≥ 3:1 against grounds. |
| 2.1.1 Keyboard | A | Supports | All controls keyboard-operable; `OXModal` traps focus. |
| 2.4.1 Bypass Blocks | A | Supports | Skip-to-content link in the root layout. |
| 2.4.7 Focus Visible | AA | Supports | `:focus-visible` rings; outlines never removed. |
| 2.5.8 Target Size (Minimum) | AA | Supports | ≥ 44×44px interactive targets. |
| 3.1.1 / 3.1.2 Language | A/AA | Supports | `<html lang>` + per-block `lang` from the locale. |
| 3.2.6 Consistent Help | A | Supports | Help/contact in consistent chrome location. |
| 4.1.2 Name, Role, Value | A | Supports | Custom widgets expose ARIA name/role/state. |
| 4.1.3 Status Messages | AA | Supports | `OXToast`/`OXBanner` use `role="status"`/`aria-live`. |

## Table 2 — Section 508 / Table 3 — EN 301 549
Mapped to the WCAG rows above (508 Ch. 5–6, EN 301 549 Ch. 9–11). Functional
performance statements (4.2.x) covered by keyboard, screen-reader, contrast, and
reduced-motion support documented in `ACCESSIBILITY.md`.

> Legal note: VPAT® is a registered trademark of the Information Technology
> Industry Council (ITI). This document follows the VPAT 2.5 INT format.
