// @ox/rbac — capabilities & navigation.
// Direct port of CAPS / NAV / can() from ui_kits/_app/data.js.
// In the prototype this gates UI; in production it ALSO gates every server
// write. RLS (Postgres) is the row boundary; capabilities are the verb boundary.

export type Role = "member" | "coach" | "host" | "admin";

export type Capability =
  | "*"
  | "app.consumer"
  | "app.operator"
  | "class.book"
  | "class.manage"
  | "raid.join"
  | "shop.buy"
  | "workout.log"
  | "social.post"
  | "self.view"
  | "clients.view"
  | "program.write"
  | "roster.view"
  | "floor.manage"
  | "equipment.manage"
  | "members.view"
  | "revenue.view"
  | "checkin.scan";

/** "*" = all. Checked via can(session, cap). */
export const CAPS: Record<Role, Capability[]> = {
  member: ["app.consumer", "class.book", "raid.join", "shop.buy", "workout.log", "social.post", "self.view"],
  coach: [
    "app.operator",
    "class.book",
    "workout.log",
    "social.post",
    "self.view",
    "clients.view",
    "program.write",
    "roster.view",
  ],
  host: [
    "app.operator",
    "self.view",
    "floor.manage",
    "equipment.manage",
    "class.manage",
    "members.view",
    "revenue.view",
    "checkin.scan",
  ],
  admin: ["*"],
};

export type AppSurface = "consumer" | "operator";

export interface NavConfig {
  app: AppSurface;
  tabs: string[];
  membersLabel?: string;
}

/** Nav surfaces each role may open (drives RBAC routing). */
export const NAV: Record<Role, NavConfig> = {
  member: { app: "consumer", tabs: ["home", "train", "tribe", "map", "you"] },
  coach: { app: "operator", tabs: ["today", "schedule", "members", "inbox", "more"], membersLabel: "Clients" },
  host: { app: "operator", tabs: ["today", "schedule", "members", "inbox", "more"], membersLabel: "Members" },
  admin: { app: "operator", tabs: ["today", "schedule", "members", "inbox", "more"], membersLabel: "Members" },
};
