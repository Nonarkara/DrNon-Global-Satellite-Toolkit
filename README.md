# DrNon Global Satellite Toolkit

**See Everything. Build Anything. Deploy Anywhere.**

A production-grade, open-source framework for building satellite-powered dashboards at any scale — from a single city to the entire planet. Clone it, point it at a geography, and you have a working situational awareness system in minutes.

> **Author:** Dr Non Arkaraprasertkul ([@Nonarkara](https://github.com/Nonarkara))
> PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors
> Senior Expert in Smart City Promotion, Digital Economy Promotion Agency of Thailand (depa)
>
> **Original compilation, system design, architecture & product by Dr Non Arkaraprasertkul.**

<p align="center">
  <img src="assets/banner.jpg" alt="DrNon Global Satellite Toolkit — See Everything. Build Anything. Deploy Anywhere." width="100%" />
</p>

---

## Run it in 30 seconds

```bash
git clone https://github.com/Nonarkara/DrNon-Global-Satellite-Toolkit.git
cd DrNon-Global-Satellite-Toolkit && make
```

Open **http://localhost:3000/imagery** and you are searching the live Sentinel-2
and Landsat archives, rendering real satellite imagery, **with no API key.**

```bash
npm run probe   # verify every keyless source against the live internet
npm test        # 47 tests, no network required
```

[Full quick start ↓](#quick-start) · [Data sources](docs/data-sources.md) · [For AI agents](AGENTS.md)

---

## What you can do without a single API key

| | |
|---|---|
| **Find imagery** | Search Sentinel-2, Landsat, Sentinel-1 SAR, DEMs and land cover across four STAC catalogs (NASA, ESA, AWS, Microsoft) |
| **See it** | Any scene renders as map tiles through a dynamic COG tiler — no download, no preprocessing |
| **Measure it** | Eight spectral indices (NDVI, NDWI, NDMI, NBR, NDBI, SAVI, NDSI) with real pixel statistics, not just pictures |
| **Plan it** | Predict when a satellite will next fly over any point — accounting for instrument swath and whether the sun will be up |
| **Know where to look** | 39 data sources, each probed live, tier-ranked, with the gotchas that waste an afternoon |
| **Hand it to an agent** | A built-in MCP server exposes all of the above as tools for Claude Code, Codex or Cursor |

### Measure, don't just look

```bash
curl "localhost:3000/api/stac/indices?index=ndvi&bbox=100.3,13.5,100.9,14.0"
```

Returns the least-cloudy recent scene, a rendered NDVI image, XYZ tiles, and a
statistics endpoint giving real min/max/mean/median over the scene. The same
machinery answers *how much* vegetation, *where* the water is, *how badly* it
burned — rather than only showing you a picture of it.

| Index | Question it answers |
|---|---|
| `ndvi` / `savi` | How much healthy vegetation is here? |
| `ndwi` | Where is the open water? (flood extent) |
| `ndmi` | Is the canopy drying out? (fire-season early warning) |
| `nbr` | How badly did it burn? (difference two dates for dNBR) |
| `ndbi` | Where is the built-up and impervious surface? |
| `ndsi` | Where is the snow and ice? (and not cloud) |

### Plan the next acquisition

```bash
curl "localhost:3000/api/orbital/overpass?lat=13.75&lon=100.5&imageableOnly=true"
```

```
2026-10-09T03:38Z (10:38 ICT)  Landsat 9     sun 60.8°  12.9 km  → landsat-c2-l2
2026-10-09T03:54Z (10:54 ICT)  Sentinel-2A   sun 63.8°  54.7 km  → sentinel-2-l2a
2026-10-12T11:09Z (18:09 ICT)  Sentinel-1A   sun -3.0°  22.3 km  → sentinel-1-grd
```

SGP4 propagation of live CelesTrak elements. Optical passes in darkness are
excluded; the Sentinel-1 twilight pass is kept, because radar carries its own
illumination. Those local times are the real thing — Landsat and Sentinel-2 fly
~10:30 sun-synchronous descending nodes, Sentinel-1 flies dawn-dusk.

### Give it to an AI agent

```bash
claude mcp add satellite -- node /path/to/DrNon-Global-Satellite-Toolkit/mcp/server.mjs
```

Four tools, no API key: `search_imagery`, `spectral_index`, `next_overpass`,
`list_data_sources`. The agent can then answer "show me how green the Mekong
Delta was last month, and tell me when the next clear pass is" without being
told anything about this codebase.

---

## What This Is

This is not a satellite viewer. It's a **blueprint for building real-time global awareness systems**.

42,000+ lines of TypeScript. 32 pluggable data-source modules. 20+ satellite APIs from 80+ space agencies surveyed worldwide. A rendering pipeline that layers fire detection over vegetation indices over night-time lights over ocean bathymetry — on any base map, with any combination, and it always renders even when APIs go down.

It started as a hobby — "how many satellite feeds can I stack onto one map?" — and turned into the toolkit that powers production monitoring dashboards for smart city programs.

## What You Can Build With This

### Disaster Response & Emergency Operations
- Real-time wildfire tracking with NASA FIRMS thermal hotspot detection
- Flood extent monitoring via Sentinel-1 SAR and MODIS imagery
- Disaster event feeds from ReliefWeb with automatic geographic correlation
- Precipitation overlays from NASA IMERG for storm tracking
- Air quality crisis monitoring with PM2.5/NO₂/O₃ from OpenAQ and AQICN

### Smart City Command Centers
- Urban heat island detection via MODIS land surface temperature
- Traffic flow visualization from Longdo and highway camera feeds
- Public transit tracking — buses, trains, metro systems
- Environmental sensor dashboards with multi-station AQI
- Night-time economic activity mapping via VIIRS nightlights

### Defense & Geopolitical Intelligence
- Orbital awareness — track every satellite and debris object in real time via CelesTrak and Space-Track
- Armed conflict event mapping with ACLED (protests, battles, explosions, civilian targeting)
- GDELT global event monitoring — 300+ event types coded from news in 65 languages
- Air traffic pattern analysis for anomaly detection via OpenSky Network
- Overflight frequency analysis — which satellites are watching which regions, and when

### Climate & Environmental Monitoring
- Deforestation tracking with NDVI/EVI vegetation indices over time
- Ocean health via sea surface temperature and chlorophyll concentration layers
- Aerosol optical depth for air pollution transport analysis
- Multi-source weather fusion — TMD, Meteoblue, Open-Meteo, Meteosource
- Glacier retreat and snow cover monitoring via Sentinel-2

### Maritime & Border Surveillance
- AIS vessel tracking correlation with satellite overpass timing
- Coastline change detection via historical Landsat time series
- Illegal fishing zone monitoring with VIIRS boat detection
- Distance grid system with nautical mile support for maritime operations
- SAR (Synthetic Aperture Radar) for all-weather, day/night monitoring

### Agricultural Intelligence
- Crop health monitoring with NDVI/EVI vegetation indices
- Drought early warning via soil moisture and precipitation data
- Growing season analysis with multi-temporal Sentinel-2
- Flood damage assessment for crop insurance verification
- Regional weather forecasting for precision agriculture

### Urban Planning & Development
- Urban sprawl detection with historical satellite comparison
- Infrastructure change detection — new roads, buildings, construction sites
- Land use classification from multi-spectral imagery
- Population density estimation via nightlight intensity
- Transit-oriented development analysis with ridership data

### Journalism & Open-Source Intelligence (OSINT)
- Verify conflict claims with independent satellite imagery timestamps
- Track refugee camp growth via settlement pattern detection
- Environmental crime detection — illegal mining, deforestation, waste dumping
- Cross-reference news events (GDELT) with satellite imagery of affected locations
- Google Trends + news API fusion for narrative tracking

### Academic Research
- Longitudinal Earth observation studies with decades of Landsat/MODIS data
- Multi-source data fusion for peer-reviewed analysis
- Reproducible research with version-controlled data pipelines
- Access to 6 national space agency APIs (NASA, ESA, ISRO, JAXA, DLR, INPE) in one interface

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LAYER STACK (top → bottom)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Module Data Panels  (conflict events, air traffic, weather, news)  │
│  Labels & Annotations                                               │
│  Distance Grid       (500m / 1km / 5km / 10km + nautical miles)    │
│  Analytic Overlays   (AQI, aerosol, precipitation, fire detection) │
│  Satellite Imagery   (VIIRS, MODIS, Sentinel-2, Landsat)           │
│  Base Map            (Mapbox / OSM / LongDo / ESRI / CartoDB)      │
│  Gradient Fallback   (always renders — never a blank screen)       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     MODULE SYSTEM (30 data sources)                 │
├─────────────────────────────────────────────────────────────────────┤
│  Earth Observation    │  NASA FIRMS, GIBS, Sentinel, ISRO, JAXA    │
│  Orbital & Air        │  OpenSky, CelesTrak, Space-Track, Flights  │
│  Conflict & Events    │  ACLED, GDELT, ReliefWeb, PredictHQ        │
│  Environmental        │  AQI, OpenAQ, TMD, Meteoblue, Meteosource  │
│  News & Trends        │  Google Trends, News API, GDELT News       │
│  Thailand-specific    │  SRT Trains, BTS/MRT, Smart Bus, Highways  │
├─────────────────────────────────────────────────────────────────────┤
│  Each module = 1 file with: fetch logic + mock data + UI hints     │
│  Add a module → it appears in the UI. Remove it → it vanishes.     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Links

- 📘 **Documentation** — [Architecture](./docs/architecture.md) · [Authoring a module](./docs/authoring-a-module.md) · [Module contract](./CLAUDE.md)
- 🚀 **Examples** — [City Monitor (Bangkok)](./examples/city-monitor/README.md) · [Disaster Watch](./examples/disaster-watch/README.md) · [Southeast Asia regional](./examples/southeast-asia/README.md)
- 🤖 **For AI agents** — [AGENTS.md](./AGENTS.md) (cross-agent) · [CLAUDE.md](./CLAUDE.md) (Claude Code)
- 🤝 **Contributing** — [CONTRIBUTING.md](./CONTRIBUTING.md) · [Code of Conduct](./CODE_OF_CONDUCT.md) · [Security](./SECURITY.md) · [Open an issue](../../issues/new/choose)

### Fallback Philosophy

**The dashboard always renders.** Every layer, every module, every dependency has a fallback:

- **Base maps**: Mapbox → OSM → LongDo → ESRI → CartoDB → CSS Gradient
- **Satellite imagery**: NASA GIBS → Sentinel-2 (EOX) → ESRI World Imagery
- **Fire detection**: NASA FIRMS live → cached database → static fallback
- **Data modules**: Live API → mock data (realistic, same schema)
- **Storage**: Supabase → Firebase → PostgreSQL → Google Sheets → local cache

No API key? Mock data loads. API down? Cached data loads. Offline? Static fallback loads. **There is no failure state that produces a blank screen.**

Every tile fetch records metadata — provider, timestamp, latency, imagery date, HTTP status — so the system builds its own provider health dashboard over time.

---

## 32 Pluggable Data-Source Modules

The module system is the core innovation. Each data source is a **self-contained file** — one file per API, with fetch logic, realistic mock data, and UI rendering hints. Add or remove modules by editing one line in the registry.

**Status key**, as measured by `npm run probe` on 2026-09-06:
🟢 live with no credentials · 🔑 live once you add a free key · 💳 needs a paid or approval-gated account · ⚪ fixture only, upstream unavailable

### Earth Observation (7 modules)
| | Module | Source | What It Shows |
|---|--------|--------|---------------|
| 🟢 | **Sentinel-2 Scenes (STAC)** | Earth Search / AWS | Live scene search with ready-to-render tile URLs — 10 m optical, no key |
| 🟢 | NASA GIBS | NASA | 1,000+ daily imagery layers as WMTS tile templates |
| 🔑 | NASA FIRMS | NASA | Active fire/thermal hotspots, ~3 h behind overpass |
| 💳 | Sentinel Hub | ESA | Processed Sentinel-2 + Landsat with custom band combinations |
| ⚪ | ISRO Bhoonidhi | ISRO (India) | No open REST API — use the `bhoonidhi-downloader` CLI |
| ⚪ | JAXA Tellus | JAXA (Japan) | G-Portal requires an authenticated session (403) |
| ⚪ | GK2A | KMA (Korea) | No open JSON API at the documented path |

### Orbital & Air Traffic (4 modules)
| | Module | Source | What It Shows |
|---|--------|--------|---------------|
| 🟢 | OpenSky Network | Community | Live ADS-B aircraft positions; add credentials for a higher quota |
| 🟢 | CelesTrak | CelesTrak | TLE sets for Earth-observation, weather and science satellites |
| 💳 | Space-Track | USSF | Full NORAD catalog with decay predictions (manual approval) |
| 💳 | FlightLabs Thai | AirLabs | BKK/DMK arrivals, departures and Thai carrier tracking |

### Conflict & Events (5 modules)
| | Module | Source | What It Shows |
|---|--------|--------|---------------|
| 🟢 | GDELT Events | GDELT Project | 300+ CAMEO-coded event types from news in 65 languages |
| 🟢 | GDELT News | GDELT Project | News volume and tone by geography |
| 🔑 | ACLED | ACLED | Expert-coded armed conflict events, protests, political violence |
| 💳 | PredictHQ | PredictHQ | Scheduled and unscheduled events with impact scoring |
| 💳 | ReliefWeb | UN OCHA | v1 decommissioned; v2 needs an OCHA-approved appname |

> **Note on GDELT:** healthy but slow (10–25 s) and it throttles hard. It falls
> back to mock on a 429, which is expected — don't poll it faster than the
> module's `pollInterval`.

### Environmental (6 modules)
| | Module | Source | What It Shows |
|---|--------|--------|---------------|
| 🟢 | Open-Meteo AQI | Open-Meteo | Global PM2.5 and US AQI for 6 stations — model, works anywhere |
| 🔑 | AQICN Thailand | AQICN | Thai station-level PM2.5 (the public `demo` token returns nothing) |
| 🔑 | OpenAQ | OpenAQ | Measured ground-station air quality (v2 retired, v3 needs a key) |
| 💳 | Meteoblue | Meteoblue | 100+ weather variables globally, 14-day forecasts |
| 💳 | Meteosource | Meteosource | Hyperlocal weather for Thai cities |
| ⚪ | TMD Weather | Thai Met Dept | The public RSS feed was retired (404) |

### News & Information (2 modules)
| | Module | Source | What It Shows |
|---|--------|--------|---------------|
| 🟢 | Google Trends | Google | Daily trending search topics for Thailand, via the public RSS feed |
| 💳 | News API | NewsAPI | Global news aggregation with keyword/source filtering |

### Thailand-Specific (8 modules)

Every module in this group is currently **⚪ fixture only**. These are Thai
government and operator feeds that were probed on 2026-09-06 and returned 404,
403, 401 or timed out — several are unreachable from outside Thailand. Each
module carries a comment recording exactly what happened, and the panels render
from a fixture so the layout still works. **Reviving these is the single most
valuable contribution to this repo** — see the recipe in [`AGENTS.md`](AGENTS.md).

| | Module | Source | Probe result (2026-09-06) |
|---|--------|--------|---------------|
| ⚪ | Phuket Smart Bus | PKSB | No open real-time feed exists |
| ⚪ | SRT Trains | SRT Thailand | `GetTrainRunning` → 404 |
| ⚪ | BTS/MRT | Community | Source GitHub dataset → 404 |
| ⚪ | Longdo Traffic | Longdo | `traffic.longdo.com/feed/json` → 404; now keyed |
| ⚪ | Highway Cameras | DOH Thailand | `its.doh.go.th` did not resolve |
| ⚪ | Gov Open Data | data.go.th | CKAN endpoint timed out |
| ⚪ | Provinces | api.openthailand.org | Host did not resolve |
| ⚪ | GTFS Buses | transit.land | → 401; v2 REST now requires a key |

---

## Global Satellite API Registry

The most comprehensive open-source compilation of satellite data APIs in existence. Surveyed **80+ space agencies** worldwide (per UNOOSA/WMO OSCAR directories). Found **20+ true public APIs** — the rest are portal-only or commercial.

### Key Finding
Most people think satellite data is expensive or classified. It's not. **The majority of Earth observation data is free and publicly accessible** — the problem is that nobody has compiled all the endpoints in one place. Until now.

### Tier 1: Popular APIs (High Adoption)

| API | Agency | Auth | Protocol | Coverage |
|-----|--------|------|----------|----------|
| **Sentinel Hub** | ESA | OAuth | STAC | Global — all Sentinel, Landsat, MODIS |
| **Google Earth Engine** | Google | OAuth | REST | Planetary-scale — petabytes |
| **NASA GIBS** | NASA | None | WMTS | Global — 1,000+ daily layers |
| **NASA CMR STAC** | NASA | None | STAC | All NASA data holdings |
| **Planet Labs** | Planet | API Key | REST | Global daily 3-5m optical |
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

~65-70 agencies have **zero public APIs**. Notable examples: China (CNSA/CRESDA Gaofen), South Korea (KARI/KOMPSAT), Argentina (CONAE/SAOCOM), Thailand (GISTDA/THEOS), Algeria, Turkey, UAE, Iran, Mexico, Indonesia, Vietnam, Philippines.

Full details with endpoints in [`src/registry/global-satellite-apis.ts`](src/registry/global-satellite-apis.ts).

---

## Satellite Imagery Overlays

10 raster overlays from 6 providers, all consumable via standard WMTS tiles:

| Overlay | Source | What It Reveals |
|---------|--------|-----------------|
| VIIRS True Color | NASA GIBS | Daily global imagery at 375m — see the Earth as it looks today |
| MODIS False Color | NASA GIBS | Vegetation health — red = stressed, green = healthy |
| Blue Marble Relief | NASA GIBS | Terrain and bathymetry in stunning detail |
| Vegetation Index (EVI) | NASA GIBS | Quantified plant health — track droughts, deforestation, crop cycles |
| Night Lights | NASA GIBS | Human activity patterns — urbanization, economic output, conflict blackouts |
| Precipitation Rate | NASA IMERG | Where it's raining right now, globally |
| Aerosol Optical Depth | NASA MODIS | Air pollution transport — see smoke plumes, dust storms, haze events |
| Sentinel-2 Cloudless | EOX/ESA | Cloud-free annual composite at 10m resolution |
| Surface Water | JRC/Google | Every lake, river, and reservoir mapped and tracked over time |
| Ocean Bathymetry | EMODnet/GEBCO | Seafloor depth for maritime and coastal analysis |

---

## Use It As a Template

This toolkit is designed to be a **starting point, not a finished product**. The intended workflow:

1. **Clone** the repo
2. **Pick your geography** — change the map center and zoom
3. **Enable the modules** you need — toggle them in the registry
4. **Add client-specific modules** — copy `_template.ts`, fill in the API logic
5. **Deploy** — it's a standard Next.js app, deploy anywhere

### Example: Build a Disaster Response Dashboard in 10 Minutes

```bash
git clone https://github.com/Nonarkara/DrNon-Global-Satellite-Toolkit.git my-disaster-dashboard
cd my-disaster-dashboard
npm install

# Set your FIRMS key for live fire data
echo "FIRMS_KEY=your_key_here" > .env.local

npm run dev
```

Enable these modules in the UI: **NASA FIRMS** + **ReliefWeb** + **Open-Meteo AQI** + **GDELT Events**. You now have a working disaster monitoring dashboard with fire detection, humanitarian alerts, air quality, and news event correlation.

### Example: Build a Smart City Command Center

Same repo, different modules: **Longdo Traffic** + **AQICN Thailand** + **TMD Weather** + **Phuket Smart Bus** + **Highway Cameras**. You now have urban mobility, environmental monitoring, and transit tracking in one interface.

### Example: Build an OSINT Geopolitical Monitor

Enable: **ACLED** + **GDELT Events** + **OpenSky Network** + **CelesTrak** + **Google Trends** + **Night Lights**. You now have conflict events, air traffic patterns, satellite overpass awareness, media narrative tracking, and economic activity indicators — all on one map.

---

## Adding Your Own Modules

Every module is one file. Copy the template:

```bash
cp src/modules/_template.ts src/modules/my-category/my-source.ts
```

Fill in 5 things:
1. **`id`** — unique string
2. **`label`** — human-readable name
3. **`category`** — which drawer it appears in
4. **`fetchData()`** — the API call (or scrape, or computation)
5. **`mockData`** — realistic fallback data (same schema as live)

Add one import line to `src/modules/registry.ts`. Done. It appears in the module selector, gets a dynamic API route, and the React hook can consume it.

---

## Distance Grid System

4 grid presets with automatic zoom-level selection and Mercator correction:

| Preset | Cell Size | Major Lines | Nautical Miles |
|--------|-----------|-------------|----------------|
| 500m | 0.5 km | Every 1 km | ~0.27 nm |
| 1 km | 1.0 km | Every 5 km | ~0.54 nm |
| 5 km | 5.0 km | Every 10 km | ~2.70 nm |
| 10 km | 10.0 km | Every 50 km | ~5.40 nm |

Grids auto-adjust longitude spacing by latitude and suppress when too dense. Nautical mile conversion included for maritime use cases.

## Storage & Database

Supports 5 storage backends with automatic resolution:

| Backend | Best For | Free Tier |
|---------|----------|-----------|
| **Supabase** | Primary DB with PostGIS, real-time | 500MB DB, 1GB storage |
| **Firebase** | Document store, real-time listeners | 1GB Firestore, 5GB storage |
| **PostgreSQL** | Self-hosted, full control | Self-hosted |
| **Google Sheets** | Non-sensitive data, easy sharing | Free with Google account |
| **Local Cache** | Offline fallback | Always available |

## Quick Start

```bash
git clone https://github.com/Nonarkara/DrNon-Global-Satellite-Toolkit.git
cd DrNon-Global-Satellite-Toolkit
make
```

That installs and starts the dev server. Or, if you prefer npm directly:

```bash
npm install && npm run dev
```

Then open **[http://localhost:3000/imagery](http://localhost:3000/imagery)**.

You are now searching the live Sentinel-2 and Landsat archives and rendering
real satellite imagery — **with no API key, no account and no signup.** Pick a
city, drag the cloud-cover slider, and the scenes are fetched from public
archives at request time.

### Verify it yourself

```bash
npm run probe
```

This probes every keyless data source against the live internet and prints what
came back. Every source in this repo was verified this way on 2026-09-06; the
script is committed so you can re-verify whenever you like rather than trusting
the documentation.

```
  ✓ Earth Search STAC (Sentinel-2 over Bangkok)    200, 2 features
  ✓ Planetary Computer STAC (Landsat)              200, 2 features
  ✓ Copernicus Data Space STAC                     200, 10 collections
  ✓ TiTiler renders a Sentinel-2 COG tile          200 image/png @ z8
  ✓ NASA GIBS WMTS capabilities                    206
  ✓ Open-Meteo air quality                         200, pm2.5=9.5
  ✓ CelesTrak orbital elements                     200, 22 objects
  ✓ OpenSky live aircraft (anonymous)              200, 20 aircraft
  …
  12/12 passed.  Registry matches reality.
```

### How the imagery works

```
STAC search  →  public COG  →  dynamic tiler  →  XYZ tiles  →  deck.gl
Earth Search    sentinel-cogs   TiTiler          your map
(no key)        (anonymous S3)  (no key)
```

[STAC](https://stacspec.org/) is the standard catalog format the whole Earth-observation
world has converged on. This toolkit speaks it to four backends out of the box —
**Earth Search** (AWS, default), **Microsoft Planetary Computer**, **Copernicus Data
Space** (ESA) and **NASA CMR** — so the same query works across NASA, ESA and AWS
archives. See [`src/stac/`](src/stac/).

### What is actually live on a cold clone

| | Count | |
|---|---|---|
| 🟢 **Live, no credentials** | 6 | `stac-imagery`, `nasa-gibs`, `opensky-network`, `celestrak`, `open-meteo-aqi`, `google-trends` |
| 🔑 **Live once you add a free key** | 14 | FIRMS, AQICN, OpenAQ, ACLED, Space-Track, … |
| ⚪ **Fixture only** | 12 | Upstream probed dead on 2026-09-06 — see [`docs/data-sources.md`](docs/data-sources.md) |

`/api/modules/<id>` reports `tier: "live"` or `"mock"` honestly. A module never
claims to be live when it is serving a fixture.

### Python / notebooks

```bash
make python
./ingestion/.venv/bin/python ingestion/stac_search.py --aoi bangkok --max-cloud 10
```

```
  2026-07-19  cloud=0.3%    S2C_47PPQ_20260719_0_L2A
  2026-07-24  cloud=5.6%    S2B_47PPQ_20260724_0_L2A
```

Built on [`pystac-client`](https://github.com/stac-utils/pystac-client) and
[`odc-stac`](https://github.com/opendatacube/odc-stac). `make notebook` adds
JupyterLab and [`leafmap`](https://github.com/opengeos/leafmap).

### Docker

```bash
docker compose up
```

Runs the dashboard plus its own [TiTiler](https://github.com/developmentseed/titiler)
instance, so nothing depends on the public demo tiler.

### Point an AI agent at it

The repo is written to be picked up cold by Claude Code, Codex, Cursor or any
other agent runtime. [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md) carry
the architecture, the module contract and task recipes; `npm run probe -- --json`
gives an agent a machine-readable picture of which sources are alive right now;
and `GET /api/sources` serves the full curated registry — auth requirements,
gotchas and all — as JSON.

### Which data source for which question

The full prioritised guide is in **[`docs/data-sources.md`](docs/data-sources.md)** —
38 sources, each with a tier, the auth it needs, a dated probe result, usage
instructions and the gotchas that cost real time. A sample:

| I need… | Use |
|---|---|
| Recent optical imagery, anywhere, right now | `earth-search` (10 m Sentinel-2, keyless) |
| A multi-decade time series | `planetary-computer` (Landsat back to 1982) |
| To see through cloud or work at night | `asf-search` (Sentinel-1 / ALOS SAR) |
| A daily global basemap, zero processing | `nasa-gibs-wmts` |
| Active fires and burning-season haze | `nasa-firms` (free key) |
| Air quality where there are no stations | `open-meteo-aqi` (keyless model) |
| Atmospheric chemistry (NO₂, SO₂, CH₄) | `cdse-stac` → Sentinel-5P |
| Higher resolution over South Asia | `isro-bhoonidhi` via `bhoonidhi-downloader` |

### Use as a Library

```typescript
import {
  buildMapOverlayCatalog,
  createGIBSLayer,
  createDistanceGridLayer,
  GRID_PRESETS,
  getBestBasemap,
  allApis,
  registryStats,
  getModuleCatalog,
  getAllModules,
} from "drnon-global-satellite-toolkit";

// Browse the global API registry
console.log(`${registryStats.totalApis} satellite APIs cataloged`);
console.log(`${registryStats.noAuthCount} require no authentication`);

// Get all satellite overlays for a date
const catalog = buildMapOverlayCatalog("2024-03-01");

// Create a VIIRS layer for Deck.gl
const viirsLayer = createGIBSLayer({
  id: "viirs",
  layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
  date: "2024-03-01",
});

// List all available data modules
const modules = getModuleCatalog();
console.log(`${modules.total} data source modules available`);
```

## Environment Variables

All optional — the system works without any keys using mock data and free basemaps.

```bash
# Satellite data
FIRMS_KEY=                          # NASA FIRMS thermal detection (free)

# Module API keys (all optional — mock data used when absent)
ACLED_KEY=                          # Armed conflict data
ACLED_EMAIL=                        # ACLED registration email
SENTINEL_HUB_KEY=                   # ESA processed imagery
SPACE_TRACK_USER=                   # NORAD orbital catalog
SPACE_TRACK_PASS=
FLIGHTLABS_KEY=                     # Aviation data
METEOBLUE_KEY=                      # High-res weather
METEOSOURCE_KEY=                    # Hyperlocal weather
PREDICTHQ_KEY=                      # Event intelligence
NEWS_API_KEY=                       # News aggregation

# Base maps (all optional — OSM works without any tokens)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=    # Mapbox
LONGDO_MAP_KEY=                     # LongDo Map (free, Thai-optimized)
STADIA_API_KEY=                     # Stadia Maps

# Database (pick one, or none for local cache)
DATABASE_URL=                       # PostgreSQL with PostGIS
SUPABASE_URL=                       # Supabase
SUPABASE_ANON_KEY=
```

## Key Design Decisions

1. **No satellite processing on the client** — We consume pre-processed tiles via WMTS/XYZ endpoints, not raw imagery. The client stays lightweight.

2. **STAC is the universal standard** — Any STAC-compatible API can be queried with `pystac-client`. The registry tracks which agencies support it.

3. **Mock data is not optional** — Every module ships realistic mock data with the same schema as live responses. This means the dashboard works on day zero with zero configuration.

4. **Resilience over features** — Every external dependency has a fallback chain. The dashboard works offline, without API keys, and with intermittent connectivity.

5. **One file per data source** — Adding a module never requires editing more than 2 files (the module itself + one line in the registry). Removing a module is the reverse.

6. **Metadata everywhere** — Every tile fetch and API call logs provider, timestamp, latency, and status. This builds an audit trail for accuracy and provider health over time.

---

## Who This Is For

- **Smart city teams** who need a situational awareness dashboard without building from scratch
- **Disaster response organizations** who need fire/flood/weather monitoring in hours, not months
- **Defense and intelligence analysts** who want open-source satellite + OSINT fusion
- **Climate researchers** who need multi-source environmental data on one screen
- **Journalists and OSINT investigators** who verify events with satellite evidence
- **Urban planners** who want to see how cities grow, breathe, and move
- **Developers** who want a production-grade geospatial template instead of a tutorial project
- **Anyone** who wants to understand what's happening on Earth, right now, from open data

---

## Author & Attribution

This toolkit — including the global satellite API registry, overlay engine, module system, fallback architecture, distance grid system, and storage design — is an original compilation and product by **Dr Non Arkaraprasertkul** ([@Nonarkara](https://github.com/Nonarkara)).

**Dr Non Arkaraprasertkul**
PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors
Senior Expert in Smart City Promotion
Digital Economy Promotion Agency of Thailand (depa)
Bangkok, Thailand 10900

The satellite API registry was compiled through exhaustive research of 80+ space agencies per UNOOSA/WMO OSCAR directories, cross-referenced against global STAC indexes, developer portals, and open-data catalogs. The module system and overlay engine were extracted from production geopolitical monitoring dashboards.

Most of the world's satellite data is free. Most people don't know that. This toolkit exists so that the barrier to building something meaningful with that data is as close to zero as possible.

## License

MIT — see [LICENSE](LICENSE).
