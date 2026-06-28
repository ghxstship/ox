"use client";

// OX web — client session store. Holds the active identity (RBAC routing) + the
// bearer token for the api-client and Supabase RLS. Two real paths feed it:
//   • signInDemo(userId)   — POST /auth/otp/verify {id, code} → {jwt, session}
//   • setSupabaseSession() — a verified Supabase email-OTP session (access token)
// Persisted to localStorage so a reload keeps you signed in. When the API is
// unreachable the demo path degrades to a local seed session so the app still
// renders standalone (offline acceptance fixture).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@ox/rbac";
import { sessionFor } from "../../lib/seed";
import { demoSignIn, toRbacSession } from "../../lib/auth";

const STORAGE_KEY = "ox.session.v1";
const TOKEN_KEY = "ox.token.v1";

interface SessionState {
  session: Session | null;
  token: string | null;
  ready: boolean;
  /** Demo one-click sign-in — real API JWT, seed fallback when offline. */
  signInDemo: (userId: string) => Promise<void>;
  /** Production OTP — install a verified Supabase session + its identity. */
  setSupabaseSession: (token: string, session: Session) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Session, tok: string) => {
    setSession(next);
    setToken(tok);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(TOKEN_KEY, tok);
    } catch {
      /* ignore */
    }
  }, []);

  const signInDemo = useCallback(
    async (userId: string) => {
      try {
        const { jwt, session: apiSession } = await demoSignIn(userId);
        persist(toRbacSession(apiSession), jwt);
      } catch {
        // API offline → degrade to a local seed identity so the demo still works.
        persist(sessionFor(userId), `demo.${userId}`);
      }
    },
    [persist]
  );

  const setSupabaseSession = useCallback(
    (tok: string, next: Session) => {
      persist(next, tok);
    },
    [persist]
  );

  const signOut = useCallback(() => {
    setSession(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      void import("../../lib/supabase").then((m) => m.supabase().auth.signOut());
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<SessionState>(
    () => ({ session, token, ready, signInDemo, setSupabaseSession, signOut }),
    [session, token, ready, signInDemo, setSupabaseSession, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
