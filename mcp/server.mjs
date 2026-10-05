#!/usr/bin/env node
/**
 * DrNon Satellite Toolkit — MCP server
 *
 * Exposes the toolkit's satellite capabilities as Model Context Protocol
 * tools, so any agent (Claude Code, Codex, Cursor, …) can search imagery,
 * compute spectral indices and plan acquisitions without reading the codebase.
 *
 * Runs standalone — it calls the public STAC and tiler endpoints directly and
 * needs neither the Next.js app nor any API key.
 *
 *   node mcp/server.mjs            # stdio transport
 *
 * Register with Claude Code:
 *   claude mcp add satellite -- node /abs/path/to/mcp/server.mjs
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ── Configuration ──────────────────────────────────────────────────────────

const BACKENDS = {
  "earth-search": {
    url: "https://earth-search.aws.element84.com/v1",
    assetsArePublic: true,
  },
  "planetary-computer": {
    url: "https://planetarycomputer.microsoft.com/api/stac/v1",
    assetsArePublic: false,
    signEndpoint: "https://planetarycomputer.microsoft.com/api/sas/v1/sign",
  },
  cdse: {
    url: "https://stac.dataspace.copernicus.eu/v1",
    assetsArePublic: false,
  },
};

const TITILER = process.env.TITILER_URL || "https://titiler.xyz";
const TIMEOUT_MS = 30_000;

/** Index definitions mirror src/stac/indices.ts. Bands are positional: b1, b2. */
const INDICES = {
  ndvi: { assets: ["nir", "red"], expr: "(b1-b2)/(b1+b2)", rescale: "-0.2,0.9", cmap: "rdylgn", meaning: "Vegetation vigour. <0 water, 0-0.2 bare/built, >0.6 dense canopy." },
  ndwi: { assets: ["green", "nir"], expr: "(b1-b2)/(b1+b2)", rescale: "-0.5,0.8", cmap: "blues", meaning: "Open water. >0 is water. Standard for flood extent." },
  ndmi: { assets: ["nir", "swir16"], expr: "(b1-b2)/(b1+b2)", rescale: "-0.5,0.6", cmap: "rdbu", meaning: "Canopy moisture. Falling NDMI is drought/fire-risk warning." },
  nbr: { assets: ["nir", "swir22"], expr: "(b1-b2)/(b1+b2)", rescale: "-0.5,0.8", cmap: "rdylgn", meaning: "Burn severity. Low/negative = recently burned. Difference two dates for dNBR." },
  ndbi: { assets: ["swir16", "nir"], expr: "(b1-b2)/(b1+b2)", rescale: "-0.5,0.5", cmap: "magma", meaning: "Built-up/impervious surface. Bare soil also reads positive." },
  savi: { assets: ["nir", "red"], expr: "1.5*(b1-b2)/(b1+b2+0.5)", rescale: "-0.2,0.9", cmap: "rdylgn", meaning: "Soil-adjusted vegetation. Better than NDVI in sparse/arid canopy." },
  ndsi: { assets: ["green", "swir16"], expr: "(b1-b2)/(b1+b2)", rescale: "-0.5,1.0", cmap: "blues", meaning: "Snow and ice. >0.4 is snow; separates snow from cloud." },
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchJson(url, init = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${body.slice(0, 200)}`);
  }
  return res.json();
}

function text(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function failure(message) {
  return { isError: true, content: [{ type: "text", text: message }] };
}

function lookbackWindow(days) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  return `${start.toISOString()}/${end.toISOString()}`;
}

async function stacSearch({ backend, collections, bbox, days, maxCloud, limit, sortby }) {
  const config = BACKENDS[backend];
  const body = {
    collections,
    bbox,
    datetime: lookbackWindow(days),
    limit,
  };
  if (typeof maxCloud === "number") {
    body.query = { "eo:cloud_cover": { lt: maxCloud } };
  }
  if (sortby) {
    const desc = sortby.startsWith("-");
    body.sortby = [
      { field: desc ? sortby.slice(1) : sortby, direction: desc ? "desc" : "asc" },
    ];
  }

  const json = await fetchJson(`${config.url}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return json.features ?? [];
}

async function signHref(href, backend) {
  const config = BACKENDS[backend];
  if (config.assetsArePublic || !config.signEndpoint) return href;
  try {
    const json = await fetchJson(
      `${config.signEndpoint}?href=${encodeURIComponent(href)}`,
    );
    return json.href ?? href;
  } catch {
    return href;
  }
}

function itemSelfHref(item, backend) {
  const self = item.links?.find((l) => l.rel === "self")?.href;
  if (self) return self;
  if (!item.collection) return null;
  return `${BACKENDS[backend].url}/collections/${item.collection}/items/${item.id}`;
}

// ── Server ─────────────────────────────────────────────────────────────────

const server = new McpServer(
  { name: "drnon-satellite-toolkit", version: "2.2.0" },
  {
    instructions:
      "Satellite imagery and Earth-observation tools. search_imagery finds " +
      "scenes; spectral_index computes NDVI/NDWI/NBR and friends with real " +
      "pixel statistics; next_overpass says when a satellite will next image " +
      "a location and whether the sun will be up. Everything works with no " +
      "API key against public NASA, ESA and AWS archives.",
  },
);

const bboxSchema = z
  .array(z.number())
  .length(4)
  .describe("Bounding box [west, south, east, north] in WGS84 degrees");

server.registerTool(
  "search_imagery",
  {
    title: "Search satellite imagery",
    description:
      "Find satellite scenes over an area. Returns scene IDs, dates, cloud " +
      "cover and ready-to-render tile URLs. Use this first — other tools " +
      "take the scene IDs it returns.",
    inputSchema: {
      bbox: bboxSchema,
      collection: z
        .string()
        .default("sentinel-2-l2a")
        .describe(
          "STAC collection. sentinel-2-l2a (10m optical), landsat-c2-l2 " +
            "(30m, back to 1982), sentinel-1-grd (SAR, sees through cloud), " +
            "cop-dem-glo-30 (elevation).",
        ),
      days: z.number().int().min(1).max(3650).default(120)
        .describe(
          "How far back to look. Monsoon and high-latitude winter regions can " +
            "go months without a clear scene, so short windows often return nothing.",
        ),
      maxCloud: z.number().min(0).max(100).default(30)
        .describe("Maximum cloud cover percent"),
      limit: z.number().int().min(1).max(50).default(10),
      backend: z
        .enum(["earth-search", "planetary-computer", "cdse"])
        .default("earth-search")
        .describe(
          "earth-search: keyless public COGs, best default. " +
            "planetary-computer: widest catalog. cdse: authoritative ESA, " +
            "but s3:// assets cannot be previewed.",
        ),
      sortBy: z
        .enum(["newest", "least-cloud"])
        .default("newest"),
    },
  },
  async ({ bbox, collection, days, maxCloud, limit, backend, sortBy }) => {
    try {
      const items = await stacSearch({
        backend,
        collections: [collection],
        bbox,
        days,
        maxCloud: collection.includes("sentinel-1") ? undefined : maxCloud,
        limit,
        sortby: sortBy === "newest" ? "-properties.datetime" : "properties.eo:cloud_cover",
      });

      if (items.length === 0) {
        // A bare "nothing found" leaves an agent stuck. Probe what IS there so
        // the answer carries its own next step.
        const widened = await stacSearch({
          backend,
          collections: [collection],
          bbox,
          days: 365,
          maxCloud: undefined,
          limit: 3,
          sortby: "properties.eo:cloud_cover",
        }).catch(() => []);

        if (widened.length === 0) {
          return text(
            `No ${collection} scenes over this bbox in the last year. ` +
              `Check the bbox is [west, south, east, north] in degrees, or try ` +
              `collection "landsat-c2-l2" (longer archive) or "sentinel-1-grd" ` +
              `(radar, unaffected by cloud).`,
          );
        }

        const best = widened[0];
        const cloud = best.properties?.["eo:cloud_cover"];
        return text(
          `No scenes within ${days} days under ${maxCloud}% cloud — this area ` +
            `may be in a cloudy season.\n\n` +
            `Clearest scene in the last year: ${best.id} on ` +
            `${(best.properties?.datetime ?? "").slice(0, 10)} at ` +
            `${typeof cloud === "number" ? cloud.toFixed(1) : "?"}% cloud.\n\n` +
            `Retry with days=365, or raise maxCloud, or use ` +
            `collection="sentinel-1-grd" — radar sees through cloud entirely.`,
        );
      }

      const scenes = await Promise.all(
        items.map(async (item) => {
          const visual =
            item.assets?.visual?.href ?? item.assets?.rendered_preview?.href;
          const href = visual ? await signHref(visual, backend) : null;
          const httpReadable = href?.startsWith("http");

          return {
            id: item.id,
            datetime: item.properties?.datetime ?? null,
            cloudCover: item.properties?.["eo:cloud_cover"] ?? null,
            platform: item.properties?.platform ?? null,
            bbox: item.bbox ?? null,
            previewUrl: httpReadable
              ? `${TITILER}/cog/preview.png?url=${encodeURIComponent(href)}&max_size=1024`
              : null,
            tileUrl: httpReadable
              ? `${TITILER}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(href)}`
              : null,
          };
        }),
      );

      return text({ backend, collection, count: scenes.length, scenes });
    } catch (error) {
      return failure(`Imagery search failed: ${error.message}`);
    }
  },
);

server.registerTool(
  "spectral_index",
  {
    title: "Compute a spectral index",
    description:
      "Compute NDVI, NDWI, NBR and other band-math indices over a scene, and " +
      "return both a rendered image URL and real pixel statistics " +
      "(min/max/mean/std). This is how you answer quantitative questions: " +
      "how much vegetation, where the water is, how badly it burned.",
    inputSchema: {
      bbox: bboxSchema,
      index: z
        .enum(Object.keys(INDICES))
        .describe(
          Object.entries(INDICES)
            .map(([k, v]) => `${k}: ${v.meaning}`)
            .join(" | "),
        ),
      sceneId: z
        .string()
        .optional()
        .describe("Pin a specific scene from search_imagery; otherwise the least-cloudy recent scene is used"),
      days: z.number().int().min(1).max(3650).default(120),
      maxCloud: z.number().min(0).max(100).default(20),
      // Only Earth Search works here: Planetary Computer assets need SAS
      // signing a public tiler cannot do (409), and Earth Search's Landsat is
      // in a requester-pays bucket (AccessDenied). Verified 2026-10-05.
      backend: z.enum(["earth-search"]).default("earth-search"),
      includeStatistics: z
        .boolean()
        .default(true)
        .describe("Fetch real pixel statistics over the scene (slower, but quantitative)"),
    },
  },
  async ({ bbox, index, sceneId, days, maxCloud, backend, includeStatistics }) => {
    try {
      const spec = INDICES[index];
      const items = await stacSearch({
        backend,
        collections: ["sentinel-2-l2a"],
        bbox,
        days,
        maxCloud,
        limit: sceneId ? 50 : 5,
        sortby: "properties.eo:cloud_cover",
      });

      const item = sceneId ? items.find((i) => i.id === sceneId) : items[0];
      if (!item) {
        return failure(
          sceneId
            ? `Scene "${sceneId}" not found in this area/cloud range.`
            : "No scenes matched. Widen days or maxCloud.",
        );
      }

      const missing = spec.assets.filter((a) => !item.assets?.[a]);
      if (missing.length > 0) {
        return failure(
          `Scene ${item.id} lacks band(s) ${missing.join(", ")} needed for ${index}.`,
        );
      }

      const href = itemSelfHref(item, backend);
      if (!href) return failure(`Could not resolve a STAC item URL for ${item.id}.`);

      const params = new URLSearchParams();
      params.set("url", href);
      for (const a of spec.assets) params.append("assets", a);
      params.set("asset_as_band", "true");
      params.set("expression", spec.expr);
      params.set("rescale", spec.rescale);
      params.set("colormap_name", spec.cmap);

      const result = {
        index,
        meaning: spec.meaning,
        bands: spec.assets,
        expression: spec.expr,
        scene: {
          id: item.id,
          datetime: item.properties?.datetime ?? null,
          cloudCover: item.properties?.["eo:cloud_cover"] ?? null,
        },
        imageUrl: `${TITILER}/stac/preview.png?${params}&max_size=1024`,
        tileUrl: `${TITILER}/stac/tiles/WebMercatorQuad/{z}/{x}/{y}.png?${params}`,
      };

      if (includeStatistics) {
        try {
          const stats = await fetchJson(`${TITILER}/stac/statistics?${params}`);
          const band = Object.values(stats)[0];
          if (band) {
            result.statistics = {
              min: Number(band.min?.toFixed(4)),
              max: Number(band.max?.toFixed(4)),
              mean: Number(band.mean?.toFixed(4)),
              median: Number(band.median?.toFixed(4)),
              std: Number(band.std?.toFixed(4)),
              validPercent: band.valid_percent,
            };
          }
        } catch (error) {
          result.statisticsError = error.message;
        }
      }

      return text(result);
    } catch (error) {
      return failure(`Spectral index failed: ${error.message}`);
    }
  },
);

server.registerTool(
  "next_overpass",
  {
    title: "Predict satellite overpasses",
    description:
      "When will a satellite next fly over this location, and will the pass " +
      "produce a usable image? Accounts for instrument swath and solar " +
      "illumination — optical sensors need daylight, radar does not. Use " +
      "this to plan when new imagery will become available.",
    inputSchema: {
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      hours: z
        .number()
        .int()
        .min(1)
        .max(336)
        .default(240)
        .describe("Look-ahead window. Sentinel-2 repeats every 10 days, so short windows often return nothing."),
      imageableOnly: z
        .boolean()
        .default(true)
        .describe("Exclude optical passes that happen in darkness"),
      appUrl: z
        .string()
        .default("http://localhost:3000")
        .describe("Base URL of a running toolkit instance, which performs the orbital propagation"),
    },
  },
  async ({ latitude, longitude, hours, imageableOnly, appUrl }) => {
    const url =
      `${appUrl.replace(/\/$/, "")}/api/orbital/overpass` +
      `?lat=${latitude}&lon=${longitude}&hours=${hours}&imageableOnly=${imageableOnly}`;
    try {
      const json = await fetchJson(url);
      if (json.errors?.length) {
        json.note =
          "Some platforms could not be propagated; their passes are absent from this list.";
      }
      return text(json);
    } catch (error) {
      return failure(
        `Overpass prediction needs a running toolkit instance at ${appUrl} ` +
          `(start it with "npm run dev"). ${error.message}`,
      );
    }
  },
);

server.registerTool(
  "list_data_sources",
  {
    title: "List verified satellite data sources",
    description:
      "The curated registry of satellite and Earth-observation data sources — " +
      "what each provides, what credentials it needs, whether it was last " +
      "probed working, and the gotchas that waste time. Use this to decide " +
      "where to get data you cannot get from the imagery tools.",
    inputSchema: {
      tier: z
        .number()
        .int()
        .min(1)
        .max(4)
        .optional()
        .describe("1 = keyless and reliable, 4 = deprecated/gated"),
      keylessOnly: z.boolean().default(false),
      appUrl: z.string().default("http://localhost:3000"),
    },
  },
  async ({ tier, keylessOnly, appUrl }) => {
    try {
      const json = await fetchJson(`${appUrl.replace(/\/$/, "")}/api/sources`);
      let sources = json.sources ?? [];
      if (tier) sources = sources.filter((s) => s.tier === tier);
      if (keylessOnly) {
        sources = sources.filter(
          (s) => s.auth === "none" && s.verified?.status === "ok",
        );
      }
      return text({
        count: sources.length,
        sources: sources.map((s) => ({
          id: s.id,
          name: s.name,
          tier: s.tier,
          auth: s.auth,
          status: s.verified?.status,
          useWhen: s.useWhen,
          howTo: s.howTo,
          gotchas: s.gotchas,
        })),
      });
    } catch (error) {
      return failure(
        `Source registry needs a running toolkit instance at ${appUrl} ` +
          `(start it with "npm run dev"). ${error.message}`,
      );
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
