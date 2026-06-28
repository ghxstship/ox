# Deploying OX

OX is a Supabase-backed monorepo. The database is the hosted Supabase project
**`xaepcwnqjwphuwvuekfb`** — there is no separate DB to provision or migrate at
deploy time (apply `db/migrations/*.sql` once via the Supabase CLI / dashboard).

## Environments / secrets

| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | web, api | public; defaulted to the project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web, api | publishable key; safe in the browser (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **api only** | trusted writes (webhooks, automations); never ship to the browser |
| `SUPABASE_JWT_SECRET` | api | verify Supabase access tokens (else JWKS / dev decode) |
| `NEXT_PUBLIC_OX_API_URL` | web | e.g. `https://api.ox.fit/api/v1` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | api | optional; mock mode when unset |

## Option A — Docker (anywhere)

```bash
cp .env.example .env          # fill the service key + Stripe (optional)
docker compose up --build     # web :3000 + api :4000
```

`apps/web/Dockerfile` produces a standalone Next server; `apps/api/Dockerfile`
runs the NestJS app. Both build from the **repo root** as context. Health checks
are built in. Put a TLS-terminating proxy / load balancer in front for prod.

## Option B — Managed platforms

- **Web → Vercel:** import the repo, set the project root to `apps/web`, add the
  `NEXT_PUBLIC_*` env vars. `output: "standalone"` + `transpilePackages` are
  already configured; the build traces the workspace packages.
- **API → Fly.io / Render / Railway / Cloud Run:** deploy `apps/api/Dockerfile`
  (root build context). Set the API env vars above. Point Stripe webhooks at
  `POST /api/v1/webhooks/stripe`.
- **Mobile → EAS:** `eas build` from `apps/mobile` (Expo). Set the Supabase
  url/key in `app.json` → `expo.extra`.

## Database

```bash
supabase login && supabase link --project-ref xaepcwnqjwphuwvuekfb
pnpm --filter @ox/db push     # applies db/migrations/*.sql
pnpm --filter @ox/db types    # regenerate packages/supabase/src/database.types.ts
```

## Smoke test (after deploy)

1. `GET /api/v1/floors` → live floors (public discovery, no auth).
2. Sign in as a demo identity (`mara@ox.fit` / `oxdemo1234`) → consumer surface;
   `hq@ox.fit` → operator console with the right RLS scope.
3. `GET /api/v1/docs` → Swagger UI.
