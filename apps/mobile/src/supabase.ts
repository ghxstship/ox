// OX mobile — Supabase client for native. Session persists to AsyncStorage so
// the user stays signed in across launches. RLS does the row filtering, so the
// publishable key is safe on-device: a signed-in athlete only ever sees the
// rows the policies allow (auth.uid() ↔ User.authUserId). Public discovery
// (floors / events / exercises / products) is readable when signed out.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@ox/supabase/types";
import { ENV } from "./env";

export type { Database, Tables };

export const supabase = createClient<Database>(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // no URL session on native
  },
});

/** Typed row helpers for the tables the app reads directly. */
export type FloorRow = Tables<"Floor">;
export type ExerciseRow = Tables<"Exercise">;
export type ProductRow = Tables<"Product">;
export type EventRow = Tables<"Event">;
export type ClassRow = Tables<"Class">;
export type PostRow = Tables<"Post">;
export type UserRow = Tables<"User">;
export type PRRow = Tables<"PR">;
export type RecoveryRow = Tables<"Recovery">;
export type QuestRow = Tables<"Quest">;
export type FloorEquipmentRow = Tables<"FloorEquipment">;
export type WorkoutSessionRow = Tables<"WorkoutSession">;
export type SetLogRow = Tables<"SetLog">;
export type MembershipRow = Tables<"Membership">;
export type BookingRow = Tables<"Booking">;
export type OrderRow = Tables<"Order">;
