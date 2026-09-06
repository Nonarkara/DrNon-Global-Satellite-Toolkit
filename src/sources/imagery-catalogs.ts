// ─── Satellite Imagery Catalogs & Archives ─────────────────────────────────
// Ordered by tier. Tier 1 works from a cold clone with no credentials.
// Last full probe: 2026-09-06 (run `npm run probe` to re-verify).

import type { DataSource } from "./types";

export const IMAGERY_CATALOGS: DataSource[] = [
  // ── Tier 1 — keyless STAC. Start here. ───────────────────────────────────
  {
    id: "earth-search",
    name: "Earth Search (Element 84 / AWS Open Data)",
    agency: "Element 84 on AWS Open Data (hosts ESA + USGS archives)",
    country: "GLOBAL",
    kind: "stac-api",
    auth: "none",
    tier: 1,
    endpoint: "https://earth-search.aws.element84.com/v1",
    portal: "https://element84.com/earth-search/",
    docs: "https://github.com/Element84/earth-search",
    provides: [
      "Sentinel-2 L2A (surface reflectance, cloud-optimised)",
      "Sentinel-2 L1C",
      "Sentinel-1 GRD (C-band SAR)",
      "Landsat Collection 2 L2",
      "Copernicus DEM",
      "NAIP aerial (US only)",
    ],
    resolution: "10 m (S2 visible/NIR), 20–60 m (other S2 bands), 30 m (Landsat)",
    latency: "~12–24 h after acquisition",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "POST https://earth-search.aws.element84.com/v1/search {collections:[sentinel-2-l2a], bbox:[100.3,13.5,100.9,14.0]}",
      note: "200, 3 features returned for Bangkok. Assets are anonymously readable public COGs (HTTP Range GET → 206).",
    },
    useWhen:
      "You want recent optical imagery over any point on Earth and you want it working in the next five minutes with no signup.",
    howTo:
      "POST a STAC search to /v1/search with `collections`, `bbox` and `datetime`. Each returned feature's `assets.visual.href` is a public COG you can read directly over HTTP range requests, or hand to a dynamic tiler for XYZ tiles. This is the default backend of `src/stac/client.ts`.",
    gotchas: [
      "Sort by `eo:cloud_cover` — the newest scene is very often the cloudiest, especially in the SEA monsoon.",
      "Scenes are MGRS tiles (~110 km), so a city bbox usually spans 2–4 tiles that must be mosaicked.",
      "Coverage starts ~2015 for Sentinel-2. For anything earlier use Landsat.",
    ],
    seeAlso: ["planetary-computer", "titiler-public"],
  },
  {
    id: "planetary-computer",
    name: "Microsoft Planetary Computer STAC",
    agency: "Microsoft",
    country: "GLOBAL",
    kind: "stac-api",
    auth: "none",
    tier: 1,
    endpoint: "https://planetarycomputer.microsoft.com/api/stac/v1",
    portal: "https://planetarycomputer.microsoft.com/catalog",
    docs: "https://planetarycomputer.microsoft.com/docs/quickstarts/reading-stac/",
    provides: [
      "Sentinel-1/2/3/5P",
      "Landsat Collection 2 L2 (1982→present)",
      "MODIS, VIIRS, HLS",
      "Copernicus DEM, ESA WorldCover, ALOS DEM",
      "126+ curated collections including climate and biodiversity",
    ],
    resolution: "10 m – 1 km depending on collection",
    latency: "hours to days by collection",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "POST https://planetarycomputer.microsoft.com/api/stac/v1/search {collections:[landsat-c2-l2]}",
      note: "200, 3 Landsat 9 features over Bangkok. Search is fully anonymous.",
    },
    useWhen:
      "You need the deepest catalog breadth — long Landsat time series, DEMs, land cover, climate — from one STAC endpoint.",
    howTo:
      "Search anonymously against /api/stac/v1/search exactly like Earth Search. Asset hrefs point at Azure Blob and must be signed before reading: GET https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=<asset-href> returns a time-limited URL. Signing is free and needs no account. In Python, `planetary-computer.sign(item)` does this for you.",
    gotchas: [
      "Unsigned asset hrefs return 404 — signing is not optional, it just isn't authenticated.",
      "SAS tokens expire (~1 h). Sign at read time, never cache a signed URL in a database.",
    ],
    seeAlso: ["earth-search"],
  },
  {
    id: "cdse-stac",
    name: "Copernicus Data Space Ecosystem — STAC",
    agency: "ESA / European Commission",
    country: "EU",
    kind: "stac-api",
    auth: "none",
    tier: 1,
    endpoint: "https://stac.dataspace.copernicus.eu/v1",
    portal: "https://dataspace.copernicus.eu/",
    docs: "https://documentation.dataspace.copernicus.eu/APIs/STAC.html",
    provides: [
      "Sentinel-1 (C-band SAR, all-weather)",
      "Sentinel-2 L1C/L2A (10 m optical)",
      "Sentinel-3 (ocean/land surface temperature, colour)",
      "Sentinel-5P (NO2, SO2, CO, CH4, aerosol)",
      "Copernicus Contributing Missions (CCM)",
    ],
    resolution: "10 m (S2) – 7 km (S5P)",
    latency: "3 h (NRT) – 24 h",
    coverage: "Global, richest over Europe",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe: "GET https://stac.dataspace.copernicus.eu/v1/collections",
      note: "200, 59 KB collection list. Search returned S2B scenes over Bangkok. Metadata is open; product download needs an account.",
    },
    useWhen:
      "You need the authoritative ESA source — newest Sentinel processing baselines, Sentinel-5P atmospheric chemistry, or full CCM.",
    howTo:
      "Browse /v1/collections, then POST /v1/search. Metadata and search are open. Downloading the product bytes requires a free CDSE account (OAuth2 client-credentials against identity.dataspace.copernicus.eu). For keyless pixels, search here and fetch the equivalent scene from Earth Search.",
    gotchas: [
      "Asset hrefs are `s3://eodata/...` object URIs, not HTTPS. A public tiler cannot read them, so CDSE scenes have no browser preview in this toolkit — search here, then fetch the matching scene from Earth Search for pixels.",
      "The old OData root https://catalogue.dataspace.copernicus.eu/odata/v1/Collections is a 404 — the resource is /odata/v1/Products.",
      "SciHub and the Open Access Hub are retired. Anything pointing at scihub.copernicus.eu is dead.",
      "Sentinel-5P is ~7 km/pixel: national and regional signal, never street level.",
    ],
    seeAlso: ["earth-search", "cdse-odata"],
  },
  {
    id: "nasa-cmr-stac",
    name: "NASA CMR STAC",
    agency: "NASA (Common Metadata Repository)",
    country: "US",
    kind: "stac-api",
    auth: "none",
    tier: 1,
    endpoint: "https://cmr.earthdata.nasa.gov/stac",
    portal: "https://search.earthdata.nasa.gov/",
    docs: "https://github.com/nasa/cmr-stac",
    provides: [
      "STAC view over the entire NASA Earthdata holdings",
      "MODIS, VIIRS, ASTER, SMAP, GEDI, ICESat-2",
      "HLS (harmonised Landsat + Sentinel-2, 30 m)",
      "Per-DAAC sub-catalogs (LPCLOUD, POCLOUD, ASF, …)",
    ],
    resolution: "30 m – 25 km depending on mission",
    latency: "3 h (NRT products) – days",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe: "GET https://cmr.earthdata.nasa.gov/stac",
      note: "200, root catalog listing per-DAAC child catalogs.",
    },
    useWhen:
      "You need a NASA mission that isn't Landsat — atmospheric, cryosphere, biomass, soil moisture, altimetry.",
    howTo:
      "The root is a catalog of catalogs, one per DAAC. Pick a provider (e.g. /stac/LPCLOUD) and search that child's /search endpoint. For the widest analysis-ready optical record use collection HLSL30/HLSS30 in LPCLOUD.",
    gotchas: [
      "Search is open, but downloading most DAAC assets requires a free Earthdata Login and a .netrc or bearer token.",
      "There is no single global /search — you must target a provider catalog.",
    ],
    seeAlso: ["nasa-earthdata", "nasa-gibs-wmts"],
  },
  {
    id: "nasa-gibs-wmts",
    name: "NASA GIBS (Global Imagery Browse Services)",
    agency: "NASA",
    country: "US",
    kind: "tile-service",
    auth: "none",
    tier: 1,
    endpoint:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml",
    portal: "https://worldview.earthdata.nasa.gov/",
    docs: "https://nasa-gibs.github.io/gibs-api-docs/",
    provides: [
      "1000+ pre-rendered global imagery layers as XYZ/WMTS tiles",
      "MODIS & VIIRS true colour, updated daily",
      "Fire/thermal anomalies, aerosol, land surface temperature",
      "Near-real-time layers ~3 h behind acquisition",
    ],
    resolution: "250 m – 2 km (browse imagery, not analysis-grade)",
    latency: "~3 h (NRT)",
    coverage: "Global, daily, back to 2000 for MODIS",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml",
      note: "200, 5.8 MB capabilities document.",
    },
    useWhen:
      "You want a daily global basemap or a fast visual answer to 'what did Earth look like there yesterday' — no processing, no keys, instant tiles.",
    howTo:
      "Use the XYZ template directly in deck.gl/MapLibre: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg — e.g. layer `MODIS_Terra_CorrectedReflectance_TrueColor`, time `2026-09-05`, matrix set `GoogleMapsCompatible_Level9`. Wired up in `src/engine/map-engine.ts`.",
    gotchas: [
      "Tile path order is {z}/{y}/{x} — y before x. Getting this backwards is the single most common GIBS bug.",
      "Each layer has its own max zoom level; requesting beyond it returns blank tiles, not an error.",
      "This is browse imagery. Never derive quantitative indices (NDVI, LST) from GIBS tiles — use the STAC COGs instead.",
    ],
    seeAlso: ["nasa-cmr-stac", "earth-search"],
  },
  {
    id: "titiler-public",
    name: "TiTiler (public demo instance)",
    agency: "Development Seed",
    country: "GLOBAL",
    kind: "tile-service",
    auth: "none",
    tier: 1,
    endpoint: "https://titiler.xyz",
    portal: "https://titiler.xyz/api.html",
    docs: "https://developmentseed.org/titiler/",
    provides: [
      "On-the-fly XYZ tiles from any public Cloud-Optimised GeoTIFF",
      "TileJSON, /info, /statistics, band math and rescaling",
      "STAC item endpoints (/stac/tiles) for multi-asset composites",
    ],
    resolution: "Native resolution of the source COG",
    latency: "Real time",
    coverage: "Anything reachable by URL",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://titiler.xyz/cog/tiles/WebMercatorQuad/11/1595/949.png?url=<sentinel-cogs TCI.tif>",
      note: "200 image/png, 72866 B, 256x256 RGBA — real Sentinel-2 pixels over Bangkok with zero credentials.",
    },
    useWhen:
      "You have a STAC item and want its pixels on a slippy map right now, without downloading a scene or standing up infrastructure.",
    howTo:
      "URL-encode the COG href and request https://titiler.xyz/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=<encoded>. Call /cog/WebMercatorQuad/tilejson.json first to get correct bounds, minzoom and maxzoom. Wired up in `src/engine/cog-layer.ts`.",
    gotchas: [
      "titiler.xyz is a courtesy demo with no SLA. Prototype on it; self-host (Docker: ghcr.io/developmentseed/titiler) before anything production.",
      "Requests outside the COG's footprint return HTTP 404 with `Tile ... is outside bounds`, not a transparent tile — always read bounds from TileJSON first.",
      "Planetary Computer assets must be SAS-signed before TiTiler can read them. Earth Search assets need no signing.",
    ],
    seeAlso: ["earth-search", "planetary-computer"],
  },

  // ── Tier 2 — free, but there's a signup step. ────────────────────────────
  {
    id: "asf-search",
    name: "ASF Vertex Search API (Alaska Satellite Facility)",
    agency: "NASA DAAC operated by University of Alaska Fairbanks",
    country: "US",
    kind: "rest-api",
    auth: "free-account",
    tier: 2,
    endpoint: "https://api.daac.asf.alaska.edu/services/search/param",
    portal: "https://search.asf.alaska.edu/",
    docs: "https://docs.asf.alaska.edu/api/basics/",
    provides: [
      "Sentinel-1 A/B/C SAR (SLC, GRD, OCN)",
      "ALOS PALSAR (JAXA L-band, incl. the free RTC archive)",
      "RADARSAT-1 (CSA)",
      "ERS-1/2, JERS-1, SIR-C, UAVSAR, NISAR",
    ],
    resolution: "3 m – 100 m depending on mode",
    latency: "hours to days",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://api.daac.asf.alaska.edu/services/search/param?platform=Sentinel-1A&maxResults=1&output=json",
      note: "200, 2635 B of scene metadata. Search is open; download needs Earthdata Login.",
    },
    useWhen:
      "Cloud is blocking your optical view — monsoon floods, night-time events, subsidence, deforestation under haze. SAR sees through all of it.",
    howTo:
      "Search is a plain GET with query params (`platform`, `bbox`/`intersectsWith`, `start`, `end`, `processingLevel`, `output=json|geojson`). Downloads require a free NASA Earthdata Login supplied via .netrc. In Python use `asf_search` (pip install asf-search) rather than hand-rolling.",
    gotchas: [
      "This is the only free route to RADARSAT-1; CSA does not run an open portal of its own.",
      "Sentinel-1 SLC scenes are ~4–8 GB each. Filter hard before you download anything.",
      "Raw SAR is not a picture. Budget for calibration + terrain correction (SNAP, or the pre-made ALOS RTC products).",
    ],
    requiredEnvVars: ["EARTHDATA_USER", "EARTHDATA_PASS"],
    seeAlso: ["snap-engine", "nasa-earthdata"],
  },
  {
    id: "usgs-earthexplorer",
    name: "USGS EarthExplorer / M2M API",
    agency: "USGS",
    country: "US",
    kind: "bulk-download",
    auth: "free-account",
    tier: 2,
    endpoint: "https://m2m.cr.usgs.gov/api/api/json/stable",
    portal: "https://earthexplorer.usgs.gov/",
    docs: "https://m2m.cr.usgs.gov/api/docs/json/",
    provides: [
      "Landsat 1–9 full archive (1972→present), Collection 2 L1/L2",
      "Declassified CORONA/GAMBIT imagery (1960s–70s)",
      "SRTM and ASTER DEMs, aerial photography, NAIP",
    ],
    resolution: "15 m (pan) / 30 m (multispectral) for Landsat",
    latency: "~12–24 h for Landsat 8/9",
    coverage: "Global, deepest historical optical record that exists",
    verified: {
      at: "2026-09-06",
      status: "needs-auth",
      probe: "GET https://m2m.cr.usgs.gov/api/api/json/stable/dataset-search",
      note: "403 with an HTML login page — the M2M API requires an approved account token on every call, including discovery.",
    },
    useWhen:
      "You need pre-2015 imagery, the declassified Cold War archive, or an authoritative USGS-issued Landsat product.",
    howTo:
      "Register at ers.cr.usgs.gov, then request M2M access (approval is manual and can take a day or two). Authenticate via POST /login-token to get an X-Auth-Token header, then use scene-search and download-request. For most modern Landsat work, skip all of this — Earth Search and Planetary Computer serve the same Collection 2 scenes as COGs with no account at all.",
    gotchas: [
      "M2M access is a separate approval from a plain EROS account, and it is not instant.",
      "Bulk downloads are order-based and asynchronous, not a simple GET.",
    ],
    requiredEnvVars: ["USGS_USERNAME", "USGS_TOKEN"],
    seeAlso: ["earth-search", "planetary-computer"],
  },
  {
    id: "nasa-earthdata",
    name: "NASA Earthdata Search / CMR",
    agency: "NASA",
    country: "US",
    kind: "rest-api",
    auth: "free-account",
    tier: 2,
    endpoint: "https://cmr.earthdata.nasa.gov/search",
    portal: "https://search.earthdata.nasa.gov/",
    docs: "https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html",
    provides: [
      "Unified discovery across every NASA DAAC (~9000 collections)",
      "Granule-level metadata, temporal and spatial filters",
      "Direct S3 access credentials for in-region (us-west-2) compute",
    ],
    coverage: "Global, all NASA Earth science missions",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe: "GET https://cmr.earthdata.nasa.gov/stac",
      note: "STAC facade returns 200 anonymously; the classic CMR search API is likewise open for metadata.",
    },
    useWhen:
      "You know a NASA product exists but not which DAAC holds it, or you need to enumerate what's available before writing a pipeline.",
    howTo:
      "Query collections first (/search/collections.json?keyword=...), note the concept-id, then list granules. Metadata is anonymous; asset downloads need a free Earthdata Login bearer token. Prefer the CMR STAC facade (tier 1) when your tooling already speaks STAC.",
    gotchas: [
      "Earthdata Login tokens expire; refresh them rather than pinning one in .env forever.",
      "S3 direct access only works from us-west-2 — from anywhere else you pay egress and it is slower than HTTPS.",
    ],
    requiredEnvVars: ["EARTHDATA_TOKEN"],
    seeAlso: ["nasa-cmr-stac", "asf-search"],
  },
  {
    id: "cdse-odata",
    name: "Copernicus Data Space — OData & OpenSearch",
    agency: "ESA / European Commission",
    country: "EU",
    kind: "bulk-download",
    auth: "free-account",
    tier: 2,
    endpoint: "https://catalogue.dataspace.copernicus.eu/odata/v1/Products",
    portal: "https://browser.dataspace.copernicus.eu/",
    docs: "https://documentation.dataspace.copernicus.eu/APIs/OData.html",
    provides: [
      "Full-product download of every Sentinel mission (SAFE archives)",
      "Rich OData filtering on attributes (cloud cover, orbit, tile id)",
      "S3-compatible bucket access for account holders",
    ],
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$top=1",
      note: "200, returned an S3A product record. Metadata queries are anonymous; $value download needs an OAuth2 token.",
    },
    useWhen:
      "You need the complete original SAFE product — all bands, all metadata — rather than the cloud-optimised subset.",
    howTo:
      "Filter with OData syntax: ?$filter=Collection/Name eq 'SENTINEL-2' and ContainsData(...)&$top=20. To download, get an OAuth2 token from identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token with a free account, then GET Products(<id>)/$value.",
    gotchas: [
      "/odata/v1/Collections does not exist and returns 404 — the entity set is Products.",
      "OData filter strings must be URL-encoded carefully; `$` and spaces break naive clients.",
      "SAFE archives are 500 MB–8 GB. Use the STAC COG route unless you genuinely need every band.",
    ],
    requiredEnvVars: ["CDSE_CLIENT_ID", "CDSE_CLIENT_SECRET"],
    seeAlso: ["cdse-stac", "earth-search"],
  },

  // ── Tier 3 — regional and mission-specific. ──────────────────────────────
  {
    id: "jaxa-earth",
    name: "JAXA Earth Observation (EORC / G-Portal)",
    agency: "JAXA",
    country: "JP",
    kind: "portal",
    auth: "free-account",
    tier: 3,
    endpoint: "https://gportal.jaxa.jp/gpr/search",
    portal: "https://earth.jaxa.jp/",
    docs: "https://gportal.jaxa.jp/gpr/information/tutorial",
    provides: [
      "ALOS / ALOS-2 / ALOS-4 PALSAR L-band SAR",
      "GCOM-W (soil moisture, sea ice) and GCOM-C (ocean colour, LST)",
      "GSMaP global precipitation, hourly",
      "Himawari-8/9 geostationary imagery (10-minute full disk over Asia-Pacific)",
    ],
    resolution: "10 m (ALOS-2) – 10 km (GSMaP)",
    latency: "~20 min (Himawari) – days",
    coverage: "Global, with the densest Asia-Pacific record",
    verified: {
      at: "2026-09-06",
      status: "manual",
      note: "G-Portal requires an account and an SFTP/HTTPS session; not usefully probeable anonymously. GSMaP browse at sharaku.eorc.jaxa.jp is public.",
    },
    useWhen:
      "You are working in Asia-Pacific and need 10-minute geostationary cadence (Himawari) or L-band SAR that penetrates vegetation canopy better than Sentinel-1's C-band.",
    howTo:
      "Register a free G-Portal account, then use its SFTP endpoint for bulk retrieval. For Himawari specifically, the far easier path is the AWS Open Data mirror (noaa-himawari8/9 buckets, anonymous S3) or the JAXA Himawari Monitor tiles. For ALOS PALSAR RTC, ASF Vertex (tier 2) is the least painful route.",
    gotchas: [
      "G-Portal's browser UI is slow and its API is thin — script against SFTP, not the web app.",
      "Himawari full-disk files are large and land every 10 minutes; subset before you archive anything.",
    ],
    seeAlso: ["asf-search"],
  },
  {
    id: "isro-bhoonidhi",
    name: "ISRO Bhoonidhi / NRSC",
    agency: "ISRO (NRSC)",
    country: "IN",
    kind: "portal",
    auth: "free-account",
    tier: 3,
    endpoint: "https://bhoonidhi.nrsc.gov.in/bhoonidhi/index.html",
    portal: "https://bhuvan.nrsc.gov.in/",
    docs: "https://bhoonidhi.nrsc.gov.in/",
    provides: [
      "ResourceSat-2/2A (LISS-III 23.5 m, LISS-IV 5.8 m, AWiFS 56 m)",
      "CartoSat-1/2/3 (up to 0.25 m panchromatic)",
      "EOS-04 (RISAT) C-band SAR, Oceansat-3",
      "INSAT-3D/3DR geostationary meteorology",
    ],
    resolution: "0.25 m – 56 m",
    latency: "1–3 days",
    coverage: "Strongest over India and South Asia; some global datasets",
    verified: {
      at: "2026-09-06",
      status: "manual",
      note: "Portal-based with session auth and rate limits. Not anonymously probeable.",
    },
    useWhen:
      "Your area of interest is South Asia and you need higher resolution than Sentinel-2's 10 m without paying commercial rates.",
    howTo:
      "Register at Bhoonidhi, then use the community CLI `bhoonidhi-downloader` (pip install bhoonidhi-downloader) — it handles the session auth and rate limiting that make the raw portal painful to script. See `docs/data-sources.md` for the ISRO tooling notes.",
    gotchas: [
      "Access policy varies per product; some datasets are India-only or research-use-only. Check licensing before redistributing.",
      "The portal aggressively rate-limits scripted requests — the CLI backs off correctly, hand-rolled loops get banned.",
    ],
    seeAlso: ["earth-search"],
  },
  {
    id: "cnsa-geo",
    name: "CNSA-GEO Open Data (Gaofen series)",
    agency: "China National Space Administration",
    country: "CN",
    kind: "portal",
    auth: "free-account",
    tier: 3,
    portal: "https://www.cnsageo.com/",
    provides: [
      "Gaofen-1 / Gaofen-6 wide-field imagery at 16 m, shared globally",
      "Selected higher-resolution GF scenes on request",
    ],
    resolution: "16 m (open global tier); 2 m and finer on the gated tier",
    latency: "Days to weeks",
    coverage: "Global for the 16 m tier; densest over China",
    verified: {
      at: "2026-09-06",
      status: "manual",
      note: "Registration-gated portal, no documented public API. Listed for completeness.",
    },
    useWhen:
      "You need an independent optical source to cross-check Sentinel/Landsat, or a gap-fill where both were cloudy.",
    howTo:
      "Register on the CNSA-GEO portal and download through the web UI. Treat this as a manual, occasional supplement — there is no API to build a pipeline on.",
    gotchas: [
      "The portal is primarily Chinese-language and there is no stable machine interface.",
      "At 16 m it is coarser than Sentinel-2's 10 m — reach for it for redundancy, not detail.",
    ],
  },

  // ── Tier 4 — documented so you don't waste time rediscovering. ───────────
  {
    id: "scihub-legacy",
    name: "Copernicus Open Access Hub (SciHub) — RETIRED",
    agency: "ESA",
    country: "EU",
    kind: "bulk-download",
    auth: "free-account",
    tier: 4,
    portal: "https://dataspace.copernicus.eu/",
    provides: ["Nothing — service decommissioned"],
    verified: {
      at: "2026-09-06",
      status: "deprecated",
      note: "scihub.copernicus.eu and apihub have been shut down and replaced by the Copernicus Data Space Ecosystem.",
    },
    useWhen: "Never. Present only so old tutorials pointing here are recognisable as stale.",
    howTo:
      "Migrate to `cdse-stac` (keyless search) or `cdse-odata` (full product download). The `sentinelsat` Python package targeted this API and is likewise obsolete.",
    seeAlso: ["cdse-stac", "cdse-odata"],
  },
];
