// ─── TLE sourcing ──────────────────────────────────────────────────────────
// Two-Line Element sets from CelesTrak, for the Earth-observation platforms
// whose overpasses actually matter when you are planning an acquisition.
//
// CelesTrak returns HTTP 403 for the bulk GROUP=active feed (verified
// 2026-09-06) and asks callers to cache rather than re-fetch. Both are
// handled here.

const GP_URL = "https://celestrak.org/NORAD/elements/gp.php";
const USER_AGENT = "drnon-satellite-toolkit/2.2";
const FETCH_TIMEOUT_MS = 20_000;

/** CelesTrak asks for a few fetches a day at most. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface Tle {
  name: string;
  line1: string;
  line2: string;
  noradId: string;
}

/**
 * The imaging and environmental platforms this toolkit can act on. Each entry
 * names the CelesTrak catalogue number so we fetch exactly what we need rather
 * than pulling a whole group and filtering.
 */
export interface TrackedPlatform {
  id: string;
  label: string;
  noradId: number;
  /** Which STAC collection this platform's imagery lands in, if any. */
  collection?: string;
  /** Nominal swath width in km — drives the default overpass search radius. */
  swathKm: number;
  /**
   * Radar platforms carry their own illumination, so they image at night and
   * through cloud. Optical platforms need the sun above the horizon.
   */
  isRadar?: boolean;
  notes: string;
}

export const TRACKED_PLATFORMS: TrackedPlatform[] = [
  {
    id: "sentinel-2a",
    label: "Sentinel-2A",
    noradId: 40697,
    collection: "sentinel-2-l2a",
    swathKm: 290,
    notes: "10 m optical. With 2B/2C gives ~5-day revisit at the equator.",
  },
  {
    id: "sentinel-2b",
    label: "Sentinel-2B",
    noradId: 42063,
    collection: "sentinel-2-l2a",
    swathKm: 290,
    notes: "10 m optical, same orbit plane as 2A, 180° out of phase.",
  },
  {
    id: "sentinel-1a",
    label: "Sentinel-1A",
    noradId: 39634,
    collection: "sentinel-1-grd",
    swathKm: 250,
    isRadar: true,
    notes: "C-band SAR. Sees through cloud and works at night.",
  },
  {
    id: "landsat-8",
    label: "Landsat 8",
    noradId: 39084,
    collection: "landsat-c2-l2",
    swathKm: 185,
    notes: "30 m multispectral, 16-day repeat cycle.",
  },
  {
    id: "landsat-9",
    label: "Landsat 9",
    noradId: 49260,
    collection: "landsat-c2-l2",
    swathKm: 185,
    notes: "30 m multispectral, 8 days out of phase with Landsat 8.",
  },
  {
    id: "terra",
    label: "Terra (MODIS)",
    noradId: 25994,
    swathKm: 2330,
    notes: "250 m–1 km daily global coverage. Morning overpass.",
  },
  {
    id: "aqua",
    label: "Aqua (MODIS)",
    noradId: 27424,
    swathKm: 2330,
    notes: "250 m–1 km daily global coverage. Afternoon overpass.",
  },
  {
    id: "suomi-npp",
    label: "Suomi NPP (VIIRS)",
    noradId: 37849,
    swathKm: 3060,
    notes: "375 m VIIRS — the sensor behind FIRMS fire detections.",
  },
  {
    id: "noaa-20",
    label: "NOAA-20 (VIIRS)",
    noradId: 43013,
    swathKm: 3060,
    notes: "375 m VIIRS, 50 minutes ahead of Suomi NPP.",
  },
  {
    id: "iss",
    label: "ISS (ZARYA)",
    noradId: 25544,
    swathKm: 0,
    notes: "Not an EO platform, but the reference object for sanity-checking a propagator.",
  },
];

export function getPlatform(id: string): TrackedPlatform | undefined {
  return TRACKED_PLATFORMS.find((p) => p.id === id);
}

interface CacheEntry {
  tle: Tle;
  fetchedAt: number;
}

const tleCache = new Map<number, CacheEntry>();

/** Parse CelesTrak's 3-line TLE format. */
function parseTle(text: string): Tle | null {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 3) return null;

  const [name, line1, line2] = lines;
  if (!line1.startsWith("1 ") || !line2.startsWith("2 ")) return null;

  return { name, line1, line2, noradId: line1.substring(2, 7).trim() };
}

/** Delay between consecutive CelesTrak requests. */
const POLITE_GAP_MS = 350;
/** CelesTrak answers a burst of parallel requests with 500s; retry once. */
const MAX_ATTEMPTS = 2;
const RETRY_BACKOFF_MS = 1200;

let lastFetchAt = 0;

/** Serialises CelesTrak access: concurrent requests get throttled. */
let fetchChain: Promise<unknown> = Promise.resolve();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTleUncached(noradId: number): Promise<Tle> {
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const sinceLast = Date.now() - lastFetchAt;
    if (sinceLast < POLITE_GAP_MS) await sleep(POLITE_GAP_MS - sinceLast);
    lastFetchAt = Date.now();

    const res = await fetch(`${GP_URL}?CATNR=${noradId}&FORMAT=tle`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.ok) {
      const text = await res.text();
      const tle = parseTle(text);
      if (tle) return tle;
      lastError = `no usable elements: ${text.slice(0, 80)}`;
    } else {
      lastError = `HTTP ${res.status}`;
    }

    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_BACKOFF_MS);
  }

  throw new Error(`CelesTrak CATNR=${noradId}: ${lastError}`);
}

/**
 * Fetch one object's current elements, cached for 6 hours.
 *
 * Requests are serialised and spaced: CelesTrak answers a burst of parallel
 * requests with HTTP 500, and asks callers to cache rather than re-fetch.
 * TLE accuracy decays over days, so a 6-hour cache costs nothing in accuracy.
 */
export async function fetchTle(noradId: number): Promise<Tle> {
  const cached = tleCache.get(noradId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.tle;
  }

  // Queue behind any in-flight request so callers can fan out freely while
  // CelesTrak still sees one request at a time.
  const queued = fetchChain.then(
    () => fetchTleUncached(noradId),
    () => fetchTleUncached(noradId),
  );
  fetchChain = queued.catch(() => undefined);

  const tle = await queued;
  tleCache.set(noradId, { tle, fetchedAt: Date.now() });
  return tle;
}
