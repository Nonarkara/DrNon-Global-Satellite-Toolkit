# Example: City Monitor (Bangkok)

A working dashboard configuration for a single-city situational awareness view. Drop-in replacement for the default `src/app/page.tsx` and `src/modules/registry.ts`.

## What it does

A 1-screen dashboard for a city operations center. Shows:

- **Live air quality** for the city (PM2.5 / PM10 / NO₂ from Open-Meteo + OpenAQ)
- **Weather now** (temperature, humidity, precipitation from TMD / Open-Meteo)
- **Public transit status** (BTS / MRT / buses from `src/modules/thailand/`)
- **Traffic camera snapshots** (Longdo + Highway Cams)
- **Recent news** about the city (Google Trends + GDELT-news)
- **Fire / haze hotspots** within 50 km of city center (NASA FIRMS)

The default AOI is **Bangkok** (13.7563° N, 100.5018° E), 50 km buffer. Change one line to retarget the entire dashboard at any city.

## Files

| File | Where it goes in your fork | What it changes |
|---|---|---|
| `page.tsx` | `src/app/page.tsx` | Replaces the default starter page |
| `registry.ts` | `src/modules/registry.ts` | Replaces the default module list with a city-focused subset |

## How to use

```bash
# In a fresh clone of the toolkit
cp examples/city-monitor/page.tsx     src/app/page.tsx
cp examples/city-monitor/registry.ts  src/modules/registry.ts
npm install
npm run dev
# Open http://localhost:3000
```

With **zero env keys set**, the dashboard renders mock data for all modules. Add keys to `.env` to flip any module from `mock` → `live`.

## Retarget to another city

Edit `AOI` in `page.tsx`:

```ts
const AOI = {
  name: "Bangkok",
  center: [100.5018, 13.7563] as [number, number],   // [lon, lat]
  radiusKm: 50,
  bbox: [100.35, 13.55, 100.85, 13.95] as [number, number, number, number],
};
```

Replace with your target city's coordinates. Everything downstream (FIRMS AOI filter, transit list, news query) is parameterised on this constant.

For a non-Thailand city, also adjust the `thailand/` modules — they're Thailand-specific by design. Replace them with your local transit / traffic / open-data equivalents.

## Modules enabled

- `nasa-firms` (fire hotspots within radius)
- `open-meteo-aqi` (air quality)
- `openaq` (ground station AQI)
- `tmd-weather` (Thai Met Dept)
- `meteosource-thai` (hyperlocal Thai weather) — needs key
- `bts-mrt` (Bangkok rail)
- `srt-trains` (State Railway)
- `longdo-traffic` (Bangkok traffic)
- `highway-cameras` (motorway CCTV)
- `gtfs-buses` (bus routes)
- `pksb-transit` (Phuket bus — keep even outside Bangkok; useful for coastal haze correlation)
- `google-trends` (trending searches in the city)
- `news-api` (city-tagged news) — needs key
- `gdelt-news` (free fallback)
- `thailand-admin` (district metadata)

15 modules — small enough to render fast, large enough to be useful.

## What's *not* in this example

- Country / region scale — see `examples/disaster-watch/` and `examples/southeast-asia/`
- Maritime / coastal surveillance — see the per-port extensions
- Custom basemaps — the default basemap catalog handles 12 providers out of the box
