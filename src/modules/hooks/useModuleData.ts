"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ModuleApiResponse,
  ModuleDataState,
  ModuleMetadata,
} from "../../types/modules";

/**
 * Hook to fetch and poll data for a specific module.
 *
 * Usage:
 *   const { data, loading, error, tier } = useModuleData<FireEvent[]>("nasa-firms");
 */
export function useModuleData<T = unknown>(
  moduleId: string | null,
): ModuleDataState<T> & { meta: ModuleMetadata | null } {
  const [state, setState] = useState<ModuleDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastFetchedAt: null,
    tier: null,
  });
  const [meta, setMeta] = useState<ModuleMetadata | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchModule = useCallback(async () => {
    if (!moduleId) return;

    try {
      const res = await fetch(`/api/modules/${moduleId}`);
      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: `HTTP ${res.status}`,
        }));
        return;
      }

      const json = (await res.json()) as ModuleApiResponse<T>;
      setState({
        data: json.data,
        loading: false,
        error: null,
        lastFetchedAt: json.fetchedAt,
        tier: json.tier,
      });
      setMeta(json.module);
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Fetch failed",
      }));
    }
  }, [moduleId]);

  useEffect(() => {
    if (!moduleId) {
      setState({
        data: null,
        loading: false,
        error: null,
        lastFetchedAt: null,
        tier: null,
      });
      setMeta(null);
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    void fetchModule();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [moduleId, fetchModule]);

  // Set up polling once we have metadata with pollInterval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (meta && meta.pollInterval > 0 && moduleId) {
      intervalRef.current = setInterval(
        () => void fetchModule(),
        meta.pollInterval * 1000,
      );
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [meta, moduleId, fetchModule]);

  return { ...state, meta };
}
