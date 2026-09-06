// ─── STAC backends ─────────────────────────────────────────────────────────
// All four were probed on 2026-09-06 and returned live results for a Bangkok
// bounding box with no credentials. See `src/sources/imagery-catalogs.ts`.

import type { StacBackend, StacBackendId } from "./types";

export const STAC_BACKENDS: Record<StacBackendId, StacBackend> = {
  "earth-search": {
    id: "earth-search",
    label: "Earth Search (AWS Open Data)",
    url: "https://earth-search.aws.element84.com/v1",
    assetsArePublic: true,
    sentinel2Collection: "sentinel-2-l2a",
    landsatCollection: "landsat-c2-l2",
    cloudFilter: "query",
    notes:
      "Default. Assets are anonymous public COGs, so a tiler can read them with no signing step.",
  },
  "planetary-computer": {
    id: "planetary-computer",
    label: "Microsoft Planetary Computer",
    url: "https://planetarycomputer.microsoft.com/api/stac/v1",
    assetsArePublic: false,
    signEndpoint: "https://planetarycomputer.microsoft.com/api/sas/v1/sign",
    sentinel2Collection: "sentinel-2-l2a",
    landsatCollection: "landsat-c2-l2",
    cloudFilter: "query",
    notes:
      "Widest catalog (126+ collections, Landsat back to 1982). Asset hrefs must be SAS-signed before reading; signing is free and unauthenticated.",
  },
  cdse: {
    id: "cdse",
    label: "Copernicus Data Space (ESA)",
    url: "https://stac.dataspace.copernicus.eu/v1",
    assetsArePublic: false,
    sentinel2Collection: "sentinel-2-l2a",
    cloudFilter: "query",
    notes:
      "Authoritative ESA source with the newest processing baselines. Search is open; downloading product bytes needs a free CDSE account.",
  },
  "nasa-cmr": {
    id: "nasa-cmr",
    label: "NASA CMR (LPCLOUD)",
    url: "https://cmr.earthdata.nasa.gov/stac/LPCLOUD",
    assetsArePublic: false,
    cloudFilter: "none",
    notes:
      "STAC facade over NASA Earthdata. Best for HLS (harmonised Landsat + Sentinel-2, 30 m). Asset downloads need an Earthdata Login.",
  },
};

export const DEFAULT_BACKEND: StacBackendId = "earth-search";

export function getBackend(id: StacBackendId = DEFAULT_BACKEND): StacBackend {
  return STAC_BACKENDS[id] ?? STAC_BACKENDS[DEFAULT_BACKEND];
}

export function listBackends(): StacBackend[] {
  return Object.values(STAC_BACKENDS);
}

export function isBackendId(value: string): value is StacBackendId {
  return value in STAC_BACKENDS;
}
