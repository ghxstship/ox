# OX — Icons

Line-icon set. **Policy (inherited, non-negotiable):** line only · single
**1.5** stroke · `currentColor` · 24px grid · **no fills** · square terminals
(butt cap, miter join) · one concept per icon · wayfinding only. Most things in
OX have a word, and the word is better — reach for an icon only where a label
won't fit (tab bars, icon buttons, dense rows).

## Format

A single SVG sprite, `ox-icons.svg`, of `<symbol>`s. Reference with `<use>`:

```html
<svg class="ox-ic" aria-hidden="true"><use href="assets/icons/ox-icons.svg#ox-house"/></svg>
```

- **Color** follows `currentColor` — set it on the parent (`color: var(--ox-accent)` etc).
- **Size** via the `.ox-ic` class (24px), `.ox-ic--sm` (18), `.ox-ic--lg` (32), or width/height.
- **Stroke** stays 1.5 because vectors scale; for display sizes (>48px) drop the symbol's stroke to 1.25 in a local override.
- **Accessibility** — decorative: `aria-hidden="true"`. Meaningful: add `role="img"` + `<title>` (the React `<OXIcon title>` prop does this).

## Inventory (19)

| id | concept | id | concept |
|---|---|---|---|
| `ox-house` | House / home tab | `ox-share` | Share |
| `ox-events` | Events / calendar | `ox-settings` | Settings |
| `ox-feed` | Feed (the compass diamond) | `ox-bell` | Notifications |
| `ox-wallet` | Wallet | `ox-lock` | Locked / token-gated |
| `ox-profile` | You / profile | `ox-check` | Confirm / selected |
| `ox-search` | Search | `ox-external` | External / verify link |
| `ox-back` | Back | `ox-add` | Add / compose |
| `ox-chevron` | Disclosure / forward | `ox-like` | Like |
| `ox-close` | Close / dismiss | `ox-comment` | Comment |
| `ox-repost` | Repost | | |

## Don't

No fills, no two-tone, no rounded caps, no duotone Oxide+Ink within one icon, no
icon larger than its label, no decorative icon families (weather, emoji-likes).
The Oxide accent is allowed via `currentColor` but counts toward the ≤10% budget.
