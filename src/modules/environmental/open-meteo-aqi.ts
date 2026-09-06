import type { ModuleDefinition } from "../../types/modules";

interface AirQualityPoint {
  label: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  category: string;
}

/** Stations to sample. Edit this list to retarget the module to your region. */
const STATIONS: { label: string; lat: number; lng: number }[] = [
  { label: "Phuket Town", lat: 7.88, lng: 98.39 },
  { label: "Krabi", lat: 8.09, lng: 98.91 },
  { label: "Bangkok", lat: 13.76, lng: 100.5 },
  { label: "Chiang Mai", lat: 18.79, lng: 98.98 },
  { label: "Hat Yai", lat: 7.01, lng: 100.47 },
  { label: "Singapore", lat: 1.35, lng: 103.82 },
];

const API = "https://air-quality-api.open-meteo.com/v1/air-quality";

/** US AQI breakpoints — https://www.airnow.gov/aqi/aqi-basics/ */
function aqiCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

interface OpenMeteoPoint {
  current?: { pm2_5?: number; us_aqi?: number };
}

export const openMeteoAqi: ModuleDefinition<AirQualityPoint[]> = {
  id: "open-meteo-aqi",
  label: "Air Quality (Open-Meteo)",
  category: "environmental",
  description:
    "Live US AQI and PM2.5 from the Open-Meteo CAMS model for stations across Thailand, the Andaman coast and Singapore. No API key required.",
  pollInterval: 900,
  uiType: "table",
  tableColumns: [
    { key: "label", label: "Station" },
    { key: "aqi", label: "AQI" },
    { key: "pm25", label: "PM2.5" },
    { key: "category", label: "Category" },
  ],

  async fetchData() {
    // Open-Meteo accepts comma-separated coordinates and returns one object
    // per location, in the order requested.
    const params = new URLSearchParams({
      latitude: STATIONS.map((s) => s.lat).join(","),
      longitude: STATIONS.map((s) => s.lng).join(","),
      current: "pm2_5,us_aqi",
      timezone: "auto",
    });

    const res = await fetch(`${API}?${params}`, {
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`Open-Meteo AQI: ${res.status}`);

    const json = (await res.json()) as OpenMeteoPoint | OpenMeteoPoint[];
    // A single-station request returns an object, multi-station an array.
    const points = Array.isArray(json) ? json : [json];

    return STATIONS.map((station, i) => {
      const aqi = Math.round(points[i]?.current?.us_aqi ?? 0);
      return {
        label: station.label,
        lat: station.lat,
        lng: station.lng,
        aqi,
        pm25: Math.round((points[i]?.current?.pm2_5 ?? 0) * 10) / 10,
        category: aqiCategory(aqi),
      };
    });
  },

  mockData: [
    { label: "Phuket Town", lat: 7.88, lng: 98.39, aqi: 44, pm25: 9, category: "Good" },
    { label: "Bangkok", lat: 13.76, lng: 100.5, aqi: 92, pm25: 27, category: "Moderate" },
  ],
};
