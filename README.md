# DrNon Global Satellite Toolkit

> **Author:** Dr Non Arkaraprasertkul ([@Nonarkara](https://github.com/Nonarkara))
> PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors
> Senior Expert in Smart City Promotion, Digital Economy Promotion Agency of Thailand (depa)
>
> This started as a hobby project — I wanted to see how many satellite feeds I could layer onto a single map just for the fun of it. Turns out quite a few. Along the way it became something with real potential: a layered geographic mapping system that can surface insights about environment, infrastructure, conflict, economics, and human movement — all from open satellite data that most people don't know is freely available.
>
> **Original compilation, system design, architecture & product by Dr Non Arkaraprasertkul.**

Comprehensive satellite imagery overlay engine for geospatial dashboards. Integrates **20+ satellite APIs** from global space agencies, **10+ free base maps** with automatic fallback, and a **Deck.gl rendering pipeline** for layered satellite visualization.

What started as a weekend curiosity — "how many satellite feeds can I stack?" — grew into a toolkit that can help anyone understand what's happening on Earth through open data: fire detection, vegetation health, night-time activity, ocean depth, air quality, precipitation, and more. All free, all open, all layered.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LAYER STACK (top → bottom)            │
├─────────────────────────────────────────────────────────┤
│  Labels & Annotations                                    │
│  Distance Grid (500m / 1km / 5km / 10km + nautical mi)  │
│  Analytic Overlays (AQI, aerosol, precipitation, fire)   │
│  Satellite Imagery (VIIRS, MODIS, Sentinel-2, etc.)      │
│  Base Map (OSM / LongDo / ESRI / CartoDB / Mapbox)       │
│  Gradient Fallback (always renders)                      │
└─────────────────────────────────────────────────────────┘
```

### Fallback Philosophy

**The map always renders.** Every layer has a fallback chain:

- **Base maps**: Mapbox → OSM → LongDo → ESRI → CartoDB → Gradient
- **Satellite imagery**: NASA GIBS → Sentinel-2 (EOX) → ESRI World Imagery
- **Fire detection**: NASA FIRMS live → cached DB → static fallback
- **Storage**: Supabase → Firebase → PostgreSQL → Google Sheets → local cache

Every tile fetch records metadata (provider, timestamp, latency, imagery date, status) so the system tracks accuracy and provider health automatically.

## Repository Structure

```
src/
├── index.ts                          # Main exports
├── types/
│   └── satellite.ts                  # Core type definitions
├── registry/
│   └── global-satellite-apis.ts      # 20+ APIs from 80+ agencies surveyed
├── overlays/
│   └── map-overlays.ts               # 10 raster + vector overlay catalog
├── engine/
│   └── map-engine.ts                 # Deck.gl layer factories
├── basemaps/
│   └── basemap-catalog.ts            # 10+ base maps with fallback chain
├── grid/
│   └── distance-grid.ts              # 500m–10km grids + nautical miles
├── storage/
│   └── database-architecture.ts      # Supabase/Firebase/PG/Sheets/cache
├── providers/
│   └── satellite-providers.ts        # Active + optional provider catalog
├── api/
│   └── copernicus-preview.ts         # Imagery preview endpoint logic
├── components/
│   └── SourceStack.tsx               # React space agency health indicator
├── data/
│   └── fallbacks.ts                  # Fallback data for offline operation
└── modules/                          # ← NEW: Pluggable data-source modules
    ├── registry.ts                   # Central module index (30 modules)
    ├── _template.ts                  # Copy-paste starter for new modules
    ├── satellite-freshness.ts        # Image freshness selector with fallback
    ├── earth-observation/            # NASA FIRMS, GIBS, Sentinel, ISRO, JAXA, GK2A
    ├── orbital-air-traffic/          # OpenSky, CelesTrak, Space-Track, FlightLabs
    ├── conflict-events/              # ACLED, GDELT, ReliefWeb, PredictHQ
    ├── environmental/                # AQI, OpenAQ, AQICN, TMD, Meteoblue
    ├── news-info/                    # Google Trends, News API, GDELT News
    ├── thailand/                     # SRT Trains, BTS/MRT, Longdo Traffic, GTFS, Gov Data
    ├── hooks/
    │   └── useModuleData.ts          # React hook with auto-polling
    └── components/
        ├── ModulePanel.tsx           # Renders any module by uiType
        ├── ModuleSelector.tsx        # Toggle drawer for enabling modules
        └── ModuleRail.tsx            # Dynamic tab bar for active modules

ingestion/
├── firms_ingest.py                   # NASA FIRMS fire detection pipeline
└── requirements.txt                  # Python dependencies

docs/
└── (architecture diagrams — future)
```

## Global Satellite API Registry

Surveyed **80+ space agencies** (per UNOOSA/WMO OSCAR directories). Found **20+ true public APIs** — the rest are portal-only or commercial.

### Tier 1: Popular APIs (High Adoption)

| API | Agency | Auth | Protocol | Coverage |
|-----|--------|------|----------|----------|
| **Sentinel Hub** | ESA | OAuth | STAC | Global — all Sentinel, Landsat, MODIS |
| **Google Earth Engine** | Google | OAuth | REST | Planetary-scale — petabytes |
| **NASA GIBS** | NASA | None | WMTS | Global — 1,000+ daily layers |
| **NASA CMR STAC** | NASA | None | STAC | All NASA data holdings |
| **Planet Labs** | Planet | API Key | REST | Global daily 3–5m optical |
| **MS Planetary Computer** | Microsoft | None | STAC | Global aggregated STAC |
| **N2YO** | Community | API Key | REST | Real-time orbital tracking |
| **Open Notify** | Community | None | REST | ISS position |

### Tier 2: Pro-Level APIs (Low Hype, High Reliability)

| API | Agency | Auth | Protocol | Coverage |
|-----|--------|------|----------|----------|
| **Celestrak GP** | 18 SPCS | None | REST | All NORAD objects (OMM/TLE) |
| **Space-Track** | USSF | Registration | REST | Official orbital catalog |
| **SatNOGS** | Libre Space | None | REST | Amateur satellite telemetry |
| **TLE API** | Community | None | REST | JSON TLE wrapper |
| **OpenEO** | EU Consortium | OAuth | REST | Unified processing backends |
| **EUMETSAT** | EUMETSAT | Registration | REST | Geostationary weather |

### Tier 3: Niche / Regional APIs

| API | Agency | Country | Protocol | Coverage |
|-----|--------|---------|----------|----------|
| **ISRO Bhoonidhi** | ISRO/NRSC | India | STAC | Resourcesat, EOS, NovaSAR |
| **DEA STAC** | Geoscience AU | Australia | STAC | Landsat/Sentinel ARD |
| **Digital Earth Africa** | SANSA | South Africa | STAC | Africa continent |
| **DLR EOC** | DLR | Germany | STAC | National EO collections |
| **CSA Open Data** | CSA | Canada | REST | RADARSAT, NEOSSat |
| **INPE STAC** | INPE | Brazil | STAC | CBERS, Amazonia-1 |
| **JAXA Earth** | JAXA | Japan | REST | ALOS, GCOM, Himawari |
| **Roscosmos STAC** | Roscosmos | Russia | STAC | Resurs-P, Kanopus-V |

### Portal-Only Agencies (No Public API)

~65–70 agencies have **zero public APIs**. Notable examples:

- **China (CNSA/CRESDA Gaofen)** — web portal only at cnsageo.com
- **South Korea (KARI/KOMPSAT)** — commercial channels only
- **Argentina (CONAE/SAOCOM)** — browser-only catalog
- **Thailand (GISTDA/THEOS)** — web portal download
- **Algeria, Turkey, UAE, Iran, Mexico, Indonesia, Vietnam, Philippines** — no APIs

Full details with endpoints in [`src/registry/global-satellite-apis.ts`](src/registry/global-satellite-apis.ts).

## Satellite Imagery Overlays

10 raster overlays from 6 providers, all consumable via WMTS tiles:

| Overlay | Source | Family | Max Zoom | Time Mode |
|---------|--------|--------|----------|-----------|
| VIIRS True Color | NASA GIBS | Imagery | 9 | Daily |
| MODIS False Color | NASA GIBS | Vegetation | 9 | Daily |
| Blue Marble Relief | NASA GIBS | Terrain | 8 | Daily |
| Vegetation Index (EVI) | NASA GIBS | Vegetation | 9 | 8-day |
| Night Lights | NASA GIBS | Lights | 8 | Default |
| Precipitation Rate | NASA GIBS/IMERG | Weather | 6 | Daily |
| Aerosol Optical Depth | NASA GIBS/MODIS | Air Quality | 6 | Daily |
| Sentinel-2 Cloudless | EOX/ESA | Imagery | 15 | Annual |
| Surface Water | JRC/Google | Terrain | 13 | Static |
| Ocean Bathymetry | EMODnet/GEBCO | Terrain | 12 | Static |

## Base Maps with Fallback

12 base map options across 7 providers, ordered by priority:

| Priority | Base Map | Provider | Token? | Notes |
|----------|----------|----------|--------|-------|
| 1 | Streets / Dark / Satellite | Mapbox | Yes | Best quality, optional |
| 2 | Standard | OpenStreetMap | No | Universal free default |
| 3 | LongDo Map | Metamedia | Yes* | Thai-optimized, free key |
| 4 | World Imagery / Topo | ESRI | No | Great aerial fallback |
| 5 | Positron / Dark Matter | CartoDB | No | Clean for data overlays |
| 6 | Terrain / Toner | Stadia | Yes* | Terrain/high-contrast |
| 99 | Gradient | CSS | No | Final fallback — always works |

## Distance Grid System

4 grid presets with automatic zoom-level selection:

| Preset | Cell Size | Major Lines | Nautical Miles |
|--------|-----------|-------------|----------------|
| 500m | 0.5 km | Every 1 km | ~0.27 nm |
| 1 km | 1.0 km | Every 5 km | ~0.54 nm |
| 5 km | 5.0 km | Every 10 km | ~2.70 nm |
| 10 km | 10.0 km | Every 50 km | ~5.40 nm |

Grids auto-adjust longitude spacing by latitude (Mercator correction) and suppress when too dense.

## Storage & Database

Supports 5 storage backends with automatic resolution:

| Backend | Best For | Free Tier |
|---------|----------|-----------|
| **Supabase** | Primary DB with PostGIS, real-time | 500MB DB, 1GB storage |
| **Firebase** | Document store, real-time listeners | 1GB Firestore, 5GB storage |
| **PostgreSQL** | Self-hosted, full control | Self-hosted |
| **Google Sheets** | Non-sensitive data, easy sharing | Free with Google account |
| **Local Cache** | Offline fallback | Always available |

The system records tile fetch metadata (provider, timestamp, latency, imagery date, accuracy) in whichever backend is configured. Google Sheets can serve as a convenient secondary store for provider health dashboards and configuration overrides.

PostgreSQL schema included in [`src/storage/database-architecture.ts`](src/storage/database-architecture.ts).

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Nonarkara/DrNon-Global-Satellite-Toolkit.git
cd DrNon-Global-Satellite-Toolkit

# Install TypeScript dependencies
npm install

# (Optional) Set up Python ingestion
cd ingestion
pip install -r requirements.txt
cp ../.env.example ../.env
# Edit .env with your FIRMS_KEY
python firms_ingest.py
```

### Use in Your Project

```typescript
import {
  buildMapOverlayCatalog,
  createRasterOverlayLayer,
  createGIBSLayer,
  createDistanceGridLayer,
  GRID_PRESETS,
  getBestBasemap,
  allApis,
  registryStats,
} from "drnon-global-satellite-toolkit";

// Get all satellite overlays
const catalog = buildMapOverlayCatalog("2024-03-01");
console.log(`${catalog.overlays.length} overlays available`);

// Create a VIIRS layer
const viirsLayer = createGIBSLayer({
  id: "viirs",
  layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
  date: "2024-03-01",
});

// Create a 1km distance grid
const grid = createDistanceGridLayer(
  { west: 98, south: 7, east: 99, north: 9 },
  GRID_PRESETS.ONE_KM,
);

// Find the best base map for your environment
const basemap = getBestBasemap({
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: false,
});
console.log(`Using: ${basemap.label}`); // "OpenStreetMap"

// Browse the global API registry
console.log(`${registryStats.totalApis} satellite APIs cataloged`);
console.log(`${registryStats.noAuthCount} require no authentication`);
```

## Environment Variables

```bash
# Satellite data
FIRMS_KEY=                          # NASA FIRMS thermal detection (free key)

# Database (pick one)
SUPABASE_URL=                       # Supabase project URL
SUPABASE_ANON_KEY=                  # Supabase anonymous key
FIREBASE_PROJECT_ID=                # Firebase project ID
FIREBASE_API_KEY=                   # Firebase API key
DATABASE_URL=                       # Direct PostgreSQL connection
GOOGLE_SHEETS_ID=                   # Google Sheets spreadsheet ID
GOOGLE_API_KEY=                     # Google API key for Sheets

# Base maps (all optional — OSM works without any tokens)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=    # Mapbox (optional)
LONGDO_MAP_KEY=                     # LongDo Map (optional, free)
STADIA_API_KEY=                     # Stadia Maps (optional)
```

## Module System (Global Satellite Toolkit)

The module system is a pluggable architecture for integrating dozens of global awareness APIs. Each data source is a self-contained module — one file with fetch logic, mock data, and UI hints. Add or remove modules without touching any other code.

### 30 Modules Across 7 Categories

| Category | Modules | Free? |
|----------|---------|-------|
| **Earth Observation** | NASA FIRMS, NASA GIBS, Sentinel Hub, ISRO Bhoonidhi (India), JAXA Tellus (Japan), GK2A (Korea) | Mixed |
| **Orbital & Air Traffic** | OpenSky Network, CelesTrak, Space-Track, FlightLabs Thai | Mixed |
| **Conflict & Events** | ACLED, GDELT Events, GDELT News, ReliefWeb, PredictHQ | Mixed |
| **Environmental** | Open-Meteo AQI, OpenAQ, AQICN Thailand, TMD Weather, Meteoblue, Meteosource | Mixed |
| **News & Info** | Google Trends, News API | Mixed |
| **Thailand** | Phuket Smart Bus, SRT Trains, BTS/MRT, Longdo Traffic, Highway Cameras, Gov Open Data, Provinces, GTFS Buses | Free |

### Adding a New Module

1. Copy `src/modules/_template.ts` to the appropriate category folder
2. Fill in: `id`, `label`, `category`, `fetchData()`, `mockData`, `uiType`
3. Add one import + one array entry to `src/modules/registry.ts`

That's it. The module appears in the selector and is servable via the dynamic API route.

### Satellite Image Freshness Selector

All earth-observation modules use `selectBestImage()` from `satellite-freshness.ts`:

1. Pick the newest image within N days and under X% cloud cover
2. If none, pick the newest image within N days (any cloud)
3. If none, pick the overall newest image (stale fallback)

### React Integration

```tsx
import { useModuleData } from "./modules/hooks/useModuleData";

function MyComponent() {
  const { data, loading, error, tier } = useModuleData("gdelt-events");
  // tier = "live" | "mock" — always renders something
}
```

## Key Design Decisions

1. **No direct satellite processing** — We consume pre-processed tiles via WMTS/XYZ endpoints, not raw imagery. This keeps the client lightweight.

2. **STAC is the universal standard** — Any STAC-compatible API (NASA CMR, Sentinel Hub, DEA, ISRO, etc.) can be queried with `pystac-client` in Python.

3. **Safe date anchoring** — NASA GIBS only serves imagery up to the current real-world date. We default to a known-good historical date to prevent blank tiles.

4. **Resilience over features** — Every external dependency has a fallback. The dashboard works offline with bundled static data.

5. **Metadata everywhere** — Every tile fetch is logged with provider, timestamp, latency, and status. This builds an audit trail for accuracy and provider health.

## Author & Attribution

This toolkit — including the global satellite API registry, overlay engine, fallback architecture, distance grid system, and storage design — is an original compilation and product by **Dr Non Arkaraprasertkul** ([@Nonarkara](https://github.com/Nonarkara)).

**Dr Non Arkaraprasertkul**
PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors
Senior Expert in Smart City Promotion
Digital Economy Promotion Agency of Thailand (depa)
Bangkok, Thailand 10900

This project started as a hobby — pure curiosity about how many satellite feeds could be layered onto a single map. The satellite API registry was compiled through exhaustive research of 80+ space agencies per UNOOSA/WMO OSCAR directories, cross-referenced against global STAC indexes, developer portals, and open-data catalogs. The overlay engine and fallback architecture were extracted from a production geopolitical monitoring dashboard.

The potential goes well beyond the hobby origin. Layered satellite data can surface insights about environmental change, urban growth, disaster response, economic activity, agricultural health, maritime monitoring, and much more — all from open data that most people don't realize is freely available. If this toolkit helps someone see the world a little more clearly, it was worth building.

## License

MIT — see [LICENSE](LICENSE).
