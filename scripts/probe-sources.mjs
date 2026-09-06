#!/usr/bin/env node
/**
 * Live source probe.
 *
 * Every source in `src/sources` claims a verification status. This script
 * re-checks the machine-reachable ones against the real internet so the
 * registry cannot quietly rot.
 *
 *   npm run probe            # keyless sources only (works from a cold clone)
 *   npm run probe -- --all   # include sources needing credentials
 *   npm run probe -- --json  # machine-readable output
 *
 * Exit code is non-zero when a source that should work does not.
 */

const args = new Set(process.argv.slice(2));
const INCLUDE_AUTHED = args.has("--all");
const AS_JSON = args.has("--json");
const TIMEOUT_MS = 25_000;

/**
 * Probes mirror what the toolkit itself calls at runtime.
 * `expect` is the outcome that means "the registry entry is still true".
 */
const PROBES = [
  // ── Keyless: these must pass from a cold clone ─────────────────────────
  {
    id: "earth-search",
    label: "Earth Search STAC (Sentinel-2 over Bangkok)",
    keyless: true,
    expect: "ok",
    run: () =>
      postJson("https://earth-search.aws.element84.com/v1/search", {
        collections: ["sentinel-2-l2a"],
        bbox: [100.3, 13.5, 100.9, 14.0],
        limit: 2,
      }).then((r) => ({
        ok: r.status === 200 && (r.json?.features?.length ?? 0) > 0,
        detail: `${r.status}, ${r.json?.features?.length ?? 0} features`,
      })),
  },
  {
    id: "planetary-computer",
    label: "Planetary Computer STAC (Landsat)",
    keyless: true,
    expect: "ok",
    run: () =>
      postJson(
        "https://planetarycomputer.microsoft.com/api/stac/v1/search",
        { collections: ["landsat-c2-l2"], bbox: [100.3, 13.5, 100.9, 14.0], limit: 2 },
      ).then((r) => ({
        ok: r.status === 200 && (r.json?.features?.length ?? 0) > 0,
        detail: `${r.status}, ${r.json?.features?.length ?? 0} features`,
      })),
  },
  {
    id: "cdse-stac",
    label: "Copernicus Data Space STAC",
    keyless: true,
    expect: "ok",
    run: () =>
      getJson("https://stac.dataspace.copernicus.eu/v1/collections").then((r) => ({
        ok: r.status === 200 && (r.json?.collections?.length ?? 0) > 0,
        detail: `${r.status}, ${r.json?.collections?.length ?? 0} collections`,
      })),
  },
  {
    id: "nasa-cmr-stac",
    label: "NASA CMR STAC root",
    keyless: true,
    expect: "ok",
    run: () =>
      head("https://cmr.earthdata.nasa.gov/stac").then((r) => ({
        ok: r.status === 200,
        detail: String(r.status),
      })),
  },
  {
    id: "titiler-public",
    label: "TiTiler renders a Sentinel-2 COG tile",
    keyless: true,
    expect: "ok",
    run: async () => {
      // Discover a live scene rather than hard-coding one that will age out.
      const search = await postJson(
        "https://earth-search.aws.element84.com/v1/search",
        {
          collections: ["sentinel-2-l2a"],
          bbox: [100.3, 13.5, 100.9, 14.0],
          limit: 1,
          query: { "eo:cloud_cover": { lt: 40 } },
        },
      );
      const href = search.json?.features?.[0]?.assets?.visual?.href;
      if (!href) return { ok: false, detail: "no visual asset in search result" };

      const tj = await getJson(
        `https://titiler.xyz/cog/WebMercatorQuad/tilejson.json?url=${encodeURIComponent(href)}`,
      );
      const b = tj.json?.bounds;
      if (!b) return { ok: false, detail: `tilejson ${tj.status}` };

      // Centre of the scene, at the tiler's advertised minimum zoom.
      const z = tj.json.minzoom ?? 8;
      const lon = (b[0] + b[2]) / 2;
      const lat = (b[1] + b[3]) / 2;
      const n = 2 ** z;
      const x = Math.floor(((lon + 180) / 360) * n);
      const y = Math.floor(
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
          ) /
            Math.PI) /
          2) *
          n,
      );

      const res = await request(
        `https://titiler.xyz/cog/tiles/WebMercatorQuad/${z}/${x}/${y}.png?url=${encodeURIComponent(href)}`,
      );
      const type = res.headers?.get("content-type") ?? "";
      return {
        ok: res.status === 200 && type.startsWith("image/"),
        detail: `${res.status} ${type} @ z${z}`,
      };
    },
  },
  {
    id: "nasa-gibs-wmts",
    label: "NASA GIBS WMTS capabilities",
    keyless: true,
    expect: "ok",
    run: () =>
      head(
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml",
      ).then((r) => ({
        // head() sends a Range header, so a healthy server replies 206.
        ok: r.status === 200 || r.status === 206,
        detail: String(r.status),
      })),
  },
  {
    id: "open-meteo-aqi",
    label: "Open-Meteo air quality",
    keyless: true,
    expect: "ok",
    run: () =>
      getJson(
        "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=13.75&longitude=100.5&current=pm2_5,us_aqi",
      ).then((r) => ({
        ok: r.status === 200 && r.json?.current?.pm2_5 !== undefined,
        detail: `${r.status}, pm2.5=${r.json?.current?.pm2_5}`,
      })),
  },
  {
    id: "celestrak",
    label: "CelesTrak orbital elements",
    keyless: true,
    expect: "ok",
    run: () =>
      getJson(
        "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json",
      ).then((r) => ({
        ok: r.status === 200 && Array.isArray(r.json) && r.json.length > 0,
        detail: `${r.status}, ${Array.isArray(r.json) ? r.json.length : 0} objects`,
      })),
  },
  {
    id: "nasa-eonet",
    label: "NASA EONET natural events",
    keyless: true,
    expect: "ok",
    run: () =>
      getJson("https://eonet.gsfc.nasa.gov/api/v3/events?limit=2").then((r) => ({
        ok: r.status === 200 && Array.isArray(r.json?.events),
        detail: `${r.status}, ${r.json?.events?.length ?? 0} events`,
      })),
  },
  {
    id: "opensky",
    label: "OpenSky live aircraft (anonymous)",
    keyless: true,
    expect: "ok",
    run: () =>
      getJson(
        "https://opensky-network.org/api/states/all?lamin=13&lomin=100&lamax=14&lomax=101",
      ).then((r) => ({
        // 429 means the anonymous quota is spent, not that the source is wrong.
        ok: r.status === 200 || r.status === 429,
        detail:
          r.status === 429
            ? "429 anonymous quota exhausted (source healthy)"
            : `${r.status}, ${r.json?.states?.length ?? 0} aircraft`,
      })),
  },
  {
    id: "gdelt",
    label: "GDELT article search",
    keyless: true,
    expect: "ok",
    run: async () => {
      const url =
        "https://api.gdeltproject.org/api/v2/doc/doc?query=flood&mode=artlist&format=json&maxrecords=2";
      // GDELT is slow and throttles hard; one retry with backoff before
      // calling it a failure.
      let r = await request(url);
      if (r.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        r = await request(url);
      }
      return {
        ok: r.status === 200 || r.status === 429,
        detail:
          r.status === 429
            ? "429 rate limited (expected; back off)"
            : r.status === 0
              ? `network error: ${String(r.error).slice(0, 60)}`
              : String(r.status),
      };
    },
  },
  {
    id: "google-trends",
    label: "Google Trends daily RSS (TH)",
    keyless: true,
    expect: "ok",
    run: () =>
      request("https://trends.google.com/trending/rss?geo=TH").then((r) => ({
        ok: r.status === 200,
        detail: String(r.status),
      })),
  },

  // ── Credentialed: only probed with --all ───────────────────────────────
  {
    id: "asf-search",
    label: "ASF Vertex search (metadata is open)",
    keyless: false,
    expect: "ok",
    run: () =>
      request(
        "https://api.daac.asf.alaska.edu/services/search/param?platform=Sentinel-1A&maxResults=1&output=json",
      ).then((r) => ({ ok: r.status === 200, detail: String(r.status) })),
  },
  {
    id: "cdse-odata",
    label: "Copernicus OData products",
    keyless: false,
    expect: "ok",
    run: () =>
      request(
        "https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$top=1",
      ).then((r) => ({ ok: r.status === 200, detail: String(r.status) })),
  },
  {
    id: "nasa-firms",
    label: "NASA FIRMS (needs FIRMS_KEY)",
    keyless: false,
    expect: "needs-auth",
    run: async () => {
      const key = process.env.FIRMS_KEY;
      if (!key) {
        const r = await request(
          "https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/world/1",
        );
        return {
          ok: r.status === 400 || r.status === 401,
          detail: "no FIRMS_KEY set; endpoint correctly rejects a bad key",
        };
      }
      const r = await request(
        `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/VIIRS_SNPP_NRT/92,5,106,21/1`,
      );
      return { ok: r.status === 200, detail: `${r.status} with real key` };
    },
  },
  {
    id: "openaq",
    label: "OpenAQ v3 (needs OPENAQ_KEY)",
    keyless: false,
    expect: "needs-auth",
    run: async () => {
      const key = process.env.OPENAQ_KEY;
      const r = await request("https://api.openaq.org/v3/locations?limit=1", {
        headers: key ? { "X-API-Key": key } : {},
      });
      return {
        ok: key ? r.status === 200 : r.status === 401,
        detail: key ? `${r.status} with key` : "401 without key (as documented)",
      };
    },
  },
  {
    id: "reliefweb",
    label: "ReliefWeb v2 (needs approved appname)",
    keyless: false,
    expect: "deprecated",
    run: async () => {
      const app = process.env.RELIEFWEB_APPNAME;
      const r = await request(
        `https://api.reliefweb.int/v2/disasters?limit=1&appname=${encodeURIComponent(app ?? "unapproved")}`,
      );
      return {
        ok: app ? r.status === 200 : r.status === 403,
        detail: app
          ? `${r.status} with appname "${app}"`
          : "403 without an OCHA-approved appname (as documented)",
      };
    },
  },
];

// ── HTTP helpers ────────────────────────────────────────────────────────────

async function request(url, init = {}) {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return { status: res.status, headers: res.headers, res };
  } catch (error) {
    return { status: 0, headers: null, error: String(error) };
  }
}

async function getJson(url) {
  const r = await request(url, { headers: { Accept: "application/json" } });
  if (!r.res) return { status: r.status, json: null };
  const json = await r.res.json().catch(() => null);
  return { status: r.status, json };
}

async function postJson(url, body) {
  const r = await request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/geo+json" },
    body: JSON.stringify(body),
  });
  if (!r.res) return { status: r.status, json: null };
  const json = await r.res.json().catch(() => null);
  return { status: r.status, json };
}

async function head(url) {
  return request(url, { method: "GET", headers: { Range: "bytes=0-256" } });
}

// ── Runner ──────────────────────────────────────────────────────────────────

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const selected = PROBES.filter((p) => INCLUDE_AUTHED || p.keyless);

const results = await Promise.all(
  selected.map(async (probe) => {
    const started = Date.now();
    try {
      const outcome = await probe.run();
      return { ...probe, ...outcome, ms: Date.now() - started };
    } catch (error) {
      return {
        ...probe,
        ok: false,
        detail: String(error).slice(0, 120),
        ms: Date.now() - started,
      };
    }
  }),
);

const failed = results.filter((r) => !r.ok);

if (AS_JSON) {
  console.log(
    JSON.stringify(
      {
        probedAt: new Date().toISOString(),
        total: results.length,
        passed: results.length - failed.length,
        results: results.map(({ id, label, ok, detail, ms, expect }) => ({
          id,
          label,
          ok,
          expect,
          detail,
          ms,
        })),
      },
      null,
      2,
    ),
  );
} else {
  console.log(
    `\n  Probing ${results.length} sources${INCLUDE_AUTHED ? " (including credentialed)" : " (keyless only)"}…\n`,
  );
  for (const r of results.sort((a, b) => a.id.localeCompare(b.id))) {
    const mark = r.ok ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    console.log(
      `  ${mark} ${r.label.padEnd(46)} ${DIM}${r.detail} (${r.ms}ms)${RESET}`,
    );
  }
  console.log(
    `\n  ${results.length - failed.length}/${results.length} passed.` +
      (failed.length
        ? `\n  ${RED}Failing: ${failed.map((f) => f.id).join(", ")}${RESET}\n` +
          `  ${DIM}Update src/sources/ if an upstream has genuinely changed.${RESET}\n`
        : `  ${DIM}Registry matches reality.${RESET}\n`),
  );
}

process.exit(failed.length > 0 ? 1 : 0);
