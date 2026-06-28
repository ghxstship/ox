"use client";
// OX web — auth bridge. Two real flows, one session store:
//   1. Production: Supabase email OTP (signInWithOtp → verifyOtp). When a real
//      Supabase session exists we prefer its access token and pass it to BOTH
//      the Supabase client (RLS) and the api-client (bearer).
//   2. Demo identities (Mara/Dom/Iris/HQ): call the API demo endpoint
//      POST /auth/otp/verify {id, code:"000000"} via @ox/api-client to obtain
//      {jwt, session}; store the jwt as the bearer.
// The api-client token getter reads whichever token is live.
import { createOxApi, type AuthResult } from "@ox/api-client";
import type { Session } from "@ox/rbac";
import { supabase } from "./supabase";

export const DEMO_CODE = "000000";

/** Map the api-client AuthSession (or a Supabase user) into the rbac Session. */
export function toRbacSession(s: AuthResult["session"]): Session {
  return {
    userId: s.userId,
    name: s.name,
    initial: s.initial,
    role: s.role,
    floorId: s.floorId,
    floors: s.floors ?? [],
    level: s.level,
    xp: s.xp,
    homeFloor: s.homeFloor,
  };
}

/** Demo one-click: verify the fixed code against the API and return {jwt, session}. */
export async function demoSignIn(userId: string): Promise<AuthResult> {
  const api = createOxApi({
    baseUrl: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_OX_API_URL : undefined,
  });
  return api.auth.otpVerify({ id: userId, code: DEMO_CODE });
}

/** Production OTP — start: emails a code via Supabase Auth. */
export async function otpStart(email: string): Promise<void> {
  const { error } = await supabase().auth.signInWithOtp({ email });
  if (error) throw error;
}

/** Production OTP — verify: exchanges the emailed code for a Supabase session. */
export async function otpVerify(
  email: string,
  code: string
): Promise<{ accessToken: string; user: { id: string; email?: string } }> {
  const { data, error } = await supabase().auth.verifyOtp({ email, token: code, type: "email" });
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token || !data.user) throw new Error("No session returned");
  return { accessToken: token, user: { id: data.user.id, email: data.user.email } };
}
