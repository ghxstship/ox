// OX mobile — data hook layer. Public discovery reads go through @ox/supabase
// (RLS-scoped when signed in, public when not). Privileged / capability-gated
// reads go through @ox/api-client. Every hook returns {data, loading, error,
// reload} so screens can render loading / empty / error states uniformly.
import { useCallback, useEffect, useState } from "react";
import {
  supabase,
  type FloorRow,
  type ExerciseRow,
  type ProductRow,
  type EventRow,
  type ClassRow,
  type PostRow,
  type PRRow,
  type RecoveryRow,
  type QuestRow,
  type FloorEquipmentRow,
} from "./supabase";

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAsync<T>(fn: () => Promise<T>, initial: T, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const run = useCallback(fn, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    run()
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e?.message ?? "Something went wrong.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [run, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}

// ── Public discovery (Supabase) ──────────────────────────────

export function useFloors() {
  return useAsync<FloorRow[]>(async () => {
    const { data, error } = await supabase.from("Floor").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  }, []);
}

export function useFloorEquipment(floorId?: string) {
  return useAsync<FloorEquipmentRow[]>(
    async () => {
      if (!floorId) return [];
      const { data, error } = await supabase.from("FloorEquipment").select("*").eq("floorId", floorId);
      if (error) throw error;
      return data ?? [];
    },
    [],
    [floorId]
  );
}

export function useExercises(filter?: { muscle?: string; equipment?: string; q?: string }) {
  return useAsync<ExerciseRow[]>(
    async () => {
      let query = supabase.from("Exercise").select("*").order("name");
      if (filter?.muscle) query = query.contains("muscles", [filter.muscle]);
      if (filter?.equipment) query = query.contains("equipment", [filter.equipment]);
      if (filter?.q) query = query.ilike("name", `%${filter.q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    [],
    [filter?.muscle, filter?.equipment, filter?.q]
  );
}

export function useProducts() {
  return useAsync<ProductRow[]>(async () => {
    const { data, error } = await supabase.from("Product").select("*").order("gateLevel");
    if (error) throw error;
    return data ?? [];
  }, []);
}

export function useProduct(id?: string) {
  return useAsync<ProductRow | null>(
    async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("Product").select("*").eq("id", id).limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    null,
    [id]
  );
}

export function useEvents() {
  return useAsync<EventRow[]>(async () => {
    const { data, error } = await supabase.from("Event").select("*").order("startsAt");
    if (error) throw error;
    return data ?? [];
  }, []);
}

export function useClasses() {
  return useAsync<ClassRow[]>(async () => {
    const { data, error } = await supabase.from("Class").select("*").order("startsAt");
    if (error) throw error;
    return data ?? [];
  }, []);
}

export interface FeedPost extends PostRow {
  author?: { name: string; initial: string } | null;
  herdCount: number;
}

export function useFeed() {
  return useAsync<FeedPost[]>(async () => {
    const { data, error } = await supabase
      .from("Post")
      .select("*, author:User(name,initial), herds:Herd(id)")
      .order("createdAt", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data ?? []).map((p: any) => ({
      ...p,
      author: p.author ?? null,
      herdCount: Array.isArray(p.herds) ? p.herds.length : 0,
    }));
  }, []);
}

// ── Signed-in reads (Supabase, RLS-scoped to the user) ───────

export function useMyProgress(userId?: string) {
  return useAsync<{ prs: PRRow[]; recovery: RecoveryRow[]; quests: QuestRow[] }>(
    async () => {
      if (!userId) return { prs: [], recovery: [], quests: [] };
      const [prs, recovery, quests] = await Promise.all([
        supabase.from("PR").select("*").eq("userId", userId).order("at", { ascending: false }),
        supabase.from("Recovery").select("*").eq("userId", userId),
        supabase.from("Quest").select("*").eq("userId", userId),
      ]);
      return {
        prs: prs.data ?? [],
        recovery: recovery.data ?? [],
        quests: quests.data ?? [],
      };
    },
    { prs: [], recovery: [], quests: [] },
    [userId]
  );
}
