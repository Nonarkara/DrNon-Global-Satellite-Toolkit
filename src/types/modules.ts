// ─── Global Satellite Toolkit — Module System Types ────────────────────────

export type ModuleCategory =
  | "earth-observation"
  | "orbital-air-traffic"
  | "conflict-events"
  | "environmental"
  | "news-info"
  | "thailand"
  | "regional-satellite";

export type ModuleUiType =
  | "table"
  | "map-layer"
  | "chart"
  | "stat-card"
  | "feed"
  | "ticker";

export interface ModuleDefinition<TData = unknown> {
  /** Unique kebab-case ID, e.g. "gdelt-events" */
  id: string;
  /** Human label, e.g. "GDELT Global Events" */
  label: string;
  category: ModuleCategory;
  description: string;
  /** Polling interval in seconds; 0 = fetch once on mount */
  pollInterval: number;
  /** Server-side fetch function. Called by the dynamic API route. */
  fetchData: () => Promise<TData>;
  /** Static fallback data when live fetch fails */
  mockData: TData;
  /** How the frontend should render this module's data */
  uiType: ModuleUiType;
  /** Column definitions for table uiType */
  tableColumns?: { key: string; label: string }[];
  /** Chart configuration for chart uiType */
  chartConfig?: {
    type: "line" | "bar" | "area";
    xKey: string;
    yKey: string;
    color?: string;
  };
  /** If this wraps an existing API route, note it here for docs */
  wrapsExisting?: string;
  /** Env vars required for this module to work (e.g. ["SENTINEL_HUB_KEY"]) */
  requiredEnvVars?: string[];
}

/** Client-safe metadata (no fetchData/mockData, which are server-only) */
export interface ModuleMetadata {
  id: string;
  label: string;
  category: ModuleCategory;
  description: string;
  pollInterval: number;
  uiType: ModuleUiType;
  tableColumns?: { key: string; label: string }[];
  chartConfig?: {
    type: "line" | "bar" | "area";
    xKey: string;
    yKey: string;
    color?: string;
  };
  wrapsExisting?: string;
  requiredEnvVars?: string[];
  /** Whether required env vars are present (set at API response time) */
  configured?: boolean;
}

/** Shape returned by /api/modules/[id] */
export interface ModuleApiResponse<TData = unknown> {
  data: TData;
  tier: "live" | "mock";
  fetchedAt: string;
  module: ModuleMetadata;
}

/** Shape returned by /api/modules (catalog) */
export interface ModuleCatalogResponse {
  modules: ModuleMetadata[];
  generatedAt: string;
}

/** Client-side data state from useModuleData hook */
export interface ModuleDataState<TData = unknown> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
  tier: "live" | "mock" | null;
}

/** Category display metadata */
export const MODULE_CATEGORY_LABELS: Record<ModuleCategory, string> = {
  "earth-observation": "Earth Observation",
  "orbital-air-traffic": "Orbital & Air Traffic",
  "conflict-events": "Conflict & Events",
  environmental: "Environmental",
  "news-info": "News & Information",
  thailand: "Thailand",
  "regional-satellite": "Regional Satellite",
};
