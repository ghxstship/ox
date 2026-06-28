# @ox/db — OX database (Supabase, no ORM)

OX uses the existing Supabase project **`xaepcwnqjwphuwvuekfb`** as its database.
There is **no ORM** — the apps talk to Postgres through **supabase-js**
(`@ox/supabase`), and **Row-Level Security is the boundary**: every query is
scoped by the signed-in identity (`auth.uid() ↔ "User"."authUserId"`).

## Layout

```
db/
  migrations/
    0001_rls_helpers.sql      # app_uid / app_role / app_floor / is_admin / is_operator
    0002_parity_operator.sql  # Lead, Automation, Shift, Agreement, Signature, WebhookEvent
    0003_parity_consumer.sql  # Notification, BodyMetric, Wishlist, Review, Address, CreditLedger,
                              # Pack, UserPack, GiftCard, PromoCode, Waiver, HealthConnection, GuestPass, Onboarding
  SUPABASE.md                 # project ref, keys, RLS model, connection
```

The **base schema** (Users, Floors, Classes, Products, the game/media/messaging
layers, …) is provisioned in the Supabase project. The migrations here are the
**additive** OX layer; apply them to a fresh project to reproduce the OX tables.

## Apply migrations

```bash
supabase login
supabase link --project-ref xaepcwnqjwphuwvuekfb
pnpm --filter @ox/db push        # supabase db push  (applies db/migrations/*.sql)
# or paste a file into the Supabase SQL editor
```

## Regenerate the typed client

```bash
pnpm --filter @ox/db types        # → packages/supabase/src/database.types.ts
```

## Demo identities

Four seeded identities sign in with a real Supabase session (password
`oxdemo1234`): `mara@ox.fit` (member), `dom@ox.fit` (coach), `iris@ox.fit`
(host), `hq@ox.fit` (admin). RLS makes the same query return different rows per
identity — the acceptance test from the handoff.
