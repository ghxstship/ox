# 01 · Architecture

## Monorepo (pnpm + Turborepo)
```
ox/
  apps/
    web/         # Next.js (App Router) — consumer + operator console (one app, role-routed)
    mobile/      # Expo / React Native — consumer + operator
    api/         # NestJS (or tRPC+Fastify) — REST/RPC, auth, webhooks
  packages/
    ds/          # @ox/ds — THIS design system (compiled bundle + tokens + React components)
    types/       # @ox/types — entities/enums from 02-data-model (shared client+server)
    api-client/  # @ox/api-client — typed fetch/tRPC client, generated from api
    rbac/        # @ox/rbac — CAPS map + can() + scope() (mirrors ui_kits/_app/data.js)
    config/      # tsconfig/eslint/tailwind-or-token bridge presets
  db/
    prisma/      # schema.prisma + migrations + seed.ts (seed mirrors _app/data.js)
```

## Stack
- **Language:** TypeScript everywhere.
- **Web:** Next.js App Router, React 18, RSC for data fetch, server actions or `@ox/api-client` for mutations. SSR the operator console; the consumer surface can be mostly client + RSC.
- **Mobile:** Expo (React Native) + expo-router; shares `@ox/types`, `@ox/rbac`, `@ox/api-client`. The DS is React DOM — mobile re-implements the *visual* tokens (1px rules, square, copper) via a RN token bridge from `packages/ds/tokens`, not the DOM components.
- **API:** NestJS modules per domain (auth, training, events, commerce, ops, billing). Postgres + **Prisma**. **Redis** for queues (BullMQ: payment retries, notifications, XP awards) + realtime presence. **S3** media (exercise demos, event art, product shots).
- **Auth:** OTP / passkey (DS has `OXOTP`). JWT carries `{ userId, role, floorId }`. The token is the source of truth for RBAC + RLS — never client state.
- **Payments:** Stripe; **Stripe Connect** for partner-floor payouts (host revenue), Billing for memberships, Checkout/PaymentIntents for shop + tickets.
- **Realtime:** WebSocket/SSE for live class attendance, leaderboard, feed.

## Request → data path (RLS enforced server-side)
1. Client calls API with JWT.
2. API middleware decodes JWT → sets Postgres session GUCs `current_user_id / current_role / current_floor_id`.
3. **Postgres RLS policies** (see 06) filter every row automatically.
4. API additionally checks **capability** (`can(session, cap)`) for writes.
5. Client `scope()`/`can()` (from `@ox/rbac`) are **UX only** — hide what the server would refuse — never the enforcement boundary.

## Environments
`local` (docker-compose: pg+redis+minio) → `preview` (per-PR) → `staging` → `prod`. Migrations via Prisma; seed parity with the prototype's `_app/data.js` so QA can reproduce the demo identities.
