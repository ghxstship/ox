// @ox/rbac — session shape, can(), scope(), scopeLabel().
// Port of ui_kits/_app/data.js. The Session is the decoded JWT in production
// (06-roles-and-permissions). NEVER trust client-supplied scope server-side —
// the API sets Postgres GUCs from the verified token and RLS does the filtering.

import { CAPS, type Capability, type Role } from "./caps.js";

export interface Session {
  userId: string;
  name: string;
  initial: string;
  role: Role;
  floorId: string | null;
  floors: string[];
  level?: number;
  xp?: number;
  homeFloor?: string;
}

/** Capability check — the verb boundary. `"*"` (admin) grants everything. */
export function can(session: Session | null | undefined, cap: Capability): boolean {
  if (!session) return false;
  const caps = CAPS[session.role] ?? [];
  return caps.includes("*") || caps.includes(cap);
}

export type ScopeEntity = "classes" | "members" | "tx" | "events";

interface ScopedRow {
  id?: string;
  floorId?: string;
  coachId?: string;
  who?: string;
}

/**
 * Row-level scope — the UX mirror of the Postgres RLS policies in 06.
 * The SAME query returns different rows per identity. This is for hiding what
 * the server would refuse; it is NOT the enforcement boundary.
 */
export function scope<T extends ScopedRow>(entity: ScopeEntity, rows: T[], session: Session | null): T[] {
  if (!session) return [];
  if (session.role === "admin") return rows; // global read
  switch (entity) {
    case "classes":
      if (session.role === "host") return rows.filter((r) => r.floorId === session.floorId);
      if (session.role === "coach") return rows.filter((r) => r.coachId === session.userId);
      return rows; // members browse all bookable
    case "members":
      if (session.role === "host") return rows.filter((r) => r.floorId === session.floorId);
      if (session.role === "coach") return rows.filter((r) => r.coachId === session.userId);
      if (session.role === "member") return rows.filter((r) => r.id === session.userId);
      return rows;
    case "tx":
      if (session.role === "host") return rows.filter((r) => r.floorId === session.floorId);
      if (session.role === "coach") return rows.filter((r) => r.who === session.name);
      if (session.role === "member") return rows.filter((r) => r.who === session.name);
      return rows;
    case "events":
      return rows; // discovery is public
    default:
      return rows;
  }
}

/** Human-readable scope chip shown in the app chrome. */
export function scopeLabel(session: Session | null, floorName?: (floorId: string) => string | undefined): string {
  if (!session) return "—";
  if (session.role === "admin") return "All floors · global";
  if (session.role === "host") {
    const name = session.floorId ? floorName?.(session.floorId) : undefined;
    return `${name ?? "Floor"} only`;
  }
  if (session.role === "coach") return "Own roster · own classes";
  return "Self only";
}

export { CAPS, NAV, type Capability, type Role, type AppSurface, type NavConfig } from "./caps.js";
