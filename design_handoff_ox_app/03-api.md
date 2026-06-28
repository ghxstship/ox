# 03 · API Surface

> REST shown (tRPC maps 1:1). Base `/api/v1`. All routes require a Bearer JWT
> except auth + public discovery. **Every handler:** (1) sets Postgres session
> GUCs from the JWT so RLS applies, (2) checks the listed capability for writes.
> `cap` column = capability from `06`. List endpoints return only RLS-visible
> rows automatically — no per-endpoint filtering needed once policies exist.

## Auth
| Method | Path | cap | Notes |
|---|---|---|---|
| POST | `/auth/otp/start` | — | `{ email\|phone }` → sends code (OTP/passkey) |
| POST | `/auth/otp/verify` | — | `{ id, code }` → `{ jwt, session }` (session shape in 06) |
| POST | `/auth/signout` | — | revoke |
| GET | `/me` | self.view | current session + profile |

## Training (Fitbod)
| Method | Path | cap | Notes |
|---|---|---|---|
| GET | `/exercises?muscle=&equipment=&q=` | — | library, filterable |
| POST | `/workouts/generate` | workout.log | body: focus, equipment[], experience, goal → returns planned session |
| POST | `/workouts` | workout.log | start a session |
| POST | `/workouts/:id/sets` | workout.log | log a set `{exerciseId,index,weight,reps,rpe,done}` |
| POST | `/workouts/:id/finish` | workout.log | → awards XP, updates Recovery + PRs |
| GET | `/me/prs` · `/me/recovery` | self.view | progress widgets |

## Classes & booking (TeamUp)
| Method | Path | cap | Notes |
|---|---|---|---|
| GET | `/classes?from=&to=` | — | RLS-scoped (member=all bookable, coach=own, host=floor) |
| POST | `/classes` | class.manage | host/admin create (supports `recurRule`) |
| PATCH/DELETE | `/classes/:id` | class.manage | |
| POST | `/classes/:id/book` | class.book | → Booking (or waitlist if full) |
| POST | `/bookings/:id/cancel` | class.book | applies late-cancel penalty (see 05) |
| GET | `/classes/:id/roster` | roster.view | coach/host |
| POST | `/classes/:id/checkin` | checkin.scan | mark attended |

## Events & tickets (SweatPals)
| Method | Path | cap | Notes |
|---|---|---|---|
| GET | `/events` · `/events/:id` | — | public discovery |
| POST | `/events` | class.manage | create event/raid + tiers |
| POST | `/events/:id/tickets` | raid.join | reserve a tier → PaymentIntent if paid |
| POST | `/tickets/:id/checkin` | checkin.scan | scan QR → checked_in (+XP for attendee) |
| GET | `/events/:id/analytics` | revenue.view | live sales/attendance (host/admin) |

## Commerce (Alo)
| Method | Path | cap | Notes |
|---|---|---|---|
| GET | `/products?collection=` | — | gated drops filtered by viewer level |
| GET | `/cart` · POST `/cart/items` · DELETE `/cart/items/:id` | shop.buy | |
| POST | `/checkout` | shop.buy | → PaymentIntent → Order(placed→paid) |
| GET | `/me/orders` | self.view | |

## Operator / CRM / billing (TeamUp)
| Method | Path | cap | Notes |
|---|---|---|---|
| GET | `/members` | members.view | RLS: host=floor, coach=roster, admin=all |
| GET | `/members/:id` | members.view | profile, attendance, comms log |
| GET | `/clients` | clients.view | coach roster |
| POST | `/programs` | program.write | coach assigns a plan |
| GET | `/payments` | revenue.view | RLS-scoped ledger |
| POST | `/payments/:id/retry` | revenue.view | failed-payment recovery (Stripe) |
| GET | `/memberships` · POST · PATCH | revenue.view | tiers + add-ons |
| GET | `/reports/*` | revenue.view | revenue, utilization, retention, demographics |
| POST | `/campaigns` | members.view | SMS/email blast → delivery stats |
| GET/PUT | `/floors/:id` · `/floors/:id/equipment` | floor.manage / equipment.manage | host |

## Admin-only
| Method | Path | cap | Notes |
|---|---|---|---|
| GET/POST | `/admin/floors` | * | manage all partner floors |
| GET/POST | `/admin/challenges` | * | Iron Safari challenge builder |
| GET/POST | `/admin/staff` | * | invite hosts/coaches, assign roles (RBAC) |
| GET | `/admin/analytics` | * | global dashboards |

## Webhooks
`POST /webhooks/stripe` — payment/sub lifecycle → updates `Payment`/`Membership`,
enqueues retry/notification jobs. Idempotent by event id.

## Realtime channels
`floor:{id}:attendance` · `class:{id}:roster` · `tribe:{id}:feed` ·
`leaderboard:{scope}` — subscribe scoped to RLS visibility.
