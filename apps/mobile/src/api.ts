// OX mobile — the typed OX Platform API client (@ox/api-client).
// Used for authenticated / privileged reads + writes (capability-gated on the
// server, RLS-scoped rows). The bearer token is the OX JWT issued by
// /auth/otp/verify; we hold it in a module ref the session provider keeps fresh
// so every request carries the caller's identity.
import { createOxApi, type OxApi } from "@ox/api-client";
import { ENV } from "./env";

let currentToken: string | null = null;

/** Session provider calls this on sign-in / restore / sign-out. */
export function setApiToken(jwt: string | null) {
  currentToken = jwt;
}

export const api: OxApi = createOxApi({
  baseUrl: ENV.apiUrl,
  getToken: () => currentToken,
});

/** Best-effort wrapper: returns fallback if the API/network is unavailable. */
export async function tryApi<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
