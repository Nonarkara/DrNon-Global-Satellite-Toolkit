# DrNon Global Satellite Toolkit — Template Instructions

This is a **dashboard template** for building real-time data dashboards with satellite imagery, global awareness APIs, and pluggable data modules.

**Author:** Dr Non Arkaraprasertkul ([@Nonarkara](https://github.com/Nonarkara))

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

All 30 modules render mock data with zero API keys. Add keys to `.env` to activate live data.

## Architecture

```
src/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Design tokens (--bg, --ink, --cool, etc.)
│   ├── page.tsx                          # Starter page — replace with your dashboard
│   └── api/modules/
│       ├── catalog/route.ts              # GET → all module metadata
│       └── [id]/route.ts                 # GET → module data (live or mock fallback)
├── modules/
│   ├── registry.ts                       # Central index — add/remove modules here
│   ├── _template.ts                      # Copy this to create a new module
│   ├── lib/module-fetch.ts               # Internal URL helper
│   ├── hooks/useModuleData.ts            # React hook with auto-polling
│   ├── components/
│   │   ├── ModulePanel.tsx               # Renders any module by uiType
│   │   ├── ModuleSelector.tsx            # Drawer to toggle modules on/off
│   │   └── ModuleRail.tsx                # Tab bar for enabled modules
│   ├── earth-observation/                # NASA FIRMS, GIBS, Sentinel, ISRO, JAXA, GK2A
│   ├── orbital-air-traffic/              # OpenSky, CelesTrak, Space-Track, FlightLabs
│   ├── conflict-events/                  # ACLED, GDELT, ReliefWeb, PredictHQ
│   ├── environmental/                    # AQI, OpenAQ, AQICN, TMD, Meteoblue
│   ├── news-info/                        # Google Trends, News API
│   └── thailand/                         # SRT, BTS/MRT, Longdo Traffic, Highway Cams, GTFS
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
- `nasa-firms` — Fire detection (wraps /api/fires)
- `nasa-gibs` — Satellite imagery tiles (wraps /api/map/overlays)
- `sentinel-hub` — Processed Sentinel imagery (needs SENTINEL_HUB_KEY)
- `isro-bhoonidhi` — ISRO 46-satellite archive
- `jaxa-tellus` — JAXA Earth observation
- `gk2a-korea` — GK2A geostationary weather

**Orbital & Air Traffic**:
- `opensky-network` — Real-time flight tracking (wraps /api/flights)
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
- `open-meteo-aqi` — Air quality (wraps /api/air-quality)
- `openaq` — Global AQ stations (free, no key)
- `aqicn-thailand` — Thai PM2.5 stations (free, no key)
- `tmd-weather` — Thai Met Dept forecasts (free, no key)
- `meteoblue` — 100+ weather variables (needs METEOBLUE_KEY)
- `meteosource-thai` — Hyperlocal Thai weather (needs METEOSOURCE_KEY)

**News & Info**:
- `google-trends` — Trending topics (wraps /api/trends)
- `news-api` — Global news aggregation (needs NEWS_API_KEY)

**Thailand**:
- `pksb-transit` — Phuket Smart Bus (wraps /api/transit/pksb)
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
}
```

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
