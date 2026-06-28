// OX mobile — runtime config. Reads from expo.extra (app.json) with the live
// OX project baked into @ox/supabase as the fallback. Keep this the single
// source for url/keys so the data layer never hard-codes them.
import Constants from "expo-constants";
import { OX_SUPABASE_URL, OX_SUPABASE_ANON_KEY } from "@ox/supabase";

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiUrl?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export const ENV = {
  // The NestJS API base (apps/api). Privileged / capability-gated reads + writes.
  apiUrl: extra.apiUrl ?? "http://localhost:4000/api/v1",
  // Supabase project — public discovery + RLS-scoped reads when signed in.
  supabaseUrl: extra.supabaseUrl ?? OX_SUPABASE_URL,
  supabaseAnonKey: extra.supabaseAnonKey ?? OX_SUPABASE_ANON_KEY,
} as const;
