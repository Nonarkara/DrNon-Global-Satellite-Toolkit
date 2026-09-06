import type { ModuleDefinition } from "../../types/modules";

interface FireEvent {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string;
  acq_date: string;
}

const API = "https://firms.modaps.eosdis.nasa.gov/api/area/csv";

/** FIRMS area order is west,south,east,north — the reverse of many APIs. */
const AREA = "92,5,106,21"; // Mainland Southeast Asia
const SOURCE = "VIIRS_SNPP_NRT"; // 375 m, ~3 h latency
const DAYS = 1;
const MAX_ROWS = 500;

/** Minimal CSV parse — FIRMS returns a flat, unquoted CSV. */
function parseFirmsCsv(csv: string): FireEvent[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const col = (name: string) => headers.indexOf(name);

  const iLat = col("latitude");
  const iLon = col("longitude");
  const iBright = col("bright_ti4") !== -1 ? col("bright_ti4") : col("brightness");
  const iConf = col("confidence");
  const iDate = col("acq_date");

  if (iLat === -1 || iLon === -1) {
    throw new Error("FIRMS CSV missing latitude/longitude columns");
  }

  return lines
    .slice(1, MAX_ROWS + 1)
    .map((line) => line.split(","))
    .filter((f) => f.length >= headers.length - 1)
    .map((f) => ({
      latitude: Number(f[iLat]),
      longitude: Number(f[iLon]),
      brightness: Math.round(Number(f[iBright] ?? 0)),
      confidence: f[iConf] ?? "unknown",
      acq_date: f[iDate] ?? "",
    }))
    .filter((e) => Number.isFinite(e.latitude) && Number.isFinite(e.longitude));
}

export const nasaFirms: ModuleDefinition<FireEvent[]> = {
  id: "nasa-firms",
  label: "NASA FIRMS Fire Detection",
  category: "earth-observation",
  description:
    "Near-real-time thermal hotspots from VIIRS (375 m) across mainland Southeast Asia, ~3 h behind satellite overpass. Needs a free FIRMS_KEY.",
  pollInterval: 900,
  uiType: "table",
  requiredEnvVars: ["FIRMS_KEY"],
  tableColumns: [
    { key: "acq_date", label: "Date" },
    { key: "latitude", label: "Lat" },
    { key: "longitude", label: "Lng" },
    { key: "brightness", label: "Brightness (K)" },
    { key: "confidence", label: "Confidence" },
  ],

  async fetchData() {
    const key = process.env.FIRMS_KEY;
    if (!key) {
      // Explicit, actionable failure — the route catches this and serves
      // mockData, and the UI shows the module as unconfigured.
      throw new Error(
        "FIRMS_KEY not set — get a free key at https://firms.modaps.eosdis.nasa.gov/api/map_key/",
      );
    }

    const res = await fetch(`${API}/${key}/${SOURCE}/${AREA}/${DAYS}`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`FIRMS: ${res.status}`);

    const text = await res.text();
    // FIRMS returns 200 with a plain-text error body for a bad key.
    if (text.startsWith("Invalid") || text.includes("MAP_KEY")) {
      throw new Error(`FIRMS rejected the key: ${text.slice(0, 80)}`);
    }
    return parseFirmsCsv(text);
  },

  mockData: [
    {
      latitude: 7.88,
      longitude: 98.39,
      brightness: 312,
      confidence: "nominal",
      acq_date: "2026-03-24",
    },
    {
      latitude: 18.79,
      longitude: 98.98,
      brightness: 331,
      confidence: "high",
      acq_date: "2026-03-24",
    },
  ],
};
