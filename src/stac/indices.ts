// ─── Spectral Indices ──────────────────────────────────────────────────────
// Band math over STAC items, rendered on the fly by a dynamic tiler.
// This is what turns an imagery viewer into an analysis tool: the same scene
// becomes vegetation health, surface water, burn severity or built-up area
// depending on which bands you combine.
//
// Rendering contract (verified against titiler 2.4.0 on 2026-10-05):
//   /stac/preview.png?url=<item>&assets=A&assets=B&asset_as_band=true
//                    &expression=(b1-b2)/(b1+b2)
// Bands are referenced POSITIONALLY as b1, b2, … in the order the `assets`
// parameters appear. Asset names ("nir", "red") are NOT valid expression
// variables and return HTTP 400 "Invalid expression".

import type { StacBackendId } from "./types";

/** A normalised-difference or arithmetic combination of named STAC assets. */
export interface SpectralIndex {
  id: string;
  label: string;
  /** What the number physically means. */
  description: string;
  /**
   * STAC asset keys, in the order the expression references them.
   * `assets[0]` is `b1`, `assets[1]` is `b2`, and so on.
   */
  assets: string[];
  /** rio-tiler band math over b1..bN. */
  expression: string;
  /** Display stretch — [min, max] of the index, not of raw reflectance. */
  rescale: [number, number];
  /** A TiTiler colormap name. */
  colormap: string;
  /** How to read the output, for a legend or an agent's explanation. */
  interpretation: string;
  /** Which STAC collections carry the required assets. */
  collections: string[];
}

/** Normalised difference, the most common form: (A − B) / (A + B). */
function normalisedDifference(): string {
  return "(b1-b2)/(b1+b2)";
}

export const SPECTRAL_INDICES: SpectralIndex[] = [
  {
    id: "true-color",
    label: "True Colour",
    description: "Natural-colour composite — the scene as the eye would see it.",
    assets: ["red", "green", "blue"],
    expression: "",
    rescale: [0, 3000],
    colormap: "",
    interpretation: "What a person in orbit would see.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a", "sentinel-2-l1c"],
  },
  {
    id: "ndvi",
    label: "NDVI — Vegetation",
    description:
      "Normalised Difference Vegetation Index. Healthy leaves reflect near-infrared strongly and absorb red, so the gap between them tracks vegetation vigour.",
    assets: ["nir", "red"],
    expression: normalisedDifference(),
    rescale: [-0.2, 0.9],
    colormap: "rdylgn",
    interpretation:
      "Below 0 is water. 0–0.2 bare soil, rock or built-up. 0.2–0.5 sparse or stressed vegetation. Above 0.6 dense healthy canopy.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
  {
    id: "ndwi",
    label: "NDWI — Surface Water",
    description:
      "McFeeters Normalised Difference Water Index. Water reflects green and absorbs near-infrared, so the index isolates open water — the standard way to map flood extent.",
    assets: ["green", "nir"],
    expression: normalisedDifference(),
    rescale: [-0.5, 0.8],
    colormap: "blues",
    interpretation:
      "Above 0 is open water. Below 0 is land. Flood mapping usually thresholds around 0.0–0.2.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
  {
    id: "ndmi",
    label: "NDMI — Vegetation Moisture",
    description:
      "Normalised Difference Moisture Index. Shortwave infrared is absorbed by leaf water, so NIR minus SWIR tracks canopy water content and drought stress.",
    assets: ["nir", "swir16"],
    expression: normalisedDifference(),
    rescale: [-0.5, 0.6],
    colormap: "rdbu",
    interpretation:
      "Negative values mean water stress or bare ground. Positive values mean well-watered canopy. Falling NDMI ahead of fire season is an early warning.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
  {
    id: "nbr",
    label: "NBR — Burn Severity",
    description:
      "Normalised Burn Ratio. Fire drops near-infrared and raises shortwave infrared, so NBR falls sharply over burned ground. Differencing pre- and post-fire NBR gives severity.",
    assets: ["nir", "swir22"],
    expression: normalisedDifference(),
    rescale: [-0.5, 0.8],
    colormap: "rdylgn",
    interpretation:
      "High values are unburned vegetation. Low or negative values are recently burned. Compare two dates — dNBR — for severity rather than reading one scene alone.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
  {
    id: "ndbi",
    label: "NDBI — Built-up Area",
    description:
      "Normalised Difference Built-up Index. Concrete and asphalt reflect shortwave infrared more than near-infrared, inverting the vegetation signal.",
    assets: ["swir16", "nir"],
    expression: normalisedDifference(),
    rescale: [-0.5, 0.5],
    colormap: "magma",
    interpretation:
      "Positive values indicate built-up and impervious surfaces. Bare soil also reads positive — pair with NDVI to separate the two.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
  {
    id: "savi",
    label: "SAVI — Soil-Adjusted Vegetation",
    description:
      "Soil-Adjusted Vegetation Index. NDVI over-reads bare soil in sparse canopy; the 0.5 correction factor damps that out.",
    assets: ["nir", "red"],
    expression: "1.5*(b1-b2)/(b1+b2+0.5)",
    rescale: [-0.2, 0.9],
    colormap: "rdylgn",
    interpretation:
      "Read like NDVI, but trust it more in arid and early-season scenes where soil dominates the pixel.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
  {
    id: "ndsi",
    label: "NDSI — Snow & Ice",
    description:
      "Normalised Difference Snow Index. Snow is bright in green and dark in shortwave infrared, which also separates it from optically similar cloud.",
    assets: ["green", "swir16"],
    expression: normalisedDifference(),
    rescale: [-0.5, 1.0],
    colormap: "blues",
    interpretation: "Above ~0.4 is snow or ice. Cloud stays below that threshold.",
    collections: ["sentinel-2-l2a", "sentinel-2-c1-l2a"],
  },
];

/**
 * Band naming is not consistent across collections. Sentinel-2 calls the
 * near-infrared band `nir`; Landsat Collection 2 calls the equivalent
 * `nir08`. An index defined against Sentinel-2 names therefore fails on a
 * Landsat scene unless the names are translated.
 *
 * Keys are the canonical (Sentinel-2) names used in SPECTRAL_INDICES.
 * Verified against real items from both collections on 2026-10-05.
 */
const BAND_ALIASES: Record<string, Record<string, string>> = {
  "landsat-c2-l2": {
    nir: "nir08",
    swir16: "swir16",
    swir22: "swir22",
    red: "red",
    green: "green",
    blue: "blue",
  },
};

/** Translate an index's canonical band names into one collection's names. */
export function resolveAssets(
  index: SpectralIndex,
  collection: string | undefined,
): string[] {
  const aliases = collection ? BAND_ALIASES[collection] : undefined;
  if (!aliases) return index.assets;
  return index.assets.map((a) => aliases[a] ?? a);
}

export function getIndex(id: string): SpectralIndex | undefined {
  return SPECTRAL_INDICES.find((i) => i.id === id);
}

export function indicesForCollection(collection: string): SpectralIndex[] {
  return SPECTRAL_INDICES.filter((i) => i.collections.includes(collection));
}

/**
 * Backends whose assets a PUBLIC tiler can read for band math.
 *
 * Only Earth Search qualifies, and the reason matters — verified 2026-10-05:
 *
 *   earth-search + sentinel-2-l2a  → works. Assets are anonymous public COGs
 *                                    on s3://sentinel-cogs.
 *   earth-search + landsat-c2-l2   → HTTP 500 "AccessDenied". Landsat COGs
 *                                    live in the USGS requester-pays bucket.
 *   planetary-computer + anything  → HTTP 409. PC assets need a SAS token,
 *                                    and a public tiler cannot sign the
 *                                    per-asset URLs behind a STAC item.
 *   cdse + anything                → assets are s3:// URIs, not HTTP at all.
 *
 * A self-hosted tiler with AWS credentials (for requester-pays) or a PC
 * signing proxy lifts these limits; set NEXT_PUBLIC_TITILER_URL and widen
 * this list if you run one.
 */
const TILER_READABLE_BACKENDS: StacBackendId[] = ["earth-search"];

export function supportsIndices(backend: StacBackendId): boolean {
  return TILER_READABLE_BACKENDS.includes(backend);
}

/** Collections whose bands a public tiler can read for band math. */
export const INDEX_READY_COLLECTIONS = [
  "sentinel-2-l2a",
  "sentinel-2-c1-l2a",
] as const;
