# 11 · Parity Surfaces (the gap-closing delta)

> This doc is the **delta** on top of `02`–`08`: every screen built to reach
> feature parity with the benchmark products (Fitbod · TeamUp · TIXR · Speakeasy ·
> Shopify · Gymshark · Alo · Hubfit · SweatPals), the **new data models** behind
> them, the **new API surface**, and the **new store actions**. The base docs
> describe the original core; build those first, then layer this in at **M3.5**
> (consumer parity) and **M4.5** (operator parity) of `08`.
>
> Reference prototypes for these surfaces: `references/ox-mobile/parity*.jsx`
> (consumer) and `references/ox-web/parityweb.jsx` (operator). They run on the
> shared runtime in `references/_app/{data,store}.js`. Spec boards (default +
> listed states, on-brand): `references/boards/OX Parity Screens P0|P1|P2.html`.
> Surface→entry-point index: `references/parity-surfaces.card.html`.

---

## A · Consumer surfaces (mobile · `parity*.jsx`)

| # | Screen | Route | DS / kit components | Data (from §B) | States to build |
|---|---|---|---|---|---|
| 1 | **Workout Generator** | `/train/generate` | OXSeg, OXChip, OXRecoveryMap, OXMeter, OXButton | `Exercise`, `Recovery`, `PR` → `WorkoutSession` | empty (pre-gen) · generating (skeleton) · ready · regenerated (diff) · no-equipment fallback |
| 2 | **Exercise Demo** | sheet over `/train/*` | OXSheet, OXChip | `Exercise.media[]/cues[]/alternatives[]` | loading media · no-media (cue-only) · swap-open |
| 3 | **Set Logger v2** | `/train/session/:id` | OXSetRow, OXChip, OXRestTimer, OXMeter | `SetLog`(+group/kind/rpe), reads last session | working · resting · set-done · PR-hit (celebrate) · deload-suggested |
| 4 | **Strength Analytics** | `/you/analytics` | OXLineChart, OXBars, OXKpi | `SetLog`+`PR` aggregates, `Lift` | insufficient-data · single-lift drill-down |
| 5 | **Program Library** | `/train/programs` (+`/:id`) | OXCardGrid, OXCard, OXChip, OXMeter | `Program`(public/weeks/level), `Enrollment` | not-enrolled · enrolled (progress) · completed |
| 6 | **Entitlements + Booking Gate** | `/you/plan` | OXMeter, OXChip, gate badge | `MembershipPlan`, `CreditWallet`, `Membership` | included · pack · drop-in · locked · over-limit |
| 7 | **Class Packs / Credits** | `/you/credits` | OXCard, OXMeter, OXButton | `Package`, `CreditWallet`, `CreditLedger` | balance · buy-pack · ledger · expired |
| 8 | **Drop-in Purchase** | sheet | OXSheet, checkout | `Class`, `Payment` | member-rate · pay → booked · error |
| 9 | **Booking Questions / Waiver** | sheet (gate ▸ Included) | OXField, OXCheckbox, OXSheet | `BookingQuestion`, `BookingAnswer`, `WaiverSignature` | per-question · waiver-unscrolled (CTA locked) · consented |
| 10 | **Commerce PDP v2** | `/shop/:id` | size picker, OXChip, wishlist heart | `ProductVariant`(stock), `Wishlist`, `Discount` | low-stock · sold-out · notify-me · sale price · saved |
| 11 | **Reviews + Size Guide** | `/shop/:id#reviews` | histogram, fit bar, OXTable | `Review`, size guide table | empty · write-review sheet · fit-finder result |
| 12 | **Order Tracking + Returns** | `/you/orders/:id` | OXTimeline*, OXListRow, OXButton | `Order`, `Address`, `Shipment`, `Return` | placed→packed→shipped→delivered · start-return |
| 13 | **Checkout v2** | `/cart/checkout` | address book, shipping radios, OXButton | `Address`, `Shipment`, `Order` | empty-address · method-select · tax math · placed |
| 14 | **Promo / Access Code** | `/you/code` or cart | OXField, OXChip--oxide | `PromoCode`, `AccessCode` | applied (discount line) · presale-unlock · invalid |
| 15 | **Wallet Pass** | `/you/wallet` | OXCredential, QR, OXButton | `Membership` → wallet credential | active · expired · not-eligible · guest-pass issued |
| 16 | **Ticket Transfer / Gift** | sheet | recipient search, OXButton | `Ticket`(transfer state, recipient) | transferable · pending · claimed |
| 17 | **Notification Center** | `/you/notifications` | OXNotif, OXListRow, unread dot | `Notification` (grouped) | unread · read · empty |
| 18 | **Onboarding / Assessment** | `/onboarding` | OXStepper, OXChoiceGroup, progress dots | `OnboardingProfile` | per-step · skippable · resume · summary→seed |
| 19 | **Body Metrics** | `/you/body` | OXLineChart, OXSheet, photo grid | `BodyMetric`, `ProgressPhoto` | empty · entry sheet · before/after compare |
| 20 | **Gift Cards & Subscriptions** | `/shop/gift` | amount picker, OXSwitch | `GiftCard`, `Subscription` | buy · redeem · subscribe-to-restock |
| 21 | **Member-Hosted Event** | `/events/new` | create form, OXStepper(capacity) | `Event`(createdBy, status) | draft · pending-review · published |
| 22 | **Health / Wearable Sync** | `/you/connections` | connect cards, OXSwitch | `HealthConnection`, `HealthSample` | not-connected · connected (readout→recovery/XP) |
| 23 | **Global Search** | overlay (⌕) | OXCmdk, OXSearch | cross-entity index | empty · grouped results · deep-link |
| 24 | **My Schedule + iCal** | `/you/schedule` | agenda/week toggle, OXListRow | `Booking`+`Event` | agenda · week · add-to-calendar (.ics) |

`*` OXTimeline, OXCredential, the gate badge: ship as **new DS primitives** (see §E).

## B · Operator surfaces (web console · `parityweb.jsx`)

| # | Screen | Nav | Roles | DS components | Data (RLS-scoped) | States |
|---|---|---|---|---|---|---|
| 25 | **Lead / Prospect Pipeline** | Pipeline | host, admin | OXData, OXListRow, OXChip | `Lead`, `LeadActivity` | stage columns · card→advance · weighted total · won/lost |
| 26 | **Automation Builder** | Automations | host, admin | OXSetting, OXSwitch, OXListRow | `Automation`, `AutomationRun` | rule list · enable toggle · run history |
| 27 | **POS · Desk Sales** | POS | host | OXCardGrid, cart, tender | `Product`/`Package` → `Payment` | grid · tap-to-cart · tender (card/cash) · receipt |
| 28 | **Staff Scheduling / Shifts** | Schedule | coach, host | week grid, OXChip | `Shift`, `Availability` | class · floor · open-shift · cover-request |
| 29 | **Commission / Payroll** | Payroll | admin | OXData, OXKpi, export | `Commission` | per-staff earnings · period select · CSV export |
| 30 | **Recurring Class Builder** | Class series | coach, host | day picker, OXField, preview | `Class`(recurRule, seriesId) | new · editing-series · single-occurrence (this vs all-future) |
| 31 | **Contracts / Waivers + e-sign** | Contracts | host, admin | template list, signature pad | `Agreement`, `Signature` | template · sign flow (scroll+sign) · signed archive |

---

## C · New Prisma models (parity delta — add to `02`)

```prisma
// — Membership economics —
model MembershipPlan {            // entitlements behind a Tier
  id String @id @default(cuid())
  tier Tier
  classesPerMonth Int?            // null = unlimited
  guestPasses Int @default(0)
  floorsIncluded Int @default(0)
  benefits String[]
}
model Package      { id String @id @default(cuid()) name String credits Int priceCents Int expiryDays Int floorId String }
model CreditWallet { id String @id @default(cuid()) userId String balance Int @default(0) expiresAt DateTime? }
model CreditLedger { id String @id @default(cuid()) walletId String delta Int reason String at DateTime @default(now()) }

// — Commerce depth —
model ProductVariant { id String @id @default(cuid()) productId String size String color String? stock Int @default(0) }
model Discount    { id String @id @default(cuid()) code String @unique kind String valueCents Int? percent Int? activeFrom DateTime? activeTo DateTime? }
model PromoCode   { id String @id @default(cuid()) code String @unique discountId String? eventId String? }
model AccessCode  { id String @id @default(cuid()) code String @unique eventId String unlocksPresale Boolean @default(true) }
model Wishlist    { id String @id @default(cuid()) userId String productId String @@unique([userId,productId]) }
model Review      { id String @id @default(cuid()) productId String userId String rating Int body String fit String? photos String[] at DateTime @default(now()) }
model Address     { id String @id @default(cuid()) userId String label String line1 String city String region String postal String country String isDefault Boolean @default(false) }
model Shipment    { id String @id @default(cuid()) orderId String method String costCents Int etaDays Int state String trackingNo String? } // placed|packed|shipped|delivered
model Return      { id String @id @default(cuid()) orderId String reason String state String refundCents Int }
model GiftCard    { id String @id @default(cuid()) code String @unique balanceCents Int purchaserId String }
model Subscription{ id String @id @default(cuid()) userId String productId String cadenceDays Int nextAt DateTime active Boolean @default(true) }
model DropNotify  { id String @id @default(cuid()) userId String productId String @@unique([userId,productId]) }

// — Training depth —
model Lift        { id String @id @default(cuid()) userId String name String est1RM Float at DateTime @default(now()) }
model Program     { id String @id @default(cuid()) title String public Boolean @default(false) weeks Int sessionsPerWeek Int level String coverUrl String? } // extends core
model Enrollment  { id String @id @default(cuid()) userId String programId String week Int @default(1) state String @@unique([userId,programId]) } // not_enrolled|enrolled|completed
model BodyMetric  { id String @id @default(cuid()) userId String kind String value Float unit String at DateTime @default(now()) } // weight|waist|bodyfat
model ProgressPhoto { id String @id @default(cuid()) userId String url String at DateTime @default(now()) }

// — Booking & access —
model BookingQuestion { id String @id @default(cuid()) floorId String prompt String kind String required Boolean @default(true) }
model BookingAnswer   { id String @id @default(cuid()) bookingId String questionId String value String }
model WaiverSignature { id String @id @default(cuid()) userId String classId String signedAt DateTime @default(now()) }
model AccessGrant { id String @id @default(cuid()) userId String floorId String code String active Boolean @default(true) }
model AccessLog   { id String @id @default(cuid()) floorId String userId String at DateTime @default(now()) door String }
model GuestPass   { id String @id @default(cuid()) issuerId String floorId String code String usedAt DateTime? }

// — Cross-cutting —
model Notification { id String @id @default(cuid()) userId String group String title String body String deepLink String? read Boolean @default(false) at DateTime @default(now()) } // events|herd|drops|coach|billing|game
model OnboardingProfile { id String @id @default(cuid()) userId String @unique goal String experience String equipment String[] limits String[] schedule String[] homeFloorId String? }
model HealthConnection { id String @id @default(cuid()) userId String provider String connected Boolean @default(false) } // apple_health|google_fit|strava
model HealthSample { id String @id @default(cuid()) userId String kind String value Float at DateTime @default(now()) }

// — Operator (Hubfit parity) —
model Lead        { id String @id @default(cuid()) floorId String name String contact String source String stage String notes String? valueCents Int @default(0) } // lead|tour|trial|member|lost
model LeadActivity{ id String @id @default(cuid()) leadId String kind String note String at DateTime @default(now()) }
model Automation  { id String @id @default(cuid()) floorId String trigger String action String delayHours Int @default(0) enabled Boolean @default(true) }
model AutomationRun { id String @id @default(cuid()) automationId String at DateTime @default(now()) result String }
model Shift       { id String @id @default(cuid()) floorId String staffId String startsAt DateTime endsAt DateTime kind String coverRequested Boolean @default(false) } // class|floor|open
model Availability{ id String @id @default(cuid()) staffId String dow Int startMin Int endMin Int }
model Commission  { id String @id @default(cuid()) staffId String period String classesCents Int ptCents Int retailCents Int }
model Agreement   { id String @id @default(cuid()) floorId String title String body String version Int @default(1) }
model Signature   { id String @id @default(cuid()) agreementId String userId String dataUrl String signedAt DateTime @default(now()) }
```

Also **extend core models**: `Exercise(+media[], cues[], alternatives[])`,
`SetLog(+group, kind: warmup|working, rpe)`, `Ticket(+transferState, recipientId)`,
`Event(+createdBy, status: draft|pending|published)`, `Product(+releaseAt for drops)`.

## D · New API surface (add to `03`)

```
# Training
POST /train/generate            {goal,minutes,equipment[]} → Session (unsaved)
GET  /exercises/:id/demo        → media[], cues[], alternatives[]
GET  /me/analytics              → {lifts[], volumeByWeek[], muscleBalance[], prTimeline[]}
GET  /programs?public=1&...     · POST /programs/:id/enroll · GET /me/enrollments
# Membership economics
GET  /me/plan                   → entitlements + usage meters
GET  /me/credits · POST /packages/:id/buy · GET /me/credits/ledger
POST /classes/:id/dropin        (Stripe) → Booking
POST /classes/:id/answers       {answers[], waiverSigned}
# Commerce
GET  /products/:id/variants · POST /me/wishlist/:productId (toggle)
GET  /products/:id/reviews · POST /products/:id/reviews
POST /cart/promo {code} · GET /me/addresses · POST /checkout {addressId,method}
GET  /me/orders/:id/tracking · POST /orders/:id/return
POST /products/:id/notify · POST /giftcards · POST /me/subscriptions
# Tickets & access
POST /tickets/:id/transfer {recipient} · POST /events/:id/code {code}
GET  /me/wallet (pass) · POST /floors/:id/guestpass · GET /floors/:id/access (host)
# Cross-cutting
GET  /me/notifications · POST /me/notifications/read
POST /onboarding · GET /search?q= · POST /me/health/:provider (connect)
GET  /me/body · POST /me/body · POST /me/body/photo
# Operator (RLS-scoped to floor)
GET/POST /leads · POST /leads/:id/stage · POST /leads/:id/convert
GET/POST /automations · POST /automations/:id/toggle
GET /pos/catalog · POST /pos/sale · GET /shifts · POST /shifts/:id/cover
GET /commission?period= (CSV) · POST /classes/recur {rule} · GET/POST /agreements · POST /agreements/:id/sign
```

## E · New DS primitives to ship

Three reusable components the parity screens introduced — build as real
`components/<group>/<Name>.{jsx,d.ts}` with `@dsCard` thumbnails so they enter
the kit, not as one-offs:
- **`OXGate`** — the booking-gate badge: `state = included | credit | dropin | locked | overlimit`, copper-keyed, mono caps. (forms/ or product/)
- **`OXTimeline`** — vertical step tracker (order: placed→packed→shipped→delivered), ruled, copper active node. (data/)
- **`OXCredential`** — already exists; reuse for Wallet Pass (QR + tier + member#).

## F · New store actions (reference runtime · `_app/store.js`)

Persisted to localStorage in the prototype; in production these are API writes:
`enrollProgram · toggleHealth · toggleSub · moveLead · toggleAuto · logSetDone ·
pickAddress · pickShipping · toggleOccurrence`. Each maps 1:1 to a §D endpoint.

## G · Build order (slots into `08`)

- **M3.5 · Consumer parity** (after M3): surfaces 1–24. Generator + Set Logger v2
  first (core value), then membership economics (6–9), commerce depth (10–14),
  then engagement (15–24). Wire the booking gate as a real fork (Included→waiver,
  Drop-in→pay, Credit→wallet).
  ✅ Done when: a member generates a session, logs it with RPE + auto-progress,
  hits the gate on a class and resolves all four states, and checks out with an
  address + shipping method — all persisted server-side.
- **M4.5 · Operator parity** (after M4): surfaces 25–31. Pipeline + Automations
  first (revenue ops), then POS, scheduling, commission, recurring builder,
  contracts.
  ✅ Done when: a host advances a lead to member, toggles an automation that
  fires on signup, rings a POS sale, and a recurring class generates its
  occurrences — all RLS-scoped to their floor.
