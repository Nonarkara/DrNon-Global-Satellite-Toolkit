// ─── Curated Data Source Registry — Types ──────────────────────────────────
// Every entry in this registry has been probed live. See `npm run probe`.

/**
 * Priority tier. Lower is better. Drives ordering in docs, UI and agent hints.
 *
 * 1 — Start here. Keyless, global, stable, actively maintained.
 * 2 — Excellent, but needs a free key/account or has a narrower scope.
 * 3 — Specialist or regional. Reach for it when tier 1–2 can't answer.
 * 4 — Reference only. Deprecated, gated, or superseded — documented so you
 *     don't waste an afternoon rediscovering why it doesn't work.
 */
export type SourceTier = 1 | 2 | 3 | 4;

export type AuthMode =
  /** No credentials at all. Works from a cold clone. */
  | "none"
  /** Self-serve key, issued instantly and free. */
  | "free-key"
  /** Free account with a login/registration step. */
  | "free-account"
  /** Free, but a human at the provider must approve your app name. */
  | "approved-appname"
  /** Paid, or free tier too small to build on. */
  | "commercial";

export type SourceKind =
  /** SpatioTemporal Asset Catalog API — /search, /collections. */
  | "stac-api"
  /** Raster/vector tiles: WMTS, XYZ, TileJSON. */
  | "tile-service"
  /** Plain JSON/CSV REST endpoint. */
  | "rest-api"
  /** Bulk archive access — S3, FTP, order-based. */
  | "bulk-download"
  /** Human-facing web portal, no usable machine API. */
  | "portal"
  /** Open-source library or CLI you install, not a service you call. */
  | "library"
  /** Model Context Protocol server — plugs a source into an AI agent. */
  | "mcp-server";

export type VerifyStatus =
  /** Probed and returned usable data. */
  | "ok"
  /** Reachable, but returned 401/403 without credentials. */
  | "needs-auth"
  /** Returned 410/404 or an explicit end-of-life notice. */
  | "deprecated"
  /** Rate-limited during probing; expected to work when called politely. */
  | "rate-limited"
  /** Not machine-probeable (portal, library, manual ordering). */
  | "manual";

export interface SourceVerification {
  /** ISO date of the last live probe. */
  at: string;
  status: VerifyStatus;
  /** Exact URL that was probed, so the result is reproducible. */
  probe?: string;
  /** What actually came back. */
  note?: string;
}

export interface DataSource {
  /** kebab-case, stable — referenced by modules and docs. */
  id: string;
  name: string;
  /** Operating agency or organisation, e.g. "NASA", "ESA / European Commission". */
  agency: string;
  /** ISO-ish country/bloc code: "US", "EU", "JP", "IN", "CN", "CA", "GLOBAL". */
  country: string;
  kind: SourceKind;
  auth: AuthMode;
  tier: SourceTier;
  /** Machine endpoint. Absent for portals and libraries. */
  endpoint?: string;
  /** Human landing page. */
  portal: string;
  docs?: string;
  /** What data you actually get, in plain words. */
  provides: string[];
  /** Ground sample distance, e.g. "10 m", "250 m–1 km", "n/a". */
  resolution?: string;
  /** Time from acquisition to availability, e.g. "3 h (NRT)". */
  latency?: string;
  coverage?: string;
  verified: SourceVerification;
  /** One sentence: the question this source is the right answer to. */
  useWhen: string;
  /** Curated, copy-pasteable instruction for getting first data out. */
  howTo: string;
  /** Traps that cost real time. */
  gotchas?: string[];
  /** Env vars this source needs, if any. */
  requiredEnvVars?: string[];
  /** Related registry ids — usually the modern replacement or the companion tool. */
  seeAlso?: string[];
}
