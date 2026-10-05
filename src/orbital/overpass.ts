// ─── Overpass prediction ───────────────────────────────────────────────────
// "When will Sentinel-2 next fly over my area of interest?"
//
// This is the question that turns a satellite archive into an operational
// tool: it tells you when the next observation is available, so you can plan
// a flood assessment or a burn-scar comparison around real acquisitions
// rather than refreshing a catalog and hoping.
//
// Method: SGP4 propagation of CelesTrak elements (satellite.js), sampled at a
// fixed step, with sub-sample refinement around each closest approach.

import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  propagate,
  twoline2satrec,
} from "satellite.js";
import { fetchTle, getPlatform, TRACKED_PLATFORMS } from "./tle";
import { illuminationAt, type Illumination } from "./solar";

const EARTH_RADIUS_KM = 6371;

/** Coarse sampling step. 60 s is finer than any LEO ground track needs. */
const SAMPLE_STEP_S = 60;
/** Refinement step around a candidate minimum. */
const REFINE_STEP_S = 5;
const REFINE_WINDOW_S = 120;

/**
 * 10 days. Narrow-swath platforms have long repeat cycles — Sentinel-2A alone
 * repeats every 10 days, so a 72-hour default routinely reports "no passes"
 * for a satellite that is working perfectly. Wide-swath platforms
 * (MODIS, VIIRS) pass daily and fill the near term regardless.
 */
const DEFAULT_HORIZON_HOURS = 240;
const MAX_HORIZON_HOURS = 24 * 14;

export interface GroundPoint {
  latitude: number;
  longitude: number;
}

export interface Overpass {
  platform: string;
  label: string;
  /** UTC instant of closest approach. */
  time: string;
  /** Hours from now. */
  inHours: number;
  /** Great-circle distance from the target to the sub-satellite point, km. */
  distanceKm: number;
  /** Sub-satellite point at closest approach. */
  subSatellite: GroundPoint;
  /** Satellite altitude in km. */
  altitudeKm: number;
  /**
   * Whether the target falls inside the instrument's nominal swath. A pass
   * outside the swath is overhead but does not image you.
   */
  withinSwath: boolean;
  /** STAC collection this pass's imagery will land in, when applicable. */
  collection?: string;
  /** Solar elevation at the target, in degrees. Negative is below horizon. */
  sunElevation: number;
  illumination: Illumination;
  /**
   * Whether this pass can actually produce an image.
   *
   * Optical sensors need the sun up; SAR carries its own illumination and
   * images equally well at night, which is the entire reason to reach for it.
   */
  imageable: boolean;
}

/** Great-circle distance between two points on a sphere, in km. */
export function haversineKm(a: GroundPoint, b: GroundPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Sub-satellite point and altitude at an instant, or null if propagation fails. */
function subPointAt(
  satrec: ReturnType<typeof twoline2satrec>,
  when: Date,
): (GroundPoint & { altitudeKm: number }) | null {
  const result = propagate(satrec, when);
  // satellite.js returns false-y position for decayed or un-propagatable epochs.
  if (!result || typeof result.position === "boolean" || !result.position) {
    return null;
  }

  const geodetic = eciToGeodetic(result.position, gstime(when));
  return {
    latitude: degreesLat(geodetic.latitude),
    longitude: degreesLong(geodetic.longitude),
    altitudeKm: geodetic.height,
  };
}

export interface OverpassOptions {
  /** How far ahead to look. Default 72 h, capped at 14 days. */
  horizonHours?: number;
  /**
   * Treat a pass as relevant within this distance of the target.
   * Defaults to half the platform's swath — i.e. the target is imaged.
   */
  radiusKm?: number;
  /** Maximum passes to return per platform. */
  limit?: number;
  /** Start of the search window. Defaults to now. */
  from?: Date;
}

/**
 * Predict upcoming overpasses of one platform over a target point.
 *
 * Returns closest-approach events ordered by time. A pass is reported when the
 * sub-satellite track comes within `radiusKm`; `withinSwath` says whether the
 * instrument would actually cover the target.
 */
export async function predictOverpasses(
  platformId: string,
  target: GroundPoint,
  options: OverpassOptions = {},
): Promise<Overpass[]> {
  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error(
      `Unknown platform "${platformId}". Known: ${TRACKED_PLATFORMS.map((p) => p.id).join(", ")}`,
    );
  }

  const horizonHours = Math.min(
    options.horizonHours ?? DEFAULT_HORIZON_HOURS,
    MAX_HORIZON_HOURS,
  );
  // Half-swath is the honest default: that is the distance within which the
  // instrument actually sees the target.
  const radiusKm = options.radiusKm ?? Math.max(platform.swathKm / 2, 100);
  const limit = options.limit ?? 10;
  const start = options.from ?? new Date();

  const tle = await fetchTle(platform.noradId);
  const satrec = twoline2satrec(tle.line1, tle.line2);

  const totalSeconds = horizonHours * 3600;
  const passes: Overpass[] = [];

  let previousDistance = Infinity;
  let descending = false;

  for (let t = 0; t <= totalSeconds; t += SAMPLE_STEP_S) {
    const when = new Date(start.getTime() + t * 1000);
    const point = subPointAt(satrec, when);
    if (!point) continue;

    const distance = haversineKm(target, point);

    // A local minimum is the moment the track stops approaching and begins
    // receding. Only refine the ones that come close enough to matter.
    if (descending && distance > previousDistance) {
      const refined = refineClosestApproach(
        satrec,
        target,
        new Date(start.getTime() + (t - SAMPLE_STEP_S) * 1000),
      );

      if (refined && refined.distanceKm <= radiusKm) {
        const sun = illuminationAt(
          target.latitude,
          target.longitude,
          refined.when,
        );

        passes.push({
          platform: platform.id,
          label: platform.label,
          time: refined.when.toISOString(),
          inHours:
            Math.round(
              ((refined.when.getTime() - start.getTime()) / 3_600_000) * 10,
            ) / 10,
          distanceKm: Math.round(refined.distanceKm * 10) / 10,
          subSatellite: {
            latitude: Math.round(refined.point.latitude * 1e4) / 1e4,
            longitude: Math.round(refined.point.longitude * 1e4) / 1e4,
          },
          altitudeKm: Math.round(refined.point.altitudeKm),
          withinSwath: refined.distanceKm <= platform.swathKm / 2,
          collection: platform.collection,
          sunElevation: sun.elevation,
          illumination: sun.illumination,
          // SAR is its own illumination source; darkness is irrelevant to it.
          imageable: platform.isRadar ? true : sun.imageable,
        });

        if (passes.length >= limit) break;
      }
    }

    descending = distance < previousDistance;
    previousDistance = distance;
  }

  return passes;
}

/** Walk a fine step around a coarse minimum to pin the actual closest approach. */
function refineClosestApproach(
  satrec: ReturnType<typeof twoline2satrec>,
  target: GroundPoint,
  around: Date,
): { when: Date; distanceKm: number; point: GroundPoint & { altitudeKm: number } } | null {
  let best: {
    when: Date;
    distanceKm: number;
    point: GroundPoint & { altitudeKm: number };
  } | null = null;

  for (let d = -REFINE_WINDOW_S; d <= REFINE_WINDOW_S; d += REFINE_STEP_S) {
    const when = new Date(around.getTime() + d * 1000);
    const point = subPointAt(satrec, when);
    if (!point) continue;

    const distanceKm = haversineKm(target, point);
    if (!best || distanceKm < best.distanceKm) {
      best = { when, distanceKm, point };
    }
  }

  return best;
}

/** Result of a multi-platform prediction, including what failed. */
export interface OverpassReport {
  passes: Overpass[];
  /** Platforms whose elements could not be fetched, with the reason. */
  errors: { platform: string; error: string }[];
  /** Platforms that were successfully propagated. */
  platforms: string[];
}

/**
 * Predict across several platforms at once, merged and time-ordered.
 *
 * Failures are reported, never swallowed: an empty `passes` list with a
 * populated `errors` list means "we could not tell", which is a different
 * answer from "nothing is coming".
 */
export async function predictAll(
  target: GroundPoint,
  platformIds: string[] = TRACKED_PLATFORMS.filter((p) => p.collection).map(
    (p) => p.id,
  ),
  options: OverpassOptions = {},
): Promise<OverpassReport> {
  const settled = await Promise.allSettled(
    platformIds.map((id) => predictOverpasses(id, target, options)),
  );

  const passes: Overpass[] = [];
  const errors: { platform: string; error: string }[] = [];
  const platforms: string[] = [];

  settled.forEach((result, i) => {
    const id = platformIds[i];
    if (result.status === "fulfilled") {
      passes.push(...result.value);
      platforms.push(id);
    } else {
      errors.push({
        platform: id,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  passes.sort((a, b) => a.time.localeCompare(b.time));
  return { passes, errors, platforms };
}

export { TRACKED_PLATFORMS, getPlatform };
export type { TrackedPlatform } from "./tle";
