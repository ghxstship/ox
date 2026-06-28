-- OX · RLS helper functions (the identity gate).
-- These resolve the current OX User from the Supabase auth session
-- (auth.uid() ↔ "User"."authUserId") and are referenced by every policy.
-- SECURITY DEFINER + STABLE so policies can read "User" regardless of the
-- caller's own row visibility.

create or replace function public.app_uid() returns text
  language sql stable security definer set search_path = public as $$
  select id from "User" where "authUserId" = auth.uid() limit 1 $$;

create or replace function public.app_role() returns text
  language sql stable security definer set search_path = public as $$
  select role::text from "User" where "authUserId" = auth.uid() limit 1 $$;

create or replace function public.app_floor() returns text
  language sql stable security definer set search_path = public as $$
  select "floorId" from "User" where "authUserId" = auth.uid() limit 1 $$;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from "User" where "authUserId" = auth.uid() and role = 'admin') $$;

create or replace function public.is_operator() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from "User" where "authUserId" = auth.uid() and role in ('coach','host','admin')) $$;
