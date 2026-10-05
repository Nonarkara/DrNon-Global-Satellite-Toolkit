// ─── STAC collection catalog ───────────────────────────────────────────────
// What you can actually search for, and which backend to ask.
// Every entry was probed against a Bangkok bounding box on 2026-10-05 and
// returned real items; the assets listed are what came back.

import type { StacBackendId } from "./types";

export type CollectionKind =
  | "optical"
  | "radar"
  | "elevation"
  | "land-cover"
  | "atmospheric"
  | "derived";

export interface CollectionInfo {
  id: string;
  label: string;
  kind: CollectionKind;
  /** Backends that carry it, best first. */
  backends: StacBackendId[];
  resolution: string;
  revisit: string;
  /** Temporal extent of the archive. */
  archive: string;
  /** What question this collection answers. */
  useWhen: string;
  /** Asset keys confirmed present in a returned item. */
  assets: string[];
  /** Whether a public tiler can render it without credentials. */
  previewable: boolean;
  gotchas?: string[];
}

export const COLLECTIONS: CollectionInfo[] = [
  // ── Optical ──────────────────────────────────────────────────────────────
  {
    id: "sentinel-2-l2a",
    label: "Sentinel-2 L2A (surface reflectance)",
    kind: "optical",
    backends: ["earth-search", "planetary-computer", "cdse"],
    resolution: "10 m visible/NIR, 20 m red-edge/SWIR, 60 m atmospheric",
    revisit: "~5 days (2A + 2B combined)",
    archive: "2015 → present",
    useWhen:
      "The default for anything optical: vegetation, water, urban change, agriculture. Highest free resolution with a short revisit.",
    assets: ["visual", "red", "green", "blue", "nir", "swir16", "swir22", "scl"],
    previewable: true,
    gotchas: [
      "Scenes are ~110 km MGRS tiles; a city bbox usually spans several.",
      "Cloud is the limiting factor in the tropics — filter on eo:cloud_cover, and expect gaps in monsoon season.",
    ],
  },
  {
    id: "landsat-c2-l2",
    label: "Landsat Collection 2 Level-2",
    kind: "optical",
    backends: ["planetary-computer", "earth-search"],
    resolution: "30 m multispectral, 15 m panchromatic, 100 m thermal",
    revisit: "8 days (Landsat 8 + 9 combined)",
    archive: "1982 → present (Landsat 4 onward)",
    useWhen:
      "Long time series and anything pre-2015 that Sentinel-2 cannot reach. Also the only free source of calibrated surface temperature.",
    assets: ["red", "green", "blue", "nir08", "swir16", "swir22", "lwir11", "qa_pixel"],
    previewable: false,
    gotchas: [
      "Band names differ from Sentinel-2 — nir08 rather than nir. `resolveAssets()` in src/stac/indices.ts translates them.",
      "Not renderable by a public tiler (verified 2026-10-05): Earth Search's Landsat COGs sit in the USGS requester-pays bucket (AccessDenied) and Planetary Computer's need SAS signing the tiler cannot perform (HTTP 409). Search and metadata work fine; for pixels, self-host a tiler with credentials or download the assets.",
      "Landsat 7 scenes after 2003 have SLC-off striping.",
    ],
  },

  // ── Radar ────────────────────────────────────────────────────────────────
  {
    id: "sentinel-1-rtc",
    label: "Sentinel-1 RTC (radiometrically terrain-corrected SAR)",
    kind: "radar",
    backends: ["planetary-computer"],
    resolution: "10 m",
    revisit: "~12 days",
    archive: "2014 → present",
    useWhen:
      "Cloud is blocking the optical view, or the event happened at night. Analysis-ready: already calibrated and terrain-corrected, so you can use it directly rather than running SNAP.",
    assets: ["vv", "vh", "rendered_preview", "tilejson"],
    previewable: true,
    gotchas: [
      "SAR backscatter is not a photograph. Bright means rough or metallic, dark means smooth — calm water is near-black.",
      "Flood mapping with SAR thresholds VV backscatter low; wind-roughened water breaks that assumption.",
    ],
  },
  {
    id: "sentinel-1-grd",
    label: "Sentinel-1 GRD (ground range detected)",
    kind: "radar",
    backends: ["earth-search", "cdse"],
    resolution: "10 m (IW mode)",
    revisit: "~12 days",
    archive: "2014 → present",
    useWhen:
      "You need raw-ish SAR to process yourself, or RTC is unavailable for your area.",
    assets: ["safe-manifest", "schema-product-vv", "schema-calibration-vv"],
    previewable: false,
    gotchas: [
      "GRD on Earth Search exposes SAFE metadata rather than readable COG bands — there is no `visual` asset and no browser preview.",
      "Needs calibration and terrain correction before it means anything quantitatively. Prefer sentinel-1-rtc unless you specifically want to do that yourself.",
    ],
  },

  // ── Elevation ────────────────────────────────────────────────────────────
  {
    id: "cop-dem-glo-30",
    label: "Copernicus DEM GLO-30",
    kind: "elevation",
    backends: ["earth-search", "planetary-computer"],
    resolution: "30 m",
    revisit: "Static",
    archive: "2021 release (acquired 2010–2015)",
    useWhen:
      "Terrain, watersheds, flood routing, viewsheds, or terrain-correcting another dataset. The best free global DEM.",
    assets: ["data"],
    previewable: true,
    gotchas: [
      "A surface model, not a bare-earth model: it includes buildings and canopy.",
    ],
  },
  {
    id: "nasadem",
    label: "NASADEM",
    kind: "elevation",
    backends: ["planetary-computer"],
    resolution: "30 m",
    revisit: "Static",
    archive: "SRTM 2000, reprocessed 2020",
    useWhen:
      "A reference DEM for change comparison, or where Copernicus DEM has voids.",
    assets: ["elevation", "rendered_preview"],
    previewable: true,
    gotchas: ["Coverage stops at 60°N / 56°S — no polar data."],
  },

  // ── Land cover ───────────────────────────────────────────────────────────
  {
    id: "esa-worldcover",
    label: "ESA WorldCover",
    kind: "land-cover",
    backends: ["planetary-computer"],
    resolution: "10 m",
    revisit: "Annual (2020, 2021)",
    archive: "2020–2021",
    useWhen:
      "You need an authoritative land-cover baseline to classify against, or to mask an index to one land type.",
    assets: ["map", "input_quality", "rendered_preview"],
    previewable: true,
    gotchas: [
      "Only two epochs — useful as a baseline, not as a change time series.",
    ],
  },
  {
    id: "io-lulc-annual-v02",
    label: "Impact Observatory Annual Land Use / Land Cover",
    kind: "land-cover",
    backends: ["planetary-computer"],
    resolution: "10 m",
    revisit: "Annual",
    archive: "2017 → present",
    useWhen:
      "Year-on-year land-use change — deforestation, urban expansion, cropland conversion.",
    assets: ["data", "rendered_preview"],
    previewable: true,
  },

  // ── Derived ──────────────────────────────────────────────────────────────
  {
    id: "modis-13A1-061",
    label: "MODIS Vegetation Indices (16-day, 500 m)",
    kind: "derived",
    backends: ["planetary-computer"],
    resolution: "500 m",
    revisit: "16-day composite",
    archive: "2000 → present",
    useWhen:
      "A 25-year vegetation record at continental scale, already composited to remove cloud. Use it for trend, not for detail.",
    assets: ["500m_16_days_NDVI", "500m_16_days_EVI"],
    previewable: true,
    gotchas: [
      "Pre-computed NDVI and EVI — do not recompute them from reflectance.",
      "Scaled integers: multiply by 0.0001 to get the real index value.",
    ],
  },
];

export function getCollection(id: string): CollectionInfo | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}

export function collectionsByKind(kind: CollectionKind): CollectionInfo[] {
  return COLLECTIONS.filter((c) => c.kind === kind);
}

export function collectionsForBackend(backend: StacBackendId): CollectionInfo[] {
  return COLLECTIONS.filter((c) => c.backends.includes(backend));
}

/** Best backend to ask for a collection — the first one that carries it. */
export function preferredBackend(id: string): StacBackendId | undefined {
  return getCollection(id)?.backends[0];
}
