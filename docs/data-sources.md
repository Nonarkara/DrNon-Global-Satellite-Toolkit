# Data Sources — Curated and Verified

> **Generated from [`src/sources/`](../src/sources/). Do not edit by hand** —
> run `npm run docs:sources` after changing the registry.

Every source below was probed against the live internet. 38 entries; **21 need no credentials at all**. Re-verify at any time with `npm run probe`.

## At a glance

| Source | Tier | Kind | Auth | Status |
|---|---|---|---|---|
| [CelesTrak GP (orbital elements)](#celestrak-gp-orbital-elements) | 1 | rest-api | No credentials | 🟢 verified working |
| [Copernicus Data Space Ecosystem — STAC](#copernicus-data-space-ecosystem-stac) | 1 | stac-api | No credentials | 🟢 verified working |
| [deck.gl](#deck-gl) | 1 | library | No credentials | 🟢 verified working |
| [Earth Search (Element 84 / AWS Open Data)](#earth-search-element-84-aws-open-data) | 1 | stac-api | No credentials | 🟢 verified working |
| [GDELT 2.0 Document & Event API](#gdelt-2-0-document-event-api) | 1 | rest-api | No credentials | 🟢 verified working |
| [leafmap](#leafmap) | 1 | library | No credentials | 🟢 verified working |
| [MapLibre GL JS](#maplibre-gl-js) | 1 | library | No credentials | 🟢 verified working |
| [Microsoft Planetary Computer STAC](#microsoft-planetary-computer-stac) | 1 | stac-api | No credentials | 🟢 verified working |
| [NASA CMR STAC](#nasa-cmr-stac) | 1 | stac-api | No credentials | 🟢 verified working |
| [NASA EONET (Earth Observatory Natural Event Tracker)](#nasa-eonet-earth-observatory-natural-event-tracker) | 1 | rest-api | No credentials | 🟢 verified working |
| [NASA GIBS (Global Imagery Browse Services)](#nasa-gibs-global-imagery-browse-services) | 1 | tile-service | No credentials | 🟢 verified working |
| [odc-stac](#odc-stac) | 1 | library | No credentials | 🟢 verified working |
| [Open-Meteo Air Quality API](#open-meteo-air-quality-api) | 1 | rest-api | No credentials | 🟢 verified working |
| [OpenSky Network](#opensky-network) | 1 | rest-api | Free account | 🟢 verified working |
| [pystac-client](#pystac-client) | 1 | library | No credentials | 🟢 verified working |
| [TiTiler (public demo instance)](#titiler-public-demo-instance) | 1 | tile-service | No credentials | 🟢 verified working |
| [TiTiler (self-hosted)](#titiler-self-hosted) | 1 | library | No credentials | 🟢 verified working |
| [ASF Vertex Search API (Alaska Satellite Facility)](#asf-vertex-search-api-alaska-satellite-facility) | 2 | rest-api | Free account | 🟢 verified working |
| [asf_search (Python)](#asf-search-python) | 2 | library | Free account | 🟢 verified working |
| [bhoonidhi-downloader](#bhoonidhi-downloader) | 2 | library | Free account | 🟢 verified working |
| [Copernicus Data Space — OData & OpenSearch](#copernicus-data-space-odata-opensearch) | 2 | bulk-download | Free account | 🟢 verified working |
| [ESA SNAP Engine](#esa-snap-engine) | 2 | library | No credentials | 🟢 verified working |
| [geemap](#geemap) | 2 | library | Free account | 🟢 verified working |
| [NASA Earthdata Search / CMR](#nasa-earthdata-search-cmr) | 2 | rest-api | Free account | 🟢 verified working |
| [NASA FIRMS (Fire Information for Resource Management)](#nasa-firms-fire-information-for-resource-management) | 2 | rest-api | Free key, instant | 🔑 reachable, needs credentials |
| [OpenAQ v3](#openaq-v3) | 2 | rest-api | Free key, instant | 🔑 reachable, needs credentials |
| [opengeos/geospatial-data-catalogs](#opengeos-geospatial-data-catalogs) | 2 | library | No credentials | 🟢 verified working |
| [Space-Track (18th Space Defense Squadron)](#space-track-18th-space-defense-squadron) | 2 | rest-api | Free account | 🔑 reachable, needs credentials |
| [sparkgeo/geo-mcp-servers](#sparkgeo-geo-mcp-servers) | 2 | mcp-server | No credentials | 🟢 verified working |
| [USGS EarthExplorer / M2M API](#usgs-earthexplorer-m2m-api) | 2 | bulk-download | Free account | 🔑 reachable, needs credentials |
| [World Air Quality Index (AQICN / WAQI)](#world-air-quality-index-aqicn-waqi) | 2 | rest-api | Free key, instant | 🔑 reachable, needs credentials |
| [CNSA-GEO Open Data (Gaofen series)](#cnsa-geo-open-data-gaofen-series) | 3 | portal | Free account | ⚪ not machine-probeable |
| [Community scene downloaders (landsat-download, Optical-Downloader)](#community-scene-downloaders-landsat-download-optical-downloader) | 3 | library | No credentials | 🟢 verified working |
| [ISRO Bhoonidhi / NRSC](#isro-bhoonidhi-nrsc) | 3 | portal | Free account | ⚪ not machine-probeable |
| [JAXA Earth Observation (EORC / G-Portal)](#jaxa-earth-observation-eorc-g-portal) | 3 | portal | Free account | ⚪ not machine-probeable |
| [stackstac](#stackstac) | 3 | library | No credentials | 🟢 verified working |
| [Copernicus Open Access Hub (SciHub) — RETIRED](#copernicus-open-access-hub-scihub-retired) | 4 | bulk-download | Free account | 🔴 dead or superseded |
| [ReliefWeb API](#reliefweb-api) | 4 | rest-api | Human approval required | 🔴 dead or superseded |

## Which source for which question

| I need… | Use |
|---|---|
| Recent optical imagery, anywhere, right now | `earth-search` (10 m Sentinel-2, keyless COGs) |
| A multi-decade time series | `planetary-computer` (Landsat back to 1982) |
| To see through cloud or work at night | `asf-search` (Sentinel-1 / ALOS SAR) |
| A daily global basemap with zero processing | `nasa-gibs-wmts` |
| Those pixels on a slippy map in one step | `titiler-public` → self-host `titiler` |
| Active fires and burning-season haze | `nasa-firms` (free key) |
| Air quality anywhere, including unmonitored areas | `open-meteo-aqi` (keyless model) |
| Air quality actually measured by instruments | `openaq` or `aqicn` (free keys) |
| Curated natural-disaster events | `nasa-eonet` (keyless) |
| What people are reporting about an event | `gdelt` (keyless, throttled) |
| Satellite overpass prediction | `celestrak` (keyless) |
| Live aircraft positions | `opensky` |
| Atmospheric chemistry (NO₂, SO₂, CH₄) | `cdse-stac` → Sentinel-5P |
| Higher resolution over South Asia | `isro-bhoonidhi` via `bhoonidhi-downloader` |
| 10-minute cadence over Asia-Pacific | `jaxa-earth` → Himawari |
| To explore before committing to code | `leafmap` in a notebook |
| An AI agent to query catalogs in natural language | `geo-mcp-servers` |

## Tier 1 — Start here

Keyless, global, stable and actively maintained. Everything in this tier works from a cold clone with no signup. If you are building something new, build it on these.

#### CelesTrak GP (orbital elements)

`celestrak` · CelesTrak / Dr T.S. Kelso · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You need to know where a satellite is, or predict when one will next pass over your area of interest.

**Provides**
- TLE / OMM orbital elements for ~30,000 tracked objects
- Grouped feeds: stations, active satellites, weather, GNSS, Starlink, debris
- SupGP supplemental elements from operators

| | |
|---|---|
| Latency | Updated several times daily |
| Coverage | All catalogued Earth-orbiting objects |
| Endpoint | `https://celestrak.org/NORAD/elements/gp.php` |
| Portal | https://celestrak.org/ |
| Docs | https://celestrak.org/NORAD/documentation/gp-data-formats.php |

**How to use it.** GET gp.php with `GROUP=` (stations, active, weather, science…) or `CATNR=` for one object, and `FORMAT=json|tle|xml`. Propagate with an SGP4 library (`satellite.js` in the browser, `sgp4`/`skyfield` in Python) — TLEs are not positions, they are inputs to a propagator.

**Gotchas**
- CelesTrak asks you to cache and not re-fetch more than a few times a day. Repeated hammering gets your IP blocked.
- TLE accuracy decays; elements older than ~a week give visibly wrong positions.

<sub>Last probed 2026-09-06 — 200, 9298 B of JSON orbital elements. Fully anonymous.</sub>

<sub>See also: `space-track`</sub>

#### Copernicus Data Space Ecosystem — STAC

`cdse-stac` · ESA / European Commission · EU · **No credentials** · 🟢 verified working

**Use when:** You need the authoritative ESA source — newest Sentinel processing baselines, Sentinel-5P atmospheric chemistry, or full CCM.

**Provides**
- Sentinel-1 (C-band SAR, all-weather)
- Sentinel-2 L1C/L2A (10 m optical)
- Sentinel-3 (ocean/land surface temperature, colour)
- Sentinel-5P (NO2, SO2, CO, CH4, aerosol)
- Copernicus Contributing Missions (CCM)

| | |
|---|---|
| Resolution | 10 m (S2) – 7 km (S5P) |
| Latency | 3 h (NRT) – 24 h |
| Coverage | Global, richest over Europe |
| Endpoint | `https://stac.dataspace.copernicus.eu/v1` |
| Portal | https://dataspace.copernicus.eu/ |
| Docs | https://documentation.dataspace.copernicus.eu/APIs/STAC.html |

**How to use it.** Browse /v1/collections, then POST /v1/search. Metadata and search are open. Downloading the product bytes requires a free CDSE account (OAuth2 client-credentials against identity.dataspace.copernicus.eu). For keyless pixels, search here and fetch the equivalent scene from Earth Search.

**Gotchas**
- Asset hrefs are `s3://eodata/...` object URIs, not HTTPS. A public tiler cannot read them, so CDSE scenes have no browser preview in this toolkit — search here, then fetch the matching scene from Earth Search for pixels.
- The old OData root https://catalogue.dataspace.copernicus.eu/odata/v1/Collections is a 404 — the resource is /odata/v1/Products.
- SciHub and the Open Access Hub are retired. Anything pointing at scihub.copernicus.eu is dead.
- Sentinel-5P is ~7 km/pixel: national and regional signal, never street level.

<sub>Last probed 2026-09-06 — 200, 59 KB collection list. Search returned S2B scenes over Bangkok. Metadata is open; product download needs an account.</sub>

<sub>See also: `earth-search`, `cdse-odata`</sub>

#### deck.gl

`deckgl` · vis.gl / OpenJS Foundation · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** Rendering more points than the DOM can handle — thousands of fire detections, aircraft or stations at 60 fps.

**Provides**
- WebGL2/WebGPU layer framework for large geospatial datasets
- TileLayer, BitmapLayer, ScatterplotLayer, H3, hexbin aggregation

| | |
|---|---|
| Portal | https://github.com/visgl/deck.gl |
| Docs | https://deck.gl/docs |

**How to use it.** Already a dependency. Layer factories live in `src/engine/map-engine.ts` (GIBS/WMTS, fire points) and `src/engine/cog-layer.ts` (STAC COG imagery).

**Gotchas**
- Needs `transpilePackages` in next.config.mjs under Next.js — already configured here.

<sub>Last probed 2026-09-06 — ★14558, last push 2026-09-05. This toolkit's rendering layer.</sub>

<sub>See also: `maplibre`</sub>

#### Earth Search (Element 84 / AWS Open Data)

`earth-search` · Element 84 on AWS Open Data (hosts ESA + USGS archives) · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want recent optical imagery over any point on Earth and you want it working in the next five minutes with no signup.

**Provides**
- Sentinel-2 L2A (surface reflectance, cloud-optimised)
- Sentinel-2 L1C
- Sentinel-1 GRD (C-band SAR)
- Landsat Collection 2 L2
- Copernicus DEM
- NAIP aerial (US only)

| | |
|---|---|
| Resolution | 10 m (S2 visible/NIR), 20–60 m (other S2 bands), 30 m (Landsat) |
| Latency | ~12–24 h after acquisition |
| Coverage | Global |
| Endpoint | `https://earth-search.aws.element84.com/v1` |
| Portal | https://element84.com/earth-search/ |
| Docs | https://github.com/Element84/earth-search |

**How to use it.** POST a STAC search to /v1/search with `collections`, `bbox` and `datetime`. Each returned feature's `assets.visual.href` is a public COG you can read directly over HTTP range requests, or hand to a dynamic tiler for XYZ tiles. This is the default backend of `src/stac/client.ts`.

**Gotchas**
- Sort by `eo:cloud_cover` — the newest scene is very often the cloudiest, especially in the SEA monsoon.
- Scenes are MGRS tiles (~110 km), so a city bbox usually spans 2–4 tiles that must be mosaicked.
- Coverage starts ~2015 for Sentinel-2. For anything earlier use Landsat.

<sub>Last probed 2026-09-06 — 200, 3 features returned for Bangkok. Assets are anonymously readable public COGs (HTTP Range GET → 206).</sub>

<sub>See also: `planetary-computer`, `titiler-public`</sub>

#### GDELT 2.0 Document & Event API

`gdelt` · GDELT Project · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want the human-reported context around what the satellites are showing — the flood in the imagery, described by local press.

**Provides**
- Worldwide news monitoring in 65+ languages, updated every 15 minutes
- Geocoded events, tone and theme scoring
- Article search with country, language and time filters

| | |
|---|---|
| Latency | 15 minutes |
| Coverage | Global |
| Endpoint | `https://api.gdeltproject.org/api/v2/doc/doc` |
| Portal | https://www.gdeltproject.org/ |
| Docs | https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/ |

**How to use it.** GET /doc/doc with `query` (supports `sourcecountry:`, `theme:`, `near:`), `mode=artlist|timelinevol|geo`, `format=json`, `maxrecords`. `mode=geo` returns mappable GeoJSON directly.

**Gotchas**
- Rate limits are real and undocumented — one call every few seconds, with backoff. A 429 on first call is common.
- No API key means no quota to raise. Cache results server-side; never poll from the browser.
- Free-text queries pick up a lot of noise. Always constrain by country or theme.

<sub>Last probed 2026-09-06 — First probe returned 429 (rate limited), retry returned 200 with articles. Throttle your calls.</sub>

#### leafmap

`leafmap` · opengeos (Qiusheng Wu) · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** Exploring and prototyping before you commit anything to the dashboard. Fastest path from 'I wonder' to a picture.

**Provides**
- Interactive geospatial mapping in Jupyter with almost no boilerplate
- Built-in STAC search, COG display, split-screen comparison, basemaps
- Backends for folium, ipyleaflet, MapLibre and deck.gl

| | |
|---|---|
| Portal | https://github.com/opengeos/leafmap |
| Docs | https://leafmap.org/ |

**How to use it.** pip install leafmap, then `m = leafmap.Map(); m.add_stac_layer(url=item_url, bands=['red','green','blue'])`. `leafmap.stac_search(...)` wraps pystac-client with a map UI. Notebook provided at `ingestion/notebooks/explore.ipynb`.

**Gotchas**
- Pulls a large dependency tree. Keep it in the Python ingestion environment, out of the Next.js app.

<sub>Last probed 2026-09-06 — ★3771, last push 2026-08-31. The most active EO notebook-mapping package.</sub>

<sub>See also: `geemap`, `pystac-client`</sub>

#### MapLibre GL JS

`maplibre` · MapLibre organisation · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want a proper vector basemap without a Mapbox account or usage billing.

**Provides**
- Open-source vector-tile basemap renderer, no vendor token required
- Drop-in interop with deck.gl via MapboxOverlay

| | |
|---|---|
| Portal | https://github.com/maplibre/maplibre-gl-js |
| Docs | https://maplibre.org/maplibre-gl-js/docs/ |

**How to use it.** Free styles from demotiles.maplibre.org or basemaps.cartocdn.com need no key. The toolkit's basemap fallback chain in `src/basemaps/basemap-catalog.ts` prefers keyless styles and only uses Mapbox if a token happens to be set.

<sub>Last probed 2026-09-06 — ★11544, last push 2026-09-05.</sub>

<sub>See also: `deckgl`</sub>

#### Microsoft Planetary Computer STAC

`planetary-computer` · Microsoft · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You need the deepest catalog breadth — long Landsat time series, DEMs, land cover, climate — from one STAC endpoint.

**Provides**
- Sentinel-1/2/3/5P
- Landsat Collection 2 L2 (1982→present)
- MODIS, VIIRS, HLS
- Copernicus DEM, ESA WorldCover, ALOS DEM
- 126+ curated collections including climate and biodiversity

| | |
|---|---|
| Resolution | 10 m – 1 km depending on collection |
| Latency | hours to days by collection |
| Coverage | Global |
| Endpoint | `https://planetarycomputer.microsoft.com/api/stac/v1` |
| Portal | https://planetarycomputer.microsoft.com/catalog |
| Docs | https://planetarycomputer.microsoft.com/docs/quickstarts/reading-stac/ |

**How to use it.** Search anonymously against /api/stac/v1/search exactly like Earth Search. Asset hrefs point at Azure Blob and must be signed before reading: GET https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=<asset-href> returns a time-limited URL. Signing is free and needs no account. In Python, `planetary-computer.sign(item)` does this for you.

**Gotchas**
- Unsigned asset hrefs return 404 — signing is not optional, it just isn't authenticated.
- SAS tokens expire (~1 h). Sign at read time, never cache a signed URL in a database.

<sub>Last probed 2026-09-06 — 200, 3 Landsat 9 features over Bangkok. Search is fully anonymous.</sub>

<sub>See also: `earth-search`</sub>

#### NASA CMR STAC

`nasa-cmr-stac` · NASA (Common Metadata Repository) · US · **No credentials** · 🟢 verified working

**Use when:** You need a NASA mission that isn't Landsat — atmospheric, cryosphere, biomass, soil moisture, altimetry.

**Provides**
- STAC view over the entire NASA Earthdata holdings
- MODIS, VIIRS, ASTER, SMAP, GEDI, ICESat-2
- HLS (harmonised Landsat + Sentinel-2, 30 m)
- Per-DAAC sub-catalogs (LPCLOUD, POCLOUD, ASF, …)

| | |
|---|---|
| Resolution | 30 m – 25 km depending on mission |
| Latency | 3 h (NRT products) – days |
| Coverage | Global |
| Endpoint | `https://cmr.earthdata.nasa.gov/stac` |
| Portal | https://search.earthdata.nasa.gov/ |
| Docs | https://github.com/nasa/cmr-stac |

**How to use it.** The root is a catalog of catalogs, one per DAAC. Pick a provider (e.g. /stac/LPCLOUD) and search that child's /search endpoint. For the widest analysis-ready optical record use collection HLSL30/HLSS30 in LPCLOUD.

**Gotchas**
- Search is open, but downloading most DAAC assets requires a free Earthdata Login and a .netrc or bearer token.
- There is no single global /search — you must target a provider catalog.

<sub>Last probed 2026-09-06 — 200, root catalog listing per-DAAC child catalogs.</sub>

<sub>See also: `nasa-earthdata`, `nasa-gibs-wmts`</sub>

#### NASA EONET (Earth Observatory Natural Event Tracker)

`nasa-eonet` · NASA · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want a clean, de-duplicated list of significant natural events rather than a raw firehose of sensor detections.

**Provides**
- Curated natural events as GeoJSON: wildfires, storms, volcanoes, floods, icebergs
- Each event linked to the GIBS imagery layers that show it
- Open and closed event history

| | |
|---|---|
| Latency | Hours to a day (human-curated) |
| Coverage | Global |
| Endpoint | `https://eonet.gsfc.nasa.gov/api/v3/events` |
| Portal | https://eonet.gsfc.nasa.gov/ |
| Docs | https://eonet.gsfc.nasa.gov/docs/v3 |

**How to use it.** GET /api/v3/events with `category` (wildfires, severeStorms, volcanoes, floods…), `status=open|closed`, `days`, and `bbox`. Response is event-shaped GeoJSON with a geometry time series — ideal for a dashboard alert feed. Pairs naturally with GIBS: each event carries the layer names that visualise it.

**Gotchas**
- Curated, so it is authoritative but lags raw detections by hours. For fire response speed use FIRMS instead.
- bbox order is lon-min, lat-MAX, lon-max, lat-MIN — upper-left then lower-right, not the usual STAC order.

<sub>Last probed 2026-09-06 — 200, 87983 B of curated global events. No key.</sub>

<sub>See also: `nasa-firms`, `nasa-gibs-wmts`</sub>

#### NASA GIBS (Global Imagery Browse Services)

`nasa-gibs-wmts` · NASA · US · **No credentials** · 🟢 verified working

**Use when:** You want a daily global basemap or a fast visual answer to 'what did Earth look like there yesterday' — no processing, no keys, instant tiles.

**Provides**
- 1000+ pre-rendered global imagery layers as XYZ/WMTS tiles
- MODIS & VIIRS true colour, updated daily
- Fire/thermal anomalies, aerosol, land surface temperature
- Near-real-time layers ~3 h behind acquisition

| | |
|---|---|
| Resolution | 250 m – 2 km (browse imagery, not analysis-grade) |
| Latency | ~3 h (NRT) |
| Coverage | Global, daily, back to 2000 for MODIS |
| Endpoint | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml` |
| Portal | https://worldview.earthdata.nasa.gov/ |
| Docs | https://nasa-gibs.github.io/gibs-api-docs/ |

**How to use it.** Use the XYZ template directly in deck.gl/MapLibre: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg — e.g. layer `MODIS_Terra_CorrectedReflectance_TrueColor`, time `2026-09-05`, matrix set `GoogleMapsCompatible_Level9`. Wired up in `src/engine/map-engine.ts`.

**Gotchas**
- Tile path order is {z}/{y}/{x} — y before x. Getting this backwards is the single most common GIBS bug.
- Each layer has its own max zoom level; requesting beyond it returns blank tiles, not an error.
- This is browse imagery. Never derive quantitative indices (NDVI, LST) from GIBS tiles — use the STAC COGs instead.

<sub>Last probed 2026-09-06 — 200, 5.8 MB capabilities document.</sub>

<sub>See also: `nasa-cmr-stac`, `earth-search`</sub>

#### odc-stac

`odc-stac` · Open Data Cube · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You have STAC search results and want an analysis-ready time-series cube without writing GDAL warping code.

**Provides**
- Loads STAC items straight into an xarray Dataset
- Lazy Dask-backed reads, reprojection and mosaicking on the fly

| | |
|---|---|
| Portal | https://github.com/opendatacube/odc-stac |
| Docs | https://odc-stac.readthedocs.io/ |

**How to use it.** `odc.stac.load(items, bands=['red','green','blue','nir'], crs='EPSG:4326', resolution=0.0001, bbox=bbox, chunks={})` returns a lazy xarray Dataset. Compute NDVI as a plain array expression. Preferred over `stackstac`, which has not been updated since 2024.

**Gotchas**
- Always pass `chunks={}` for large areas, otherwise it loads everything into RAM at once.
- Planetary Computer items must be signed before loading.

<sub>Last probed 2026-09-06 — ★202, last push 2026-09-03. Actively maintained by the Open Data Cube team.</sub>

<sub>See also: `pystac-client`, `rioxarray`</sub>

#### Open-Meteo Air Quality API

`open-meteo-aqi` · Open-Meteo (open-source, CAMS-derived) · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want air quality anywhere on Earth, including places with no ground stations, and you want it working immediately.

**Provides**
- PM2.5, PM10, NO2, SO2, O3, CO — hourly, 5-day forecast + 3-month archive
- European and US AQI indices
- Dust and UV index

| | |
|---|---|
| Resolution | 11 km (CAMS global) / 4 km (CAMS Europe) |
| Latency | Hourly |
| Coverage | Global |
| Endpoint | `https://air-quality-api.open-meteo.com/v1/air-quality` |
| Portal | https://open-meteo.com/en/docs/air-quality-api |

**How to use it.** GET with `latitude`, `longitude` and a comma-separated `hourly` variable list. Add `timezone=auto` for local timestamps. It is a model reanalysis, so it returns values everywhere — including over oceans and unmonitored regions.

**Gotchas**
- Model output, not measurement. For regulatory or ground-truth claims pair it with a station network.
- Non-commercial free tier is ~10k calls/day. Cache aggressively; poll at 15+ minute intervals.

<sub>Last probed 2026-09-06 — 200, 3049 B of hourly PM2.5 for Bangkok. No key, no registration, generous free tier.</sub>

<sub>See also: `openaq`, `aqicn`</sub>

#### OpenSky Network

`opensky` · OpenSky Network (non-profit, ETH Zürich) · GLOBAL · **Free account** · 🟢 verified working

**Use when:** You need live air traffic — airport congestion, airspace closures during a disaster, or a movement layer over your map.

**Provides**
- Live ADS-B aircraft state vectors: position, altitude, velocity, heading
- Flight and track history for registered users
- Airport arrival/departure listings

| | |
|---|---|
| Latency | 5–10 seconds |
| Coverage | Global where volunteer receivers exist; dense over Europe/N. America, thinner over SEA oceans |
| Endpoint | `https://opensky-network.org/api/states/all` |
| Portal | https://opensky-network.org/ |
| Docs | https://openskynetwork.github.io/opensky-api/rest.html |
| Env vars | `OPENSKY_CLIENT_ID`, `OPENSKY_CLIENT_SECRET` |

**How to use it.** GET /api/states/all with a bounding box (`lamin`,`lomin`,`lamax`,`lomax`). Response is a positional array, not objects — index 5 is longitude, 6 is latitude, 7 baro-altitude. Register a free account and use OAuth2 client credentials to lift the rate limit substantially.

**Gotchas**
- Anonymous users get ~400 credits/day and 10-second resolution; it is easy to exhaust in an afternoon of development.
- Always pass a bounding box. Fetching the unbounded global state vector is enormous and burns quota instantly.
- Coverage is volunteer-driven — sparse over oceans and parts of Asia. Absence of aircraft is not absence of flights.

<sub>Last probed 2026-09-06 — 200, 2636 B — live aircraft over Bangkok, anonymously. Anonymous quota is small; register for a usable one.</sub>

#### pystac-client

`pystac-client` · stac-utils · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** Anything Python that needs to find satellite scenes. This is the entry point to the whole modern EO stack.

**Provides**
- Python client for any STAC API — search, pagination, item collections
- CQL2 filtering, works against Earth Search, Planetary Computer, CDSE

| | |
|---|---|
| Portal | https://github.com/stac-utils/pystac-client |
| Docs | https://pystac-client.readthedocs.io/ |

**How to use it.** pip install pystac-client, then `Client.open('https://earth-search.aws.element84.com/v1').search(collections=['sentinel-2-l2a'], bbox=..., datetime=..., query={'eo:cloud_cover': {'lt': 20}})`. Already wired up in `ingestion/stac_search.py`.

**Gotchas**
- `.get_items()` is a lazy generator that will page forever — always set `max_items`.

<sub>Last probed 2026-09-06 — ★207, last push 2026-08-31. The de-facto standard STAC client; used by every serious EO pipeline.</sub>

<sub>See also: `odc-stac`, `earth-search`</sub>

#### TiTiler (public demo instance)

`titiler-public` · Development Seed · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You have a STAC item and want its pixels on a slippy map right now, without downloading a scene or standing up infrastructure.

**Provides**
- On-the-fly XYZ tiles from any public Cloud-Optimised GeoTIFF
- TileJSON, /info, /statistics, band math and rescaling
- STAC item endpoints (/stac/tiles) for multi-asset composites

| | |
|---|---|
| Resolution | Native resolution of the source COG |
| Latency | Real time |
| Coverage | Anything reachable by URL |
| Endpoint | `https://titiler.xyz` |
| Portal | https://titiler.xyz/api.html |
| Docs | https://developmentseed.org/titiler/ |

**How to use it.** URL-encode the COG href and request https://titiler.xyz/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=<encoded>. Call /cog/WebMercatorQuad/tilejson.json first to get correct bounds, minzoom and maxzoom. Wired up in `src/engine/cog-layer.ts`.

**Gotchas**
- titiler.xyz is a courtesy demo with no SLA. Prototype on it; self-host (Docker: ghcr.io/developmentseed/titiler) before anything production.
- Requests outside the COG's footprint return HTTP 404 with `Tile ... is outside bounds`, not a transparent tile — always read bounds from TileJSON first.
- Planetary Computer assets must be SAS-signed before TiTiler can read them. Earth Search assets need no signing.

<sub>Last probed 2026-09-06 — 200 image/png, 72866 B, 256x256 RGBA — real Sentinel-2 pixels over Bangkok with zero credentials.</sub>

<sub>See also: `earth-search`, `planetary-computer`</sub>

#### TiTiler (self-hosted)

`titiler` · Development Seed · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You have moved past prototyping and need reliable raster tiles you control, without the SLA risk of a public demo.

**Provides**
- FastAPI dynamic tile server for COG, STAC items and MosaicJSON
- Band math, rescaling, colormaps, /statistics endpoints

| | |
|---|---|
| Portal | https://github.com/developmentseed/titiler |
| Docs | https://developmentseed.org/titiler/ |

**How to use it.** `docker run -p 8000:8000 ghcr.io/developmentseed/titiler:latest`, then point `NEXT_PUBLIC_TITILER_URL=http://localhost:8000` in .env. The toolkit's COG layer reads that variable and falls back to titiler.xyz when it is unset.

**Gotchas**
- Put a cache in front of it. Every tile request re-reads byte ranges from the source COG.

<sub>Last probed 2026-09-06 — ★1170, last push 2026-09-05. Actively developed; the public demo at titiler.xyz was probed serving real Sentinel-2 tiles.</sub>

<sub>See also: `titiler-public`, `earth-search`</sub>

## Tier 2 — Worth the signup

Excellent sources that need a free key or account, or that cover a narrower scope. Most keys here are issued instantly.

#### ASF Vertex Search API (Alaska Satellite Facility)

`asf-search` · NASA DAAC operated by University of Alaska Fairbanks · US · **Free account** · 🟢 verified working

**Use when:** Cloud is blocking your optical view — monsoon floods, night-time events, subsidence, deforestation under haze. SAR sees through all of it.

**Provides**
- Sentinel-1 A/B/C SAR (SLC, GRD, OCN)
- ALOS PALSAR (JAXA L-band, incl. the free RTC archive)
- RADARSAT-1 (CSA)
- ERS-1/2, JERS-1, SIR-C, UAVSAR, NISAR

| | |
|---|---|
| Resolution | 3 m – 100 m depending on mode |
| Latency | hours to days |
| Coverage | Global |
| Endpoint | `https://api.daac.asf.alaska.edu/services/search/param` |
| Portal | https://search.asf.alaska.edu/ |
| Docs | https://docs.asf.alaska.edu/api/basics/ |
| Env vars | `EARTHDATA_USER`, `EARTHDATA_PASS` |

**How to use it.** Search is a plain GET with query params (`platform`, `bbox`/`intersectsWith`, `start`, `end`, `processingLevel`, `output=json|geojson`). Downloads require a free NASA Earthdata Login supplied via .netrc. In Python use `asf_search` (pip install asf-search) rather than hand-rolling.

**Gotchas**
- This is the only free route to RADARSAT-1; CSA does not run an open portal of its own.
- Sentinel-1 SLC scenes are ~4–8 GB each. Filter hard before you download anything.
- Raw SAR is not a picture. Budget for calibration + terrain correction (SNAP, or the pre-made ALOS RTC products).

<sub>Last probed 2026-09-06 — 200, 2635 B of scene metadata. Search is open; download needs Earthdata Login.</sub>

<sub>See also: `snap-engine`, `nasa-earthdata`</sub>

#### asf_search (Python)

`asf-search-py` · Alaska Satellite Facility · US · **Free account** · 🟢 verified working

**Use when:** Any serious Sentinel-1 or ALOS work in Python — especially building InSAR stacks.

**Provides**
- Python search and authenticated download for the full ASF SAR archive
- Baseline stacks for InSAR pair selection

| | |
|---|---|
| Portal | https://github.com/asfadmin/Discovery-asf_search |
| Docs | https://docs.asf.alaska.edu/asf_search/basics/ |

**How to use it.** `pip install asf-search`, then `asf.geo_search(platform=asf.PLATFORM.SENTINEL1, intersectsWith=wkt, start=..., end=...)`. Downloads use an Earthdata session.

**Gotchas**
- Downloads are large; always filter by processingLevel first.

<sub>Last probed 2026-09-06 — Official ASF client; the underlying REST API was probed at 200.</sub>

<sub>See also: `asf-search`, `snap-engine`</sub>

#### bhoonidhi-downloader

`bhoonidhi-downloader` · geovicco-dev (community) · IN · **Free account** · 🟢 verified working

**Use when:** South Asia work needing ResourceSat/CartoSat resolution beyond what Sentinel-2 gives you.

**Provides**
- CLI and Python SDK for ISRO's Bhoonidhi portal
- Handles the session auth and rate limiting the raw portal imposes

| | |
|---|---|
| Portal | https://github.com/geovicco-dev/bhoonidhi-downloader |

**How to use it.** `pip install bhoonidhi-downloader`, then `bhoonidhi search --bbox ... --start ... --end ...` with your Bhoonidhi credentials in the environment.

**Gotchas**
- Single-maintainer project against an undocumented portal — pin the version and expect occasional breakage when ISRO changes the portal.

<sub>Last probed 2026-09-06 — ★19, last push 2026-09-01. Small community project but actively maintained and the only practical scripted route to ISRO data.</sub>

<sub>See also: `isro-bhoonidhi`</sub>

#### Copernicus Data Space — OData & OpenSearch

`cdse-odata` · ESA / European Commission · EU · **Free account** · 🟢 verified working

**Use when:** You need the complete original SAFE product — all bands, all metadata — rather than the cloud-optimised subset.

**Provides**
- Full-product download of every Sentinel mission (SAFE archives)
- Rich OData filtering on attributes (cloud cover, orbit, tile id)
- S3-compatible bucket access for account holders

| | |
|---|---|
| Coverage | Global |
| Endpoint | `https://catalogue.dataspace.copernicus.eu/odata/v1/Products` |
| Portal | https://browser.dataspace.copernicus.eu/ |
| Docs | https://documentation.dataspace.copernicus.eu/APIs/OData.html |
| Env vars | `CDSE_CLIENT_ID`, `CDSE_CLIENT_SECRET` |

**How to use it.** Filter with OData syntax: ?$filter=Collection/Name eq 'SENTINEL-2' and ContainsData(...)&$top=20. To download, get an OAuth2 token from identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token with a free account, then GET Products(<id>)/$value.

**Gotchas**
- /odata/v1/Collections does not exist and returns 404 — the entity set is Products.
- OData filter strings must be URL-encoded carefully; `$` and spaces break naive clients.
- SAFE archives are 500 MB–8 GB. Use the STAC COG route unless you genuinely need every band.

<sub>Last probed 2026-09-06 — 200, returned an S3A product record. Metadata queries are anonymous; $value download needs an OAuth2 token.</sub>

<sub>See also: `cdse-stac`, `earth-search`</sub>

#### ESA SNAP Engine

`snap-engine` · ESA / senbox-org · EU · **No credentials** · 🟢 verified working

**Use when:** You need genuinely analysis-ready SAR — calibrated, speckle-filtered, terrain-corrected — and pre-made RTC products don't cover your scene.

**Provides**
- Reference processing engine for Sentinel-1/2/3 and heritage missions
- SAR calibration, speckle filtering, terrain correction, interferometry
- Scriptable via the gpt command-line graph processor

| | |
|---|---|
| Portal | https://github.com/senbox-org/snap-engine |
| Docs | https://step.esa.int/main/toolboxes/snap/ |

**How to use it.** Install SNAP desktop, build a processing graph in the GUI, export the XML, then batch it: `gpt graph.xml -Pinput=... -Poutput=...`. Wrap that in your ingestion pipeline. Use esa-snappy for Python bindings.

**Gotchas**
- Heavy JVM dependency — keep it in a separate container from the Node app.
- Before building an SAR chain, check whether ASF's pre-processed ALOS/Sentinel-1 RTC products already answer your question. They usually do.

<sub>Last probed 2026-09-06 — ★213, last push 2026-08-26. Java; heavyweight but authoritative.</sub>

<sub>See also: `asf-search`</sub>

#### geemap

`geemap` · gee-community (Qiusheng Wu) · GLOBAL · **Free account** · 🟢 verified working

**Use when:** Continental-scale or multi-decade analysis where downloading scenes is infeasible and you want the compute next to the data.

**Provides**
- Google Earth Engine in Jupyter, with interactive maps and export helpers
- Access to GEE's petabyte-scale preprocessed archive

| | |
|---|---|
| Portal | https://github.com/gee-community/geemap |
| Docs | https://geemap.org/ |

**How to use it.** Requires a free Earth Engine account (non-commercial approval). `pip install geemap`, `ee.Authenticate()`, then `geemap.Map()`. Best for aggregate analysis; export results to your own store for the dashboard rather than calling GEE from the frontend.

**Gotchas**
- Commercial use now requires a paid Google Cloud EE licence — check terms before shipping client work.
- GEE is not a STAC API. Code written against it does not port to Earth Search or Planetary Computer.

<sub>Last probed 2026-09-06 — ★4022, last push 2026-09-04. NOTE: the repo lives at gee-community/geemap — opengeos/geemap is a stale redirect that 404s on the API.</sub>

<sub>See also: `leafmap`, `pystac-client`</sub>

#### NASA Earthdata Search / CMR

`nasa-earthdata` · NASA · US · **Free account** · 🟢 verified working

**Use when:** You know a NASA product exists but not which DAAC holds it, or you need to enumerate what's available before writing a pipeline.

**Provides**
- Unified discovery across every NASA DAAC (~9000 collections)
- Granule-level metadata, temporal and spatial filters
- Direct S3 access credentials for in-region (us-west-2) compute

| | |
|---|---|
| Coverage | Global, all NASA Earth science missions |
| Endpoint | `https://cmr.earthdata.nasa.gov/search` |
| Portal | https://search.earthdata.nasa.gov/ |
| Docs | https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html |
| Env vars | `EARTHDATA_TOKEN` |

**How to use it.** Query collections first (/search/collections.json?keyword=...), note the concept-id, then list granules. Metadata is anonymous; asset downloads need a free Earthdata Login bearer token. Prefer the CMR STAC facade (tier 1) when your tooling already speaks STAC.

**Gotchas**
- Earthdata Login tokens expire; refresh them rather than pinning one in .env forever.
- S3 direct access only works from us-west-2 — from anywhere else you pay egress and it is slower than HTTPS.

<sub>Last probed 2026-09-06 — STAC facade returns 200 anonymously; the classic CMR search API is likewise open for metadata.</sub>

<sub>See also: `nasa-cmr-stac`, `asf-search`</sub>

#### NASA FIRMS (Fire Information for Resource Management)

`nasa-firms` · NASA · GLOBAL · **Free key, instant** · 🔑 reachable, needs credentials

**Use when:** Agricultural burning, wildfire, or haze — this is the canonical global hotspot feed and the backbone of any burning-season dashboard.

**Provides**
- Active fire / thermal anomaly detections from VIIRS (375 m) and MODIS (1 km)
- Near-real-time, 3 hours behind satellite overpass
- Brightness temperature, fire radiative power, confidence class

| | |
|---|---|
| Resolution | 375 m (VIIRS S-NPP/NOAA-20/21), 1 km (MODIS) |
| Latency | ~3 h (NRT), ~1 min for US/Canada (RT) |
| Coverage | Global, multiple overpasses daily |
| Endpoint | `https://firms.modaps.eosdis.nasa.gov/api/area/csv` |
| Portal | https://firms.modaps.eosdis.nasa.gov/ |
| Docs | https://firms.modaps.eosdis.nasa.gov/api/area/ |
| Env vars | `FIRMS_KEY` |

**How to use it.** Request a free MAP_KEY at firms.modaps.eosdis.nasa.gov/api/map_key/ (arrives by email in minutes). Then GET /api/area/csv/{MAP_KEY}/{SOURCE}/{west,south,east,north}/{days} — e.g. source `VIIRS_SNPP_NRT`, area `97,5,106,21` for Thailand, days `1`. Returns CSV; parse to GeoJSON for mapping. Set `FIRMS_KEY` in .env and the `nasa-firms` module goes live automatically.

**Gotchas**
- The area parameter is west,south,east,north — the opposite corner order from many other APIs.
- A 'fire' detection is a thermal anomaly: gas flares, industrial furnaces and hot bare soil all trigger it. Filter by confidence and cross-check against land cover.
- Transaction limit is 5000 per 10 minutes per key. Fetch a country bbox once and cache, don't query per-tile.

<sub>Last probed 2026-09-06 — 400 'Invalid MAP_KEY.' — endpoint is live and correct, it simply requires a real key. Keys are issued instantly and free by email.</sub>

<sub>See also: `nasa-eonet`, `nasa-gibs-wmts`</sub>

#### OpenAQ v3

`openaq` · OpenAQ (non-profit) · GLOBAL · **Free key, instant** · 🔑 reachable, needs credentials

**Use when:** You need actual measured air quality from physical instruments, not model output — for ground-truthing or regulatory reporting.

**Provides**
- Aggregated ground-station air quality measurements from 100+ countries
- PM2.5, PM10, NO2, SO2, O3, CO, BC from reference-grade and low-cost sensors
- Historical archive back to 2016

| | |
|---|---|
| Latency | Varies by provider, typically hourly |
| Coverage | Global where governments publish; strong in EU/US/India, patchy elsewhere |
| Endpoint | `https://api.openaq.org/v3/locations` |
| Portal | https://openaq.org/ |
| Docs | https://docs.openaq.org/ |
| Env vars | `OPENAQ_KEY` |

**How to use it.** Register free at explore.openaq.org to get a key, then send it as an `X-API-Key` header. Find stations with /v3/locations?coordinates=lat,lon&radius=25000, then pull /v3/sensors/{id}/measurements. Set `OPENAQ_KEY` in .env.

**Gotchas**
- v2 is retired and v3 requires a key — this changed and broke a lot of existing code, including this repo's original module.
- Station density is very uneven. Absence of a station is not clean air.

<sub>Last probed 2026-09-06 — 401 without a key. v3 introduced mandatory API keys — older docs and tutorials describing a keyless v2 are out of date.</sub>

<sub>See also: `open-meteo-aqi`, `aqicn`</sub>

#### opengeos/geospatial-data-catalogs

`geospatial-data-catalogs` · opengeos (Qiusheng Wu) · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You are hunting for a dataset and don't yet know which provider holds it.

**Provides**
- Machine-readable index of open datasets across AWS, Earth Engine, Planetary Computer and STAC
- Companion repos: opengeos/aws-open-data, opengeos/stac-index-catalogs

| | |
|---|---|
| Portal | https://github.com/opengeos/geospatial-data-catalogs |

**How to use it.** Clone and grep the JSON catalogs, or read them straight from the raw GitHub URLs. Treat it as a lookup table for discovery, then point this toolkit's STAC client at whichever endpoint it surfaces.

**Gotchas**
- A directory, not a service. Endpoints listed there still need their own verification — several entries elsewhere in the ecosystem are stale.

<sub>Last probed 2026-09-06 — ★661, last push 2026-09-05. Companions verified: aws-open-data ★65, stac-index-catalogs ★22, both updated within days.</sub>

<sub>See also: `earth-search`, `planetary-computer`</sub>

#### Space-Track (18th Space Defense Squadron)

`space-track` · US Space Force · US · **Free account** · 🔑 reachable, needs credentials

**Use when:** CelesTrak's grouped feeds aren't enough — you need the full catalog, historical elements, or conjunction warnings.

**Provides**
- Authoritative NORAD satellite catalog and orbital elements
- Conjunction data messages, decay predictions, launch history
- Deeper history and more objects than CelesTrak's public feeds

| | |
|---|---|
| Coverage | All tracked Earth-orbiting objects |
| Endpoint | `https://www.space-track.org/basicspacedata/query` |
| Portal | https://www.space-track.org/ |
| Docs | https://www.space-track.org/documentation |
| Env vars | `SPACE_TRACK_USER`, `SPACE_TRACK_PASS` |

**How to use it.** POST credentials to /ajaxauth/login to obtain a session cookie, then query /basicspacedata/query/class/gp/... Reuse the session; do not log in per request. Set `SPACE_TRACK_USER` / `SPACE_TRACK_PASS`.

**Gotchas**
- Strict rate limits (≈30 requests/minute, 300/hour). Logging in on every call will get the account suspended.
- Account approval is manual and takes a day or two.
- For most dashboard use CelesTrak (tier 1) is the better answer — no auth, same underlying data.

<sub>Last probed 2026-09-06 — Session-cookie login required on every call. Not anonymously probeable.</sub>

<sub>See also: `celestrak`</sub>

#### sparkgeo/geo-mcp-servers

`geo-mcp-servers` · Sparkgeo · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want an AI agent to answer 'show me cloud-free Sentinel-2 over Bangkok in the last three months' by calling the right STAC API itself.

**Provides**
- Tracked index of 77+ Model Context Protocol servers for geospatial and EO
- Includes stac-mcp, earthdata-mcp, planetary-computer-mcp, copernicus-mcp

| | |
|---|---|
| Portal | https://github.com/sparkgeo/geo-mcp-servers |

**How to use it.** Browse the index, pick a server, and register it in your agent's MCP config. `stac-mcp` is the most general — it speaks to any STAC API, including the four this toolkit ships with. See `AGENTS.md` for how this repo expects an agent to drive it.

**Gotchas**
- An index, not a guarantee. MCP server quality varies widely — check each server's own last-commit date before depending on it.
- Most of these wrap the same STAC endpoints this toolkit already calls directly. Add an MCP server for natural-language access, not for capability you already have.

<sub>Last probed 2026-09-06 — ★83, last push 2026-09-04. Actively curated.</sub>

<sub>See also: `earth-search`, `planetary-computer`</sub>

#### USGS EarthExplorer / M2M API

`usgs-earthexplorer` · USGS · US · **Free account** · 🔑 reachable, needs credentials

**Use when:** You need pre-2015 imagery, the declassified Cold War archive, or an authoritative USGS-issued Landsat product.

**Provides**
- Landsat 1–9 full archive (1972→present), Collection 2 L1/L2
- Declassified CORONA/GAMBIT imagery (1960s–70s)
- SRTM and ASTER DEMs, aerial photography, NAIP

| | |
|---|---|
| Resolution | 15 m (pan) / 30 m (multispectral) for Landsat |
| Latency | ~12–24 h for Landsat 8/9 |
| Coverage | Global, deepest historical optical record that exists |
| Endpoint | `https://m2m.cr.usgs.gov/api/api/json/stable` |
| Portal | https://earthexplorer.usgs.gov/ |
| Docs | https://m2m.cr.usgs.gov/api/docs/json/ |
| Env vars | `USGS_USERNAME`, `USGS_TOKEN` |

**How to use it.** Register at ers.cr.usgs.gov, then request M2M access (approval is manual and can take a day or two). Authenticate via POST /login-token to get an X-Auth-Token header, then use scene-search and download-request. For most modern Landsat work, skip all of this — Earth Search and Planetary Computer serve the same Collection 2 scenes as COGs with no account at all.

**Gotchas**
- M2M access is a separate approval from a plain EROS account, and it is not instant.
- Bulk downloads are order-based and asynchronous, not a simple GET.

<sub>Last probed 2026-09-06 — 403 with an HTML login page — the M2M API requires an approved account token on every call, including discovery.</sub>

<sub>See also: `earth-search`, `planetary-computer`</sub>

#### World Air Quality Index (AQICN / WAQI)

`aqicn` · World Air Quality Index Project · GLOBAL · **Free key, instant** · 🔑 reachable, needs credentials

**Use when:** You want the AQI number the public actually sees on their phone, for a specific named city — especially in Thailand and SEA.

**Provides**
- Real-time AQI from 12,000+ stations in 100+ countries
- Per-city and per-station feeds, plus map-bounds queries
- Dominant pollutant and per-pollutant breakdown

| | |
|---|---|
| Latency | Hourly |
| Coverage | Global, with excellent Thailand and SEA station coverage |
| Endpoint | `https://api.waqi.info/feed` |
| Portal | https://aqicn.org/ |
| Docs | https://aqicn.org/api/ |
| Env vars | `AQICN_TOKEN` |

**How to use it.** Get a free token, then GET https://api.waqi.info/feed/bangkok/?token=<TOKEN>, or /feed/geo:13.75;100.5/. For a whole viewport use /map/bounds/?latlng=lat1,lng1,lat2,lng2&token=. Set `AQICN_TOKEN` in .env.

**Gotchas**
- AQI is a country-specific index, not a concentration. Compare µg/m³ across borders, never raw AQI.
- The published station list mixes reference-grade monitors with low-cost sensors of varying quality.

<sub>Last probed 2026-09-06 — Requires a free token issued instantly at aqicn.org/data-platform/token/. The public demo token is heavily throttled.</sub>

<sub>See also: `open-meteo-aqi`, `openaq`</sub>

## Tier 3 — Specialist and regional

Reach for these when tiers 1 and 2 cannot answer the question — higher resolution over a specific region, a particular sensor, or a national archive.

#### CNSA-GEO Open Data (Gaofen series)

`cnsa-geo` · China National Space Administration · CN · **Free account** · ⚪ not machine-probeable

**Use when:** You need an independent optical source to cross-check Sentinel/Landsat, or a gap-fill where both were cloudy.

**Provides**
- Gaofen-1 / Gaofen-6 wide-field imagery at 16 m, shared globally
- Selected higher-resolution GF scenes on request

| | |
|---|---|
| Resolution | 16 m (open global tier); 2 m and finer on the gated tier |
| Latency | Days to weeks |
| Coverage | Global for the 16 m tier; densest over China |
| Portal | https://www.cnsageo.com/ |

**How to use it.** Register on the CNSA-GEO portal and download through the web UI. Treat this as a manual, occasional supplement — there is no API to build a pipeline on.

**Gotchas**
- The portal is primarily Chinese-language and there is no stable machine interface.
- At 16 m it is coarser than Sentinel-2's 10 m — reach for it for redundancy, not detail.

<sub>Last probed 2026-09-06 — Registration-gated portal, no documented public API. Listed for completeness.</sub>

#### Community scene downloaders (landsat-download, Optical-Downloader)

`reference-downloaders` · Independent contributors · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You want to read a worked example of the search → cloud-mask → clip → composite pipeline before writing your own.

**Provides**
- landsat-download: bulk Landsat 4–9 C2 L2 with automatic composites and indices
- Optical-Downloader: least-cloudy Sentinel-2/Landsat scene, cloud-masked and clipped

| | |
|---|---|
| Portal | https://github.com/gorniakgrzegorz/landsat-download |

**How to use it.** Read the source for the pattern; both use Planetary Computer STAC underneath, which this toolkit already talks to. Reimplement the ~40 lines you need with pystac-client + odc-stac rather than taking a dependency on a zero-star single-maintainer package.

**Gotchas**
- Not battle-tested. Do not put either in a production requirements.txt — treat them as reference implementations.

<sub>Last probed 2026-09-06 — Both repos exist and were pushed within the last month, but each has 0 stars and a single contributor. landsat-download ★0 (2026-08-24), Optical-Downloader ★0 (2026-08-28).</sub>

<sub>See also: `pystac-client`, `odc-stac`</sub>

#### ISRO Bhoonidhi / NRSC

`isro-bhoonidhi` · ISRO (NRSC) · IN · **Free account** · ⚪ not machine-probeable

**Use when:** Your area of interest is South Asia and you need higher resolution than Sentinel-2's 10 m without paying commercial rates.

**Provides**
- ResourceSat-2/2A (LISS-III 23.5 m, LISS-IV 5.8 m, AWiFS 56 m)
- CartoSat-1/2/3 (up to 0.25 m panchromatic)
- EOS-04 (RISAT) C-band SAR, Oceansat-3
- INSAT-3D/3DR geostationary meteorology

| | |
|---|---|
| Resolution | 0.25 m – 56 m |
| Latency | 1–3 days |
| Coverage | Strongest over India and South Asia; some global datasets |
| Endpoint | `https://bhoonidhi.nrsc.gov.in/bhoonidhi/index.html` |
| Portal | https://bhuvan.nrsc.gov.in/ |
| Docs | https://bhoonidhi.nrsc.gov.in/ |

**How to use it.** Register at Bhoonidhi, then use the community CLI `bhoonidhi-downloader` (pip install bhoonidhi-downloader) — it handles the session auth and rate limiting that make the raw portal painful to script. See `docs/data-sources.md` for the ISRO tooling notes.

**Gotchas**
- Access policy varies per product; some datasets are India-only or research-use-only. Check licensing before redistributing.
- The portal aggressively rate-limits scripted requests — the CLI backs off correctly, hand-rolled loops get banned.

<sub>Last probed 2026-09-06 — Portal-based with session auth and rate limits. Not anonymously probeable.</sub>

<sub>See also: `earth-search`</sub>

#### JAXA Earth Observation (EORC / G-Portal)

`jaxa-earth` · JAXA · JP · **Free account** · ⚪ not machine-probeable

**Use when:** You are working in Asia-Pacific and need 10-minute geostationary cadence (Himawari) or L-band SAR that penetrates vegetation canopy better than Sentinel-1's C-band.

**Provides**
- ALOS / ALOS-2 / ALOS-4 PALSAR L-band SAR
- GCOM-W (soil moisture, sea ice) and GCOM-C (ocean colour, LST)
- GSMaP global precipitation, hourly
- Himawari-8/9 geostationary imagery (10-minute full disk over Asia-Pacific)

| | |
|---|---|
| Resolution | 10 m (ALOS-2) – 10 km (GSMaP) |
| Latency | ~20 min (Himawari) – days |
| Coverage | Global, with the densest Asia-Pacific record |
| Endpoint | `https://gportal.jaxa.jp/gpr/search` |
| Portal | https://earth.jaxa.jp/ |
| Docs | https://gportal.jaxa.jp/gpr/information/tutorial |

**How to use it.** Register a free G-Portal account, then use its SFTP endpoint for bulk retrieval. For Himawari specifically, the far easier path is the AWS Open Data mirror (noaa-himawari8/9 buckets, anonymous S3) or the JAXA Himawari Monitor tiles. For ALOS PALSAR RTC, ASF Vertex (tier 2) is the least painful route.

**Gotchas**
- G-Portal's browser UI is slow and its API is thin — script against SFTP, not the web app.
- Himawari full-disk files are large and land every 10 minutes; subset before you archive anything.

<sub>Last probed 2026-09-06 — G-Portal requires an account and an SFTP/HTTPS session; not usefully probeable anonymously. GSMaP browse at sharaku.eorc.jaxa.jp is public.</sub>

<sub>See also: `asf-search`</sub>

#### stackstac

`stackstac` · Gabe Joseph (independent) · GLOBAL · **No credentials** · 🟢 verified working

**Use when:** You are reading older EO tutorials that assume it. For new code, don't.

**Provides**
- Turns a STAC ItemCollection into a Dask-backed xarray DataArray

| | |
|---|---|
| Portal | https://github.com/gjoseph92/stackstac |

**How to use it.** Use `odc-stac` instead — same job, actively maintained, better reprojection handling.

**Gotchas**
- Unmaintained since 2024; dependency conflicts with current xarray/dask are common.

<sub>Last probed 2026-09-06 — ★272, but last push 2024-08-10 — over two years stale as of this writing.</sub>

<sub>See also: `odc-stac`</sub>

## Tier 4 — Documented so you don't waste an afternoon

Deprecated, decommissioned or gated behind human approval. Listed because tutorials and older code still point at them.

#### Copernicus Open Access Hub (SciHub) — RETIRED

`scihub-legacy` · ESA · EU · **Free account** · 🔴 dead or superseded

**Use when:** Never. Present only so old tutorials pointing here are recognisable as stale.

**Provides**
- Nothing — service decommissioned

| | |
|---|---|
| Portal | https://dataspace.copernicus.eu/ |

**How to use it.** Migrate to `cdse-stac` (keyless search) or `cdse-odata` (full product download). The `sentinelsat` Python package targeted this API and is likewise obsolete.

<sub>Last probed 2026-09-06 — scihub.copernicus.eu and apihub have been shut down and replaced by the Copernicus Data Space Ecosystem.</sub>

<sub>See also: `cdse-stac`, `cdse-odata`</sub>

#### ReliefWeb API

`reliefweb` · UN OCHA · GLOBAL · **Human approval required** · 🔴 dead or superseded

**Use when:** You need officially recognised humanitarian disaster declarations with UN provenance, and you can wait for approval.

**Provides**
- Humanitarian disaster records, situation reports, appeals
- Country and crisis profiles curated by UN OCHA

| | |
|---|---|
| Endpoint | `https://api.reliefweb.int/v2` |
| Portal | https://reliefweb.int/ |
| Docs | https://apidoc.reliefweb.int/ |

**How to use it.** Request an appname at reliefweb.int/help/api (human review). Once approved, call https://api.reliefweb.int/v2/disasters?appname=<approved>&limit=20. Until then this source cannot be used at all — the toolkit ships it as mock-only. For unblocked event data right now, use NASA EONET or GDELT instead.

**Gotchas**
- Every tutorial and code sample using v1, or an arbitrary appname string, is now broken. This includes this repo's original module.
- Approval is not instant and not guaranteed for hobby projects.

<sub>Last probed 2026-09-06 — v1 returns 410 'The API version v1 has been decommissioned'. v2 returns 403 'You are not using an approved appname' — a human at OCHA must approve your app name before any call works.</sub>

<sub>See also: `nasa-eonet`, `gdelt`</sub>

---

<sub>Generated 2026-09-06 from `src/sources/`. Verification statuses reflect the last run of `npm run probe`.</sub>
