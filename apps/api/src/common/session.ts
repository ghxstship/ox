// The resolved session that rides every request. Mirrors @ox/rbac Session.
import type { Session } from "@ox/rbac";
import type { Request } from "express";

export type { Session };

/** Express request augmented with the verified session. */
export interface OxRequest extends Request {
  session?: Session;
  rawBody?: Buffer;
  /** The raw Supabase access token, if present. */
  accessToken?: string;
  /** True when a Supabase access token resolved a session (RLS-via-token path). */
  isSupabaseToken?: boolean;
}
