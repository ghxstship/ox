# @ox/mobile — Expo / React Native

The OX consumer + operator app on native. Shares `@ox/types`, `@ox/rbac`, and
`@ox/api-client` with the web app. The DS DOM components do **not** run on native,
so the *visual* tokens (one accent, square, ruled, flat) are re-implemented via a
token bridge (`src/tokens.ts`) — in a full pipeline these are generated from
`packages/ds/styles/tokens/tokens.dtcg.json` with Style-Dictionary.

## Run

```bash
pnpm install
pnpm --filter @ox/mobile start   # then press i / a / w
```

Point at the API with `app.json` → `expo.extra.apiUrl` (default
`http://localhost:4000/api/v1`).

## Surfaces

Member tabs — **Home · Train · Tribe · Map · You** (mirrors `NAV.member.tabs`).
Operator surfaces and the parity layers (generator, set-logger v2, wallet, …)
follow the same behavioural spec as `apps/web`; this scaffold ships the member
shell and the token bridge as the foundation.

## Invariants (enforced by the token bridge)

One accent — Oxide copper `#B5552E`, ≤10% of any surface. Square (`borderRadius: 0`,
pills only for avatars/dots). Flat — separation by 1px rules, never shadows.
Type — DM Serif Display / JetBrains Mono caps / Geist via `font` tokens. Status by
label + icon, never hue alone.
