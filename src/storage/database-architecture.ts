/**
 * Database & Storage Architecture
 *
 * This toolkit supports multiple storage backends with automatic fallback.
 * The primary concern is recording satellite tile metadata (accuracy, timestamps,
 * latency) and caching overlay data for offline/degraded operation.
 *
 * STORAGE TIERS (in order of preference):
 *
 *   1. SUPABASE (recommended primary)
 *      - PostgreSQL + PostGIS for geospatial queries
 *      - Real-time subscriptions for live dashboards
 *      - Row-level security for multi-tenant setups
 *      - Built-in auth and file storage
 *      - Free tier: 500MB database, 1GB file storage
 *
 *   2. FIREBASE (alternative primary)
 *      - Firestore for document-based storage
 *      - Real-time listeners for live updates
 *      - Cloud Functions for ingestion pipelines
 *      - Free tier: 1GB Firestore, 5GB storage
 *
 *   3. POSTGRESQL (self-hosted)
 *      - Direct PostgreSQL with PostGIS extension
 *      - Full control, no vendor lock-in
 *      - Best for large-scale data lakes
 *
 *   4. GOOGLE SHEETS (convenience fallback)
 *      - For non-sensitive, small-volume data
 *      - Easy sharing and manual inspection
 *      - Google Sheets API v4 for programmatic access
 *      - Good for: tile health logs, provider status, config overrides
 *      - NOT for: high-frequency writes or sensitive data
 *
 *   5. LOCAL CACHE (offline fallback)
 *      - In-memory or file-based cache
 *      - Ensures the dashboard never shows blank panels
 *      - Static fallback data bundled with the app
 *
 * WHAT WE STORE:
 *
 *   tile_fetch_log:
 *     Records every satellite tile fetch with provider, timestamp, latency,
 *     zoom level, tile coordinates, imagery date, and success/failure status.
 *     Used for accuracy auditing, provider health monitoring, and SLA tracking.
 *
 *   overlay_metadata:
 *     Catalog of active overlays with their current state, last successful
 *     fetch, error counts, and fallback chain position.
 *
 *   fire_events:
 *     NASA FIRMS thermal detections with PostGIS geometry.
 *
 *   satellite_provider_health:
 *     Rolling health check results for each satellite API endpoint.
 *
 * GOOGLE SHEETS INTEGRATION:
 *   For data that benefits from easy human access:
 *     - Provider health dashboard (auto-updated every 15 min)
 *     - Tile fetch summary (daily rollup)
 *     - Configuration overrides (manual edits reflected in app)
 *   Access via Google Sheets API v4:
 *     GET https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}
 *     Requires: Google Cloud project + API key or OAuth
 */

// ── Types ───────────────────────────────────────────────────────

export type StorageBackend =
  | "supabase"
  | "firebase"
  | "postgresql"
  | "google-sheets"
  | "local-cache";

export interface StorageConfig {
  backend: StorageBackend;
  connectionUrl?: string;
  apiKey?: string;
  projectId?: string;
  /** Google Sheets spreadsheet ID for convenience storage */
  sheetsId?: string;
  /** Whether this backend is currently available */
  available: boolean;
}

export interface TileFetchLogEntry {
  id?: string;
  provider: string;
  layer: string;
  timestamp: string;
  latencyMs: number;
  zoomLevel: number;
  tileX: number;
  tileY: number;
  imageryDate: string | null;
  status: "ok" | "error" | "timeout" | "fallback";
  errorMessage?: string;
  /** Whether a fallback provider was used */
  usedFallback: boolean;
  fallbackProvider?: string;
}

export interface OverlayMetadataEntry {
  overlayId: string;
  provider: string;
  lastSuccessfulFetch: string | null;
  errorCount: number;
  consecutiveErrors: number;
  fallbackChainPosition: number;
  averageLatencyMs: number;
  status: "healthy" | "degraded" | "offline";
}

export interface ProviderHealthEntry {
  providerId: string;
  providerName: string;
  endpoint: string;
  lastChecked: string;
  responseTimeMs: number | null;
  status: "live" | "slow" | "offline";
  uptime7d: number;
  errorRate7d: number;
}

// ── Schema Definitions ──────────────────────────────────────────

/**
 * SQL schema for PostgreSQL / Supabase.
 * Run this to set up the satellite metadata tables.
 */
export const POSTGRESQL_SCHEMA = `
-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tile fetch audit log
CREATE TABLE IF NOT EXISTS tile_fetch_log (
  id            BIGSERIAL PRIMARY KEY,
  provider      TEXT NOT NULL,
  layer         TEXT NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latency_ms    INTEGER,
  zoom_level    INTEGER,
  tile_x        INTEGER,
  tile_y        INTEGER,
  imagery_date  DATE,
  status        TEXT NOT NULL CHECK (status IN ('ok', 'error', 'timeout', 'fallback')),
  error_message TEXT,
  used_fallback BOOLEAN DEFAULT FALSE,
  fallback_provider TEXT
);

CREATE INDEX IF NOT EXISTS idx_tile_fetch_provider ON tile_fetch_log (provider, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_tile_fetch_status ON tile_fetch_log (status, fetched_at DESC);

-- Fire events from NASA FIRMS
CREATE TABLE IF NOT EXISTS fire_events (
  id          BIGSERIAL PRIMARY KEY,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  brightness  DOUBLE PRECISION,
  confidence  TEXT,
  acq_date    DATE,
  geom        GEOMETRY(Point, 4326),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (latitude, longitude, brightness, confidence, acq_date)
);

CREATE INDEX IF NOT EXISTS idx_fire_events_geom ON fire_events USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_fire_events_date ON fire_events (acq_date DESC);

-- Overlay health tracking
CREATE TABLE IF NOT EXISTS overlay_metadata (
  overlay_id             TEXT PRIMARY KEY,
  provider               TEXT NOT NULL,
  last_successful_fetch  TIMESTAMPTZ,
  error_count            INTEGER DEFAULT 0,
  consecutive_errors     INTEGER DEFAULT 0,
  fallback_chain_pos     INTEGER DEFAULT 0,
  avg_latency_ms         DOUBLE PRECISION DEFAULT 0,
  status                 TEXT DEFAULT 'healthy'
    CHECK (status IN ('healthy', 'degraded', 'offline')),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider health monitoring
CREATE TABLE IF NOT EXISTS satellite_provider_health (
  provider_id    TEXT NOT NULL,
  provider_name  TEXT NOT NULL,
  endpoint       TEXT NOT NULL,
  checked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_ms    INTEGER,
  status         TEXT NOT NULL CHECK (status IN ('live', 'slow', 'offline')),
  uptime_7d      DOUBLE PRECISION DEFAULT 100,
  error_rate_7d  DOUBLE PRECISION DEFAULT 0,
  PRIMARY KEY (provider_id, checked_at)
);

CREATE INDEX IF NOT EXISTS idx_provider_health_latest
  ON satellite_provider_health (provider_id, checked_at DESC);
`;

/**
 * Firestore collection structure for Firebase.
 */
export const FIRESTORE_COLLECTIONS = {
  tileFetchLog: "tile_fetch_log",
  fireEvents: "fire_events",
  overlayMetadata: "overlay_metadata",
  providerHealth: "satellite_provider_health",
} as const;

/**
 * Google Sheets layout for convenience data.
 * Each sheet name maps to a data category.
 */
export const GOOGLE_SHEETS_LAYOUT = {
  /** Provider health dashboard — auto-updated */
  providerHealth: {
    sheetName: "Provider Health",
    columns: ["Provider", "Endpoint", "Status", "Response (ms)", "Uptime 7d", "Last Checked"],
    updateFrequency: "every 15 minutes",
  },
  /** Daily tile fetch summary */
  tileFetchSummary: {
    sheetName: "Tile Fetch Summary",
    columns: ["Date", "Provider", "Total Fetches", "Avg Latency (ms)", "Error Rate %", "Fallback Count"],
    updateFrequency: "daily rollup",
  },
  /** Configuration overrides (manual edits) */
  configOverrides: {
    sheetName: "Config Overrides",
    columns: ["Key", "Value", "Description", "Updated By", "Updated At"],
    updateFrequency: "manual — changes reflected in app on next load",
  },
} as const;

// ── Storage Resolution ──────────────────────────────────────────

/**
 * Determine the best available storage backend.
 * Checks environment variables to see what's configured.
 */
export function resolveStorageBackend(env: Record<string, string | undefined>): StorageConfig {
  // 1. Supabase
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    return {
      backend: "supabase",
      connectionUrl: env.SUPABASE_URL,
      apiKey: env.SUPABASE_ANON_KEY,
      available: true,
    };
  }

  // 2. Firebase
  if (env.FIREBASE_PROJECT_ID) {
    return {
      backend: "firebase",
      projectId: env.FIREBASE_PROJECT_ID,
      apiKey: env.FIREBASE_API_KEY,
      available: true,
    };
  }

  // 3. PostgreSQL
  if (env.DATABASE_URL) {
    return {
      backend: "postgresql",
      connectionUrl: env.DATABASE_URL,
      available: true,
    };
  }

  // 4. Google Sheets
  if (env.GOOGLE_SHEETS_ID && env.GOOGLE_API_KEY) {
    return {
      backend: "google-sheets",
      sheetsId: env.GOOGLE_SHEETS_ID,
      apiKey: env.GOOGLE_API_KEY,
      available: true,
    };
  }

  // 5. Local cache fallback
  return {
    backend: "local-cache",
    available: true,
  };
}
