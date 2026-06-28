"use client";
// Web ↔ Supabase. The live data path for the OX project (xaepcwnqjwphuwvuekfb).
// RLS scopes every read by the signed-in identity (auth.uid() ↔ User.authUserId),
// so the anon/publishable key is safe in the browser. Pairs with lib/seed.ts as
// the offline fallback and lib/api.ts (the NestJS API) for writes/Stripe.
//
// Public discovery tables (Floor, Event, Exercise, Product, Class) read when
// signed out; identity-scoped tables (User, Booking, Payment, Membership, PR,
// WorkoutSession, messaging, game) need a real Supabase session.
import { createBrowserClient, type OxSupabase, type Tables } from "@ox/supabase";

let _client: OxSupabase | null = null;

/** Singleton browser client. */
export function supabase(): OxSupabase {
  if (!_client) _client = createBrowserClient();
  return _client;
}

// ── Public discovery (anon-readable) ───────────────────────────────
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

export async function fetchExercise(id: string): Promise<Tables<"Exercise"> | null> {
  const { data, error } = await supabase().from("Exercise").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProducts(): Promise<Tables<"Product">[]> {
  const { data, error } = await supabase().from("Product").select("*").order("priceCents");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProduct(id: string): Promise<Tables<"Product"> | null> {
  const { data, error } = await supabase().from("Product").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProductSizes(productId: string): Promise<Tables<"ProductSize">[]> {
  const { data, error } = await supabase().from("ProductSize").select("*").eq("productId", productId).order("index");
  if (error) throw error;
  return data ?? [];
}

export async function fetchClasses(): Promise<Tables<"Class">[]> {
  const { data, error } = await supabase().from("Class").select("*").order("startsAt");
  if (error) throw error;
  return data ?? [];
}

export async function fetchFloorEquipment(floorId: string): Promise<Tables<"FloorEquipment">[]> {
  const { data, error } = await supabase().from("FloorEquipment").select("*").eq("floorId", floorId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchPrograms(): Promise<Tables<"Program">[]> {
  const { data, error } = await supabase().from("Program").select("*").order("title");
  if (error) throw error;
  return data ?? [];
}

export async function fetchSpecies(): Promise<Tables<"Species">[]> {
  const { data, error } = await supabase().from("Species").select("*").order("zone");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTracks(): Promise<Tables<"Track">[]> {
  const { data, error } = await supabase().from("Track").select("*").order("title");
  if (error) throw error;
  return data ?? [];
}

// ── Identity-scoped (RLS-filtered to the signed-in identity) ───────
export async function fetchMembers(): Promise<Tables<"User">[]> {
  const { data, error } = await supabase().from("User").select("*").eq("role", "member");
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllUsers(): Promise<Tables<"User">[]> {
  const { data, error } = await supabase().from("User").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchPRs(): Promise<Tables<"PR">[]> {
  const { data, error } = await supabase().from("PR").select("*").order("at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecovery(): Promise<Tables<"Recovery">[]> {
  const { data, error } = await supabase().from("Recovery").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchQuests(): Promise<Tables<"Quest">[]> {
  const { data, error } = await supabase().from("Quest").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchPayments(): Promise<Tables<"Payment">[]> {
  const { data, error } = await supabase().from("Payment").select("*").order("at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMemberships(): Promise<Tables<"Membership">[]> {
  const { data, error } = await supabase().from("Membership").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyMembership(): Promise<Tables<"Membership"> | null> {
  const { data, error } = await supabase().from("Membership").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchOrders(): Promise<Tables<"Order">[]> {
  const { data, error } = await supabase().from("Order").select("*").order("createdAt", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPosts(): Promise<Tables<"Post">[]> {
  const { data, error } = await supabase().from("Post").select("*").order("createdAt", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchWorkoutSessions(): Promise<Tables<"WorkoutSession">[]> {
  const { data, error } = await supabase().from("WorkoutSession").select("*").order("startedAt", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSetLogs(sessionId: string): Promise<Tables<"SetLog">[]> {
  const { data, error } = await supabase().from("SetLog").select("*").eq("sessionId", sessionId).order("index");
  if (error) throw error;
  return data ?? [];
}

export async function fetchConversations(): Promise<Tables<"Conversation">[]> {
  const { data, error } = await supabase().from("Conversation").select("*").order("createdAt", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMessages(): Promise<Tables<"Message">[]> {
  const { data, error } = await supabase().from("Message").select("*").order("createdAt", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type { Tables };
