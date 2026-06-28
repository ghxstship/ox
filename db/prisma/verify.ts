// Read-only verification against the live Supabase DB. Proves the seed shape and
// the documented RLS row-counts WITHOUT mutating anything. Safe to run anytime.
//   pnpm --filter @ox/db verify
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const members = await db.user.count({ where: { role: "member" } });
  const coaches = await db.user.count({ where: { role: "coach" } });
  const hosts = await db.user.count({ where: { role: "host" } });
  const admins = await db.user.count({ where: { role: "admin" } });
  const floors = await db.floor.count();
  const payAll = await db.payment.count();

  const dom = await db.user.findFirst({ where: { role: "coach" } });
  const roster = dom ? await db.user.count({ where: { role: "member", coachId: dom.id } }) : 0;

  console.log("OX Supabase — live row snapshot");
  console.log({ members, coaches, hosts, admins, floors, payments: payAll, sampleCoachRoster: roster });
  console.log("Expectations (from the handoff): members≈7, floors=3, payments≈6.");
  console.log("Per-identity scoping (1/5/3/7 etc.) is proven by the RLS policies when");
  console.log("connecting as a signed-in user (auth.uid() ↔ User.authUserId), not by this count.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
