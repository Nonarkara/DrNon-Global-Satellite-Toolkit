// ─── Rendering a spectral index ────────────────────────────────────────────
// Builds the tiler URLs that turn a STAC item plus an index definition into
// pixels. Kept separate from the index definitions so the catalog stays pure
// data and only this file knows the tiler's quirks.

import { getBackend } from "./backends";
import { titilerBase } from "./preview";
import {
  SPECTRAL_INDICES,
  getIndex,
  resolveAssets,
  supportsIndices,
  type SpectralIndex,
} from "./indices";
import type { StacBackendId, StacItem } from "./types";

/** Reflectance stretch for a plain RGB composite from raw bands. */
const TRUE_COLOR_RESCALE = "0,3000";

const SPECTRAL_INDEX_IDS = SPECTRAL_INDICES.map((i) => i.id);

export interface IndexRender {
  indexId: string;
  label: string;
  /** XYZ template with {z}/{x}/{y} — drop into deck.gl or MapLibre. */
  tileUrl: string;
  /** Whole-footprint PNG, for a quick look without a map. */
  previewUrl: string;
  /** Pixel statistics endpoint — min/max/mean/percentiles over the scene. */
  statisticsUrl: string;
  interpretation: string;
  rescale: [number, number];
  colormap: string;
}

/**
 * STAC items are addressed by their canonical self link. Falls back to
 * constructing one, since a few catalogs omit `links` on search results.
 */
export function itemSelfHref(
  item: StacItem,
  backendId: StacBackendId,
): string | null {
  const self = item.links?.find((l) => l.rel === "self")?.href;
  if (self) return self;

  const backend = getBackend(backendId);
  if (!item.collection) return null;
  return `${backend.url}/collections/${item.collection}/items/${item.id}`;
}

function indexQuery(index: SpectralIndex, assets: string[]): string {
  const params = new URLSearchParams();

  // True colour is an RGB composite, not band math — no expression, and the
  // rescale applies to raw reflectance rather than an index range.
  if (!index.expression) {
    for (const asset of assets) params.append("assets", asset);
    params.set("asset_as_band", "true");
    params.set("rescale", TRUE_COLOR_RESCALE);
    return params.toString();
  }

  // Order matters: assets[0] becomes b1, assets[1] becomes b2, …
  for (const asset of assets) params.append("assets", asset);
  params.set("asset_as_band", "true");
  params.set("expression", index.expression);
  params.set("rescale", `${index.rescale[0]},${index.rescale[1]}`);
  if (index.colormap) params.set("colormap_name", index.colormap);
  return params.toString();
}

/**
 * Build tile, preview and statistics URLs for an index over one scene.
 * Returns null when the backend's assets are not HTTP-readable, or when the
 * scene's collection does not carry the bands the index needs.
 */
export function buildIndexRender(
  item: StacItem,
  indexId: string,
  backendId: StacBackendId = "earth-search",
): IndexRender | null {
  if (!supportsIndices(backendId)) return null;

  const index = getIndex(indexId);
  if (!index) return null;

  // Translate canonical band names into this collection's naming, then check
  // the item really carries them — asking for a missing band 400s the tiler.
  const assets = resolveAssets(index, item.collection);
  const missing = assets.filter((a) => !item.assets?.[a]);
  if (missing.length > 0) return null;

  const href = itemSelfHref(item, backendId);
  if (!href) return null;

  const base = titilerBase();
  const url = `url=${encodeURIComponent(href)}`;
  const query = indexQuery(index, assets);

  return {
    indexId: index.id,
    label: index.label,
    tileUrl: `${base}/stac/tiles/WebMercatorQuad/{z}/{x}/{y}.png?${url}&${query}`,
    previewUrl: `${base}/stac/preview.png?${url}&${query}&max_size=1024`,
    statisticsUrl: `${base}/stac/statistics?${url}&${query}`,
    interpretation: index.interpretation,
    rescale: index.rescale,
    colormap: index.colormap,
  };
}

/** Every index this scene has the bands for. */
export function availableIndexes(
  item: StacItem,
  backendId: StacBackendId = "earth-search",
): IndexRender[] {
  if (!supportsIndices(backendId)) return [];
  return SPECTRAL_INDEX_IDS.map((id) =>
    buildIndexRender(item, id, backendId),
  ).filter((r): r is IndexRender => r !== null);
}
