# @ox/api — OX Platform API

NestJS (Express) backend for the OX gamified-fitness platform. Plug in. Level up.

Base prefix: `/api/v1`. Default port `4000` (`PORT`). Helmet + CORS + a global
`ValidationPipe`. Every error leaves as the single OpenAPI envelope
`{ code, message, details? }`.

## The token → RLS flow (Supabase-only, no ORM)

1. The bearer is a **Supabase access token** (the apps sign in via Supabase Auth;
   the four demo identities use a real password session).
2. `JwtAuthGuard` verifies the token (`SUPABASE_JWT_SECRET` HS256 → JWKS → dev
   decode) and resolves the OX `User` (`authUserId = sub`) into `req.session`
   (the `@ox/rbac` `Session`) + `req.accessToken`. `@Public()` routes skip the
   requirement; signout denylists the token server-side.
3. `@Capability('cap')` + `CapabilityGuard` enforce the **verb boundary** via
   `can(session, cap)` — a 403 envelope otherwise.
4. Handlers read/write through **supabase-js** (`SupaService`): scoped reads use
   `forUser(token)` so **RLS** (`auth.uid() ↔ "User"."authUserId"`) filters every
   row — we never hand-filter. Trusted server writes (webhooks, automation runs,
   XP awards, payment minting) use `service()` (service role) with explicit
   `floorId`/`userId` guards so cross-tenant rows never leak.

> RLS is enforced by the Supabase policies (`db/migrations/*.sql`). There is no
> Prisma and no GUC layer.

## Two token kinds + the Supabase bridge

- **OX-minted JWT** — signed by this API (`JWT_SECRET`), claims `{ userId, role,
  floorId }`. The default for the demo flow.
- **Supabase access token** — issued by Supabase Auth. `SupabaseBridge` verifies
  it (HS256 via `SUPABASE_JWT_SECRET`, or asymmetric via the project JWKS, or —
  only when neither is set — decode-and-trust the `sub`, with a warning) and
  resolves it to an OX `User` through `User.authUserId`, producing the same
  `Session`. When a request carries a Supabase token, scoped reads can run through
  a per-request `@ox/supabase/server` client so **Supabase RLS** applies as well.

For privileged server writes (webhooks, admin jobs) `SupabaseBridge.service()`
returns a `createServiceClient()` (service-role key, bypasses RLS) when
`SUPABASE_SERVICE_ROLE_KEY` is set; otherwise callers fall back to scoped supabase-js
so rows are still filtered.

## Auth — OTP + signout

`POST /auth/otp/start` generates a 6-digit code, stores it under a returned
challenge `id` with a 10-minute TTL, and "sends" it (logged; emailed when
`OX_MAILER_FROM` is set). `POST /auth/otp/verify` checks the code and mints
`{ jwt, session }`. The four demo identities always accept `000000`. `POST
/auth/signout` revokes the bearer via a server-side **denylist** (in-memory Set +
TTL; the guard refuses denylisted tokens). *Prod swaps the OTP/denylist stores for
Redis.*

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
| **me** (consumer parity) | `GET /me/notifications`, `POST /me/notifications/:id/read`, `POST /me/notifications/read-all`; `GET/POST /me/body`; `GET /me/wishlist`, `POST /me/wishlist`, `DELETE /me/wishlist/:productId`; `GET /me/addresses`, `POST /me/addresses`, `PATCH/DELETE /me/addresses/:id`; `GET /me/credits`; `GET /me/waivers`; `GET /me/health`, `POST /me/health/connect`, `DELETE /me/health/:provider`; `GET/POST /me/guest-passes`; `GET/PUT /me/onboarding` | `self.view` / `shop.buy` |
| **tenant** | `GET /tenant/brand` (resolves `X-OX-Brand`, default OX copper) | public |
| **floors** | `GET /floors`, `GET /floors/:id` | public |
| **training** | `GET /exercises` (public, `q/muscle/equipment`), `POST /workouts/generate`, `POST /workouts`, `POST /workouts/:id/sets`, `POST /workouts/:id/finish` | `workout.log` |
| **classes** | `GET /classes`, `POST /classes`, `PATCH/DELETE /classes/:id`, `POST /classes/:id/book`, `POST /bookings/:id/cancel`, `GET /classes/:id/roster`, `POST /classes/:id/checkin` | `class.manage` / `class.book` / `roster.view` / `checkin.scan` |
| **events** | `GET /events`, `GET /events/:id` (public), `POST /events`, `POST /events/:id/rsvp`, `POST /tickets/:id/checkin` | `class.manage` / `raid.join` / `checkin.scan` |
| **commerce** | `GET /products` (public, level-gated drops), `GET /cart`, `POST /cart/items`, `DELETE /cart/items/:id`, `POST /checkout` (optional `promoCode`), `POST /cart/promo` | `shop.buy` |
| **store** (consumer parity) | `GET /products/:id/reviews` (public), `POST /products/:id/reviews`; `GET /packs` (public), `POST /packs/:id/buy`; `POST /giftcards`, `POST /giftcards/redeem`; `GET /waivers`, `POST /waivers/:id/sign` | public / `self.view` / `shop.buy` |
| **floors** (writes) | `PUT /floors/:id`, `PUT /floors/:id/equipment` | `floor.manage` / `equipment.manage` |
| **classes** (series) | `POST /classes/:id/occurrences?count=&persist=` (recurRule expander) | `class.manage` |
| **ops** | `GET /members`, `GET /members/:id`, `GET /clients`, `GET /payments`, `POST /payments/:id/retry`, `GET /memberships`, `POST /memberships`, `PATCH /memberships/:id`, `GET /reports/:name` | `members.view` / `clients.view` / `revenue.view` |
| **realtime** | `GET /realtime/floor/:id/attendance`, `/realtime/class/:id/roster`, `/realtime/tribe/:id/feed`, `/realtime/leaderboard/:scope` (SSE) | session + RLS-visibility gate |
| **parity** | `GET/POST /leads`, `POST /leads/:id/stage`, `POST /leads/:id/convert`; `GET/POST /automations`, `POST /automations/:id/toggle`; `GET /pos/catalog`, `POST /pos/sales`; `GET/POST /staff/shifts`, `POST /staff/shifts/:id/cover`; `GET /payroll`, `GET /payroll/export` (CSV); `GET/POST /contracts`, `GET /contracts/archive`, `POST /contracts/:id/sign` | `members.view` / `revenue.view` / `roster.view` / `self.view` |
| **admin** | `GET /admin/floors`, `/admin/challenges`, `/admin/staff`, `/admin/analytics` | `*` |
| **webhooks** | `POST /webhooks/stripe` (raw body, signature-verified, idempotent) | public (signature) |

`GET /reports/:name` supports `revenue`, `utilization`, `retention`, `demographics`.

## Realtime (SSE)

`RealtimeBus` is an in-process EventEmitter pub/sub fronting the channels in `03`:
`floor:{id}:attendance`, `class:{id}:roster`, `tribe:{id}:feed`,
`leaderboard:{scope}`. The SSE controller checks the caller's **RLS visibility**
before opening a stream (a class/floor RLS can't see → no subscription). Services
emit events (`book` / `cancel` / waitlist-promotion / check-in → roster +
attendance). *Prod swaps the emitter for Redis pub/sub; the tribe-feed emitter
wires in when a social/posts module lands.*

## Operator parity (11 §B)

Lead pipeline, automation builder (with a `fire(floor, trigger)` runner invoked on
signup + booking), POS desk sales (real `Payment` rows; cash settles paid, card
mints a PaymentIntent), staff scheduling, commission/payroll (computed from the
live `Payment` ledger, CSV export), recurring class builder (`occurrences`), and
contracts/e-sign. All of these now persist for real: Lead/LeadActivity,
Automation/AutomationRun, Shift, and Agreement/Signature are Supabase-backed and
RLS-scoped via `ScopeRunner` (host=floor, coach=own, admin=all), with explicit
floor/user `where` clauses so tenants never leak. The automation `fire(floor,
trigger)` runner records an `AutomationRun` per matched rule. Consumer-parity
tables (notifications, body metrics, wishlist, reviews, addresses, credit ledger,
packs, gift cards, promo codes, waivers, health connections, guest passes,
onboarding) are likewise persisted, scoped by `userId = session.userId`.

## OpenAPI

Swagger UI at `/api/v1/docs`, serving `openapi/ox-platform.yaml` verbatim (the
YAML stays the contract source of truth).

## Billing (Stripe — live + mock)

`BillingService` uses the real `stripe` SDK when `STRIPE_SECRET_KEY` is set, and
falls back to **mock mode** (deterministic fake objects, no network) when it
isn't — nothing throws either way. The live surface covers: PaymentIntents (shop
checkout, tickets, drop-ins, retries), Customers + Subscriptions/Billing
(memberships, with pause/resume/cancel-at-period-end), Connect transfers
(partner-floor payouts to `Floor.stripeAccountId`, fired from the webhook on
`payment_intent.succeeded`), and refunds.

`POST /webhooks/stripe` verifies the signature with
`stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` when the
secret is set (missing/invalid signature → rejected); with no secret it parses the
body (dev). It is **idempotent by event id** (in-memory Set — *prod needs a durable
store*) and branches on `payment_intent.succeeded/payment_failed`,
`invoice.paid/payment_failed`, `customer.subscription.updated/deleted` to update
`Payment.state` / `Order.state` / `Ticket.state` / `Membership.status` via supabase-js.
The DB mutations are real; enqueue-style side effects (dunning, notifications) are
logged TODO seams.

## Env

| Var | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `SUPABASE_SERVICE_ROLE_KEY` | trusted server writes (bypasses RLS) |
| `SUPABASE_JWT_SECRET` | verify Supabase access tokens |
| `JWT_SECRET` | signs/verifies OX-minted JWTs |
| `STRIPE_SECRET_KEY` | enables live Stripe; unset → mock mode |
| `STRIPE_WEBHOOK_SECRET` | webhook signature verification |
| `SUPABASE_SERVICE_ROLE_KEY` | privileged service client (webhooks/admin, bypasses RLS) |
| `SUPABASE_JWT_SECRET` / `SUPABASE_JWKS_URL` | verify Supabase access tokens (else decode-and-trust + warn) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (default project baked in) |
| `OX_CANCEL_CUTOFF_HOURS` | free-cancel window (default 12; late → `late_cancel` + penalty fee) |
| `OX_MAILER_FROM` | when set, OTP "dispatch" is logged as sent; else console delivery |
| `WEB_ORIGIN` | CORS allow-list |

## Scripts

`dev` (watch) · `build` (`nest build`) · `start` (`node dist/main`) ·
`typecheck` (`tsc --noEmit`) · `lint` · `clean`.
