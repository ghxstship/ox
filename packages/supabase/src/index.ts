// @ox/supabase — typed clients for the OX Supabase project (xaepcwnqjwphuwvuekfb).
// RLS is enforced in the database, so the publishable/anon key is safe in the
// browser: a signed-in user only ever sees the rows the policies allow
// (auth.uid() ↔ User.authUserId). See db/SUPABASE.md.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export type { Database } from "./database.types.js";
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
export type OxSupabase = SupabaseClient<Database>;

/** The live project — defaults baked in; override via env in any environment. */
export const OX_SUPABASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://xaepcwnqjwphuwvuekfb.supabase.co";

export const OX_SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  "sb_publishable_ZzRzJgf-NQ3g5sR6i48m8g_HbMD_DMM";

/**
 * Browser / anon client. Safe to ship — RLS does the row filtering.
 * Pass a custom key (e.g. a user JWT) only if you manage auth yourself.
 */
export function createBrowserClient(
  url: string = OX_SUPABASE_URL,
  key: string = OX_SUPABASE_ANON_KEY
): OxSupabase {
  return createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
