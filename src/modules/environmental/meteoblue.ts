import type { ModuleDefinition } from "../../types/modules";

interface MeteobluePoint {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  time: string;
}

export const meteoblue: ModuleDefinition<MeteobluePoint[]> = {
  id: "meteoblue",
  label: "Meteoblue Weather",
  category: "environmental",
  description:
    "High-resolution weather data with 100+ variables — temperature, humidity, wind, precipitation for Thai cities. 14-day forecasts.",
  pollInterval: 1800,
  uiType: "table",
  requiredEnvVars: ["METEOBLUE_KEY"],
  tableColumns: [
    { key: "location", label: "Location" },
    { key: "temperature", label: "Temp (C)" },
    { key: "humidity", label: "Humidity %" },
    { key: "windSpeed", label: "Wind (m/s)" },
    { key: "precipitation", label: "Rain (mm)" },
  ],

  async fetchData() {
    const key = process.env.METEOBLUE_KEY;
    if (!key) throw new Error("METEOBLUE_KEY not configured");

    const locations = [
      { name: "Bangkok", lat: 13.756, lng: 100.502 },
      { name: "Phuket", lat: 7.88, lng: 98.39 },
      { name: "Chiang Mai", lat: 18.787, lng: 98.984 },
    ];

    const results: MeteobluePoint[] = [];
    for (const loc of locations) {
      const url = `https://my.meteoblue.com/packages/current?apikey=${key}&lat=${loc.lat}&lon=${loc.lng}&format=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        data_current?: {
          temperature?: number;
          relative_humidity?: number;
          wind_speed?: number;
          precipitation?: number;
          pictocode?: number;
          time?: string;
        };
      };
      const c = json.data_current;
      if (c) {
        results.push({
          location: loc.name,
          temperature: c.temperature ?? 0,
          humidity: c.relative_humidity ?? 0,
          windSpeed: c.wind_speed ?? 0,
          precipitation: c.precipitation ?? 0,
          weatherCode: c.pictocode ?? 0,
          time: c.time ?? new Date().toISOString(),
        });
      }
    }
    return results;
  },

  mockData: [
    { location: "Bangkok", temperature: 34, humidity: 65, windSpeed: 3.2, precipitation: 0, weatherCode: 2, time: "2026-03-25T12:00:00Z" },
    { location: "Phuket", temperature: 31, humidity: 78, windSpeed: 4.1, precipitation: 2.5, weatherCode: 7, time: "2026-03-25T12:00:00Z" },
  ],
};
