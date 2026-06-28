// OX web — api-client factory. Reads the bearer token from the client session
// store. Surfaces fall back to local seed (lib/seed.ts) when a call rejects, so
// the app renders standalone without a running API.
import { createOxApi, type OxApi } from "@ox/api-client";

export function makeApi(getToken: () => string | null | undefined, brand?: string): OxApi {
  return createOxApi({
    baseUrl: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_OX_API_URL : undefined,
    getToken,
    brand,
  });
}

/**
 * withFallback — try a live api-client call; on any rejection (API offline,
 * network, 4xx/5xx) resolve to the provided seed value instead. Returns a flag
 * so callers can surface a "demo data" notice.
 */
export async function withFallback<T>(
  call: () => Promise<T>,
  fallback: T
): Promise<{ data: T; live: boolean }> {
  try {
    const data = await call();
    return { data, live: true };
  } catch {
    return { data: fallback, live: false };
  }
}
