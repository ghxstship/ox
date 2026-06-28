// RLS parity test — the row-count assertions from 08-build-plan M1.
// GET /members must return 7 / 5 / 3 / 1 rows for admin / coach / host / member.
// Here we verify the client mirror (scope()); the server proves the same in SQL.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scope, can, type Session } from "./index.js";

// Seven seed members (matches db/prisma/seed.ts row-counts).
const members = [
  { id: "u_mara", floorId: "f_pier", coachId: "u_dom" },
  { id: "u_iris", floorId: "f_pier", coachId: "u_dom" },
  { id: "u_lena", floorId: "f_pier", coachId: "u_dom" },
  { id: "u_theo", floorId: "f_roof", coachId: "u_dom" },
  { id: "u_kade", floorId: "f_roof", coachId: "u_dom" },
  { id: "u_remy", floorId: "f_forge", coachId: "u_nat" },
  { id: "u_sage", floorId: "f_forge", coachId: "u_nat" },
];

const admin: Session = { userId: "u_hq", name: "OX HQ", initial: "OX", role: "admin", floorId: null, floors: [] };
const coach: Session = { userId: "u_dom", name: "Dom Reyes", initial: "D", role: "coach", floorId: null, floors: ["f_pier", "f_roof"] };
const host: Session = { userId: "u_iris", name: "Iris Kelat", initial: "I", role: "host", floorId: "f_pier", floors: ["f_pier"] };
const member: Session = { userId: "u_mara", name: "Mara Vance", initial: "M", role: "member", floorId: "f_pier", floors: ["f_pier"] };

test("members scope returns 7/5/3/1 per identity", () => {
  assert.equal(scope("members", members, admin).length, 7);
  assert.equal(scope("members", members, coach).length, 5);
  assert.equal(scope("members", members, host).length, 3);
  assert.equal(scope("members", members, member).length, 1);
});

test("capabilities gate writes", () => {
  assert.equal(can(host, "class.manage"), true);
  assert.equal(can(coach, "class.manage"), false);
  assert.equal(can(admin, "class.manage"), true);
  assert.equal(can(member, "revenue.view"), false);
});
