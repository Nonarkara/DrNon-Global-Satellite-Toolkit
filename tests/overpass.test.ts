import { describe, expect, it } from "vitest";
import { haversineKm } from "@/orbital/overpass";
import { TRACKED_PLATFORMS, getPlatform } from "@/orbital/tle";

describe("haversineKm", () => {
  it("matches known great-circle distances", () => {
    // Bangkok → Singapore is ~1430 km.
    const bkkSin = haversineKm(
      { latitude: 13.75, longitude: 100.5 },
      { latitude: 1.35, longitude: 103.82 },
    );
    expect(bkkSin).toBeGreaterThan(1400);
    expect(bkkSin).toBeLessThan(1460);
  });

  it("gives a quarter of Earth's circumference across 90° of equator", () => {
    const quarter = haversineKm(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 90 },
    );
    expect(quarter).toBeGreaterThan(9950);
    expect(quarter).toBeLessThan(10060);
  });

  it("is zero for identical points", () => {
    const p = { latitude: 13.75, longitude: 100.5 };
    expect(haversineKm(p, p)).toBe(0);
  });

  it("is symmetric", () => {
    const a = { latitude: 51.5, longitude: -0.12 };
    const b = { latitude: -33.87, longitude: 151.21 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });

  it("handles the antimeridian without blowing up", () => {
    // 1° apart, straddling the date line — a naive longitude subtraction
    // would report nearly half the planet.
    const d = haversineKm(
      { latitude: 0, longitude: 179.5 },
      { latitude: 0, longitude: -179.5 },
    );
    expect(d).toBeLessThan(120);
  });
});

describe("tracked platforms", () => {
  it("has unique ids and NORAD catalogue numbers", () => {
    const ids = TRACKED_PLATFORMS.map((p) => p.id);
    const norads = TRACKED_PLATFORMS.map((p) => p.noradId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(norads).size).toBe(norads.length);
  });

  it("gives every imaging platform a positive swath", () => {
    for (const p of TRACKED_PLATFORMS.filter((x) => x.collection)) {
      expect(p.swathKm).toBeGreaterThan(0);
    }
  });

  it("marks Sentinel-1 as radar and Sentinel-2 as not", () => {
    expect(getPlatform("sentinel-1a")?.isRadar).toBe(true);
    expect(getPlatform("sentinel-2a")?.isRadar).toBeFalsy();
  });

  it("returns undefined for an unknown platform", () => {
    expect(getPlatform("death-star")).toBeUndefined();
  });
});
