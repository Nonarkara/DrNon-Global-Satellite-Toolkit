import { describe, expect, it } from "vitest";
import {
  ALL_SOURCES,
  allRequiredEnvVars,
  getSource,
  keylessSources,
  rankedSources,
} from "@/sources";
import { COLLECTIONS, getCollection } from "@/stac/collections";
import { STAC_BACKENDS, isBackendId } from "@/stac/backends";

describe("source registry", () => {
  it("has unique ids", () => {
    const ids = ALL_SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every source a dated verification", () => {
    for (const s of ALL_SOURCES) {
      expect(s.verified.at, `${s.id} missing verification date`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(s.verified.status).toBeDefined();
    }
  });

  it("gives every source usage guidance, not just a link", () => {
    for (const s of ALL_SOURCES) {
      expect(s.useWhen.length, `${s.id} useWhen too short`).toBeGreaterThan(20);
      expect(s.howTo.length, `${s.id} howTo too short`).toBeGreaterThan(40);
    }
  });

  it("never marks a credentialed source as keyless", () => {
    for (const s of keylessSources()) {
      expect(s.auth).toBe("none");
      expect(s.requiredEnvVars ?? []).toHaveLength(0);
    }
  });

  it("ranks tier 1 before tier 4", () => {
    const tiers = rankedSources().map((s) => s.tier);
    expect(tiers).toEqual([...tiers].sort((a, b) => a - b));
  });

  it("resolves every seeAlso reference to a real source", () => {
    for (const s of ALL_SOURCES) {
      for (const ref of s.seeAlso ?? []) {
        expect(getSource(ref), `${s.id} → unknown seeAlso "${ref}"`).toBeDefined();
      }
    }
  });

  it("marks deprecated sources as tier 4, not tier 1", () => {
    for (const s of ALL_SOURCES) {
      if (s.verified.status === "deprecated") {
        expect(s.tier, `${s.id} is deprecated but ranked tier ${s.tier}`).toBe(4);
      }
    }
  });

  it("exposes required env vars without duplicates", () => {
    const vars = allRequiredEnvVars();
    expect(new Set(vars).size).toBe(vars.length);
    expect(vars).toEqual([...vars].sort());
  });
});

describe("collection catalog", () => {
  it("has unique ids and at least one backend each", () => {
    const ids = COLLECTIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of COLLECTIONS) {
      expect(c.backends.length, `${c.id} has no backend`).toBeGreaterThan(0);
    }
  });

  it("names only backends that exist", () => {
    for (const c of COLLECTIONS) {
      for (const b of c.backends) {
        expect(isBackendId(b), `${c.id} → unknown backend "${b}"`).toBe(true);
      }
    }
  });

  it("explains why anything non-previewable cannot be rendered", () => {
    for (const c of COLLECTIONS.filter((x) => !x.previewable)) {
      expect(
        c.gotchas?.join(" ") ?? "",
        `${c.id} is not previewable but does not say why`,
      ).toMatch(/tiler|requester-pays|SAS|s3:\/\/|credential|preview|COG/i);
    }
  });

  it("looks up a known collection", () => {
    expect(getCollection("sentinel-2-l2a")?.kind).toBe("optical");
    expect(getCollection("sentinel-1-rtc")?.kind).toBe("radar");
    expect(getCollection("not-a-collection")).toBeUndefined();
  });
});

describe("STAC backends", () => {
  it("keys each backend by its own id", () => {
    for (const [key, backend] of Object.entries(STAC_BACKENDS)) {
      expect(backend.id).toBe(key);
    }
  });

  it("gives any backend with private assets a way to sign, or documents why not", () => {
    for (const backend of Object.values(STAC_BACKENDS)) {
      if (backend.assetsArePublic) continue;
      expect(
        backend.signEndpoint || backend.notes.length > 40,
        `${backend.id} has private assets but neither a sign endpoint nor an explanation`,
      ).toBeTruthy();
    }
  });

  it("has no trailing slash on any backend URL", () => {
    for (const backend of Object.values(STAC_BACKENDS)) {
      expect(backend.url.endsWith("/")).toBe(false);
    }
  });
});
