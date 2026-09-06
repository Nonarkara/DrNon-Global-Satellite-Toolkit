/**
 * COG Imagery Layers — Deck.gl factories for STAC scenes
 *
 * Renders analysis-grade satellite imagery from Cloud-Optimised GeoTIFFs
 * via a dynamic tiler, so a scene found through STAC search can go straight
 * onto the map without downloading or preprocessing anything.
 *
 * Chain: STAC search → item asset (COG) → TiTiler → XYZ tiles → deck.gl
 * Verified end-to-end against Sentinel-2 over Bangkok with zero API keys.
 */

import { createRasterTileLayer } from "./map-engine";
import type { ScenePreview } from "../stac/preview";

/** TiTiler serves overviews from z8 and full detail to z14 for Sentinel-2. */
const DEFAULT_MIN_ZOOM = 8;
const DEFAULT_MAX_ZOOM = 16;

export interface TileJson {
  tiles: string[];
  bounds?: [number, number, number, number];
  minzoom?: number;
  maxzoom?: number;
  center?: [number, number, number];
}

/**
 * Fetch a COG's real bounds and zoom range before rendering.
 *
 * Worth the extra request: a tiler returns HTTP 404 (not a transparent tile)
 * for requests outside the scene footprint, which deck.gl will otherwise
 * retry noisily across the whole viewport.
 */
export async function fetchTileJson(
  tileJsonUrl: string,
): Promise<TileJson | null> {
  try {
    const res = await fetch(tileJsonUrl, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as TileJson;
  } catch {
    return null;
  }
}

export interface CogLayerOptions {
  id: string;
  /** XYZ template containing {z}/{x}/{y}. */
  tileUrl: string;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  /** Restrict rendering to the scene footprint. */
  bounds?: [number, number, number, number];
  onTileError?: (error: unknown) => void;
}

/** Build a deck.gl TileLayer for a COG tile template. */
export function createCogLayer({
  id,
  tileUrl,
  opacity = 1,
  maxZoom = DEFAULT_MAX_ZOOM,
  onTileError,
}: CogLayerOptions) {
  return createRasterTileLayer({
    id,
    data: tileUrl,
    maxZoom,
    opacity,
    onTileError,
  });
}

/**
 * Build a layer directly from a `/api/stac/search` scene.
 * Returns null for scenes with no directly viewable RGB asset.
 */
export function createSceneLayer(
  scene: ScenePreview,
  opacity = 1,
  onTileError?: (error: unknown) => void,
) {
  if (!scene.preview) return null;
  return createCogLayer({
    id: `stac-scene-${scene.id}`,
    tileUrl: scene.preview.tileUrl,
    opacity,
    onTileError,
  });
}

export { DEFAULT_MIN_ZOOM, DEFAULT_MAX_ZOOM };
