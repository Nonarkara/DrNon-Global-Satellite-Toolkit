// ─── STAC (SpatioTemporal Asset Catalog) — minimal typed surface ───────────
// Only the parts of the spec this toolkit uses. Full spec:
// https://github.com/radiantearth/stac-spec

/** [west, south, east, north] in WGS84 degrees. */
export type BBox = [number, number, number, number];

export interface StacAsset {
  href: string;
  type?: string;
  title?: string;
  roles?: string[];
  /** Common band metadata when present. */
  "eo:bands"?: { name?: string; common_name?: string }[];
}

export interface StacItem {
  type: "Feature";
  stac_version: string;
  id: string;
  collection?: string;
  bbox?: BBox;
  geometry: { type: string; coordinates: unknown } | null;
  properties: {
    datetime: string | null;
    "eo:cloud_cover"?: number;
    platform?: string;
    instruments?: string[];
    [key: string]: unknown;
  };
  assets: Record<string, StacAsset>;
  links?: { rel: string; href: string; type?: string }[];
}

export interface StacItemCollection {
  type: "FeatureCollection";
  features: StacItem[];
  links?: { rel: string; href: string; body?: unknown }[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface StacCollection {
  id: string;
  title?: string;
  description?: string;
  license?: string;
  extent?: {
    spatial?: { bbox: number[][] };
    temporal?: { interval: (string | null)[][] };
  };
}

export interface StacSearchParams {
  collections: string[];
  bbox?: BBox;
  /** RFC 3339 instant or `start/end` interval. `..` is an open bound. */
  datetime?: string;
  limit?: number;
  /** Max cloud cover percent — translated to a CQL2/query filter per backend. */
  maxCloudCover?: number;
  /** Sort key, e.g. "-properties.datetime" for newest first. */
  sortby?: string;
  intersects?: { type: string; coordinates: unknown };
}

/** A search result normalised across backends, with rendering hints attached. */
export interface StacSearchResult {
  backend: StacBackendId;
  items: StacItem[];
  matched?: number;
  searchedAt: string;
}

export type StacBackendId =
  | "earth-search"
  | "planetary-computer"
  | "cdse"
  | "nasa-cmr";

export interface StacBackend {
  id: StacBackendId;
  label: string;
  /** Root of the STAC API (no trailing slash). */
  url: string;
  /** Whether asset hrefs are readable without signing. */
  assetsArePublic: boolean;
  /** Endpoint that signs an asset href, if signing is required. */
  signEndpoint?: string;
  /** Collection id for Sentinel-2 L2A on this backend, if it carries one. */
  sentinel2Collection?: string;
  /** Collection id for Landsat Collection 2 L2 on this backend. */
  landsatCollection?: string;
  /** How this backend expects cloud-cover filtering to be expressed. */
  cloudFilter: "query" | "none";
  notes: string;
}
