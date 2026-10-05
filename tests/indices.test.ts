import { describe, expect, it } from "vitest";
import {
  SPECTRAL_INDICES,
  getIndex,
  resolveAssets,
  supportsIndices,
} from "@/stac/indices";
import { buildIndexRender } from "@/stac/index-render";
import type { StacItem } from "@/stac/types";

/** A minimal Sentinel-2 item carrying every band the indices reference. */
function sentinel2Item(overrides: Partial<StacItem> = {}): StacItem {
  const bands = [
    "red",
    "green",
    "blue",
    "nir",
    "swir16",
    "swir22",
    "visual",
  ];
  return {
    type: "Feature",
    stac_version: "1.0.0",
    id: "S2B_47PPQ_20260724_0_L2A",
    collection: "sentinel-2-l2a",
    geometry: null,
    properties: { datetime: "2026-07-24T03:54:40Z", "eo:cloud_cover": 5.6 },
    assets: Object.fromEntries(
      bands.map((b) => [b, { href: `https://example.invalid/${b}.tif` }]),
    ),
    links: [
      {
        rel: "self",
        href: "https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_47PPQ_20260724_0_L2A",
      },
    ],
    ...overrides,
  };
}

describe("index catalog", () => {
  it("has unique ids", () => {
    const ids = SPECTRAL_INDICES.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references as many bands as the expression uses", () => {
    for (const index of SPECTRAL_INDICES) {
      if (!index.expression) continue;
      const referenced = new Set(index.expression.match(/b\d+/g) ?? []);
      // Every bN in the expression must have a corresponding asset.
      for (const band of referenced) {
        const n = Number(band.slice(1));
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(index.assets.length);
      }
      expect(referenced.size).toBeGreaterThan(0);
    }
  });

  it("uses positional bN naming, never asset names", () => {
    // Asset names in an expression return HTTP 400 from the tiler.
    for (const index of SPECTRAL_INDICES) {
      for (const asset of index.assets) {
        expect(index.expression).not.toContain(asset);
      }
    }
  });

  it("gives every index a sane rescale range", () => {
    for (const index of SPECTRAL_INDICES) {
      expect(index.rescale[0]).toBeLessThan(index.rescale[1]);
    }
  });

  it("documents how to read every index", () => {
    for (const index of SPECTRAL_INDICES) {
      expect(index.interpretation.length).toBeGreaterThan(20);
      expect(index.collections.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveAssets", () => {
  it("passes Sentinel-2 names through unchanged", () => {
    const ndvi = getIndex("ndvi")!;
    expect(resolveAssets(ndvi, "sentinel-2-l2a")).toEqual(["nir", "red"]);
  });

  it("translates Sentinel-2 names to Landsat's nir08", () => {
    const ndvi = getIndex("ndvi")!;
    expect(resolveAssets(ndvi, "landsat-c2-l2")).toEqual(["nir08", "red"]);
  });

  it("falls back to canonical names for an unknown collection", () => {
    const ndvi = getIndex("ndvi")!;
    expect(resolveAssets(ndvi, "something-else")).toEqual(["nir", "red"]);
  });
});

describe("supportsIndices", () => {
  it("allows only the backend verified to work with a public tiler", () => {
    expect(supportsIndices("earth-search")).toBe(true);
    // Planetary Computer assets need SAS signing (409); CDSE serves s3:// URIs.
    expect(supportsIndices("planetary-computer")).toBe(false);
    expect(supportsIndices("cdse")).toBe(false);
  });
});

describe("buildIndexRender", () => {
  it("builds tile, preview and statistics URLs for a complete scene", () => {
    const render = buildIndexRender(sentinel2Item(), "ndvi", "earth-search");
    expect(render).not.toBeNull();
    expect(render!.tileUrl).toContain("{z}/{x}/{y}");
    expect(render!.previewUrl).toContain("/stac/preview.png");
    expect(render!.statisticsUrl).toContain("/stac/statistics");
  });

  it("orders assets so b1 and b2 match the expression", () => {
    const render = buildIndexRender(sentinel2Item(), "ndvi", "earth-search")!;
    // NDVI is (nir - red) / (nir + red), so nir must be declared first.
    const nirAt = render.previewUrl.indexOf("assets=nir");
    const redAt = render.previewUrl.indexOf("assets=red");
    expect(nirAt).toBeGreaterThan(-1);
    expect(redAt).toBeGreaterThan(-1);
    expect(nirAt).toBeLessThan(redAt);
  });

  it("sets asset_as_band, without which the tiler rejects the expression", () => {
    const render = buildIndexRender(sentinel2Item(), "ndvi", "earth-search")!;
    expect(render.previewUrl).toContain("asset_as_band=true");
  });

  it("returns null when the scene lacks a required band", () => {
    const item = sentinel2Item();
    delete item.assets.swir22;
    // NBR needs nir and swir22.
    expect(buildIndexRender(item, "nbr", "earth-search")).toBeNull();
    // NDVI only needs nir and red, so it still works.
    expect(buildIndexRender(item, "ndvi", "earth-search")).not.toBeNull();
  });

  it("returns null for a backend a public tiler cannot read", () => {
    expect(buildIndexRender(sentinel2Item(), "ndvi", "cdse")).toBeNull();
    expect(
      buildIndexRender(sentinel2Item(), "ndvi", "planetary-computer"),
    ).toBeNull();
  });

  it("returns null for an unknown index", () => {
    expect(buildIndexRender(sentinel2Item(), "nonsense", "earth-search")).toBeNull();
  });

  it("omits the expression for a true-colour composite", () => {
    const render = buildIndexRender(sentinel2Item(), "true-color", "earth-search")!;
    expect(render.previewUrl).not.toContain("expression=");
  });
});
