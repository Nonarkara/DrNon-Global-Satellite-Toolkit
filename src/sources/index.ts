// ─── Curated Data Source Registry ──────────────────────────────────────────
// Single import point. Every entry was probed live — see `npm run probe`.

import type { AuthMode, DataSource, SourceKind, SourceTier } from "./types";
import { IMAGERY_CATALOGS } from "./imagery-catalogs";
import { LIVE_FEEDS } from "./live-feeds";
import { TOOLING } from "./tooling";

export * from "./types";
export { IMAGERY_CATALOGS, LIVE_FEEDS, TOOLING };

export const ALL_SOURCES: DataSource[] = [
  ...IMAGERY_CATALOGS,
  ...LIVE_FEEDS,
  ...TOOLING,
];

export function getSource(id: string): DataSource | undefined {
  return ALL_SOURCES.find((s) => s.id === id);
}

export function sourcesByTier(tier: SourceTier): DataSource[] {
  return ALL_SOURCES.filter((s) => s.tier === tier);
}

export function sourcesByKind(kind: SourceKind): DataSource[] {
  return ALL_SOURCES.filter((s) => s.kind === kind);
}

export function sourcesByAuth(auth: AuthMode): DataSource[] {
  return ALL_SOURCES.filter((s) => s.auth === auth);
}

/**
 * Sources usable from a cold clone with no credentials at all.
 * This is what makes `npm run dev` show real data instead of mocks.
 */
export function keylessSources(): DataSource[] {
  return ALL_SOURCES.filter(
    (s) => s.auth === "none" && s.verified.status === "ok",
  );
}

/** Sorted for docs and UI: tier ascending, then name. */
export function rankedSources(): DataSource[] {
  return [...ALL_SOURCES].sort(
    (a, b) => a.tier - b.tier || a.name.localeCompare(b.name),
  );
}

/** Every env var referenced by any source, deduped and sorted. */
export function allRequiredEnvVars(): string[] {
  return [
    ...new Set(ALL_SOURCES.flatMap((s) => s.requiredEnvVars ?? [])),
  ].sort();
}
