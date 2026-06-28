"use client";
// OX web — auth bridge. Supabase-only: every sign-in produces a real Supabase
// session, so the same access token drives BOTH the Supabase client (RLS) and
// the api-client (bearer). No ORM, no API-minted JWT.
//   1. Production: email OTP (signInWithOtp → verifyOtp).
//   2. Demo identities (Mara/Dom/Iris/HQ): signInWithPassword against their real
//      Supabase users (shared dev password), then resolve the OX User row.
import type { AuthResult } from "@ox/api-client";
import type { Session } from "@ox/rbac";
import { supabase } from "./supabase";

export const DEMO_CODE = "000000";
/** Demo identities → their real Supabase email. Password is shared (dev only). */
export const DEMO_EMAILS: Record<string, string> = {
  u_mara: "mara@ox.fit",
  m_mara: "mara@ox.fit",
  u_dom: "dom@ox.fit",
  u_iris: "iris@ox.fit",
  u_hq: "hq@ox.fit",
};
export const DEMO_PASSWORD = "oxdemo1234";

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

/**
 * Demo one-click: sign in with the identity's real Supabase user (password),
 * then resolve the OX `User` row (RLS self-read) to build the rbac session.
 * Returns { jwt: <supabase access token>, session } so the rest of the app —
 * api-client bearer + Supabase RLS — runs on one real token.
 */
export async function demoSignIn(userId: string): Promise<AuthResult> {
  const email = DEMO_EMAILS[userId] ?? userId;
  const sb = supabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  if (error) throw error;
  const token = data.session?.access_token;
  const uid = data.user?.id;
  if (!token || !uid) throw new Error("No Supabase session returned for demo identity.");

  const { data: u, error: uerr } = await sb
    .from("User")
    .select("id,name,initial,role,floorId,homeFloorId,level,xp")
    .eq("authUserId", uid)
    .maybeSingle();
  if (uerr) throw uerr;
  if (!u) throw new Error("No OX profile linked to this identity.");

  const session: AuthResult["session"] = {
    userId: u.id,
    name: u.name,
    initial: u.initial,
    role: u.role,
    floorId: u.floorId ?? null,
    floors: u.floorId ? [u.floorId] : [],
    level: u.level ?? undefined,
    xp: u.xp ?? undefined,
    homeFloor: u.homeFloorId ?? undefined,
  };
  return { jwt: token, session };
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
