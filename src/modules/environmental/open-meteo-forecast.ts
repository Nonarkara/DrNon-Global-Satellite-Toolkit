import type { ModuleDefinition } from "../../types/modules";
import { THAI_CIVIC_POINTS } from "../lib/thai-civic";

interface ForecastRow {
  location: string;
  observedAt: string;
  tempC: number;
  humidity: number;
  precipMm: number;
  next3dRainMm: number;
  evidence: string;
}

interface OpenMeteoForecast {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    precipitation?: number;
    relative_humidity_2m?: number;
  };
  daily?: {
    precipitation_sum?: number[];
  };
}

export const openMeteoForecast: ModuleDefinition<ForecastRow[]> = {
  id: "open-meteo-forecast",
  label: "Weather Forecast (Open-Meteo)",
  category: "environmental",
  description:
    "Free Open-Meteo 7-day forecast for Thai civic cities. Modelled weather (not TMD station observations). Complements the existing Open-Meteo AQI module.",
  pollInterval: 600,
  uiType: "table",
  tableColumns: [
    { key: "location", label: "City" },
    { key: "tempC", label: "Temp °C" },
    { key: "precipMm", label: "Precip mm" },
    { key: "next3dRainMm", label: "3-day rain" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    const rows: ForecastRow[] = [];
    for (const city of THAI_CIVIC_POINTS) {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(city.lat));
      url.searchParams.set("longitude", String(city.lon));
      url.searchParams.set(
        "current",
        "temperature_2m,precipitation,relative_humidity_2m,weather_code",
      );
      url.searchParams.set("daily", "precipitation_sum,temperature_2m_max,temperature_2m_min");
      url.searchParams.set("timezone", "Asia/Bangkok");
      url.searchParams.set("forecast_days", "7");

      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`Open-Meteo ${city.id}: HTTP ${res.status}`);
      const json = (await res.json()) as OpenMeteoForecast;
      const rain = json.daily?.precipitation_sum ?? [];
      rows.push({
        location: city.label,
        observedAt: json.current?.time ?? "",
        tempC: json.current?.temperature_2m ?? NaN,
        humidity: json.current?.relative_humidity_2m ?? NaN,
        precipMm: json.current?.precipitation ?? 0,
        next3dRainMm: rain.slice(0, 3).reduce((sum, v) => sum + (v ?? 0), 0),
        evidence:
          "Modelled forecast via Open-Meteo (NWP), not a Thai Met Department station reading.",
      });
    }
    return rows;
  },

  mockData: [
    {
      location: "Bangkok",
      observedAt: "2026-09-02T16:45",
      tempC: 28.2,
      humidity: 85,
      precipMm: 0.3,
      next3dRainMm: 13.9,
      evidence:
        "Modelled forecast via Open-Meteo (NWP), not a Thai Met Department station reading.",
    },
  ],
};
