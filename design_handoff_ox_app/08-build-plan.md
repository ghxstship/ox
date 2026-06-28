# 08 · Build Plan (one-pass order)

> Sequence to stand up the whole stack. Each milestone is independently
> verifiable. Seed parity with `ui_kits/_app/data.js` so the demo identities
> (Mara/Dom/Iris/HQ) reproduce in the real app and QA can check RLS.

## M0 · Scaffold
- Monorepo (01): `apps/web`, `apps/mobile`, `apps/api`, `packages/{ds,types,rbac,api-client}`, `db/prisma`.
- Bring in `@ox/ds` (compiled bundle + tokens, or port components 1:1) and load `styles.css` at root.
- `@ox/rbac` = port of `CAPS` + `can()` + `scope()` from `_app/data.js`.
- ✅ Done when: web renders an OXButton from the bundle; types compile.

## M1 · Data + auth + RLS (the spine)
- Prisma schema from `02`; migrate; `seed.ts` = the `_app/data.js` dataset.
- **Postgres RLS policies** for every scoped table (06). API middleware sets
  session GUCs from JWT. OTP/passkey auth → `{jwt, session}`.
- ✅ Done when: `GET /members` returns 7/5/3/1 rows for admin/coach/host/member
  (matches prototype) **enforced in SQL**, not app code.

## M2 · RBAC routing shell (both apps)
- Auth gate (port `gate.jsx`), role-routing (`NAV`), the chrome (identity, RLS
  scope chip, switch role, cart). Web = `OXAppShell` for operator + top-nav for
  consumer; mobile = tab bars.
- ✅ Done when: each identity lands on the right surface with the right nav; the
  scope chip shows the correct label.

## M3 · Consumer vertical (Member)
- Train (library + filter + generator) → Player (log sets, rest, finish→XP) →
  progress (PRs, recovery). Shop → cart → checkout (Stripe) → order. Events →
  ticket → QR check-in. Home + You aggregations. Wire XP/Level + Booking +
  Checkout + Ticket state machines (05).
- ✅ Done when: a member can complete a workout, buy a drop, and RSVP+check-in,
  with XP/level + orders persisting server-side.

## M3.5 · Consumer parity (Fitbod / TeamUp / Shopify / Gymshark / Alo)
- The 24 consumer parity surfaces in `11` §A: Generator + Set Logger v2 first
  (core value), then membership economics (entitlements/gate, packs, drop-in,
  waiver), commerce depth (variants/wishlist/reviews/checkout v2/promo), then
  engagement (wallet, transfer, notifications, onboarding, body metrics, gift,
  hosted events, health sync, search, schedule). New models/API in `11` §C/§D;
  ship the `OXGate` + `OXTimeline` primitives (`11` §E).
- ✅ Done when: a member generates a session, logs it with RPE + auto-progress,
  resolves all four booking-gate states, and checks out with address + shipping —
  persisted server-side.

## M4 · Operator vertical (Host + Coach)
- Dashboard KPIs/charts (RLS-scoped), Calendar (create/recur — `class.manage`
  gated), Members/Clients CRM + detail, Memberships, Payments + failed-payment
  recovery (Stripe webhooks + dunning), Reports, Inbox/campaigns, Floor &
  equipment. Booking penalties + Membership state machines.
- ✅ Done when: host sees only their floor everywhere; coach sees only their
  roster/classes; capability-gated actions hidden for coach.

## M4.5 · Operator parity (Hubfit)
- The 7 operator parity surfaces in `11` §B: Lead Pipeline + Automation Builder
  first (revenue ops), then POS, Staff Scheduling, Commission/Payroll, Recurring
  Class Builder, Contracts/e-sign. All RLS-scoped to floor.
- ✅ Done when: a host advances a lead to member, an automation fires on signup,
  a POS sale rings, and a recurring class generates its occurrences — each
  scoped to the host's floor.

## M5 · Admin + platform
- Admin floors, challenge builder (Iron Safari), staff/RBAC management, global
  analytics. Realtime channels (attendance, leaderboard, feed). Notifications
  (SMS/email) via queue.
- ✅ Done when: admin manages floors + staff + challenges; a level-up unlocks a
  gated drop end-to-end.

## M6 · Hardening
- A11y pass (focus-trap, 44px, non-hue status, reduced-motion) per `07` + the
  project's Accessibility cards. RTL/logical-properties. Conformance to
  `_adherence.oxlintrc.json`. Load/perf budget (offline-first training, per
  `guidelines/stack-optimizations.md`). VPAT.
- ✅ Done when: lint + a11y gates green; demo seed reproduces every prototype flow.

## Acceptance (definition of done)
1. Four seed identities reproduce the prototype behavior on web + mobile.
2. RLS enforced in Postgres (verified by the row-count assertions in M1).
3. Capabilities enforced server-side on every write (not just hidden in UI).
4. The five core state machines (booking, workout, checkout, ticket, payment) pass tests.
5. UI matches the hi-fi prototypes; DS invariants hold (one accent, square, ruled, type, voice).

## Map to references
- Visuals + interaction: `ui_kits/ox-mobile/`, `ui_kits/ox-web/` (+ `_app/`).
- Parity scope: `guidelines/app-parity-spec.md`. Access model: `06`. Components: `07`.
