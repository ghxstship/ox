// The decoded-JWT session that rides every request. Mirrors @ox/rbac Session.
import type { Session } from "@ox/rbac";
import type { Request } from "express";

export type { Session };

/** Express request augmented with the verified session. */
export interface OxRequest extends Request {
  session?: Session;
  rawBody?: Buffer;
  /** The raw bearer token (OX JWT or Supabase access token), if present. */
  accessToken?: string;
  /** True when the bearer was a Supabase access token (RLS-via-token path). */
  isSupabaseToken?: boolean;
}

/** The minimal claims we sign into the JWT. */
export interface JwtClaims {
  userId: string;
  role: Session["role"];
  floorId: string | null;
}
