# Security — OX Platform

## Reporting a vulnerability
Email **security@ox.fit** (PGP on request). Please do not open public issues for
security reports. We acknowledge within 48 hours and aim to remediate critical
issues within 7 days. We support coordinated disclosure.

## Architecture controls

- **AuthN:** Supabase Auth (email OTP / passwordless) → a Supabase access token
  (JWT). The token is the source of truth for authorization — never client state.
- **AuthZ — two boundaries:**
  1. **Row-Level Security (RLS) in Postgres (Supabase)** is the *data* boundary.
     Policies resolve the caller via `auth.uid() ↔ "User"."authUserId"` and the
     `app_uid()/app_role()/app_floor()/is_admin()/is_operator()` helpers
     (`db/migrations/0001_rls_helpers.sql`); every read/write is scoped in SQL.
     Browser and server both go through supabase-js as the signed-in user.
  2. **Capabilities** are the *verb* boundary. Every privileged write checks
     `can(session, cap)` (`@ox/rbac`) server-side, not just in the UI. The API
     uses the service role only for trusted writes (webhooks, automations) with
     explicit `userId`/`floorId` scoping.
- **Defense in depth:** client `scope()`/`can()` only hide what the server would
  refuse; they are never trusted as enforcement.
- **Payments:** PCI SAQ-A — card data is tokenized by Stripe client-side; OX
  stores only Stripe ids. Webhooks verify the Stripe signature and are
  idempotent by event id.
- **Transport & headers:** HTTPS only; Helmet sets HSTS, X-Content-Type-Options,
  frame-ancestors, and a strict CSP in production.
- **Input validation:** `class-validator` DTOs on every endpoint; output is the
  single `Error` envelope (no stack leaks).
- **Secrets:** environment-injected; never committed. `.env.example` documents
  the surface.
- **Audit:** privileged actions (role changes, payments, floor management) are
  logged with actor, scope, and timestamp.

## Hardening checklist (M6)
- [ ] DB app-role is non-superuser + `NOBYPASSRLS`, RLS `FORCE`d on scoped tables.
- [ ] RLS row-count assertions pass (7/5/3/1 members; 6/3 payments).
- [ ] Capability guard covers every mutating route.
- [ ] Rate limiting + brute-force protection on auth.
- [ ] Dependency + container scanning in CI.
- [ ] CSP / security headers verified in staging.
