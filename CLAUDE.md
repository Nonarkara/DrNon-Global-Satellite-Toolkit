# DrNon Global Satellite Toolkit — Template Instructions

This is a **dashboard template** for building real-time data dashboards with satellite imagery, global awareness APIs, and pluggable data modules.

**Author:** Dr Non Arkaraprasertkul ([@Nonarkara](https://github.com/Nonarkara))

## Quick Start

```bash
npm install && npm run dev     # http://localhost:3000
npm run probe                  # verify every keyless data source is alive
```

Then open **http://localhost:3000/imagery** — it searches real Sentinel-2 and
Landsat scenes and renders them, with no API key.

**Zero-config reality check.** Of 39 modules: **13 are live with no credentials**
(`stac-imagery`, `nasa-gibs`, `nasa-power`, `nasa-smap`, `copernicus-cdse`,
`jaxa-gsmap`, `gistda-gateway`, `gistda-gflood`, `opensky-network`, `celestrak`,
`open-meteo-aqi`, `open-meteo-forecast`, `google-trends`), 14 need a key, and 12
are `fixtureOnly` because their upstream was probed dead on 2026-09-06. `/api/modules/<id>` reports `tier: "live" | "mock"`
honestly — never assume a module is live without checking.

## The imagery pipeline

```
STAC search  →  public COG  →  dynamic tiler  →  XYZ tiles  →  deck.gl
src/stac/       sentinel-cogs   TiTiler          src/engine/cog-layer.ts
client.ts       (anonymous S3)  (titiler.xyz)
```

Four STAC backends, all verified working with no credentials:
`earth-search` (default — public COGs, no signing), `planetary-computer`
(widest catalog; assets need free SAS signing), `cdse` (authoritative ESA),
`nasa-cmr` (NASA DAACs). See `src/stac/backends.ts`.

## Architecture

```
src/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Design tokens (--bg, --ink, --cool, etc.)
│   ├── page.tsx                          # Starter page — replace with your dashboard
│   ├── imagery/page.tsx                  # Working imagery explorer — no key needed
│   └── api/
│       ├── modules/catalog/route.ts      # GET → all module metadata
│       ├── modules/[id]/route.ts         # GET → module data (live or mock fallback)
│       ├── stac/search/route.ts          # GET → scenes with ready tile URLs
│       ├── stac/indices/route.ts         # GET → NDVI/NDWI/… render + statistics
│       ├── stac/collections/route.ts     # GET → backends / collections
│       ├── orbital/overpass/route.ts     # GET → next satellite passes
│       └── sources/route.ts              # GET → the curated source registry as JSON
├── modules/
│   ├── registry.ts                       # Central index — add/remove modules here
│   ├── _template.ts                      # Copy this to create a new module
│   ├── hooks/useModuleData.ts            # React hook with auto-polling
│   ├── components/
│   │   ├── ModulePanel.tsx               # Renders any module by uiType
│   │   ├── ModuleSelector.tsx            # Drawer to toggle modules on/off
│   │   └── ModuleRail.tsx                # Tab bar for enabled modules
│   ├── earth-observation/                # NASA FIRMS, GIBS, POWER, SMAP, Sentinel Hub, CDSE, ISRO, JAXA, GK2A, GISTDA
│   ├── orbital-air-traffic/              # OpenSky, CelesTrak, Space-Track, FlightLabs
│   ├── conflict-events/                  # ACLED, GDELT, ReliefWeb, PredictHQ
│   ├── environmental/                    # AQI, OpenAQ, AQICN, TMD, Meteoblue
│   ├── news-info/                        # Google Trends, News API
│   └── thailand/                         # SRT, BTS/MRT, Longdo Traffic, Highway Cams, GTFS
├── sources/                              # Curated source registry — 38 probed entries
│   ├── types.ts                          #   DataSource: tier, auth, verified, howTo, gotchas
│   ├── imagery-catalogs.ts               #   STAC APIs, agency archives, tile services
│   ├── live-feeds.ts                     #   Fires, flights, air quality, events, orbits
│   └── tooling.ts                        #   Libraries, CLIs, MCP servers worth adopting
├── stac/                                 # STAC client — the imagery framework
│   ├── backends.ts                       #   4 verified endpoints
│   ├── client.ts                         #   searchStac / listCollections / signAssetHref
│   ├── collections.ts                    #   9 probed collections: optical, SAR, DEM, land cover
│   ├── indices.ts                        #   8 spectral indices + per-collection band aliases
│   ├── index-render.ts                   #   index → tile / preview / statistics URLs
│   └── preview.ts                        #   STAC item → XYZ tile URLs via TiTiler
├── orbital/                              # Overpass prediction
│   ├── tle.ts                            #   CelesTrak elements, serialised + 6 h cache
│   ├── solar.ts                          #   NOAA solar elevation — is the pass imageable?
│   └── overpass.ts                       #   SGP4 propagation, swath + illumination aware
├── engine/cog-layer.ts                   # Deck.gl layers for STAC/COG imagery
├── engine/map-engine.ts                  # Deck.gl layer factories (GIBS, MODIS, VIIRS, fire)
├── overlays/map-overlays.ts              # 10 satellite overlay definitions
├── basemaps/basemap-catalog.ts           # 12 basemaps with fallback chain
├── grid/distance-grid.ts                 # 500m–10km grids + nautical miles
├── storage/database-architecture.ts      # 5-tier storage (Supabase/Firebase/PG/Sheets/cache)
├── registry/global-satellite-apis.ts     # 20+ APIs from 80+ agencies surveyed
├── providers/satellite-providers.ts      # Provider catalog
└── types/
    ├── modules.ts                        # Module system types
    └── satellite.ts                      # Overlay/satellite types
```

## How to Build a Dashboard from This Template

### Step 1: Understand the client's domain
- City dashboard? National monitoring? Sector-specific?
- What geography? What data sources matter?

### Step 2: Edit `src/app/page.tsx`
Replace the starter page with the dashboard layout. Typical structure:
```tsx
<main>
  <TopBar />           {/* Header with controls */}
  <Map />              {/* Deck.gl map using engine/map-engine.ts */}
  <Sidebar />          {/* News, alerts, analytics */}
  <ModuleRail />       {/* Keep this — tabbed module panels at bottom */}
  <ModuleSelector />   {/* Keep this — module toggle drawer */}
</main>
```

### Step 3: Pick modules from the registry
Enable relevant modules in `src/modules/registry.ts` by keeping/removing entries from the `ALL_MODULES` array. Available modules:

**Earth Observation** (no key needed unless noted):
- `stac-imagery` — Sentinel-2 scene search with tile URLs (no key) 🟢
- `nasa-firms` — Fire detection, direct from the FIRMS API (needs FIRMS_KEY)
- `nasa-gibs` — GIBS tile templates, built locally (no key) 🟢
- `nasa-power` — NASA POWER daily climate (modelled GEOS fields, free)
- `nasa-smap` — SMAP L4 soil-moisture GIBS browse (modelled analysis)
- `sentinel-hub` — Processed Sentinel imagery (needs SENTINEL_HUB_KEY)
- `copernicus-cdse` — Native CDSE STAC search for Sentinel-1 GRD + Sentinel-2 L2A (catalog public)
- `isro-bhoonidhi` — ISRO 46-satellite archive
- `jaxa-tellus` — JAXA Earth observation
- `jaxa-gsmap` — JAXA GSMaP rainfall + Himawari browse freshness
- `gk2a-korea` — GK2A geostationary weather
- `gistda-gateway` — Priority 2–3 Open API `/features/flood/{1day,3days,7days,30days}` + flood-freq, then VIIRS / burn-scar / burn-freq. Catalog works without a key; GeoJSON needs GISTDA_API_KEY. Not `/app-api/proxy`.
- `gistda-gflood` — Priority 1 Open API flood WMS/WMTS/TMS (1/3/7/30-day), then fire/drought maps. STAC + Sentinel-1C/1D download are priority 5 retrospective, not a live tile CDN.

**Orbital & Air Traffic**:
- `opensky-network` — Live ADS-B, direct from OpenSky (no key) 🟢
- `celestrak` — Satellite TLE tracking (free)
- `space-track` — NORAD catalog (needs SPACE_TRACK_USER/PASS)
- `flightlabs-thai` — BKK/DMK aviation (needs FLIGHTLABS_KEY)

**Conflict & Events**:
- `acled` — Armed conflict data (needs ACLED_KEY)
- `gdelt-events` — Global events (free, no key)
- `gdelt-news` — Global news search (free, no key)
- `reliefweb` — Humanitarian disasters (free, no key)
- `predicthq` — Event intelligence (needs PREDICTHQ_KEY)

**Environmental**:
- `open-meteo-aqi` — Air quality, direct from Open-Meteo (no key) 🟢
- `open-meteo-forecast` — 7-day NWP forecast for Thai civic cities (free, modelled)
- `openaq` — Global AQ stations (free, no key)
- `aqicn-thailand` — Thai PM2.5 stations (free, no key)
- `tmd-weather` — Thai Met Dept forecasts (free, no key)
- `meteoblue` — 100+ weather variables (needs METEOBLUE_KEY)
- `meteosource-thai` — Hyperlocal Thai weather (needs METEOSOURCE_KEY)

**News & Info**:
- `google-trends` — Trending topics via Google's public RSS (no key) 🟢
- `news-api` — Global news aggregation (needs NEWS_API_KEY)

**Thailand**:
- `pksb-transit` — Phuket Smart Bus ⚪ fixture only (no open feed exists)
- `srt-trains` — State Railway tracking (free)
- `bts-mrt` — BTS/MRT routes (community data, free)
- `longdo-traffic` — Traffic feeds (free)
- `highway-cameras` — Highway CCTV/speed (free)
- `thailand-open-data` — Government datasets (free)
- `thailand-admin` — Province/district metadata (free)
- `gtfs-buses` — GTFS bus routes (free)

### Step 4: Add a map (if needed)
Use the Deck.gl engine exports:
```tsx
import { createGIBSLayer, createFireLayer } from "@/engine/map-engine";
import { getBestBasemap } from "@/basemaps/basemap-catalog";
import { createDistanceGridLayer } from "@/grid/distance-grid";
```

### Step 5: Create client-specific modules
```bash
cp src/modules/_template.ts src/modules/environmental/my-new-source.ts
```
1. Edit the file: set `id`, `label`, `category`, `fetchData()`, `mockData`, `uiType`
2. Add to `src/modules/registry.ts`: one import + one array entry
3. Done — appears in ModuleSelector automatically

### Step 6: Add API keys
Copy `.env.example` to `.env` and fill in keys for modules that need them. Modules without keys still work with mock data.

## Module Contract

Every module implements `ModuleDefinition<TData>`:
```typescript
{
  id: string;               // kebab-case unique ID
  label: string;            // Human-readable name
  category: ModuleCategory; // earth-observation | orbital-air-traffic | conflict-events | environmental | news-info | thailand
  description: string;
  pollInterval: number;     // seconds (0 = fetch once)
  fetchData: () => Promise<TData>;  // Server-side fetch
  mockData: TData;          // Fallback data
  uiType: ModuleUiType;    // table | feed | chart | stat-card | ticker | map-layer
  tableColumns?: [];        // For table rendering
  requiredEnvVars?: [];     // Env vars needed for live data
  sourceId?: string;        // Links to an entry in src/sources for provenance
  fixtureOnly?: boolean;    // No public API exists — never reports tier "live"
}
```

### The honesty contract

`/api/modules/[id]` reports one of three states, and you must not blur them:

| State | When |
|---|---|
| `tier: "live"` | `fetchData()` succeeded against a real upstream |
| `tier: "mock"` | Fetch failed or a key is missing — `mockData` served |
| `fixtureOnly: true` | No public API exists; the fetch is never attempted |

Two rules follow:
- **Throw, never swallow.** A `fetchData()` that catches an error and returns
  `[]` produces a module that reports `live` with zero rows. That bug was in
  `aqicn-thailand`; don't reintroduce it.
- **Dead upstream → `fixtureOnly: true`** with a dated comment saying what the
  endpoint returned.

### Verifying sources

```bash
npm run probe            # keyless sources — must be all green
npm run probe:all        # include credentialed sources
npm run probe -- --json  # machine-readable
```

Adding a source means adding a `DataSource` entry in `src/sources/` **and** a
probe case in `scripts/probe-sources.mjs`, then `npm run docs:sources`.

## MCP server

`mcp/server.mjs` exposes the toolkit to any agent runtime:

```bash
claude mcp add satellite -- node /abs/path/to/mcp/server.mjs
```

| Tool | Needs a running app? |
|---|---|
| `search_imagery` | No — calls STAC directly |
| `spectral_index` | No — calls STAC + tiler directly |
| `next_overpass` | Yes (`npm run dev`) — orbital propagation lives in the app |
| `list_data_sources` | Yes — reads `/api/sources` |

## Verified rendering constraints

Established by probing, not assumed. Changing any of these breaks rendering:

- Band math uses **positional `b1`/`b2`** with `asset_as_band=true`, ordered by
  the `assets` parameters. Asset names in an expression return HTTP 400.
- **Only `earth-search` + Sentinel-2** supports band math on a public tiler.
  Planetary Computer needs SAS signing (409), Earth Search's Landsat is
  requester-pays (AccessDenied), CDSE serves `s3://` URIs.
- Landsat's near-infrared band is **`nir08`**, not `nir` — see `resolveAssets()`.
- CelesTrak **403s `GROUP=active`** and 500s on concurrent requests; `tle.ts`
  serialises and caches for 6 hours.

## React Integration

```tsx
import { useModuleData } from "@/modules/hooks/useModuleData";

function MyPanel({ moduleId }: { moduleId: string }) {
  const { data, loading, error, tier, meta } = useModuleData(moduleId);
  // tier = "live" | "mock"
  // data = whatever fetchData() or mockData returns
}
```

## Design System (CSS Custom Properties)

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#efede5` | Page background |
| `--bg-raised` | `#f5f3ec` | Elevated surfaces |
| `--panel` | `rgba(248,246,240,0.9)` | Panel backgrounds |
| `--ink` | `#111111` | Primary text |
| `--muted` | `#4f4f4f` | Secondary text |
| `--dim` | `#858585` | Tertiary text |
| `--cool` | `#0f6f88` | Accent color |
| `--cool-dim` | `rgba(15,111,136,0.1)` | Accent background |
| `--danger` | `#ef4444` | Error/live indicators |
| `--success` | `#22c55e` | Success states |
| `--line` | `rgba(17,17,17,0.1)` | Borders |

Utility classes: `.dashboard-panel`, `.dashboard-panel-strong`, `.eyebrow`, `.live-badge`, `.no-scrollbar`

## Environment Variables

See `.env.example` for the full list. All are optional — modules fall back to mock data.
