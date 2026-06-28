# OX — Roles, Permissions (RBAC) & Row-Level Security (RLS)

> This is the access contract the apps demonstrate and the backend must enforce.
> The clickable prototypes embody it literally in `ui_kits/_app/data.js`
> (`CAPS`, `NAV`, `scope()`) — treat that file as the executable spec.
> **Client-side scoping in the prototype is for demonstration only. In
> production, RLS MUST be enforced server-side (Postgres RLS policies / API
> authorization), never trusted from the client.**

## Roles
| Role | App surface | Real-world identity |
|---|---|---|
| **member** | Consumer (mobile tabs Home·Train·Events·Shop·You / web Train·Events·Shop·Community) | An OX athlete |
| **coach** | Operator | Trains a roster across one or more floors |
| **host** | Operator | Runs one partner floor (gym) |
| **admin** | Operator | OX HQ — all floors, billing, analytics |

RBAC routing: `NAV[role].app` picks consumer vs operator; `NAV[role].tabs`
picks the visible surfaces. Member never sees operator tabs; coach gets a
reduced operator nav (Dashboard · Calendar · Clients · Reports); host & admin
get the full console.

## Capabilities (RBAC)
From `CAPS` in `data.js`. `can(session, cap)` gates every privileged action
(buttons, mutations, API calls). `"*"` = all.

- **member**: `app.consumer`, `class.book`, `raid.join`, `shop.buy`, `workout.log`, `social.post`, `self.view`
- **coach**: `app.operator`, `class.book`, `workout.log`, `social.post`, `self.view`, `clients.view`, `program.write`, `roster.view`
- **host**: `app.operator`, `self.view`, `floor.manage`, `equipment.manage`, `class.manage`, `members.view`, `revenue.view`, `checkin.scan`
- **admin**: `*`

In the UI these gate, e.g.: "Add class" (`class.manage` — host/admin only;
coach sees read-only schedule), "Charge member"/Payments (`revenue.view`),
"Program builder" (`program.write` — coach), automation & staff/RBAC settings
(admin only).

## Row-Level Security (RLS)
The single gate is `scope(entity, rows, session)`. The SAME query returns
different rows per identity — verified in the prototype:

| Entity | member | coach | host | admin |
|---|---|---|---|---|
| **members** | self only (1) | own roster — `coachId == me` (5) | own floor — `floorId == mine` (3) | all (7) |
| **classes** | all bookable | `coachId == me` | `floorId == mine` | all |
| **tx / payments** | own | own | own floor (3) | all (6) |
| **events** | public discovery | public | public | public |

(Counts shown are the seed-data results the demo returns.)

### Production enforcement (Postgres RLS sketch)
```sql
-- session carries: current_user_id, current_role, current_floor_id
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY members_self ON members FOR SELECT
  USING (current_role = 'member' AND id = current_user_id);
CREATE POLICY members_coach ON members FOR SELECT
  USING (current_role = 'coach' AND coach_id = current_user_id);
CREATE POLICY members_host ON members FOR SELECT
  USING (current_role = 'host' AND floor_id = current_floor_id);
CREATE POLICY members_admin ON members FOR ALL
  USING (current_role = 'admin');
```
Mirror per table (classes → coach_id/floor_id; payments → floor_id; events →
public read). Writes get matching `WITH CHECK` policies. The API layer sets the
session GUCs from the authenticated JWT; the client never supplies scope.

## Session shape
`sessionFor(userId)` →
`{ userId, name, initial, role, floorId, floors[], level, xp, homeFloor }`.
The store (`ui_kits/_app/store.js`) persists it to localStorage per surface;
`signIn(userId)` / `signOut()` drive the gate. In production this is the
decoded auth token; `scopeLabel(session)` is the human-readable scope shown in
the app chrome ("Pier 9 Iron only", "Own roster", "Self only", "All floors").

## Auth gate
`ui_kits/_app/gate.jsx` (`window.OXGate`) is the sign-in/identity picker. In
production replace the demo account list with real auth (OTP/passkey —
component `OXOTP` exists); the role + scope come from the verified identity.
