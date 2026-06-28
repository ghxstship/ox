// @ox/supabase/server — server-only clients.
// - createServerClient(accessToken): acts AS the user (RLS applies). Pass the
//   user's access token from the request so auth.uid() resolves and policies
//   scope rows exactly like the four demo identities.
// - createServiceClient(): uses the SERVICE ROLE key — BYPASSES RLS. Use only in
//   trusted server code (webhooks, admin jobs, the NestJS API capability layer).
//   NEVER ship the service key to the browser.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";
import { OX_SUPABASE_URL, OX_SUPABASE_ANON_KEY, type OxSupabase } from "./index.js";

export function createServerClient(accessToken?: string, url: string = OX_SUPABASE_URL): OxSupabase {
  return createClient<Database>(url, OX_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

export function createServiceClient(url: string = OX_SUPABASE_URL): OxSupabase {
  const key = typeof process !== "undefined" ? process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined;
  if (!key) throw new Error("@ox/supabase: SUPABASE_SERVICE_ROLE_KEY is required for the service client");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
