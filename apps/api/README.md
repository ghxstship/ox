# @ox/api — OX Platform API

NestJS (Express) backend for the OX gamified-fitness platform. Plug in. Level up.

Base prefix: `/api/v1`. Default port `4000` (`PORT`). Helmet + CORS + a global
`ValidationPipe`. Every error leaves as the single OpenAPI envelope
`{ code, message, details? }`.

## The JWT → GUC → RLS flow

1. `POST /auth/otp/verify` mints a JWT signed with `{ userId, role, floorId }`.
2. `JwtAuthGuard` decodes the bearer token into `req.session` (the `@ox/rbac`
   `Session`). `@Public()` routes skip the requirement (they still personalize
   when a token is present).
3. `@Capability('cap')` + `CapabilityGuard` enforce the **verb boundary** via
   `can(session, cap)` — a 403 envelope otherwise.
4. Scoped handlers run their Prisma work through `ScopeRunner.run(session, tx => …)`,
   which calls `@ox/db` `withScope`. That opens a transaction and sets the
   Postgres GUCs `ox.user_id / ox.role / ox.floor_id`. The **RLS policies are the
   row boundary** — they filter every row. We never hand-filter scoped rows.

> Connect Postgres as a **non-superuser, non-BYPASSRLS** role in prod or the
> policies in `db/prisma/migrations/rls/policies.sql` will not apply.

## Demo identities

`POST /auth/otp/start` with `{ email }` or `{ phone }` → `{ id }` (the `id` is the
identity echoed back). `POST /auth/otp/verify` with `{ id, code }` where the demo
code is **`000000`**. Resolve `id` by email or seed user id:

| id / email | user | role | floor |
|---|---|---|---|
| `u_mara` / `mara@ox.fit` | Mara Vance | member | Pier 9 Iron |
| `u_dom` / `dom@ox.fit` | Dom Reyes | coach | Pier 9 (roster of 5) |
| `u_iris` / `iris@ox.fit` | Iris Kelat | host | Pier 9 Iron |
| `u_hq` / `hq@ox.fit` | OX HQ | admin | all floors |

Example:

```bash
curl -s localhost:4000/api/v1/auth/otp/verify \
  -H 'content-type: application/json' \
  -d '{"id":"u_mara","code":"000000"}'
# → { jwt, session }
```

## Routes

Auth (`@Public`): `POST /auth/otp/start`, `POST /auth/otp/verify`, `POST /auth/signout`.

| Module | Routes | Caps |
|---|---|---|
| **me** | `GET /me`, `/me/progress`, `/me/recovery`, `/me/prs`, `/me/orders`, `/me/credential` | `self.view` |
| **tenant** | `GET /tenant/brand` (resolves `X-OX-Brand`, default OX copper) | public |
| **floors** | `GET /floors`, `GET /floors/:id` | public |
| **training** | `GET /exercises` (public, `q/muscle/equipment`), `POST /workouts/generate`, `POST /workouts`, `POST /workouts/:id/sets`, `POST /workouts/:id/finish` | `workout.log` |
| **classes** | `GET /classes`, `POST /classes`, `PATCH/DELETE /classes/:id`, `POST /classes/:id/book`, `POST /bookings/:id/cancel`, `GET /classes/:id/roster`, `POST /classes/:id/checkin` | `class.manage` / `class.book` / `roster.view` / `checkin.scan` |
| **events** | `GET /events`, `GET /events/:id` (public), `POST /events`, `POST /events/:id/rsvp`, `POST /tickets/:id/checkin` | `class.manage` / `raid.join` / `checkin.scan` |
| **commerce** | `GET /products` (public, level-gated drops), `GET /cart`, `POST /cart/items`, `DELETE /cart/items/:id`, `POST /checkout` | `shop.buy` |
| **ops** | `GET /members`, `GET /members/:id`, `GET /clients`, `GET /payments`, `POST /payments/:id/retry`, `GET /memberships`, `GET /reports/:name` | `members.view` / `clients.view` / `revenue.view` |
| **admin** | `GET /admin/floors`, `/admin/challenges`, `/admin/staff`, `/admin/analytics` | `*` |
| **webhooks** | `POST /webhooks/stripe` (raw body, idempotent) | public (signature) |

`GET /reports/:name` supports `revenue`, `utilization`, `retention`, `demographics`.

## OpenAPI

Swagger UI at `/api/v1/docs`, serving `openapi/ox-platform.yaml` verbatim (the
YAML stays the contract source of truth).

## Billing

`BillingService` wraps Stripe. With `STRIPE_SECRET_KEY` unset it runs in **mock
mode** — fake PaymentIntents, no network. `POST /webhooks/stripe` only verifies
the signature when `STRIPE_WEBHOOK_SECRET` is set; otherwise it dedupes by event
id and logs. Both have `// TODO: wire Stripe` seams.

## Env

See `.env.example`: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `WEB_ORIGIN`.

## Scripts

`dev` (watch) · `build` (`nest build`) · `start` (`node dist/main`) ·
`typecheck` (`tsc --noEmit`) · `lint` · `clean`.
