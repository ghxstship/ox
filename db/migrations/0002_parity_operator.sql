-- OX parity: operator + infra tables. Floor-scoped via the RLS helpers
-- (is_admin() / is_operator() / app_floor()). Additive; idempotent.

do $$ begin create type "LeadStage" as enum ('lead','tour','trial','member','lost');
exception when duplicate_object then null; end $$;
do $$ begin create type "AutomationTrigger" as enum ('signup','booking','missed_class','membership_lapsed');
exception when duplicate_object then null; end $$;
do $$ begin create type "ShiftKind" as enum ('class','floor','open');
exception when duplicate_object then null; end $$;

create table if not exists "Lead" (
  id text primary key default gen_random_uuid()::text,
  "floorId" text not null references "Floor"(id) on delete cascade,
  name text not null, contact text not null, source text not null default 'walk_in',
  stage "LeadStage" not null default 'lead', notes text,
  "valueCents" integer not null default 0,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create index if not exists "Lead_floorId_idx" on "Lead"("floorId");

create table if not exists "LeadActivity" (
  id text primary key default gen_random_uuid()::text,
  "leadId" text not null references "Lead"(id) on delete cascade,
  "floorId" text not null references "Floor"(id) on delete cascade,
  kind text not null, note text not null default '', at timestamptz not null default now()
);
create index if not exists "LeadActivity_leadId_idx" on "LeadActivity"("leadId");

create table if not exists "Automation" (
  id text primary key default gen_random_uuid()::text,
  "floorId" text not null references "Floor"(id) on delete cascade,
  name text, trigger "AutomationTrigger" not null, action text not null,
  "delayHours" integer not null default 0, enabled boolean not null default true,
  "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create index if not exists "Automation_floorId_idx" on "Automation"("floorId");

create table if not exists "AutomationRun" (
  id text primary key default gen_random_uuid()::text,
  "automationId" text not null references "Automation"(id) on delete cascade,
  "floorId" text not null references "Floor"(id) on delete cascade,
  at timestamptz not null default now(), result text not null default ''
);
create index if not exists "AutomationRun_automationId_idx" on "AutomationRun"("automationId");

create table if not exists "Shift" (
  id text primary key default gen_random_uuid()::text,
  "floorId" text not null references "Floor"(id) on delete cascade,
  "staffId" text not null references "User"(id) on delete cascade,
  "startsAt" timestamptz not null, "endsAt" timestamptz not null,
  kind "ShiftKind" not null default 'floor', "coverRequested" boolean not null default false,
  "createdAt" timestamptz not null default now()
);
create index if not exists "Shift_floorId_idx" on "Shift"("floorId");
create index if not exists "Shift_staffId_idx" on "Shift"("staffId");

create table if not exists "Agreement" (
  id text primary key default gen_random_uuid()::text,
  "floorId" text not null references "Floor"(id) on delete cascade,
  title text not null, body text not null, version integer not null default 1,
  archived boolean not null default false, "createdAt" timestamptz not null default now()
);
create index if not exists "Agreement_floorId_idx" on "Agreement"("floorId");

create table if not exists "Signature" (
  id text primary key default gen_random_uuid()::text,
  "agreementId" text not null references "Agreement"(id) on delete cascade,
  "floorId" text not null references "Floor"(id) on delete cascade,
  "userId" text not null references "User"(id) on delete cascade,
  "dataUrl" text not null, "signedAt" timestamptz not null default now()
);
create index if not exists "Signature_agreementId_idx" on "Signature"("agreementId");

create table if not exists "WebhookEvent" (
  id text primary key, type text not null,
  "receivedAt" timestamptz not null default now(), "processedAt" timestamptz
);

-- RLS: floor-scoped operator tables
do $$
declare t text;
begin
  foreach t in array array['Lead','LeadActivity','Automation','AutomationRun','Shift','Agreement','Signature'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('grant select, insert, update, delete on %I to authenticated, service_role;', t);
    execute format('drop policy if exists %I on %I;', t||'_floor_read', t);
    execute format('create policy %I on %I for select using (is_admin() or (is_operator() and "floorId" = app_floor()));', t||'_floor_read', t);
    execute format('drop policy if exists %I on %I;', t||'_floor_write', t);
    execute format('create policy %I on %I for all using (is_admin() or (is_operator() and "floorId" = app_floor())) with check (is_admin() or (is_operator() and "floorId" = app_floor()));', t||'_floor_write', t);
  end loop;
end $$;

drop policy if exists "Signature_self" on "Signature";
create policy "Signature_self" on "Signature" for select using ("userId" = app_uid());
drop policy if exists "Signature_self_sign" on "Signature";
create policy "Signature_self_sign" on "Signature" for insert with check ("userId" = app_uid());
drop policy if exists "Agreement_member_read" on "Agreement";
create policy "Agreement_member_read" on "Agreement" for select using ("floorId" = app_floor());

-- WebhookEvent: service role only
alter table "WebhookEvent" enable row level security;
grant select, insert, update on "WebhookEvent" to service_role;
