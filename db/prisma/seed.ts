// ⚠️  GUARD: the Supabase project xaepcwnqjwphuwvuekfb is ALREADY seeded. This file
//     seeds a FRESH / EMPTY Postgres only (it deletes first). It is NOT wired to
//     `pnpm db:seed` (which refuses). Run it deliberately for a local DB.

// OX seed — reproduces the four demo identities (Mara / Dom / Iris / HQ) and the
// RLS row-counts QA verifies in 08-build-plan M1:
//   GET /members -> 7 (admin) / 5 (coach Dom roster) / 3 (host Iris, Pier 9) / 1 (member self)
//   GET /payments -> 6 (admin) / 3 (host Iris, Pier 9)
// Mirrors ui_kits/_app/data.js. Idempotent: clears then re-inserts.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Clean (FK-safe order)
  await db.$transaction([
    db.herd.deleteMany(),
    db.post.deleteMany(),
    db.challengeEntry.deleteMany(),
    db.challenge.deleteMany(),
    db.quest.deleteMany(),
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.ticket.deleteMany(),
    db.ticketTier.deleteMany(),
    db.event.deleteMany(),
    db.booking.deleteMany(),
    db.setLog.deleteMany(),
    db.workoutSession.deleteMany(),
    db.pR.deleteMany(),
    db.recovery.deleteMany(),
    db.payment.deleteMany(),
    db.membership.deleteMany(),
    db.class.deleteMany(),
    db.floorEquipment.deleteMany(),
    db.product.deleteMany(),
    db.exercise.deleteMany(),
    db.tribe.deleteMany(),
    db.user.deleteMany(),
    db.floor.deleteMany(),
  ]);

  // ── Hosts (own one floor each) ────────────────────────────────
  await db.user.createMany({
    data: [
      { id: "u_iris", name: "Iris Kelat", email: "iris@ox.fit", initial: "I", role: "host", floorId: null },
      { id: "u_orin", name: "Orin Vale", email: "orin@ox.fit", initial: "O", role: "host", floorId: null },
      { id: "u_bex", name: "Bex Aturo", email: "bex@ox.fit", initial: "B", role: "host", floorId: null },
      { id: "u_hq", name: "OX HQ", email: "hq@ox.fit", initial: "OX", role: "admin" },
    ],
  });

  // ── Floors (each plugged into by OX) ──────────────────────────
  await db.floor.createMany({
    data: [
      { id: "f_pier", name: "Pier 9 Iron", scenery: "oceanfront", hostId: "u_iris", address: "Pier 9, Embarcadero" },
      { id: "f_roof", name: "Skyline Strength", scenery: "rooftop", hostId: "u_orin", address: "Rooftop, 14th & Mission" },
      { id: "f_forge", name: "The Forge", scenery: "industrial", hostId: "u_bex", address: "Dogpatch Yard 3" },
    ],
  });
  // Point hosts at their floors (host.floorId == their floor for RLS scope)
  await db.user.update({ where: { id: "u_iris" }, data: { floorId: "f_pier" } });
  await db.user.update({ where: { id: "u_orin" }, data: { floorId: "f_roof" } });
  await db.user.update({ where: { id: "u_bex" }, data: { floorId: "f_forge" } });

  await db.floorEquipment.createMany({
    data: [
      { floorId: "f_pier", equipment: "barbell", count: 8 },
      { floorId: "f_pier", equipment: "kettlebell", count: 12 },
      { floorId: "f_pier", equipment: "trx", count: 6 },
      { floorId: "f_roof", equipment: "dumbbell", count: 20 },
      { floorId: "f_roof", equipment: "machine", count: 6 },
      { floorId: "f_forge", equipment: "barbell", count: 10 },
      { floorId: "f_forge", equipment: "cable", count: 4 },
    ],
  });

  // ── Coaches ───────────────────────────────────────────────────
  await db.user.createMany({
    data: [
      { id: "u_dom", name: "Dom Reyes", email: "dom@ox.fit", initial: "D", role: "coach", floorId: "f_pier" },
      { id: "u_nat", name: "Nat Powell", email: "nat@ox.fit", initial: "N", role: "coach", floorId: "f_forge" },
    ],
  });

  // ── Members (7) — 5 coached by Dom, 3 on Pier 9 ───────────────
  await db.user.createMany({
    data: [
      { id: "u_mara", name: "Mara Vance", email: "mara@ox.fit", initial: "M", role: "member", level: 14, xp: 2480, coachId: "u_dom", floorId: "f_pier", homeFloorId: "f_pier" },
      { id: "u_lena", name: "Lena Cho", email: "lena@ox.fit", initial: "L", role: "member", level: 9, xp: 1340, coachId: "u_dom", floorId: "f_pier", homeFloorId: "f_pier" },
      { id: "u_theo", name: "Theo Banks", email: "theo@ox.fit", initial: "T", role: "member", level: 6, xp: 720, coachId: "u_dom", floorId: "f_pier", homeFloorId: "f_pier" },
      { id: "u_kade", name: "Kade Ito", email: "kade@ox.fit", initial: "K", role: "member", level: 11, xp: 1890, coachId: "u_dom", floorId: "f_roof", homeFloorId: "f_roof" },
      { id: "u_remy", name: "Remy Sol", email: "remy@ox.fit", initial: "R", role: "member", level: 4, xp: 410, coachId: "u_dom", floorId: "f_roof", homeFloorId: "f_roof" },
      { id: "u_sage", name: "Sage Orr", email: "sage@ox.fit", initial: "S", role: "member", level: 8, xp: 1120, coachId: "u_nat", floorId: "f_forge", homeFloorId: "f_forge" },
      { id: "u_quinn", name: "Quinn Diaz", email: "quinn@ox.fit", initial: "Q", role: "member", level: 3, xp: 260, coachId: "u_nat", floorId: "f_forge", homeFloorId: "f_forge" },
    ],
  });

  // ── Exercises ─────────────────────────────────────────────────
  await db.exercise.createMany({
    data: [
      { id: "ex_bsq", name: "Back Squat", muscles: ["legs", "glutes"], equipment: ["barbell"], cue: "Brace. Knees track toes." },
      { id: "ex_dl", name: "Deadlift", muscles: ["back", "legs"], equipment: ["barbell"], cue: "Lats tight. Push the floor away." },
      { id: "ex_bp", name: "Bench Press", muscles: ["chest", "push"], equipment: ["barbell"], cue: "Shoulder blades pinned." },
      { id: "ex_pu", name: "Pull-Up", muscles: ["back", "pull"], equipment: ["bodyweight"], cue: "Lead with the chest." },
      { id: "ex_kbs", name: "Kettlebell Swing", muscles: ["glutes", "full_body"], equipment: ["kettlebell"], cue: "Hinge, snap, breathe." },
      { id: "ex_row", name: "TRX Row", muscles: ["back", "arms"], equipment: ["trx"], cue: "Squeeze, control the return." },
    ],
  });

  // ── Classes — scoped by floorId + coachId ─────────────────────
  const day = (d: number, h: number) => new Date(Date.UTC(2026, 6, d, h, 0, 0));
  await db.class.createMany({
    data: [
      { id: "c1", title: "Sunrise Sled Push", coachId: "u_dom", floorId: "f_pier", startsAt: day(1, 6), capacity: 12, load: "fill" },
      { id: "c2", title: "Hypertrophy · Pull", coachId: "u_dom", floorId: "f_pier", startsAt: day(1, 12), capacity: 10, load: "full" },
      { id: "c3", title: "Rooftop HIIT", coachId: "u_dom", floorId: "f_roof", startsAt: day(1, 18), capacity: 16, load: "open" },
      { id: "c4", title: "Olympic Lifting", coachId: "u_dom", floorId: "f_roof", startsAt: day(2, 7), capacity: 8, load: "fill" },
      { id: "c5", title: "Forge Conditioning", coachId: "u_nat", floorId: "f_forge", startsAt: day(2, 19), capacity: 14, load: "open" },
      { id: "c6", title: "Cold Plunge + Mobility", coachId: "u_dom", floorId: "f_pier", startsAt: day(3, 6), capacity: 12, load: "full" },
    ],
  });

  // ── Events / raids — public discovery ─────────────────────────
  await db.event.create({
    data: {
      id: "e1", title: "Beach Bootcamp Festival", floorId: "f_pier", hostName: "Pier 9 Iron",
      startsAt: day(6, 9), rewardXp: 250, isRaid: false,
      tiers: { create: [{ id: "tt_e1_ga", name: "General", priceCents: 0, qty: 200 }, { id: "tt_e1_vip", name: "Founder", priceCents: 4500, qty: 40 }] },
    },
  });
  await db.event.create({
    data: {
      id: "e2", title: "Skyline Sunrise Raid", floorId: "f_roof", hostName: "Skyline Strength",
      startsAt: day(7, 6), rewardXp: 180, isRaid: true,
      tiers: { create: [{ id: "tt_e2_ga", name: "Raider", priceCents: 0, qty: 120 }] },
    },
  });
  await db.event.create({
    data: {
      id: "e3", title: "Forge Strongman Open", floorId: "f_forge", hostName: "The Forge",
      startsAt: day(5, 11), rewardXp: 320, isRaid: false,
      tiers: { create: [{ id: "tt_e3_ga", name: "Competitor", priceCents: 2500, qty: 60 }] },
    },
  });

  // ── Memberships ───────────────────────────────────────────────
  await db.membership.createMany({
    data: [
      { userId: "u_mara", floorId: "f_pier", tier: "distant", addOns: ["private_coaching"], status: "active" },
      { userId: "u_lena", floorId: "f_pier", tier: "sound", addOns: [], status: "active" },
      { userId: "u_theo", floorId: "f_pier", tier: "compass", addOns: [], status: "past_due" },
      { userId: "u_kade", floorId: "f_roof", tier: "founder", addOns: ["workshops"], status: "active" },
      { userId: "u_sage", floorId: "f_forge", tier: "sound", addOns: [], status: "active" },
    ],
  });

  // ── Payments — 6 total, 3 on Pier 9 (host Iris) ───────────────
  await db.payment.createMany({
    data: [
      { userId: "u_mara", floorId: "f_pier", kind: "Membership", amountCents: 18900, state: "paid" },
      { userId: "u_lena", floorId: "f_pier", kind: "Private coaching", amountCents: 9000, state: "paid" },
      { userId: "u_theo", floorId: "f_pier", kind: "Membership", amountCents: 7900, state: "failed" },
      { userId: "u_kade", floorId: "f_roof", kind: "Founder tier", amountCents: 42000, state: "paid" },
      { userId: "u_sage", floorId: "f_forge", kind: "Workshop", amountCents: 5500, state: "paid" },
      { userId: "u_quinn", floorId: "f_forge", kind: "Shop", amountCents: 12400, state: "pending" },
    ],
  });

  // ── Commerce ──────────────────────────────────────────────────
  await db.product.createMany({
    data: [
      { id: "p_tee", name: "Field Tee — Oxide", priceCents: 4200, collection: "new", sizes: ["S", "M", "L", "XL"], colors: ["oxide", "stone"], gateLevel: 0 },
      { id: "p_hood", name: "Plug-In Hoodie", priceCents: 9800, collection: "new", sizes: ["S", "M", "L", "XL"], colors: ["ink"], gateLevel: 0 },
      { id: "p_drop", name: "Founder Drop Jacket", priceCents: 24000, collection: "drop", sizes: ["M", "L", "XL"], colors: ["oxide"], gateLevel: 10 },
    ],
  });

  // ── Workout session + sets + PR + recovery for Mara ───────────
  const sess = await db.workoutSession.create({
    data: {
      id: "ws_mara1", userId: "u_mara", floorId: "f_pier", scenery: "oceanfront",
      startedAt: day(4, 6), endedAt: day(4, 7), xpAwarded: 120,
      sets: {
        create: [
          { exerciseId: "ex_bsq", index: 0, weight: 185, reps: 5, rpe: 8, done: true },
          { exerciseId: "ex_bsq", index: 1, weight: 205, reps: 3, rpe: 9, done: true },
          { exerciseId: "ex_pu", index: 2, reps: 10, rpe: 8, done: true },
        ],
      },
    },
  });
  void sess;
  await db.pR.createMany({
    data: [
      { userId: "u_mara", lift: "Back Squat", value: 225, unit: "lb" },
      { userId: "u_mara", lift: "Deadlift", value: 275, unit: "lb" },
    ],
  });
  await db.recovery.createMany({
    data: [
      { userId: "u_mara", muscle: "legs", state: "worked" },
      { userId: "u_mara", muscle: "back", state: "light" },
      { userId: "u_mara", muscle: "push", state: "fresh" },
    ],
  });

  // ── Social & game ─────────────────────────────────────────────
  await db.tribe.create({ data: { id: "t_pier", name: "Pier 9 Herd", memberIds: ["u_mara", "u_lena", "u_theo"] } });
  const post = await db.post.create({ data: { id: "po1", userId: "u_mara", body: "New squat PR. 225x3. The herd showed up." } });
  await db.herd.create({ data: { postId: post.id, userId: "u_lena" } });
  await db.challenge.create({
    data: { id: "ch_iron_safari", title: "Iron Safari", startsAt: day(1, 0), endsAt: day(28, 0), metric: "total_xp", rewardXp: 1000,
      entries: { create: [{ userId: "u_mara", progress: 0.62 }, { userId: "u_kade", progress: 0.41 }] } },
  });

  // ── Verify the documented row-counts ──────────────────────────
  const members = await db.user.count({ where: { role: "member" } });
  const roster = await db.user.count({ where: { role: "member", coachId: "u_dom" } });
  const pierMembers = await db.user.count({ where: { role: "member", floorId: "f_pier" } });
  const payAll = await db.payment.count();
  const payPier = await db.payment.count({ where: { floorId: "f_pier" } });
  console.log(`Seed OK — members: ${members} (expect 7), Dom roster: ${roster} (expect 5), Pier 9 members: ${pierMembers} (expect 3)`);
  console.log(`Payments: all ${payAll} (expect 6), Pier 9 ${payPier} (expect 3)`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
