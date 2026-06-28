"use client";
// Web ↔ Supabase. The live data path for the OX project (xaepcwnqjwphuwvuekfb).
// RLS scopes every read by the signed-in identity (auth.uid() ↔ User.authUserId),
// so the anon/publishable key is safe in the browser. Pairs with lib/seed.ts as
// the offline fallback and lib/api.ts (the NestJS API) for writes/Stripe.
import { createBrowserClient, type OxSupabase, type Tables } from "@ox/supabase";

let _client: OxSupabase | null = null;

/** Singleton browser client. */
export function supabase(): OxSupabase {
  if (!_client) _client = createBrowserClient();
  return _client;
}

/** Public discovery — readable when signed out (RLS allows anon). */
export async function fetchFloors(): Promise<Tables<"Floor">[]> {
  const { data, error } = await supabase().from("Floor").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchEvents(): Promise<Tables<"Event">[]> {
  const { data, error } = await supabase().from("Event").select("*").order("startsAt");
  if (error) throw error;
  return data ?? [];
}

export async function fetchExercises(): Promise<Tables<"Exercise">[]> {
  const { data, error } = await supabase().from("Exercise").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

/**
 * Members CRM — RLS returns only the rows the caller may see (1/5/3/7 by
 * identity). No client-side filtering: the database is the boundary.
 */
export async function fetchMembers(): Promise<Tables<"User">[]> {
  const { data, error } = await supabase().from("User").select("*").eq("role", "member");
  if (error) throw error;
  return data ?? [];
}
