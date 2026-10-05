import { NextResponse } from "next/server";
import { DEFAULT_BACKEND, isBackendId } from "../../../../stac/backends";
import { searchStac } from "../../../../stac/client";
import {
  SPECTRAL_INDICES,
  getIndex,
  resolveAssets,
} from "../../../../stac/indices";
import { buildIndexRender } from "../../../../stac/index-render";
import type { BBox, StacBackendId } from "../../../../stac/types";

export const dynamic = "force-dynamic";

const DEFAULT_BBOX: BBox = [100.3, 13.5, 100.9, 14.0];
const DEFAULT_COLLECTION = "sentinel-2-l2a";

/**
 * Index work sorts by least cloud, which over an unbounded archive happily
 * returns a pristine scene from years ago. Constrain to a recent window
 * unless the caller asks for a specific one.
 */
const DEFAULT_LOOKBACK_DAYS = 120;

function recentWindow(days: number): string {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return `${start.toISOString()}/${end.toISOString()}`;
}

function parseBBox(raw: string | null): BBox {
  if (!raw) return DEFAULT_BBOX;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return DEFAULT_BBOX;
  return parts as BBox;
}

/**
 * GET /api/stac/indices
 *
 * Without `index`, lists the available spectral indices and what they mean.
 * With `index=ndvi`, finds the least-cloudy recent scene over `bbox` and
 * returns tile, preview and statistics URLs for that index.
 *
 *   ?index=ndvi&bbox=100.3,13.5,100.9,14.0&maxCloudCover=20
 *   &item=<scene id>        pin a specific scene instead of searching
 *   &backend=earth-search|planetary-computer
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const indexId = q.get("index");

  if (!indexId) {
    return NextResponse.json({
      count: SPECTRAL_INDICES.length,
      indices: SPECTRAL_INDICES.map((i) => ({
        id: i.id,
        label: i.label,
        description: i.description,
        bands: i.assets,
        interpretation: i.interpretation,
        collections: i.collections,
      })),
    });
  }

  const index = getIndex(indexId);
  if (!index) {
    return NextResponse.json(
      {
        error: `Unknown index "${indexId}"`,
        available: SPECTRAL_INDICES.map((i) => i.id),
      },
      { status: 404 },
    );
  }

  const backendParam = q.get("backend") ?? DEFAULT_BACKEND;
  const backend: StacBackendId = isBackendId(backendParam)
    ? backendParam
    : DEFAULT_BACKEND;

  const cloudRaw = Number(q.get("maxCloudCover") ?? 20);
  const maxCloudCover = Number.isFinite(cloudRaw) ? cloudRaw : 20;
  const pinnedItem = q.get("item");

  try {
    const result = await searchStac(
      {
        collections: [q.get("collection") ?? DEFAULT_COLLECTION],
        bbox: parseBBox(q.get("bbox")),
        datetime: q.get("datetime") ?? recentWindow(DEFAULT_LOOKBACK_DAYS),
        maxCloudCover,
        limit: pinnedItem ? 50 : 10,
        // Least cloud first: for index work, clarity beats recency.
        sortby: q.get("sortby") ?? "properties.eo:cloud_cover",
      },
      backend,
    );

    const item = pinnedItem
      ? result.items.find((i) => i.id === pinnedItem)
      : result.items[0];

    if (!item) {
      return NextResponse.json(
        {
          error: pinnedItem
            ? `Scene "${pinnedItem}" not found in this area and cloud range`
            : "No scenes matched — widen maxCloudCover or the date range",
          index: index.id,
        },
        { status: 404 },
      );
    }

    const render = buildIndexRender(item, index.id, backend);
    if (!render) {
      return NextResponse.json(
        {
          error: `Scene "${item.id}" lacks the bands required for ${index.label} (${resolveAssets(index, item.collection).join(", ")}), or this backend's assets are not tiler-readable`,
          index: index.id,
        },
        { status: 422 },
      );
    }

    const cloud = item.properties?.["eo:cloud_cover"];

    return NextResponse.json({
      index: {
        id: index.id,
        label: index.label,
        description: index.description,
        bands: index.assets,
        expression: index.expression,
        interpretation: index.interpretation,
      },
      scene: {
        id: item.id,
        collection: item.collection,
        datetime: item.properties?.datetime ?? null,
        cloudCover: typeof cloud === "number" ? Math.round(cloud * 10) / 10 : null,
        bbox: item.bbox ?? null,
      },
      backend,
      render,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Spectral index error:", message);
    return NextResponse.json({ error: message, index: indexId }, { status: 502 });
  }
}
