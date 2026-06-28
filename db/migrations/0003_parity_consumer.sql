-- OX parity: consumer tables. Owner-scoped via app_uid(). Additive; idempotent.

do $$ begin create type "NotificationKind" as enum ('system','coach','social','commerce','booking','quest');
exception when duplicate_object then null; end $$;
do $$ begin create type "HealthProvider" as enum ('apple_health','google_fit','garmin','whoop','fitbit');
exception when duplicate_object then null; end $$;
do $$ begin create type "DiscountKind" as enum ('percent','fixed');
exception when duplicate_object then null; end $$;
do $$ begin create type "CreditReason" as enum ('purchase','booking','refund','gift','adjustment','referral');
exception when duplicate_object then null; end $$;

create table if not exists "Notification" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  kind "NotificationKind" not null default 'system', title text not null,
  body text not null default '', href text, read boolean not null default false,
  "createdAt" timestamptz not null default now()
);
create index if not exists "Notification_userId_idx" on "Notification"("userId");

create table if not exists "BodyMetric" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  at timestamptz not null default now(),
  "weightLb" double precision, "bodyFatPct" double precision, "restingHr" integer, notes text
);
create index if not exists "BodyMetric_userId_idx" on "BodyMetric"("userId");

create table if not exists "WishlistItem" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  "productId" text not null references "Product"(id) on delete cascade,
  "createdAt" timestamptz not null default now(), unique ("userId","productId")
);
create index if not exists "WishlistItem_userId_idx" on "WishlistItem"("userId");

create table if not exists "ProductReview" (
  id text primary key default gen_random_uuid()::text,
  "productId" text not null references "Product"(id) on delete cascade,
  "userId" text not null references "User"(id) on delete cascade,
  rating integer not null check (rating between 1 and 5), title text,
  body text not null default '', "createdAt" timestamptz not null default now(),
  unique ("productId","userId")
);
create index if not exists "ProductReview_productId_idx" on "ProductReview"("productId");

create table if not exists "ShippingAddress" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  name text not null, line1 text not null, line2 text, city text not null,
  region text not null, postal text not null, country text not null default 'US',
  phone text, "isDefault" boolean not null default false, "createdAt" timestamptz not null default now()
);
create index if not exists "ShippingAddress_userId_idx" on "ShippingAddress"("userId");

create table if not exists "CreditLedger" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  delta integer not null, "balanceAfter" integer not null,
  reason "CreditReason" not null default 'adjustment', note text, at timestamptz not null default now()
);
create index if not exists "CreditLedger_userId_idx" on "CreditLedger"("userId");

create table if not exists "Pack" (
  id text primary key default gen_random_uuid()::text,
  "floorId" text references "Floor"(id) on delete cascade,
  name text not null, credits integer not null, "priceCents" integer not null,
  active boolean not null default true, "createdAt" timestamptz not null default now()
);

create table if not exists "UserPack" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  "packId" text not null references "Pack"(id), "creditsRemaining" integer not null,
  "purchasedAt" timestamptz not null default now(), "expiresAt" timestamptz
);
create index if not exists "UserPack_userId_idx" on "UserPack"("userId");

create table if not exists "GiftCard" (
  id text primary key default gen_random_uuid()::text, code text not null unique,
  "balanceCents" integer not null, "initialCents" integer not null,
  "purchaserId" text references "User"(id) on delete set null, "recipientEmail" text,
  "redeemedById" text references "User"(id) on delete set null, "createdAt" timestamptz not null default now()
);

create table if not exists "PromoCode" (
  id text primary key default gen_random_uuid()::text, code text not null unique,
  kind "DiscountKind" not null default 'percent', value integer not null,
  active boolean not null default true, "maxRedemptions" integer,
  "timesRedeemed" integer not null default 0, "expiresAt" timestamptz, "createdAt" timestamptz not null default now()
);

create table if not exists "Waiver" (
  id text primary key default gen_random_uuid()::text,
  "floorId" text references "Floor"(id) on delete cascade,
  title text not null, body text not null, version integer not null default 1,
  "createdAt" timestamptz not null default now()
);

create table if not exists "WaiverSignature" (
  id text primary key default gen_random_uuid()::text,
  "waiverId" text not null references "Waiver"(id) on delete cascade,
  "userId" text not null references "User"(id) on delete cascade,
  "signedAt" timestamptz not null default now(), unique ("waiverId","userId")
);
create index if not exists "WaiverSignature_userId_idx" on "WaiverSignature"("userId");

create table if not exists "HealthConnection" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  provider "HealthProvider" not null, status text not null default 'connected',
  "connectedAt" timestamptz not null default now(), unique ("userId", provider)
);

create table if not exists "GuestPass" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  code text not null unique, "guestName" text, "usedAt" timestamptz, "expiresAt" timestamptz,
  "createdAt" timestamptz not null default now()
);
create index if not exists "GuestPass_userId_idx" on "GuestPass"("userId");

create table if not exists "OnboardingState" (
  "userId" text primary key references "User"(id) on delete cascade,
  step integer not null default 0, completed boolean not null default false,
  data jsonb not null default '{}'::jsonb, "updatedAt" timestamptz not null default now()
);

-- RLS: owner-scoped
do $$
declare t text;
begin
  foreach t in array array['Notification','BodyMetric','WishlistItem','ShippingAddress','CreditLedger','UserPack','WaiverSignature','HealthConnection','GuestPass','OnboardingState'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('grant select, insert, update, delete on %I to authenticated, service_role;', t);
    execute format('drop policy if exists %I on %I;', t||'_owner', t);
    execute format('create policy %I on %I for all using (is_admin() or "userId" = app_uid()) with check (is_admin() or "userId" = app_uid());', t||'_owner', t);
  end loop;
end $$;

-- ProductReview: public read, author write
alter table "ProductReview" enable row level security;
grant select, insert, update, delete on "ProductReview" to authenticated, service_role;
grant select on "ProductReview" to anon;
drop policy if exists "ProductReview_read" on "ProductReview";
create policy "ProductReview_read" on "ProductReview" for select using (true);
drop policy if exists "ProductReview_author" on "ProductReview";
create policy "ProductReview_author" on "ProductReview" for all using (is_admin() or "userId" = app_uid()) with check (is_admin() or "userId" = app_uid());

-- Pack / Waiver: public read, operator writes own floor
do $$
declare t text;
begin
  foreach t in array array['Pack','Waiver'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('grant select, insert, update, delete on %I to authenticated, service_role;', t);
    execute format('grant select on %I to anon;', t);
    execute format('drop policy if exists %I on %I;', t||'_read', t);
    execute format('create policy %I on %I for select using (true);', t||'_read', t);
    execute format('drop policy if exists %I on %I;', t||'_ops_write', t);
    execute format('create policy %I on %I for all using (is_admin() or (is_operator() and ("floorId" = app_floor() or "floorId" is null))) with check (is_admin() or (is_operator() and ("floorId" = app_floor() or "floorId" is null)));', t||'_ops_write', t);
  end loop;
end $$;

-- GiftCard / PromoCode
alter table "GiftCard" enable row level security;
grant select, insert, update on "GiftCard" to authenticated, service_role;
drop policy if exists "GiftCard_involved" on "GiftCard";
create policy "GiftCard_involved" on "GiftCard" for select using (is_admin() or "purchaserId" = app_uid() or "redeemedById" = app_uid());
drop policy if exists "GiftCard_admin" on "GiftCard";
create policy "GiftCard_admin" on "GiftCard" for all using (is_admin()) with check (is_admin());

alter table "PromoCode" enable row level security;
grant select on "PromoCode" to authenticated, anon, service_role;
grant insert, update, delete on "PromoCode" to service_role;
drop policy if exists "PromoCode_read_active" on "PromoCode";
create policy "PromoCode_read_active" on "PromoCode" for select using (active = true or is_admin());
drop policy if exists "PromoCode_admin" on "PromoCode";
create policy "PromoCode_admin" on "PromoCode" for all using (is_admin()) with check (is_admin());
