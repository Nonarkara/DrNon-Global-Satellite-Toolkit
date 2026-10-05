import { NextResponse } from "next/server";
import { predictAll, predictOverpasses } from "../../../../orbital/overpass";
import { TRACKED_PLATFORMS } from "../../../../orbital/tle";

export const dynamic = "force-dynamic";

/** Bangkok, so the endpoint is useful with no parameters. */
const DEFAULT_TARGET = { latitude: 13.75, longitude: 100.5 };
const MAX_LIMIT = 50;

/**
 * GET /api/orbital/overpass
 *
 * When will an imaging satellite next fly over a point — and will the pass
 * actually produce a usable image?
 *
 *   ?lat=13.75&lon=100.5         target point (defaults to Bangkok)
 *   &platform=sentinel-2a        one platform; omit for all imaging platforms
 *   &hours=240                   look-ahead window (default 10 days, max 14)
 *   &radiusKm=145                override the half-swath default
 *   &limit=10                    passes per platform
 *   &imageableOnly=true          drop optical night passes
 *
 * Without parameters beyond the target it answers the operational question:
 * "what is my next acquisition opportunity here?"
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;

  if (q.get("platforms") === "list") {
    return NextResponse.json({
      count: TRACKED_PLATFORMS.length,
      platforms: TRACKED_PLATFORMS.map((p) => ({
        id: p.id,
        label: p.label,
        noradId: p.noradId,
        swathKm: p.swathKm,
        isRadar: p.isRadar ?? false,
        collection: p.collection,
        notes: p.notes,
      })),
    });
  }

  const lat = Number(q.get("lat") ?? DEFAULT_TARGET.latitude);
  const lon = Number(q.get("lon") ?? DEFAULT_TARGET.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon must be numbers" },
      { status: 400 },
    );
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "lat must be -90..90 and lon -180..180" },
      { status: 400 },
    );
  }

  const target = { latitude: lat, longitude: lon };
  const hoursRaw = Number(q.get("hours") ?? 240);
  const limitRaw = Number(q.get("limit") ?? 10);
  const radiusRaw = q.get("radiusKm");

  const options = {
    horizonHours: Number.isFinite(hoursRaw) ? hoursRaw : 240,
    limit: Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.trunc(limitRaw), 1), MAX_LIMIT)
      : 10,
    radiusKm:
      radiusRaw !== null && Number.isFinite(Number(radiusRaw))
        ? Number(radiusRaw)
        : undefined,
  };

  const imageableOnly = q.get("imageableOnly") === "true";
  const platformId = q.get("platform");

  try {
    if (platformId) {
      const passes = await predictOverpasses(platformId, target, options);
      const filtered = imageableOnly ? passes.filter((p) => p.imageable) : passes;
      return NextResponse.json({
        target,
        horizonHours: options.horizonHours,
        platforms: [platformId],
        errors: [],
        count: filtered.length,
        passes: filtered,
      });
    }

    const report = await predictAll(target, undefined, options);
    const passes = imageableOnly
      ? report.passes.filter((p) => p.imageable)
      : report.passes;

    return NextResponse.json({
      target,
      horizonHours: options.horizonHours,
      platforms: report.platforms,
      // Surfaced, never swallowed: an empty list with errors present means
      // "could not determine", not "nothing is coming".
      errors: report.errors,
      count: passes.length,
      passes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Overpass prediction error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
