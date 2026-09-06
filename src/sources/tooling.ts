// ─── Ecosystem Tooling ─────────────────────────────────────────────────────
// Libraries, CLIs and MCP servers worth adopting instead of hand-rolling.
// Star counts and last-push dates verified 2026-09-06 via the GitHub API.

import type { DataSource } from "./types";

export const TOOLING: DataSource[] = [
  // ── Tier 1 — the core stack this toolkit is built on. ────────────────────
  {
    id: "pystac-client",
    name: "pystac-client",
    agency: "stac-utils",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 1,
    portal: "https://github.com/stac-utils/pystac-client",
    docs: "https://pystac-client.readthedocs.io/",
    provides: [
      "Python client for any STAC API — search, pagination, item collections",
      "CQL2 filtering, works against Earth Search, Planetary Computer, CDSE",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★207, last push 2026-08-31. The de-facto standard STAC client; used by every serious EO pipeline.",
    },
    useWhen:
      "Anything Python that needs to find satellite scenes. This is the entry point to the whole modern EO stack.",
    howTo:
      "pip install pystac-client, then `Client.open('https://earth-search.aws.element84.com/v1').search(collections=['sentinel-2-l2a'], bbox=..., datetime=..., query={'eo:cloud_cover': {'lt': 20}})`. Already wired up in `ingestion/stac_search.py`.",
    gotchas: [
      "`.get_items()` is a lazy generator that will page forever — always set `max_items`.",
    ],
    seeAlso: ["odc-stac", "earth-search"],
  },
  {
    id: "odc-stac",
    name: "odc-stac",
    agency: "Open Data Cube",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 1,
    portal: "https://github.com/opendatacube/odc-stac",
    docs: "https://odc-stac.readthedocs.io/",
    provides: [
      "Loads STAC items straight into an xarray Dataset",
      "Lazy Dask-backed reads, reprojection and mosaicking on the fly",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★202, last push 2026-09-03. Actively maintained by the Open Data Cube team.",
    },
    useWhen:
      "You have STAC search results and want an analysis-ready time-series cube without writing GDAL warping code.",
    howTo:
      "`odc.stac.load(items, bands=['red','green','blue','nir'], crs='EPSG:4326', resolution=0.0001, bbox=bbox, chunks={})` returns a lazy xarray Dataset. Compute NDVI as a plain array expression. Preferred over `stackstac`, which has not been updated since 2024.",
    gotchas: [
      "Always pass `chunks={}` for large areas, otherwise it loads everything into RAM at once.",
      "Planetary Computer items must be signed before loading.",
    ],
    seeAlso: ["pystac-client", "rioxarray"],
  },
  {
    id: "leafmap",
    name: "leafmap",
    agency: "opengeos (Qiusheng Wu)",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 1,
    portal: "https://github.com/opengeos/leafmap",
    docs: "https://leafmap.org/",
    provides: [
      "Interactive geospatial mapping in Jupyter with almost no boilerplate",
      "Built-in STAC search, COG display, split-screen comparison, basemaps",
      "Backends for folium, ipyleaflet, MapLibre and deck.gl",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★3771, last push 2026-08-31. The most active EO notebook-mapping package.",
    },
    useWhen:
      "Exploring and prototyping before you commit anything to the dashboard. Fastest path from 'I wonder' to a picture.",
    howTo:
      "pip install leafmap, then `m = leafmap.Map(); m.add_stac_layer(url=item_url, bands=['red','green','blue'])`. `leafmap.stac_search(...)` wraps pystac-client with a map UI. Notebook provided at `ingestion/notebooks/explore.ipynb`.",
    gotchas: [
      "Pulls a large dependency tree. Keep it in the Python ingestion environment, out of the Next.js app.",
    ],
    seeAlso: ["geemap", "pystac-client"],
  },
  {
    id: "titiler",
    name: "TiTiler (self-hosted)",
    agency: "Development Seed",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 1,
    portal: "https://github.com/developmentseed/titiler",
    docs: "https://developmentseed.org/titiler/",
    provides: [
      "FastAPI dynamic tile server for COG, STAC items and MosaicJSON",
      "Band math, rescaling, colormaps, /statistics endpoints",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★1170, last push 2026-09-05. Actively developed; the public demo at titiler.xyz was probed serving real Sentinel-2 tiles.",
    },
    useWhen:
      "You have moved past prototyping and need reliable raster tiles you control, without the SLA risk of a public demo.",
    howTo:
      "`docker run -p 8000:8000 ghcr.io/developmentseed/titiler:latest`, then point `NEXT_PUBLIC_TITILER_URL=http://localhost:8000` in .env. The toolkit's COG layer reads that variable and falls back to titiler.xyz when it is unset.",
    gotchas: [
      "Put a cache in front of it. Every tile request re-reads byte ranges from the source COG.",
    ],
    seeAlso: ["titiler-public", "earth-search"],
  },
  {
    id: "deckgl",
    name: "deck.gl",
    agency: "vis.gl / OpenJS Foundation",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 1,
    portal: "https://github.com/visgl/deck.gl",
    docs: "https://deck.gl/docs",
    provides: [
      "WebGL2/WebGPU layer framework for large geospatial datasets",
      "TileLayer, BitmapLayer, ScatterplotLayer, H3, hexbin aggregation",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★14558, last push 2026-09-05. This toolkit's rendering layer.",
    },
    useWhen:
      "Rendering more points than the DOM can handle — thousands of fire detections, aircraft or stations at 60 fps.",
    howTo:
      "Already a dependency. Layer factories live in `src/engine/map-engine.ts` (GIBS/WMTS, fire points) and `src/engine/cog-layer.ts` (STAC COG imagery).",
    gotchas: [
      "Needs `transpilePackages` in next.config.mjs under Next.js — already configured here.",
    ],
    seeAlso: ["maplibre"],
  },
  {
    id: "maplibre",
    name: "MapLibre GL JS",
    agency: "MapLibre organisation",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 1,
    portal: "https://github.com/maplibre/maplibre-gl-js",
    docs: "https://maplibre.org/maplibre-gl-js/docs/",
    provides: [
      "Open-source vector-tile basemap renderer, no vendor token required",
      "Drop-in interop with deck.gl via MapboxOverlay",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★11544, last push 2026-09-05.",
    },
    useWhen:
      "You want a proper vector basemap without a Mapbox account or usage billing.",
    howTo:
      "Free styles from demotiles.maplibre.org or basemaps.cartocdn.com need no key. The toolkit's basemap fallback chain in `src/basemaps/basemap-catalog.ts` prefers keyless styles and only uses Mapbox if a token happens to be set.",
    seeAlso: ["deckgl"],
  },

  // ── Tier 2 — reach for these when the task calls for them. ───────────────
  {
    id: "geemap",
    name: "geemap",
    agency: "gee-community (Qiusheng Wu)",
    country: "GLOBAL",
    kind: "library",
    auth: "free-account",
    tier: 2,
    portal: "https://github.com/gee-community/geemap",
    docs: "https://geemap.org/",
    provides: [
      "Google Earth Engine in Jupyter, with interactive maps and export helpers",
      "Access to GEE's petabyte-scale preprocessed archive",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★4022, last push 2026-09-04. NOTE: the repo lives at gee-community/geemap — opengeos/geemap is a stale redirect that 404s on the API.",
    },
    useWhen:
      "Continental-scale or multi-decade analysis where downloading scenes is infeasible and you want the compute next to the data.",
    howTo:
      "Requires a free Earth Engine account (non-commercial approval). `pip install geemap`, `ee.Authenticate()`, then `geemap.Map()`. Best for aggregate analysis; export results to your own store for the dashboard rather than calling GEE from the frontend.",
    gotchas: [
      "Commercial use now requires a paid Google Cloud EE licence — check terms before shipping client work.",
      "GEE is not a STAC API. Code written against it does not port to Earth Search or Planetary Computer.",
    ],
    seeAlso: ["leafmap", "pystac-client"],
  },
  {
    id: "geospatial-data-catalogs",
    name: "opengeos/geospatial-data-catalogs",
    agency: "opengeos (Qiusheng Wu)",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 2,
    portal: "https://github.com/opengeos/geospatial-data-catalogs",
    provides: [
      "Machine-readable index of open datasets across AWS, Earth Engine, Planetary Computer and STAC",
      "Companion repos: opengeos/aws-open-data, opengeos/stac-index-catalogs",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★661, last push 2026-09-05. Companions verified: aws-open-data ★65, stac-index-catalogs ★22, both updated within days.",
    },
    useWhen:
      "You are hunting for a dataset and don't yet know which provider holds it.",
    howTo:
      "Clone and grep the JSON catalogs, or read them straight from the raw GitHub URLs. Treat it as a lookup table for discovery, then point this toolkit's STAC client at whichever endpoint it surfaces.",
    gotchas: [
      "A directory, not a service. Endpoints listed there still need their own verification — several entries elsewhere in the ecosystem are stale.",
    ],
    seeAlso: ["earth-search", "planetary-computer"],
  },
  {
    id: "asf-search-py",
    name: "asf_search (Python)",
    agency: "Alaska Satellite Facility",
    country: "US",
    kind: "library",
    auth: "free-account",
    tier: 2,
    portal: "https://github.com/asfadmin/Discovery-asf_search",
    docs: "https://docs.asf.alaska.edu/asf_search/basics/",
    provides: [
      "Python search and authenticated download for the full ASF SAR archive",
      "Baseline stacks for InSAR pair selection",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "Official ASF client; the underlying REST API was probed at 200.",
    },
    useWhen:
      "Any serious Sentinel-1 or ALOS work in Python — especially building InSAR stacks.",
    howTo:
      "`pip install asf-search`, then `asf.geo_search(platform=asf.PLATFORM.SENTINEL1, intersectsWith=wkt, start=..., end=...)`. Downloads use an Earthdata session.",
    gotchas: ["Downloads are large; always filter by processingLevel first."],
    seeAlso: ["asf-search", "snap-engine"],
  },
  {
    id: "snap-engine",
    name: "ESA SNAP Engine",
    agency: "ESA / senbox-org",
    country: "EU",
    kind: "library",
    auth: "none",
    tier: 2,
    portal: "https://github.com/senbox-org/snap-engine",
    docs: "https://step.esa.int/main/toolboxes/snap/",
    provides: [
      "Reference processing engine for Sentinel-1/2/3 and heritage missions",
      "SAR calibration, speckle filtering, terrain correction, interferometry",
      "Scriptable via the gpt command-line graph processor",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★213, last push 2026-08-26. Java; heavyweight but authoritative.",
    },
    useWhen:
      "You need genuinely analysis-ready SAR — calibrated, speckle-filtered, terrain-corrected — and pre-made RTC products don't cover your scene.",
    howTo:
      "Install SNAP desktop, build a processing graph in the GUI, export the XML, then batch it: `gpt graph.xml -Pinput=... -Poutput=...`. Wrap that in your ingestion pipeline. Use esa-snappy for Python bindings.",
    gotchas: [
      "Heavy JVM dependency — keep it in a separate container from the Node app.",
      "Before building an SAR chain, check whether ASF's pre-processed ALOS/Sentinel-1 RTC products already answer your question. They usually do.",
    ],
    seeAlso: ["asf-search"],
  },
  {
    id: "bhoonidhi-downloader",
    name: "bhoonidhi-downloader",
    agency: "geovicco-dev (community)",
    country: "IN",
    kind: "library",
    auth: "free-account",
    tier: 2,
    portal: "https://github.com/geovicco-dev/bhoonidhi-downloader",
    provides: [
      "CLI and Python SDK for ISRO's Bhoonidhi portal",
      "Handles the session auth and rate limiting the raw portal imposes",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★19, last push 2026-09-01. Small community project but actively maintained and the only practical scripted route to ISRO data.",
    },
    useWhen:
      "South Asia work needing ResourceSat/CartoSat resolution beyond what Sentinel-2 gives you.",
    howTo:
      "`pip install bhoonidhi-downloader`, then `bhoonidhi search --bbox ... --start ... --end ...` with your Bhoonidhi credentials in the environment.",
    gotchas: [
      "Single-maintainer project against an undocumented portal — pin the version and expect occasional breakage when ISRO changes the portal.",
    ],
    seeAlso: ["isro-bhoonidhi"],
  },
  {
    id: "geo-mcp-servers",
    name: "sparkgeo/geo-mcp-servers",
    agency: "Sparkgeo",
    country: "GLOBAL",
    kind: "mcp-server",
    auth: "none",
    tier: 2,
    portal: "https://github.com/sparkgeo/geo-mcp-servers",
    provides: [
      "Tracked index of 77+ Model Context Protocol servers for geospatial and EO",
      "Includes stac-mcp, earthdata-mcp, planetary-computer-mcp, copernicus-mcp",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★83, last push 2026-09-04. Actively curated.",
    },
    useWhen:
      "You want an AI agent to answer 'show me cloud-free Sentinel-2 over Bangkok in the last three months' by calling the right STAC API itself.",
    howTo:
      "Browse the index, pick a server, and register it in your agent's MCP config. `stac-mcp` is the most general — it speaks to any STAC API, including the four this toolkit ships with. See `AGENTS.md` for how this repo expects an agent to drive it.",
    gotchas: [
      "An index, not a guarantee. MCP server quality varies widely — check each server's own last-commit date before depending on it.",
      "Most of these wrap the same STAC endpoints this toolkit already calls directly. Add an MCP server for natural-language access, not for capability you already have.",
    ],
    seeAlso: ["earth-search", "planetary-computer"],
  },

  // ── Tier 3 — useful references, not dependencies. ────────────────────────
  {
    id: "reference-downloaders",
    name: "Community scene downloaders (landsat-download, Optical-Downloader)",
    agency: "Independent contributors",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 3,
    portal: "https://github.com/gorniakgrzegorz/landsat-download",
    provides: [
      "landsat-download: bulk Landsat 4–9 C2 L2 with automatic composites and indices",
      "Optical-Downloader: least-cloudy Sentinel-2/Landsat scene, cloud-masked and clipped",
    ],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "Both repos exist and were pushed within the last month, but each has 0 stars and a single contributor. landsat-download ★0 (2026-08-24), Optical-Downloader ★0 (2026-08-28).",
    },
    useWhen:
      "You want to read a worked example of the search → cloud-mask → clip → composite pipeline before writing your own.",
    howTo:
      "Read the source for the pattern; both use Planetary Computer STAC underneath, which this toolkit already talks to. Reimplement the ~40 lines you need with pystac-client + odc-stac rather than taking a dependency on a zero-star single-maintainer package.",
    gotchas: [
      "Not battle-tested. Do not put either in a production requirements.txt — treat them as reference implementations.",
    ],
    seeAlso: ["pystac-client", "odc-stac"],
  },
  {
    id: "stackstac",
    name: "stackstac",
    agency: "Gabe Joseph (independent)",
    country: "GLOBAL",
    kind: "library",
    auth: "none",
    tier: 3,
    portal: "https://github.com/gjoseph92/stackstac",
    provides: ["Turns a STAC ItemCollection into a Dask-backed xarray DataArray"],
    verified: {
      at: "2026-09-06",
      status: "ok",
      note: "★272, but last push 2024-08-10 — over two years stale as of this writing.",
    },
    useWhen:
      "You are reading older EO tutorials that assume it. For new code, don't.",
    howTo:
      "Use `odc-stac` instead — same job, actively maintained, better reprojection handling.",
    gotchas: ["Unmaintained since 2024; dependency conflicts with current xarray/dask are common."],
    seeAlso: ["odc-stac"],
  },
];
