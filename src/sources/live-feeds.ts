// ─── Live Situational Feeds ────────────────────────────────────────────────
// Non-imagery real-time sources: fires, flights, air, events, orbits.
// Last full probe: 2026-09-06 (run `npm run probe`).

import type { DataSource } from "./types";

export const LIVE_FEEDS: DataSource[] = [
  // ── Tier 1 — keyless and reliable. ───────────────────────────────────────
  {
    id: "open-meteo-aqi",
    name: "Open-Meteo Air Quality API",
    agency: "Open-Meteo (open-source, CAMS-derived)",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "none",
    tier: 1,
    endpoint: "https://air-quality-api.open-meteo.com/v1/air-quality",
    portal: "https://open-meteo.com/en/docs/air-quality-api",
    provides: [
      "PM2.5, PM10, NO2, SO2, O3, CO — hourly, 5-day forecast + 3-month archive",
      "European and US AQI indices",
      "Dust and UV index",
    ],
    resolution: "11 km (CAMS global) / 4 km (CAMS Europe)",
    latency: "Hourly",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://air-quality-api.open-meteo.com/v1/air-quality?latitude=13.75&longitude=100.5&hourly=pm2_5",
      note: "200, 3049 B of hourly PM2.5 for Bangkok. No key, no registration, generous free tier.",
    },
    useWhen:
      "You want air quality anywhere on Earth, including places with no ground stations, and you want it working immediately.",
    howTo:
      "GET with `latitude`, `longitude` and a comma-separated `hourly` variable list. Add `timezone=auto` for local timestamps. It is a model reanalysis, so it returns values everywhere — including over oceans and unmonitored regions.",
    gotchas: [
      "Model output, not measurement. For regulatory or ground-truth claims pair it with a station network.",
      "Non-commercial free tier is ~10k calls/day. Cache aggressively; poll at 15+ minute intervals.",
    ],
    seeAlso: ["openaq", "aqicn"],
  },
  {
    id: "celestrak",
    name: "CelesTrak GP (orbital elements)",
    agency: "CelesTrak / Dr T.S. Kelso",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "none",
    tier: 1,
    endpoint: "https://celestrak.org/NORAD/elements/gp.php",
    portal: "https://celestrak.org/",
    docs: "https://celestrak.org/NORAD/documentation/gp-data-formats.php",
    provides: [
      "TLE / OMM orbital elements for ~30,000 tracked objects",
      "Grouped feeds: stations, active satellites, weather, GNSS, Starlink, debris",
      "SupGP supplemental elements from operators",
    ],
    latency: "Updated several times daily",
    coverage: "All catalogued Earth-orbiting objects",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json",
      note: "200, 9298 B of JSON orbital elements. Fully anonymous.",
    },
    useWhen:
      "You need to know where a satellite is, or predict when one will next pass over your area of interest.",
    howTo:
      "GET gp.php with `GROUP=` (stations, active, weather, science…) or `CATNR=` for one object, and `FORMAT=json|tle|xml`. Propagate with an SGP4 library (`satellite.js` in the browser, `sgp4`/`skyfield` in Python) — TLEs are not positions, they are inputs to a propagator.",
    gotchas: [
      "CelesTrak asks you to cache and not re-fetch more than a few times a day. Repeated hammering gets your IP blocked.",
      "TLE accuracy decays; elements older than ~a week give visibly wrong positions.",
    ],
    seeAlso: ["space-track"],
  },
  {
    id: "nasa-eonet",
    name: "NASA EONET (Earth Observatory Natural Event Tracker)",
    agency: "NASA",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "none",
    tier: 1,
    endpoint: "https://eonet.gsfc.nasa.gov/api/v3/events",
    portal: "https://eonet.gsfc.nasa.gov/",
    docs: "https://eonet.gsfc.nasa.gov/docs/v3",
    provides: [
      "Curated natural events as GeoJSON: wildfires, storms, volcanoes, floods, icebergs",
      "Each event linked to the GIBS imagery layers that show it",
      "Open and closed event history",
    ],
    latency: "Hours to a day (human-curated)",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe: "GET https://eonet.gsfc.nasa.gov/api/v3/events?limit=2",
      note: "200, 87983 B of curated global events. No key.",
    },
    useWhen:
      "You want a clean, de-duplicated list of significant natural events rather than a raw firehose of sensor detections.",
    howTo:
      "GET /api/v3/events with `category` (wildfires, severeStorms, volcanoes, floods…), `status=open|closed`, `days`, and `bbox`. Response is event-shaped GeoJSON with a geometry time series — ideal for a dashboard alert feed. Pairs naturally with GIBS: each event carries the layer names that visualise it.",
    gotchas: [
      "Curated, so it is authoritative but lags raw detections by hours. For fire response speed use FIRMS instead.",
      "bbox order is lon-min, lat-MAX, lon-max, lat-MIN — upper-left then lower-right, not the usual STAC order.",
    ],
    seeAlso: ["nasa-firms", "nasa-gibs-wmts"],
  },
  {
    id: "gdelt",
    name: "GDELT 2.0 Document & Event API",
    agency: "GDELT Project",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "none",
    tier: 1,
    endpoint: "https://api.gdeltproject.org/api/v2/doc/doc",
    portal: "https://www.gdeltproject.org/",
    docs: "https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/",
    provides: [
      "Worldwide news monitoring in 65+ languages, updated every 15 minutes",
      "Geocoded events, tone and theme scoring",
      "Article search with country, language and time filters",
    ],
    latency: "15 minutes",
    coverage: "Global",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://api.gdeltproject.org/api/v2/doc/doc?query=flood&mode=artlist&format=json&maxrecords=2",
      note: "First probe returned 429 (rate limited), retry returned 200 with articles. Throttle your calls.",
    },
    useWhen:
      "You want the human-reported context around what the satellites are showing — the flood in the imagery, described by local press.",
    howTo:
      "GET /doc/doc with `query` (supports `sourcecountry:`, `theme:`, `near:`), `mode=artlist|timelinevol|geo`, `format=json`, `maxrecords`. `mode=geo` returns mappable GeoJSON directly.",
    gotchas: [
      "Rate limits are real and undocumented — one call every few seconds, with backoff. A 429 on first call is common.",
      "No API key means no quota to raise. Cache results server-side; never poll from the browser.",
      "Free-text queries pick up a lot of noise. Always constrain by country or theme.",
    ],
  },
  {
    id: "opensky",
    name: "OpenSky Network",
    agency: "OpenSky Network (non-profit, ETH Zürich)",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "free-account",
    tier: 1,
    endpoint: "https://opensky-network.org/api/states/all",
    portal: "https://opensky-network.org/",
    docs: "https://openskynetwork.github.io/opensky-api/rest.html",
    provides: [
      "Live ADS-B aircraft state vectors: position, altitude, velocity, heading",
      "Flight and track history for registered users",
      "Airport arrival/departure listings",
    ],
    latency: "5–10 seconds",
    coverage: "Global where volunteer receivers exist; dense over Europe/N. America, thinner over SEA oceans",
    verified: {
      at: "2026-09-06",
      status: "ok",
      probe:
        "GET https://opensky-network.org/api/states/all?lamin=13&lomin=100&lamax=14&lomax=101",
      note: "200, 2636 B — live aircraft over Bangkok, anonymously. Anonymous quota is small; register for a usable one.",
    },
    useWhen:
      "You need live air traffic — airport congestion, airspace closures during a disaster, or a movement layer over your map.",
    howTo:
      "GET /api/states/all with a bounding box (`lamin`,`lomin`,`lamax`,`lomax`). Response is a positional array, not objects — index 5 is longitude, 6 is latitude, 7 baro-altitude. Register a free account and use OAuth2 client credentials to lift the rate limit substantially.",
    gotchas: [
      "Anonymous users get ~400 credits/day and 10-second resolution; it is easy to exhaust in an afternoon of development.",
      "Always pass a bounding box. Fetching the unbounded global state vector is enormous and burns quota instantly.",
      "Coverage is volunteer-driven — sparse over oceans and parts of Asia. Absence of aircraft is not absence of flights.",
    ],
    requiredEnvVars: ["OPENSKY_CLIENT_ID", "OPENSKY_CLIENT_SECRET"],
  },

  // ── Tier 2 — free key, issued instantly. ─────────────────────────────────
  {
    id: "nasa-firms",
    name: "NASA FIRMS (Fire Information for Resource Management)",
    agency: "NASA",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "free-key",
    tier: 2,
    endpoint: "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
    portal: "https://firms.modaps.eosdis.nasa.gov/",
    docs: "https://firms.modaps.eosdis.nasa.gov/api/area/",
    provides: [
      "Active fire / thermal anomaly detections from VIIRS (375 m) and MODIS (1 km)",
      "Near-real-time, 3 hours behind satellite overpass",
      "Brightness temperature, fire radiative power, confidence class",
    ],
    resolution: "375 m (VIIRS S-NPP/NOAA-20/21), 1 km (MODIS)",
    latency: "~3 h (NRT), ~1 min for US/Canada (RT)",
    coverage: "Global, multiple overpasses daily",
    verified: {
      at: "2026-09-06",
      status: "needs-auth",
      probe:
        "GET https://firms.modaps.eosdis.nasa.gov/api/area/csv/DEMO_KEY/VIIRS_SNPP_NRT/world/1",
      note: "400 'Invalid MAP_KEY.' — endpoint is live and correct, it simply requires a real key. Keys are issued instantly and free by email.",
    },
    useWhen:
      "Agricultural burning, wildfire, or haze — this is the canonical global hotspot feed and the backbone of any burning-season dashboard.",
    howTo:
      "Request a free MAP_KEY at firms.modaps.eosdis.nasa.gov/api/map_key/ (arrives by email in minutes). Then GET /api/area/csv/{MAP_KEY}/{SOURCE}/{west,south,east,north}/{days} — e.g. source `VIIRS_SNPP_NRT`, area `97,5,106,21` for Thailand, days `1`. Returns CSV; parse to GeoJSON for mapping. Set `FIRMS_KEY` in .env and the `nasa-firms` module goes live automatically.",
    gotchas: [
      "The area parameter is west,south,east,north — the opposite corner order from many other APIs.",
      "A 'fire' detection is a thermal anomaly: gas flares, industrial furnaces and hot bare soil all trigger it. Filter by confidence and cross-check against land cover.",
      "Transaction limit is 5000 per 10 minutes per key. Fetch a country bbox once and cache, don't query per-tile.",
    ],
    requiredEnvVars: ["FIRMS_KEY"],
    seeAlso: ["nasa-eonet", "nasa-gibs-wmts"],
  },
  {
    id: "openaq",
    name: "OpenAQ v3",
    agency: "OpenAQ (non-profit)",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "free-key",
    tier: 2,
    endpoint: "https://api.openaq.org/v3/locations",
    portal: "https://openaq.org/",
    docs: "https://docs.openaq.org/",
    provides: [
      "Aggregated ground-station air quality measurements from 100+ countries",
      "PM2.5, PM10, NO2, SO2, O3, CO, BC from reference-grade and low-cost sensors",
      "Historical archive back to 2016",
    ],
    latency: "Varies by provider, typically hourly",
    coverage: "Global where governments publish; strong in EU/US/India, patchy elsewhere",
    verified: {
      at: "2026-09-06",
      status: "needs-auth",
      probe: "GET https://api.openaq.org/v3/locations?limit=1",
      note: "401 without a key. v3 introduced mandatory API keys — older docs and tutorials describing a keyless v2 are out of date.",
    },
    useWhen:
      "You need actual measured air quality from physical instruments, not model output — for ground-truthing or regulatory reporting.",
    howTo:
      "Register free at explore.openaq.org to get a key, then send it as an `X-API-Key` header. Find stations with /v3/locations?coordinates=lat,lon&radius=25000, then pull /v3/sensors/{id}/measurements. Set `OPENAQ_KEY` in .env.",
    gotchas: [
      "v2 is retired and v3 requires a key — this changed and broke a lot of existing code, including this repo's original module.",
      "Station density is very uneven. Absence of a station is not clean air.",
    ],
    requiredEnvVars: ["OPENAQ_KEY"],
    seeAlso: ["open-meteo-aqi", "aqicn"],
  },
  {
    id: "aqicn",
    name: "World Air Quality Index (AQICN / WAQI)",
    agency: "World Air Quality Index Project",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "free-key",
    tier: 2,
    endpoint: "https://api.waqi.info/feed",
    portal: "https://aqicn.org/",
    docs: "https://aqicn.org/api/",
    provides: [
      "Real-time AQI from 12,000+ stations in 100+ countries",
      "Per-city and per-station feeds, plus map-bounds queries",
      "Dominant pollutant and per-pollutant breakdown",
    ],
    latency: "Hourly",
    coverage: "Global, with excellent Thailand and SEA station coverage",
    verified: {
      at: "2026-09-06",
      status: "needs-auth",
      note: "Requires a free token issued instantly at aqicn.org/data-platform/token/. The public demo token is heavily throttled.",
    },
    useWhen:
      "You want the AQI number the public actually sees on their phone, for a specific named city — especially in Thailand and SEA.",
    howTo:
      "Get a free token, then GET https://api.waqi.info/feed/bangkok/?token=<TOKEN>, or /feed/geo:13.75;100.5/. For a whole viewport use /map/bounds/?latlng=lat1,lng1,lat2,lng2&token=. Set `AQICN_TOKEN` in .env.",
    gotchas: [
      "AQI is a country-specific index, not a concentration. Compare µg/m³ across borders, never raw AQI.",
      "The published station list mixes reference-grade monitors with low-cost sensors of varying quality.",
    ],
    requiredEnvVars: ["AQICN_TOKEN"],
    seeAlso: ["open-meteo-aqi", "openaq"],
  },
  {
    id: "space-track",
    name: "Space-Track (18th Space Defense Squadron)",
    agency: "US Space Force",
    country: "US",
    kind: "rest-api",
    auth: "free-account",
    tier: 2,
    endpoint: "https://www.space-track.org/basicspacedata/query",
    portal: "https://www.space-track.org/",
    docs: "https://www.space-track.org/documentation",
    provides: [
      "Authoritative NORAD satellite catalog and orbital elements",
      "Conjunction data messages, decay predictions, launch history",
      "Deeper history and more objects than CelesTrak's public feeds",
    ],
    coverage: "All tracked Earth-orbiting objects",
    verified: {
      at: "2026-09-06",
      status: "needs-auth",
      note: "Session-cookie login required on every call. Not anonymously probeable.",
    },
    useWhen:
      "CelesTrak's grouped feeds aren't enough — you need the full catalog, historical elements, or conjunction warnings.",
    howTo:
      "POST credentials to /ajaxauth/login to obtain a session cookie, then query /basicspacedata/query/class/gp/... Reuse the session; do not log in per request. Set `SPACE_TRACK_USER` / `SPACE_TRACK_PASS`.",
    gotchas: [
      "Strict rate limits (≈30 requests/minute, 300/hour). Logging in on every call will get the account suspended.",
      "Account approval is manual and takes a day or two.",
      "For most dashboard use CelesTrak (tier 1) is the better answer — no auth, same underlying data.",
    ],
    requiredEnvVars: ["SPACE_TRACK_USER", "SPACE_TRACK_PASS"],
    seeAlso: ["celestrak"],
  },

  // ── Tier 4 — dead or gated; documented to save you the debugging. ────────
  {
    id: "reliefweb",
    name: "ReliefWeb API",
    agency: "UN OCHA",
    country: "GLOBAL",
    kind: "rest-api",
    auth: "approved-appname",
    tier: 4,
    endpoint: "https://api.reliefweb.int/v2",
    portal: "https://reliefweb.int/",
    docs: "https://apidoc.reliefweb.int/",
    provides: [
      "Humanitarian disaster records, situation reports, appeals",
      "Country and crisis profiles curated by UN OCHA",
    ],
    verified: {
      at: "2026-09-06",
      status: "deprecated",
      probe: "GET https://api.reliefweb.int/v1/disasters?limit=1",
      note: "v1 returns 410 'The API version v1 has been decommissioned'. v2 returns 403 'You are not using an approved appname' — a human at OCHA must approve your app name before any call works.",
    },
    useWhen:
      "You need officially recognised humanitarian disaster declarations with UN provenance, and you can wait for approval.",
    howTo:
      "Request an appname at reliefweb.int/help/api (human review). Once approved, call https://api.reliefweb.int/v2/disasters?appname=<approved>&limit=20. Until then this source cannot be used at all — the toolkit ships it as mock-only. For unblocked event data right now, use NASA EONET or GDELT instead.",
    gotchas: [
      "Every tutorial and code sample using v1, or an arbitrary appname string, is now broken. This includes this repo's original module.",
      "Approval is not instant and not guaranteed for hobby projects.",
    ],
    seeAlso: ["nasa-eonet", "gdelt"],
  },
];
