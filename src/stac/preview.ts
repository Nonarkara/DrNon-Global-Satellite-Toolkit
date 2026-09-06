// ─── Turning a STAC item into something you can look at ────────────────────
// The gap between "I found a scene" and "I can see it" is asset selection
// plus a dynamic tiler. This module closes it.

import { getBackend } from "./backends";
import { signAssetHref } from "./client";
import type { StacBackendId, StacItem } from "./types";

/**
 * Public TiTiler demo. Courtesy instance with no SLA — set
 * NEXT_PUBLIC_TITILER_URL to your own deployment before production.
 * Self-host: docker run -p 8000:8000 ghcr.io/developmentseed/titiler:latest
 */
export const DEFAULT_TITILER = "https://titiler.xyz";

export function titilerBase(): string {
  return process.env.NEXT_PUBLIC_TITILER_URL || DEFAULT_TITILER;
}

/**
 * Asset keys that hold a ready-to-view RGB composite, best first.
 * `visual`/`rendered_preview` are pre-rendered 8-bit RGB; anything else
 * needs band math and rescaling before it looks like a photograph.
 */
const RGB_ASSET_KEYS = ["visual", "rendered_preview", "TCI", "tci"];

export function findVisualAsset(item: StacItem): string | null {
  for (const key of RGB_ASSET_KEYS) {
    const asset = item.assets?.[key];
    if (asset?.href) return asset.href;
  }
  // Fall back to any asset explicitly tagged as an overview/visual role.
  for (const asset of Object.values(item.assets ?? {})) {
    if (asset.roles?.some((r) => r === "visual" || r === "overview")) {
      return asset.href;
    }
  }
  return null;
}

export interface TilePreview {
  /** XYZ template with {z}/{x}/{y} placeholders, ready for deck.gl. */
  tileUrl: string;
  /** Endpoint returning bounds/minzoom/maxzoom for this exact COG. */
  tileJsonUrl: string;
  /** The COG the tiles are rendered from. */
  assetHref: string;
}

/**
 * A tiler fetches over HTTP. Some catalogs (CDSE, several NASA DAACs) publish
 * `s3://` object URIs that only resolve with credentials and an S3 client, so
 * they cannot be previewed this way — say so rather than emitting a tile URL
 * that will silently 404.
 */
function isHttpReadable(href: string): boolean {
  return href.startsWith("https://") || href.startsWith("http://");
}

/**
 * Build tile URLs for a STAC item's RGB composite.
 * Returns null when the item has no asset a public tiler can read.
 */
export async function buildTilePreview(
  item: StacItem,
  backendId: StacBackendId = "earth-search",
): Promise<TilePreview | null> {
  const raw = findVisualAsset(item);
  if (!raw) return null;

  const href = await signAssetHref(raw, backendId);
  if (!isHttpReadable(href)) return null;

  const encoded = encodeURIComponent(href);
  const base = titilerBase();

  return {
    tileUrl: `${base}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encoded}`,
    tileJsonUrl: `${base}/cog/WebMercatorQuad/tilejson.json?url=${encoded}`,
    assetHref: href,
  };
}

/** Compact, UI-friendly summary of a STAC item. */
export interface ScenePreview {
  id: string;
  collection?: string;
  datetime: string | null;
  cloudCover: number | null;
  platform: string | null;
  bbox: number[] | null;
  backend: StacBackendId;
  preview: TilePreview | null;
}

export async function toScenePreview(
  item: StacItem,
  backendId: StacBackendId = "earth-search",
): Promise<ScenePreview> {
  const cloud = item.properties?.["eo:cloud_cover"];
  return {
    id: item.id,
    collection: item.collection,
    datetime: item.properties?.datetime ?? null,
    cloudCover: typeof cloud === "number" ? Math.round(cloud * 10) / 10 : null,
    platform: (item.properties?.platform as string) ?? null,
    bbox: item.bbox ?? null,
    backend: getBackend(backendId).id,
    preview: await buildTilePreview(item, backendId),
  };
}
