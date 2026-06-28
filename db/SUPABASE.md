# OX on Supabase

OX uses the **existing, pre-provisioned Supabase project** as its backend of
record:

| | |
|---|---|
| Project ref | `xaepcwnqjwphuwvuekfb` (name `ox-fitness`) |
| API URL | `https://xaepcwnqjwphuwvuekfb.supabase.co` |
| Region / engine | us-east-1 · Postgres 17 |
| Publishable key | `sb_publishable_ZzRzJgf-NQ3g5sR6i48m8g_HbMD_DMM` |

The database is **already migrated and seeded** (45 tables, RLS on, demo data:
~10 users, 3 floors, classes, payments, the game/media/messaging layers).
**Treat the live DB as the source of truth — introspect it, don't migrate or
seed over it.**

## Authorization — RLS is native to the DB

The live schema is wired to **Supabase Auth**. `User.authUserId (uuid)` maps to
`auth.users.id`, and the policies scope every row by identity using DB helper
functions:

```
auth.uid()      -- the signed-in auth user
app_uid()       -- the OX User.id for auth.uid()
app_role()      -- 'member' | 'coach' | 'host' | 'admin'
app_floor()     -- the operator's floor id
is_admin() / is_operator()
```

e.g. `User_select`: `is_admin() OR id = app_uid() OR (app_role()='coach' AND
"coachId"=app_uid()) OR (app_role()='host' AND "floorId"=app_floor())`. So the
**same query returns 1 / 5 / 3 / 7 rows** for member / coach / host / admin —
enforced in SQL, exactly as the handoff requires. Public discovery (classes,
events, exercises, products, floors) is readable when `auth.uid() IS NULL`.

### What this means for the apps
- **Web & mobile** use `@ox/supabase` clients. The browser/anon key is safe —
  RLS does the filtering. A signed-in user only ever sees their allowed rows.
- **Server code** that must bypass RLS (Stripe webhooks, admin jobs) uses
  `createServiceClient()` (service-role key, server-only, never shipped).
- **The NestJS API (`apps/api`)** adds the *capability* layer (`can()`), Stripe,
  and server logic. When it connects with an elevated role it bypasses RLS, so it
  enforces capabilities explicitly; alternatively it forwards the user's access
  token to act as the user. Its `withScope()` GUC helper + `policies.sql` are the
  **portable / self-hosted** equivalent of the Supabase helpers above, for
  running OX on a non-Supabase Postgres.

## Connecting Prisma to Supabase

Set both URLs (get the password from Supabase → Project Settings → Database):

```bash
# Pooled (app runtime, pgBouncer)
DATABASE_URL="postgresql://postgres.xaepcwnqjwphuwvuekfb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct (migrations / db pull)
DIRECT_URL="postgresql://postgres.xaepcwnqjwphuwvuekfb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

Sync the Prisma schema to the live DB and generate the client:

```bash
pnpm --filter @ox/db pull        # prisma db pull && prisma generate
pnpm --filter @ox/db verify      # read-only row snapshot
```

> `db:migrate` and `db:seed` intentionally **refuse** to run against this project
> (they'd clobber data). Use them only on a fresh local Postgres via
> `seed:fresh` / `prisma migrate dev`.

## Regenerate the typed client

```bash
pnpm --filter @ox/supabase gen:types   # Supabase CLI → src/database.types.ts
```
