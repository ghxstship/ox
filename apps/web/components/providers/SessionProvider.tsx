"use client";

// OX web — client session store. Holds the chosen demo identity (RBAC routing)
// + a JWT placeholder for the api-client. Persisted to localStorage so a reload
// keeps you signed in. In production the JWT is the decoded auth token; here the
// identity picker (gate) seeds it.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@ox/rbac";
import { sessionFor } from "../../lib/seed";

const STORAGE_KEY = "ox.session.v1";
const TOKEN_KEY = "ox.token.v1";

interface SessionState {
  session: Session | null;
  token: string | null;
  signIn: (userId: string) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const signIn = useCallback((userId: string) => {
    const next = sessionFor(userId);
    // Demo token — the api-client sends it as a bearer; the real API issues a JWT.
    const demoToken = `demo.${userId}`;
    setSession(next);
    setToken(demoToken);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(TOKEN_KEY, demoToken);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<SessionState>(
    () => ({ session, token, signIn, signOut }),
    [session, token, signIn, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
