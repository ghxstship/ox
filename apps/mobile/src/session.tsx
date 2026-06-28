// OX mobile — session context. Holds the signed-in identity (the @ox/rbac
// Session shape), the OX JWT (for @ox/api-client), and the member's format prefs
// (locale / currency / units → the i18n gate). Two sign-in paths:
//   1. one-tap demo identities (Mara/Dom/Iris/HQ) via the API otpVerify shim
//      (id + code "000000") — issues a real OX JWT.
//   2. real email OTP via Supabase (signInWithOtp + verifyOtp).
// Persisted to AsyncStorage so the athlete stays signed in across launches.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, Role } from "@ox/rbac";
import type { FormatPrefs, UnitSystem } from "@ox/rbac";
import { api, setApiToken } from "./api";
import { supabase } from "./supabase";

const STORE_KEY = "ox.session.v1";
const PREFS_KEY = "ox.prefs.v1";

export interface StoredAuth {
  jwt: string | null;
  session: Session;
}

export interface Prefs extends FormatPrefs {
  locale: string;
  currency: string;
  units: UnitSystem;
}

const DEFAULT_PREFS: Prefs = { locale: "en-US", currency: "USD", units: "lb" };

/** The one-tap demo roster — ids match the seeded OX Users (live DB). */
export const DEMO_IDENTITIES: { id: string; name: string; role: Role; line: string }[] = [
  { id: "m_mara", name: "Mara Okafor", role: "member", line: "Athlete · Pier 9 Iron" },
  { id: "u_dom", name: "Dom Reyes", role: "coach", line: "Coach · own roster" },
  { id: "u_iris", name: "Iris Vance", role: "host", line: "Host · Pier 9 Iron" },
  { id: "u_hq", name: "OX HQ", role: "admin", line: "Admin · all floors" },
];

interface SessionCtx {
  session: Session | null;
  jwt: string | null;
  loading: boolean;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  signInDemo: (id: string) => Promise<void>;
  startEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  // Restore on launch.
  useEffect(() => {
    (async () => {
      try {
        const [rawAuth, rawPrefs] = await Promise.all([
          AsyncStorage.getItem(STORE_KEY),
          AsyncStorage.getItem(PREFS_KEY),
        ]);
        if (rawPrefs) setPrefsState({ ...DEFAULT_PREFS, ...JSON.parse(rawPrefs) });
        if (rawAuth) {
          const stored = JSON.parse(rawAuth) as StoredAuth;
          setApiToken(stored.jwt);
          setJwt(stored.jwt);
          setSession(stored.session);
        }
      } catch {
        /* fall through to signed-out */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(auth: StoredAuth | null) {
    if (auth) await AsyncStorage.setItem(STORE_KEY, JSON.stringify(auth));
    else await AsyncStorage.removeItem(STORE_KEY);
  }

  function commit(jwtNext: string | null, sess: Session) {
    setApiToken(jwtNext);
    setJwt(jwtNext);
    setSession(sess);
    void persist({ jwt: jwtNext, session: sess });
  }

  async function signInDemo(id: string) {
    // The OTP shim accepts the seeded code "000000" for demo identities and
    // returns a real OX JWT + the rbac session.
    const res = await api.auth.otpVerify({ id, code: "000000" });
    const s = res.session;
    const sess: Session = {
      userId: s.userId,
      name: s.name,
      initial: s.initial,
      role: s.role as Role,
      floorId: s.floorId ?? null,
      floors: s.floors ?? [],
      level: s.level,
      xp: s.xp,
      homeFloor: s.homeFloor,
    };
    commit(res.jwt, sess);
  }

  async function startEmailOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  }

  async function verifyEmailOtp(email: string, code: string) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) throw error;
    const authUserId = data.user?.id;
    // Resolve the OX User row for this auth identity (RLS lets the user read self).
    const { data: rows } = await supabase
      .from("User")
      .select("id,name,initial,role,floorId,homeFloorId,level,xp")
      .eq("authUserId", authUserId ?? "")
      .limit(1);
    const u = rows?.[0];
    const sess: Session = {
      userId: u?.id ?? authUserId ?? "unknown",
      name: u?.name ?? email,
      initial: u?.initial ?? email.slice(0, 1).toUpperCase(),
      role: (u?.role as Role) ?? "member",
      floorId: u?.floorId ?? null,
      floors: u?.floorId ? [u.floorId] : [],
      level: u?.level ?? 1,
      xp: u?.xp ?? 0,
      homeFloor: u?.homeFloorId ?? undefined,
    };
    // Supabase issues its own JWT; @ox/api-client uses the Supabase access token.
    const token = data.session?.access_token ?? null;
    commit(token, sess);
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    setApiToken(null);
    setJwt(null);
    setSession(null);
    await persist(null);
  }

  function setPrefs(p: Partial<Prefs>) {
    setPrefsState((prev) => {
      const next = { ...prev, ...p };
      void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }

  const value = useMemo<SessionCtx>(
    () => ({ session, jwt, loading, prefs, setPrefs, signInDemo, startEmailOtp, verifyEmailOtp, signOut }),
    [session, jwt, loading, prefs]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

/** Convenience: the i18n format prefs for the current member. */
export function usePrefs(): Prefs {
  return useSession().prefs;
}
