"use client";
// OX web — useLive: the standard live-data hook. Runs an async fetch (Supabase
// or api-client) and tracks {data, live, loading, error}. The default path is
// LIVE; the optional `fallback` is the last-resort offline value (seed) — when
// the fetch rejects we surface it AND flag live=false so the screen can show an
// offline note. Re-runs when any dep changes.
import { useEffect, useState } from "react";

export interface LiveState<T> {
  data: T | null;
  live: boolean;
  loading: boolean;
  error: unknown;
  reload: () => void;
}

export function useLive<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  fallback?: T
): LiveState<T> {
  const [data, setData] = useState<T | null>(fallback ?? null);
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fetcher()
      .then((res) => {
        if (!active) return;
        setData(res);
        setLive(true);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        setError(e);
        setLive(false);
        if (fallback !== undefined) setData(fallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, live, loading, error, reload: () => setNonce((n) => n + 1) };
}

/** Treat an empty live result as "use the fallback" (seeded discovery tables). */
export function orFallback<T>(arr: T[] | null, fallback: T[]): T[] {
  return arr && arr.length > 0 ? arr : fallback;
}
