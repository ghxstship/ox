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
  and server logic. It reads **as the caller** (forwards the user's Supabase
  access token → `createServerClient(token)` → RLS applies) and uses the
  **service role** (`createServiceClient()`) only for trusted server writes
  (webhooks, automation runs, XP awards) with explicit `userId`/`floorId`
  scoping. **No ORM** — there is no Prisma and no GUC layer.

## Data access (no ORM)

The apps talk to Postgres through **supabase-js** (`@ox/supabase`):

```ts
import { createBrowserClient } from "@ox/supabase";          // browser / RLS
import { createServerClient, createServiceClient } from "@ox/supabase/server"; // server
```

RLS scopes every read to the signed-in identity, so the anon/publishable key is
safe in the browser. The four demo identities sign in with a real Supabase
session (password `oxdemo1234`).

## Apply SQL migrations

The OX additive layer lives in `db/migrations/*.sql` (helper functions + the
parity tables + RLS). Apply with the Supabase CLI or the dashboard SQL editor:

```bash
supabase login && supabase link --project-ref xaepcwnqjwphuwvuekfb
pnpm --filter @ox/db push        # supabase db push
```

## Regenerate the typed client

```bash
pnpm --filter @ox/db types       # Supabase CLI → packages/supabase/src/database.types.ts
```
