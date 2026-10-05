// ─── Solar geometry ────────────────────────────────────────────────────────
// An optical satellite passing overhead at midnight records nothing useful.
// This computes solar elevation at the target so an overpass prediction can
// say whether the pass is actually imageable.
//
// NOAA low-precision solar position algorithm: accurate to ~0.01° for
// elevation, which is far beyond what a go/no-go decision needs.
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF

const DEG = Math.PI / 180;

/** Fractional year in radians. */
function fractionalYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  const hour = date.getUTCHours();
  return ((2 * Math.PI) / 365) * (dayOfYear + (hour - 12) / 24);
}

/** Equation of time, in minutes. */
function equationOfTime(gamma: number): number {
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))
  );
}

/** Solar declination, in radians. */
function declination(gamma: number): number {
  return (
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)
  );
}

/**
 * Solar elevation above the horizon, in degrees, at a point and instant.
 * Negative means the sun is below the horizon.
 */
export function solarElevation(
  latitude: number,
  longitude: number,
  when: Date,
): number {
  const gamma = fractionalYear(when);
  const eqTime = equationOfTime(gamma);
  const decl = declination(gamma);

  const minutesUtc =
    when.getUTCHours() * 60 + when.getUTCMinutes() + when.getUTCSeconds() / 60;
  // True solar time in minutes, then hour angle in degrees.
  const trueSolarTime = minutesUtc + eqTime + 4 * longitude;
  const hourAngle = trueSolarTime / 4 - 180;

  const latRad = latitude * DEG;
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle * DEG);

  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZenith))) / DEG;
}

/**
 * Sun high enough for usable optical imagery.
 *
 * Below roughly 15° the atmospheric path length and shadow length degrade
 * surface reflectance badly; most providers will not even process a scene
 * acquired below ~10°.
 */
export const MIN_IMAGING_SUN_ELEVATION = 15;

export type Illumination = "daylight" | "twilight" | "night";

export function illuminationAt(
  latitude: number,
  longitude: number,
  when: Date,
): { elevation: number; illumination: Illumination; imageable: boolean } {
  const elevation = Math.round(solarElevation(latitude, longitude, when) * 10) / 10;

  const illumination: Illumination =
    elevation >= MIN_IMAGING_SUN_ELEVATION
      ? "daylight"
      : elevation > -6
        ? "twilight"
        : "night";

  return {
    elevation,
    illumination,
    imageable: elevation >= MIN_IMAGING_SUN_ELEVATION,
  };
}
