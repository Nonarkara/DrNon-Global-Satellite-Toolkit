// ─── STAC client ───────────────────────────────────────────────────────────
// One search function that works against every backend in `backends.ts`.
// No SDK, no API key, no build step — just fetch.

import { getBackend } from "./backends";
import type {
  StacBackendId,
  StacCollection,
  StacItemCollection,
  StacSearchParams,
  StacSearchResult,
} from "./types";

const SEARCH_TIMEOUT_MS = 20_000;
const COLLECTIONS_TIMEOUT_MS = 15_000;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

/** Body shape a STAC API `POST /search` accepts. */
interface StacSearchBody {
  collections: string[];
  limit: number;
  bbox?: number[];
  datetime?: string;
  sortby?: { field: string; direction: "asc" | "desc" }[];
  query?: Record<string, Record<string, number>>;
  intersects?: unknown;
}

function buildSearchBody(
  params: StacSearchParams,
  backendId: StacBackendId,
): StacSearchBody {
  const backend = getBackend(backendId);
  const body: StacSearchBody = {
    collections: params.collections,
    limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
  };

  if (params.bbox) body.bbox = params.bbox;
  if (params.datetime) body.datetime = params.datetime;
  if (params.intersects) body.intersects = params.intersects;

  // Cloud cover is an `eo` extension property; not every backend indexes it.
  if (
    typeof params.maxCloudCover === "number" &&
    backend.cloudFilter === "query"
  ) {
    body.query = { "eo:cloud_cover": { lt: params.maxCloudCover } };
  }

  if (params.sortby) {
    const desc = params.sortby.startsWith("-");
    body.sortby = [
      {
        field: desc ? params.sortby.slice(1) : params.sortby,
        direction: desc ? "desc" : "asc",
      },
    ];
  }

  return body;
}

/**
 * Search a STAC API.
 *
 * Throws on a non-2xx response so the caller (an API route, a module) can
 * decide whether to fall back — this function never silently returns mocks.
 */
export async function searchStac(
  params: StacSearchParams,
  backendId: StacBackendId = "earth-search",
): Promise<StacSearchResult> {
  const backend = getBackend(backendId);
  const body = buildSearchBody(params, backendId);

  const res = await fetch(`${backend.url}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/geo+json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `STAC search failed on ${backend.label}: ${res.status} ${detail.slice(0, 200)}`,
    );
  }

  const json = (await res.json()) as StacItemCollection;

  return {
    backend: backend.id,
    items: json.features ?? [],
    matched: json.numberMatched,
    searchedAt: new Date().toISOString(),
  };
}

/** List the collections a backend exposes. */
export async function listCollections(
  backendId: StacBackendId = "earth-search",
): Promise<StacCollection[]> {
  const backend = getBackend(backendId);

  const res = await fetch(`${backend.url}/collections`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(COLLECTIONS_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(
      `STAC collections failed on ${backend.label}: ${res.status}`,
    );
  }

  const json = (await res.json()) as { collections?: StacCollection[] };
  return json.collections ?? [];
}

/**
 * Planetary Computer serves assets from Azure Blob behind a SAS token.
 * Signing is free and needs no account, but it is not optional — unsigned
 * hrefs return 404. Other backends pass through unchanged.
 */
export async function signAssetHref(
  href: string,
  backendId: StacBackendId,
): Promise<string> {
  const backend = getBackend(backendId);
  if (backend.assetsArePublic || !backend.signEndpoint) return href;

  try {
    const res = await fetch(
      `${backend.signEndpoint}?href=${encodeURIComponent(href)}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return href;
    const json = (await res.json()) as { href?: string };
    return json.href ?? href;
  } catch {
    // Signing is best-effort: return the raw href and let the tiler report
    // the real failure rather than swallowing the item entirely.
    return href;
  }
}
