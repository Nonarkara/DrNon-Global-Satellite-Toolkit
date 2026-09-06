import { NextResponse } from "next/server";
import {
  DEFAULT_BACKEND,
  isBackendId,
  listBackends,
} from "../../../../stac/backends";
import { listCollections } from "../../../../stac/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/stac/collections?backend=earth-search
 *
 * Without a `backend` param, returns the list of configured backends so a
 * client can discover what it may ask for.
 */
export async function GET(request: Request) {
  const backendParam = new URL(request.url).searchParams.get("backend");

  if (!backendParam) {
    return NextResponse.json({ backends: listBackends() });
  }

  const backend = isBackendId(backendParam) ? backendParam : DEFAULT_BACKEND;

  try {
    const collections = await listCollections(backend);
    return NextResponse.json({
      backend,
      count: collections.length,
      collections: collections.map((c) => ({
        id: c.id,
        title: c.title ?? c.id,
        license: c.license,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message, backend }, { status: 502 });
  }
}
