# Example: Disaster Watch

A working dashboard configuration for emergency operations and disaster response. Drop-in replacement for the default `src/app/page.tsx` and `src/modules/registry.ts`.

## What it does

A real-time situational awareness dashboard for the first 72 hours of a disaster event. Shows:

- **Active fire hotspots** (NASA FIRMS thermal anomalies)
- **Disaster events feed** (ReliefWeb, ACLED, GDELT events)
- **Air quality degradation** (PM2.5 spike detection)
- **Weather & wind** (drives fire spread, haze transport)
- **Affected population proxy** (VIIRS nightlights drop)
- **Local news** (Google Trends, GDELT news)
- **Humanitarian logistics** (PredictHQ events that block roads / shelter access)

The default AOI is **Thailand-wide** (5° – 21° N, 97° – 106° E). Move the AOI to the affected province / district during activation.

## Files

| File | Where it goes in your fork | What it changes |
|---|---|---|
| `page.tsx` | `src/app/page.tsx` | Replaces the default starter page |
| `registry.ts` | `src/modules/registry.ts` | Replaces the default module list with a disaster-focused subset |
| `aoi/thailand.ts` | (optional) `src/data/aoi.ts` | Pre-computed country AOI constants |

## How to use

```bash
# In a fresh clone
cp examples/disaster-watch/page.tsx     src/app/page.tsx
cp examples/disaster-watch/registry.ts  src/modules/registry.ts
cp -r examples/disaster-watch/aoi       src/data/        # optional
npm install
npm run dev
```

## Modules enabled

- `nasa-firms` (fire hotspots — primary signal)
- `nasa-gibs` (true-color + aerosol satellite imagery as backdrop)
- `reliefweb` (humanitarian disaster reports)
- `acled` (conflict / protests / explosions — proxy for security incidents) — needs key
- `gdelt-events` (geocoded news events, free)
- `open-meteo-aqi` (smoke / haze correlation)
- `openaq` (ground AQI confirmation)
- `tmd-weather` (driving wind, precipitation)
- `meteoblue` (high-resolution weather forecast) — needs key
- `predicthq` (events that affect logistics) — needs key
- `google-trends` (public attention spike)
- `gdelt-news` (free news)

12 modules — focused on **fast** situational awareness. Every module here has either no-key-required or a clear "set this env var to upgrade to live" path.

## Activation workflow

1. **Detection** — FIRMS picks up a new hotspot cluster, or ReliefWeb publishes a new event
2. **Triangulation** — AQI spike (downwind smoke), GDELT events, news trends
3. **AOI zoom** — operator narrows the AOI to the affected province/district
4. **72-hour watch** — the dashboard polls every 60s, surfaces new events in the feed
5. **After-action** — switch to a longer `pollInterval`, hand off to recovery modules

## What's *not* in this example

- City-level granularity — see `examples/city-monitor/`
- Country set for Southeast Asia — see `examples/southeast-asia/`
- AI / LLM summarization — see the planned `src/modules/llm/` extension
