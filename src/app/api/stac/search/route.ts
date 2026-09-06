import { NextResponse } from "next/server";
import { isBackendId, DEFAULT_BACKEND } from "../../../../stac/backends";
import { searchStac } from "../../../../stac/client";
import { toScenePreview } from "../../../../stac/preview";
import type { BBox, StacBackendId } from "../../../../stac/types";

export const dynamic = "force-dynamic";

/** Bangkok, as a sensible default so the endpoint is useful with no params. */
const DEFAULT_BBOX: BBox = [100.3, 13.5, 100.9, 14.0];
const DEFAULT_COLLECTION = "sentinel-2-l2a";
const MAX_LIMIT = 50;

function parseBBox(raw: string | null): BBox {
  if (!raw) return DEFAULT_BBOX;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return DEFAULT_BBOX;
  return parts as BBox;
}

/**
 * GET /api/stac/search
 *
 *   ?bbox=100.3,13.5,100.9,14.0   west,south,east,north (WGS84)
 *   &collections=sentinel-2-l2a   comma-separated
 *   &datetime=2026-06-01/2026-09-01
 *   &maxCloudCover=20
 *   &limit=12
 *   &backend=earth-search|planetary-computer|cdse|nasa-cmr
 *
 * Returns scenes already carrying XYZ tile URLs, so a map can render them
 * without a second round trip.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams;

  const backendParam = q.get("backend") ?? DEFAULT_BACKEND;
  const backend: StacBackendId = isBackendId(backendParam)
    ? backendParam
    : DEFAULT_BACKEND;

  const collections = (q.get("collections") ?? DEFAULT_COLLECTION)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const limitRaw = Number(q.get("limit") ?? 12);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), MAX_LIMIT)
    : 12;

  const cloudRaw = q.get("maxCloudCover");
  const maxCloudCover = cloudRaw !== null ? Number(cloudRaw) : undefined;

  try {
    const result = await searchStac(
      {
        collections,
        bbox: parseBBox(q.get("bbox")),
        datetime: q.get("datetime") ?? undefined,
        maxCloudCover: Number.isFinite(maxCloudCover) ? maxCloudCover : undefined,
        limit,
        sortby: q.get("sortby") ?? "-properties.datetime",
      },
      backend,
    );

    const scenes = await Promise.all(
      result.items.map((item) => toScenePreview(item, backend)),
    );

    return NextResponse.json({
      backend: result.backend,
      matched: result.matched ?? scenes.length,
      returned: scenes.length,
      searchedAt: result.searchedAt,
      scenes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("STAC search error:", message);
    return NextResponse.json(
      { error: message, backend, scenes: [] },
      { status: 502 },
    );
  }
}
