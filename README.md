<div align="center">

# OX

**Plug in. Level up.**

The gamified-fitness platform — a partner-floor network where members train,
level up, raid events, and shop drops, and operators run their floor. Built on
the OX Design System: one accent, square, ruled, flat.

</div>

---

OX is a **Turborepo + pnpm** monorepo: a Next.js web app, an Expo/React Native
mobile app, a NestJS API, and shared packages for the design system, types,
access control, and the API client — backed by Postgres with **Row-Level
Security** as the data boundary. The platform is **OpenAPI-driven**,
**white-label ready**, and built to **WCAG 2.2 AA / EN 301 549** with a full
internationalization layer.

## Monorepo layout

```
ox/
├── apps/
│   ├── web/        # Next.js (App Router) — consumer + operator + marketing, i18n, a11y, white-label
│   ├── mobile/     # Expo / React Native — member shell + RN token bridge
│   └── api/        # NestJS — REST (OpenAPI), JWT auth, capability layer, Stripe
├── packages/
│   ├── ds/         # @ox/ds — the OX Design System (tokens · 124 React components · CSS · whitelabel)
│   ├── types/      # @ox/types — domain enums/entities + OpenAPI-generated types
│   ├── rbac/       # @ox/rbac — CAPS · can() · scope() · scopeLabel() + the i18n format gate
│   ├── api-client/ # @ox/api-client — typed fetch client over the API
│   ├── supabase/   # @ox/supabase — typed Supabase clients over the live DB (RLS-scoped)
│   └── config/     # @ox/config — shared tsconfig presets
├── db/             # @ox/db — Supabase SQL migrations + RLS (no ORM)
├── openapi/        # ox-platform.yaml (OpenAPI 3.1) + component bindings
├── whitelabel/     # brand.schema.json · apply-brand.js · brands/*.json
├── docs/           # ACCESSIBILITY · VPAT · COMPLIANCE · PRIVACY · SECURITY · WHITE-LABEL
└── design_handoff_ox_app/  # the build documentation (01–11)
```

## Quick start

The backend of record is the **existing Supabase project `xaepcwnqjwphuwvuekfb`**
(`ox-fitness`) — already migrated and seeded, with RLS enforced natively via
Supabase Auth. See [`db/SUPABASE.md`](db/SUPABASE.md). No local database needed.

```bash
# 1. Install (pnpm 9+, Node 20+)
pnpm install

# 2. Configure — point at Supabase (set [PASSWORD] from the dashboard)
cp .env.example .env                 # NEXT_PUBLIC_SUPABASE_* are pre-filled

# 3. Generate the OpenAPI types (the Supabase Database types are committed)
pnpm gen:types                       # @ox/types from openapi/ox-platform.yaml

# 4. Run everything
pnpm dev                             # web :3000 · api :4000 (Swagger at /api/v1/docs)
```

There is **no ORM and no local database** — the apps read/write the hosted
Supabase project directly through `@ox/supabase` (supabase-js), with RLS as the
boundary. The web app falls back to seed data if offline, so the UI renders
immediately.

### Docker (full stack, deployment-ready)

```bash
cp .env.example .env                 # set SUPABASE_SERVICE_ROLE_KEY + Stripe (optional)
docker compose up --build            # web :3000 + api :4000 against hosted Supabase
```

`apps/web` builds to a standalone Next server; `apps/api` runs the NestJS app.
No database container — Supabase is the database.

## The four demo identities (your acceptance test)

| Identity | Role | Surface | RLS scope |
|---|---|---|---|
| **Mara Vance** | member | consumer (Home·Train·Tribe·Map·You) | Self only |
| **Dom Reyes** | coach | operator (reduced) | Own roster · own classes |
| **Iris Kelat** | host | operator (full) | Pier 9 Iron only |
| **OX HQ** | admin | operator (full) | All floors · global |

The seed makes `GET /members` return **7 / 5 / 3 / 1** rows for admin / coach /
host / member, and `GET /payments` return **6 / 3** — enforced in **SQL**, not
app code. (`packages/rbac/src/scope.test.ts` mirrors this; the DB proves it.)

## Design invariants (non-negotiable, CI-enforced)

- **One accent** — Oxide copper `#B5552E`, ≤10% of any surface. Status / zones /
  levels / tiers are tonal copper→stone steps, **never new hues**.
- **Square, ruled, flat** — `border-radius: 0` (pills for avatars/dots, 10px for
  the credential card only). Depth = 1px rules, never shadows.
- **Type** — DM Serif Display · JetBrains Mono caps · Geist, via `--ox-font-*`.
- **Voice** — terse field-notes. Reaction: **"Herd that."** Tagline:
  **"Plug in. Level up."**

`.oxlintrc.json` enforces these in CI.

## Architecture highlights

- **OpenAPI-first.** `openapi/ox-platform.yaml` (3.1) is the contract;
  `@ox/types` generates from it, the API serves Swagger at `/api/v1/docs`, and
  every schema names its DS binding via `x-ox-component`.
- **RLS as the boundary.** Enforced natively in Supabase: `auth.uid()` ↔
  `User.authUserId`, with `app_role()`/`app_floor()` helpers scoping every row.
  The same query returns 1/5/3/7 members by identity — in SQL. Capabilities
  (`can()`) gate every write. Clients never supply scope. The API reads as the
  caller (forwarded Supabase token → RLS) and uses the service role only for
  trusted server writes (webhooks, automations) with explicit scoping.
- **White-label.** `GET /tenant/brand` → `OXBrand.apply()` re-skins every
  component at runtime, no redeploy. See `docs/WHITE-LABEL.md`.
- **i18n / a11y.** Locale-segment routing, RTL via logical properties, and a
  single money/weight/distance/date format gate. See `docs/ACCESSIBILITY.md`.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Run all apps in watch mode |
| `pnpm build` | Build everything (Turbo) |
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | Across the workspace |
| `pnpm gen:types` | Regenerate `@ox/types` from the OpenAPI spec |
| `pnpm db:migrate` / `db:seed` / `db:generate` | Prisma lifecycle |

## Documentation

- **Build playbook:** `design_handoff_ox_app/01`–`11` (architecture → data model
  → API → routes → state machines → RBAC/RLS → DS → build plan → parity).
- **Design system:** `packages/ds/README.md` · `packages/ds/SKILL.md`.
- **Compliance:** `docs/COMPLIANCE.md`, `docs/ACCESSIBILITY.md`, `docs/VPAT.md`,
  `docs/PRIVACY.md`, `docs/SECURITY.md`.

## License

Proprietary — © 2026 GHXSTSHIP / OX. See [LICENSE](LICENSE).
