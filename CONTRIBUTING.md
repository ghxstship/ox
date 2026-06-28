# Contributing to OX

## Prerequisites
- Node 20+, pnpm 9+
- Docker (for local Postgres / Redis / MinIO)

## Setup
```bash
pnpm install
pnpm gen:types && pnpm db:generate
docker compose up -d
pnpm db:migrate && pnpm db:rls && pnpm db:seed
pnpm dev
```

## Ground rules
- **Design invariants are law.** One accent (Oxide `#B5552E`, ≤10%), square,
  ruled, flat, the three type families, the OX voice. `.oxlintrc.json` enforces
  them; don't fight the linter.
- **Compose the DS — don't reinvent primitives.** Pick from `@ox/ds`
  (124 components). Props live in the co-located `.d.ts`.
- **RLS is the boundary.** Never filter scoped rows in app code; rely on the
  Postgres policies. Gate every write with `can(session, cap)`.
- **i18n everywhere.** All money / weight / distance / number / date display goes
  through the `@ox/rbac` format helpers. Use CSS logical properties for RTL.
- **a11y is a gate, not a follow-up.** Keyboard, focus, contrast, non-hue status,
  reduced-motion. See `docs/ACCESSIBILITY.md`.

## Workflow
1. Branch from `main`.
2. `pnpm typecheck && pnpm lint && pnpm test` before pushing.
3. Keep changes scoped; match the surrounding code's style.
4. Update docs when you change a contract (OpenAPI, data model, RBAC).

## Commit style
Conventional, terse, present tense — like the OX voice. `feat(train): set-logger v2`.
