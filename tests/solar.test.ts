import { describe, expect, it } from "vitest";
import {
  illuminationAt,
  solarElevation,
  MIN_IMAGING_SUN_ELEVATION,
} from "@/orbital/solar";

/**
 * Solar elevation is checked against closed-form values that follow from
 * basic geometry, not against a previous run of this code.
 */
describe("solarElevation", () => {
  it("matches the analytic maximum at solar noon on the solstice", () => {
    // At local solar noon the sun's elevation is 90 − |latitude − declination|.
    // London (51.5°N) at the June solstice, declination +23.44°:
    //   90 − (51.5 − 23.44) = 61.94°
    // London is at ~0° longitude, so 12:00 UTC is close to solar noon.
    const elevation = solarElevation(51.5, -0.12, new Date("2026-06-21T12:00:00Z"));
    expect(elevation).toBeGreaterThan(61);
    expect(elevation).toBeLessThan(63);
  });

  it("puts the sun below the horizon during polar night", () => {
    // Svalbard (78.2°N) at the December solstice never sees the sun.
    const elevation = solarElevation(78.2, 15.6, new Date("2026-12-21T12:00:00Z"));
    expect(elevation).toBeLessThan(0);
  });

  it("is near its daily minimum at local midnight", () => {
    // Bangkok is UTC+7, so 17:00 UTC is local midnight.
    const elevation = solarElevation(13.75, 100.5, new Date("2026-10-09T17:00:00Z"));
    expect(elevation).toBeLessThan(-50);
  });

  it("is symmetric about true solar noon", () => {
    // Solar noon is NOT 12:00 UTC at 0° longitude — the equation of time
    // shifts it by up to ~16 minutes through the year. So find the real
    // maximum first, then check symmetry about that.
    const day = Date.UTC(2026, 2, 20);
    let noon = day;
    let best = -Infinity;
    for (let m = 0; m < 24 * 60; m += 1) {
      const elevation = solarElevation(0, 0, new Date(day + m * 60_000));
      if (elevation > best) {
        best = elevation;
        noon = day + m * 60_000;
      }
    }

    const threeHours = 3 * 3600 * 1000;
    const before = solarElevation(0, 0, new Date(noon - threeHours));
    const after = solarElevation(0, 0, new Date(noon + threeHours));
    expect(Math.abs(before - after)).toBeLessThan(0.5);

    // Sanity: at the equator on the equinox the sun passes near the zenith.
    expect(best).toBeGreaterThan(88);
  });
});

describe("illuminationAt", () => {
  it("classifies full daylight as imageable", () => {
    const r = illuminationAt(13.75, 100.5, new Date("2026-10-09T05:00:00Z"));
    expect(r.illumination).toBe("daylight");
    expect(r.imageable).toBe(true);
    expect(r.elevation).toBeGreaterThan(MIN_IMAGING_SUN_ELEVATION);
  });

  it("classifies deep night as not imageable", () => {
    const r = illuminationAt(13.75, 100.5, new Date("2026-10-09T17:00:00Z"));
    expect(r.illumination).toBe("night");
    expect(r.imageable).toBe(false);
  });

  it("treats twilight as present but not imageable", () => {
    // Sentinel-1's dawn-dusk orbit crosses Bangkok around 18:00 local.
    const r = illuminationAt(13.75, 100.5, new Date("2026-10-12T11:09:00Z"));
    expect(r.illumination).toBe("twilight");
    expect(r.imageable).toBe(false);
  });
});
