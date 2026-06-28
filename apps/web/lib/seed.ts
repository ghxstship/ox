// OX web — local seed / mock fallback. Mirrors ui_kits/_app/data.js so the app
// renders standalone when the API (NEXT_PUBLIC_OX_API_URL) is unreachable. The
// four demo identities (Mara/Dom/Iris/HQ) are the acceptance fixture.
import type { Session, Role } from "@ox/rbac";

export interface Account {
  id: string;
  label: string;
  role: Role;
  initial: string;
}

export const accounts: Account[] = [
  { id: "u_mara", label: "Mara Vance", role: "member", initial: "M" },
  { id: "u_dom", label: "Dom Reyes", role: "coach", initial: "D" },
  { id: "u_iris", label: "Iris Kelat", role: "host", initial: "I" },
  { id: "u_hq", label: "OX HQ", role: "admin", initial: "OX" },
];

export const floors = [
  { id: "f_pier", name: "Pier 9 Iron", scenery: "oceanfront", hostId: "u_iris" },
  { id: "f_roof", name: "Skyline Strength", scenery: "rooftop", hostId: "u_theo" },
  { id: "f_forge", name: "The Forge", scenery: "industrial", hostId: "u_iris" },
];

export function floorName(id: string): string | undefined {
  return floors.find((f) => f.id === id)?.name;
}

const people: Record<string, Session> = {
  u_mara: { userId: "u_mara", name: "Mara Vance", initial: "M", role: "member", floorId: "f_pier", floors: ["f_pier"], level: 14, xp: 2480, homeFloor: "f_pier" },
  u_dom: { userId: "u_dom", name: "Dom Reyes", initial: "D", role: "coach", floorId: null, floors: ["f_pier", "f_roof"] },
  u_iris: { userId: "u_iris", name: "Iris Kelat", initial: "I", role: "host", floorId: "f_pier", floors: ["f_pier"] },
  u_hq: { userId: "u_hq", name: "OX HQ", initial: "OX", role: "admin", floorId: null, floors: [] },
};

export function sessionFor(userId: string): Session {
  return people[userId] ?? people.u_mara!;
}

// ── Consumer seed ──────────────────────────────────────────────────
export const quests = [
  { id: "q1", name: "Complete 3 sessions", sub: "This week", current: 2, target: 3, state: "active" as const },
  { id: "q2", name: "Plug into a new floor", sub: "Iron Safari", current: 1, target: 1, state: "done" as const },
  { id: "q3", name: "Hit a new PR", sub: "Any lift", current: 0, target: 1, state: "active" as const },
];

export const exercises = [
  { id: "x_sled", name: "Sled Push", muscles: "legs · full body", equipment: "sled", floors: 6 },
  { id: "x_bench", name: "Incline Bench", muscles: "push · chest", equipment: "barbell", floors: 9 },
  { id: "x_ohp", name: "Overhead Press", muscles: "push · shoulders", equipment: "barbell", floors: 8 },
  { id: "x_squat", name: "Back Squat", muscles: "legs · glutes", equipment: "barbell", floors: 11 },
  { id: "x_dead", name: "Deadlift", muscles: "pull · back", equipment: "barbell", floors: 10 },
  { id: "x_pull", name: "Weighted Pull-up", muscles: "pull · back", equipment: "bodyweight", floors: 7 },
  { id: "x_kb", name: "Kettlebell Swing", muscles: "full body · core", equipment: "kettlebell", floors: 8 },
  { id: "x_row", name: "Cable Row", muscles: "pull · back", equipment: "cable", floors: 9 },
];

export const recovery = [
  { name: "Push", state: "fresh" as const },
  { name: "Pull", state: "worked" as const },
  { name: "Legs", state: "spent" as const },
  { name: "Core", state: "light" as const },
];

export const prs = [
  { lift: "Back Squat", value: 185, unit: "lb", delta: 10, prev: 175, history: [150, 160, 165, 175, 185] },
  { lift: "Deadlift", value: 245, unit: "lb", delta: 15, prev: 230, history: [200, 210, 225, 230, 245] },
  { lift: "Bench Press", value: 135, unit: "lb", delta: 5, prev: 130, history: [110, 120, 125, 130, 135] },
];

export const sessionPlan = {
  id: "s_today",
  title: "Push Day · Sled & Press",
  exercises: [
    { id: "x_sled", name: "Sled Push", target: "4 × 20m", cue: "Drive through the floor, flat back.", sets: [{ weight: 90, reps: 8 }, { weight: 90, reps: 8 }, { weight: 100, reps: 6 }, { weight: 100, reps: 6 }] },
    { id: "x_bench", name: "Incline Bench", target: "5 × 5", cue: "Elbows tucked, bar to lower chest.", sets: [{ weight: 135, reps: 5 }, { weight: 135, reps: 5 }, { weight: 145, reps: 5 }, { weight: 145, reps: 5 }, { weight: 155, reps: 3 }] },
    { id: "x_ohp", name: "Overhead Press", target: "4 × 8", cue: "Squeeze glutes, press to lockout.", sets: [{ weight: 75, reps: 8 }, { weight: 75, reps: 8 }, { weight: 85, reps: 6 }, { weight: 85, reps: 6 }] },
  ],
};

export const leaderboard = [
  { rank: 1, name: "Fay Boon", xp: 9120, initial: "F" },
  { rank: 2, name: "Ben Olsen", xp: 7340, initial: "B" },
  { rank: 3, name: "Mara Vance", xp: 2480, initial: "M", me: true },
  { rank: 4, name: "Dee Marsh", xp: 2210, initial: "D" },
  { rank: 5, name: "Ana Ruiz", xp: 1980, initial: "A" },
];

export const feed = [
  { id: "fd1", author: "Kayla Reyes", handle: "@kayla · Pathfinder LV 19", time: "2H", body: "Back squat 1RM to 185 lb. The herd carried me through the last rep.", likes: 34, comments: 6 },
  { id: "fd2", author: "Devon Marsh", handle: "@devon · Trailblazer LV 21", time: "4H", body: "Plugged into Skyline at sunrise. 5th floor this month — Iron Safari is heating up.", likes: 18, comments: 2 },
  { id: "fd3", author: "Priya Shah", handle: "@priya · Scout LV 12", time: "6H", body: "Who's in for the Sunrise HYROX Raid Wednesday? Need two more for the crew.", likes: 11, comments: 9 },
];

export const classes = [
  { id: "c1", day: "Mon", time: "06:00", title: "Sunrise Sled Push", coachId: "u_dom", floorId: "f_pier", cap: 12, booked: 9, load: "filling" as const },
  { id: "c2", day: "Mon", time: "12:00", title: "Hypertrophy · Pull", coachId: "u_dom", floorId: "f_pier", cap: 10, booked: 10, load: "full" as const },
  { id: "c3", day: "Mon", time: "18:30", title: "Rooftop HIIT", coachId: "u_nat", floorId: "f_roof", cap: 16, booked: 7, load: "open" as const },
  { id: "c4", day: "Tue", time: "07:00", title: "Olympic Lifting", coachId: "u_dom", floorId: "f_roof", cap: 8, booked: 6, load: "filling" as const },
  { id: "c5", day: "Tue", time: "19:00", title: "Forge Conditioning", coachId: "u_nat", floorId: "f_forge", cap: 14, booked: 3, load: "open" as const },
  { id: "c6", day: "Wed", time: "06:00", title: "Cold Plunge + Mobility", coachId: "u_dom", floorId: "f_pier", cap: 12, booked: 12, load: "full" as const },
];

export const events = [
  { id: "e1", day: "SAT", title: "Beach Bootcamp Festival", host: "Pier 9 Iron", floorId: "f_pier", attendees: 184, rewardXp: 250, isRaid: false },
  { id: "e2", day: "SUN", title: "Skyline Sunrise Raid", host: "Skyline Strength", floorId: "f_roof", attendees: 96, rewardXp: 180, isRaid: true, filled: 12, capacity: 20 },
  { id: "e3", day: "FRI", title: "Forge Strongman Open", host: "The Forge", floorId: "f_forge", attendees: 58, rewardXp: 320, isRaid: false },
];

export const products = [
  { id: "p_tee", name: "Herd Tee", priceCents: 3800, collection: "Apparel", sizes: ["S", "M", "L", "XL"], gateLevel: 0 },
  { id: "p_hood", name: "Oxide Hoodie", priceCents: 8800, collection: "Apparel", sizes: ["S", "M", "L", "XL"], gateLevel: 0 },
  { id: "p_belt", name: "Founder Lifting Belt", priceCents: 12000, collection: "Gear", sizes: ["M", "L"], gateLevel: 20 },
  { id: "p_plate", name: "Copper Credential Plate", priceCents: 24000, collection: "Drops", sizes: ["One"], gateLevel: 30 },
];

export const floorMatches = [
  { distance: "0.4 mi", name: "Pier 9 Iron", has: "2 sleds · oceanfront", scenery: "oceanfront", xp: 40, isHome: true },
  { distance: "1.2 mi", name: "Skyline Strength", has: "4 sleds · rooftop", scenery: "rooftop", xp: 60, isHome: false },
  { distance: "2.8 mi", name: "The Forge", has: "Strongman yard", scenery: "industrial", xp: 80, isHome: false },
];

// ── Operator seed ──────────────────────────────────────────────────
export const members = [
  { id: "u_ana", name: "Ana Ruiz", initial: "A", level: 9, status: "ok", floorId: "f_pier", coachId: "u_dom", plan: "Compass" },
  { id: "u_ben", name: "Ben Olsen", initial: "B", level: 22, status: "ok", floorId: "f_pier", coachId: "u_dom", plan: "Sound" },
  { id: "u_cole", name: "Cole Tran", initial: "C", level: 5, status: "warn", floorId: "f_roof", coachId: "u_dom", plan: "Compass" },
  { id: "u_dee", name: "Dee Marsh", initial: "D", level: 17, status: "ok", floorId: "f_roof", coachId: "u_nat", plan: "Distant" },
  { id: "u_eli", name: "Eli Quist", initial: "E", level: 3, status: "danger", floorId: "f_forge", coachId: "u_nat", plan: "Compass" },
  { id: "u_fay", name: "Fay Boon", initial: "F", level: 31, status: "ok", floorId: "f_pier", coachId: "u_dom", plan: "Founder" },
];

export const tx = [
  { id: "t1", who: "Ana Ruiz", floorId: "f_pier", amountCents: 18000, kind: "Membership", state: "paid" as const },
  { id: "t2", who: "Ben Olsen", floorId: "f_pier", amountCents: 24000, kind: "Private coaching", state: "paid" as const },
  { id: "t3", who: "Cole Tran", floorId: "f_roof", amountCents: 18000, kind: "Membership", state: "failed" as const },
  { id: "t4", who: "Dee Marsh", floorId: "f_roof", amountCents: 9500, kind: "Workshop", state: "paid" as const },
  { id: "t5", who: "Eli Quist", floorId: "f_forge", amountCents: 18000, kind: "Membership", state: "failed" as const },
  { id: "t6", who: "Fay Boon", floorId: "f_pier", amountCents: 42000, kind: "Founder tier", state: "paid" as const },
];

export const revenueSeries = [42, 51, 48, 63, 58, 72, 81, 76, 90, 88, 102, 119];
export const revenueLabels = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
export const floorLoadBars = [
  { label: "06:00", value: 9 },
  { label: "09:00", value: 5 },
  { label: "12:00", value: 10 },
  { label: "15:00", value: 6 },
  { label: "18:00", value: 12 },
  { label: "21:00", value: 4 },
];

// ── Default OX brand (whitelabel fallback) ─────────────────────────
export const defaultBrand = {
  slug: "ox",
  name: "OX",
  accent: "#B5552E",
  mode: "light" as const,
};
