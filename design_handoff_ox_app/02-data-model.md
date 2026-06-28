# 02 · Data Model

> Prisma-flavoured. Every table that holds tenant data carries `floorId` and/or
> `coachId`/`ownerId` so the RLS policies in `06` can scope it. Enums use OX
> vocabulary. IDs are cuid. Timestamps (`createdAt`/`updatedAt`) implied on all.

## Enums
```prisma
enum Role        { member coach host admin }
enum Tier        { compass sound distant founder }      // membership tiers
enum ClassLoad   { open fill full }
enum BookingState{ booked waitlist attended late_cancel no_show cancelled }
enum PayState    { pending paid failed refunded }
enum OrderState  { cart placed paid fulfilled cancelled }
enum TicketState { reserved paid checked_in refunded }
enum Scenery     { oceanfront rooftop industrial sunrise forest }
enum Muscle      { push pull legs core full_body arms back chest glutes }
enum Equipment   { barbell dumbbell kettlebell cable machine band bodyweight trx }
enum RPE         // 6..10 (smallint in practice)
```

## Identity & tenancy
```prisma
model User {
  id        String  @id @default(cuid())
  name      String
  email     String  @unique
  initial   String
  role      Role
  level     Int     @default(1)
  xp        Int     @default(0)
  homeFloorId String?
  coachId   String?               // member → their coach
  coach     User?   @relation("Roster", fields:[coachId], references:[id])
  roster    User[]  @relation("Roster")
  floorId   String?               // host → owned floor; member → home floor (CRM)
  floor     Floor?  @relation(fields:[floorId], references:[id])
  // relations: bookings, orders, tickets, sessions(workout), posts, memberships
}

model Floor {                     // partner gym OX plugs into
  id      String  @id @default(cuid())
  name    String
  scenery Scenery
  hostId  String                  // owning host (User.role=host)
  equipment FloorEquipment[]
  classes Class[]
  address String?
  geo     Json?                   // {lat,lng}
}

model FloorEquipment {            // what a floor can host (drives discovery)
  id        String @id @default(cuid())
  floorId   String
  equipment Equipment
  count     Int @default(1)
}
```

## Training
```prisma
model Exercise {                  // library (Fitbod parity)
  id        String @id @default(cuid())
  name      String
  muscles   Muscle[]
  equipment Equipment[]
  demoUrl   String?               // S3 media
  cue       String?
}
model WorkoutSession {            // a logged workout (owner-scoped)
  id        String @id @default(cuid())
  userId    String
  floorId   String?               // where performed (plug-in)
  scenery   Scenery?
  startedAt DateTime
  endedAt   DateTime?
  xpAwarded Int @default(0)
  sets      SetLog[]
}
model SetLog {
  id         String @id @default(cuid())
  sessionId  String
  exerciseId String
  index      Int
  weight     Float?
  reps       Int
  rpe        Int?
  done       Boolean @default(false)
}
model PR {                        // personal record stamp
  id String @id @default(cuid())
  userId String
  lift   String
  value  Float
  unit   String @default("lb")
  at     DateTime @default(now())
}
model Recovery {                  // muscle freshness per user
  userId String
  muscle Muscle
  state  String                   // fresh|light|worked|spent
  @@id([userId, muscle])
}
```

## Classes & booking (TeamUp parity)
```prisma
model Class {
  id       String @id @default(cuid())
  title    String
  floorId  String                 // RLS: host scope
  coachId  String                 // RLS: coach scope
  startsAt DateTime
  capacity Int
  load     ClassLoad @default(open)
  recurRule String?               // RRULE for recurring
  bookings Booking[]
}
model Booking {
  id       String @id @default(cuid())
  classId  String
  userId   String
  state    BookingState @default(booked)
  waitlistPos Int?
  createdAt DateTime @default(now())
  @@unique([classId, userId])
}
```

## Events / raids (SweatPals parity)
```prisma
model Event {
  id        String @id @default(cuid())
  title     String
  floorId   String?
  hostName  String
  startsAt  DateTime
  rewardXp  Int @default(0)
  capacity  Int?
  tiers     TicketTier[]
  tickets   Ticket[]
  isRaid    Boolean @default(false)
}
model TicketTier { id String @id @default(cuid()) eventId String name String priceCents Int qty Int }
model Ticket {
  id      String @id @default(cuid())
  eventId String
  tierId  String
  userId  String
  state   TicketState @default(reserved)
  qrCode  String @unique
  checkedInAt DateTime?
}
```

## Memberships & payments (TeamUp/Stripe)
```prisma
model Membership {
  id       String @id @default(cuid())
  userId   String
  floorId  String
  tier     Tier
  addOns   String[]               // private coaching, extra sessions, workshops
  status   String                 // active|paused|cancelled|past_due
  renewsAt DateTime?
  stripeSubId String?
}
model Payment {
  id       String @id @default(cuid())
  userId   String
  floorId  String                 // RLS: host scope; Connect payout target
  kind     String                 // Membership|Private coaching|Workshop|Shop|Ticket|Founder tier
  amountCents Int
  state    PayState @default(pending)
  stripePiId String?
  at       DateTime @default(now())
}
```

## Commerce (Alo parity)
```prisma
model Product {
  id      String @id @default(cuid())
  name    String
  priceCents Int
  collection String                // "new", "drop", etc.
  sizes   String[]
  colors  String[]
  imageUrl String?
  gateLevel Int @default(0)        // level-gated drops (0 = open)
}
model Order {
  id     String @id @default(cuid())
  userId String
  state  OrderState @default(cart)
  totalCents Int
  items  OrderItem[]
  placedAt DateTime?
}
model OrderItem { id String @id @default(cuid()) orderId String productId String size String qty Int priceCents Int }
```

## Social & game
```prisma
model Tribe   { id String @id @default(cuid()) name String memberIds String[] }
model Post    { id String @id @default(cuid()) userId String body String mediaUrl String? createdAt DateTime @default(now()) herds Herd[] }
model Herd    { id String @id @default(cuid()) postId String userId String @@unique([postId,userId]) }  // "Herd that" reaction
model Challenge{ id String @id @default(cuid()) title String startsAt DateTime endsAt DateTime metric String rewardXp Int }
model ChallengeEntry { id String @id @default(cuid()) challengeId String userId String progress Float @default(0) }
model Quest   { id String @id @default(cuid()) userId String name String target Int current Int @default(0) state String }
```

## Scoping columns cheat-sheet (for RLS in 06)
`User.role/coachId/floorId · Floor.hostId · Class.floorId+coachId ·
Booking.userId · Payment.floorId+userId · Membership.floorId+userId ·
WorkoutSession.userId · Order.userId · Ticket.userId · Event` = public read.
