# Security — OX Platform

## Reporting a vulnerability
Email **security@ox.fit** (PGP on request). Please do not open public issues for
security reports. We acknowledge within 48 hours and aim to remediate critical
issues within 7 days. We support coordinated disclosure.

## Architecture controls

- **AuthN:** OTP / passkey → JWT carrying `{ userId, role, floorId }`. The token
  is the source of truth for authorization — never client state.
- **AuthZ — two boundaries:**
  1. **Row-Level Security (RLS) in Postgres** is the *data* boundary. The API
     decodes the JWT and sets session GUCs (`ox.user_id/ox.role/ox.floor_id`);
     policies filter every row in SQL (`db/prisma/migrations/rls/policies.sql`).
     The app must connect as a **non-superuser, non-`BYPASSRLS`** role or
     policies are skipped.
  2. **Capabilities** are the *verb* boundary. Every privileged write checks
     `can(session, cap)` (`@ox/rbac`) server-side, not just in the UI.
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
