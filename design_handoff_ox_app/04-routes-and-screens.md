# 04 · Routes & Screens

> Each screen lists: route, who (RBAC), the OX DS components it composes, the
> data it binds (API from `03`), and required empty/loading/error states.
> Reference prototypes: `ui_kits/ox-mobile/` and `ui_kits/ox-web/`. The screen
> *visuals* are final (hi-fi) — match them; recreate behavior per this doc.

## Routing model
- **One app, role-routed.** After auth, `NAV[role]` (from `06`) decides Consumer
  vs Operator and which routes exist. Guard every route with `can()` server +
  client; unauthorized → 404 (don't reveal).
- Web paths below are App-Router segments; mobile uses the same names as
  expo-router tabs/stacks.

## Consumer — Member (mobile tabs · web top-nav)
| Screen | Route | DS components | Data | States |
|---|---|---|---|---|
| **Home** | `/` | OXLevelBadge, OXXPBar, OXStreak, OXQuestRow, OXBookingCard, OXPost, OXHerdThat | `/me`, `/me/quests`, next booking, feed | loading skeletons (OXSkeleton); empty quests |
| **Train** | `/train` | OXFilterBar, OXExerciseCard, OXRecoveryMap, OXPRChip, OXButton(generate) | `/exercises`, `/me/recovery`, `/me/prs` | empty filter result; gen error |
| **Player** | `/train/session/:id` | OXExercisePlayer, OXSetRow, OXRestTimer, OXZoneBar | `/workouts/:id` + `POST sets` | timer running/rest; finish → toast +XP |
| **Events** | `/events` | OXEventCard, OXRaidCard, OXTribeBoard, OXChip(curated) | `/events` (public) | empty nearby |
| **Event/Ticket** | `/events/:id` | OXChallengeHero, ticket tiers, OXCheckIn(QR) | `/events/:id`, `POST tickets` | sold-out tier; reserved→paid→checked_in |
| **Shop** | `/shop` | product grid (OXCard-ish), OXChip(collection), level-lock tag | `/products` | gated drop (locked); empty collection |
| **PDP** | `/shop/:id` | gallery, size picker, OXButton(add) | `/products/:id` | OOS size; add→cart badge |
| **Cart/Checkout** | `/cart` | line items, OXButton(checkout), order confirm | `/cart`,`/checkout` | empty cart; payment error; confirmation |
| **You** | `/you` | OXAvatar, OXStat, OXMedal, OXSpeciesBadge, OXSetting, orders | `/me`, `/me/orders` | — |

## Operator — Coach / Host / Admin (mobile tabs · web `OXAppShell` sidebar)
| Screen | Route | Roles | DS components | Data (RLS-scoped) |
|---|---|---|---|---|
| **Today/Dashboard** | `/ops` | all ops | OXStat/OXKpi, OXLineChart, OXBars, OXBanner | KPIs, revenue, floor load |
| **Calendar/Schedule** | `/ops/calendar` | all ops (write: host/admin) | week grid, OXClassRow, OXButton(New class·gated) | `/classes` |
| **Members** | `/ops/members` | host, admin | OXDataTable, OXBadge(status), search | `/members` (host=floor, admin=all) |
| **Clients** | `/ops/clients` | coach | OXCoachCard/list, OXDataTable | `/clients` (own roster) |
| **Member detail** | `/ops/members/:id` | host,admin,coach | profile sheet, attendance, OXProgress, comms | `/members/:id` |
| **Program builder** | `/ops/programs` | coach | OXExerciseCard picker, OXSetRow | `POST /programs` |
| **Memberships** | `/ops/memberships` | host, admin | tier cards, OXTag(add-ons) | `/memberships` |
| **Payments** | `/ops/payments` | host, admin | OXDataTable(ledger), OXBadge(state), retry | `/payments` (RLS), `POST retry` |
| **Reports** | `/ops/reports` | host, admin, coach(own) | OXLineChart, OXBars, cohort, demographics | `/reports/*` |
| **Inbox/Campaigns** | `/ops/inbox` | host, admin | OXComposer, campaign stats | `/campaigns` |
| **Floor & Equipment** | `/ops/floor` | host | OXListRow, equipment inventory, OXSwitch | `/floors/:id` |
| **Admin: Floors** | `/ops/admin/floors` | admin | OXDataTable, map | `/admin/floors` |
| **Admin: Challenges** | `/ops/admin/challenges` | admin | OXChallengeHero builder | `/admin/challenges` |
| **Admin: Staff/RBAC** | `/ops/admin/staff` | admin | OXDataTable, role select | `/admin/staff` |

## Cross-cutting requirements
- **Chrome (every signed-in screen):** identity, **RLS scope chip** (`scopeLabel`), Switch role / sign out, cart (consumer). Already in both prototypes.
- **Every list:** loading (OXSkeleton/OXSpinner), empty (OXEmpty), error (OXBanner tone=danger + retry).
- **Every gated action:** if `!can()`, hide the control (don't disable-and-reveal).
- **A11y:** focus-trap overlays (OXModal owns it), ESC, scroll-lock; 44px hit targets; one-accent status never relies on hue alone (pair with label/icon).
