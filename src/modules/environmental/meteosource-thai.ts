import type { ModuleDefinition } from "../../types/modules";

interface MeteosourcePoint {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  precipitation: number;
  summary: string;
}

export const meteosourceThai: ModuleDefinition<MeteosourcePoint[]> = {
  id: "meteosource-thai",
  label: "Meteosource Thai Weather",
  category: "environmental",
  description:
    "Hyperlocal weather for Bangkok and Thai cities via Meteosource — temperature, feels-like, wind, precipitation with map overlay support.",
  pollInterval: 1800,
  uiType: "table",
  requiredEnvVars: ["METEOSOURCE_KEY"],
  tableColumns: [
    { key: "location", label: "Location" },
    { key: "temperature", label: "Temp (C)" },
    { key: "feelsLike", label: "Feels" },
    { key: "humidity", label: "Humidity %" },
    { key: "summary", label: "Conditions" },
  ],

  async fetchData() {
    const key = process.env.METEOSOURCE_KEY;
    if (!key) throw new Error("METEOSOURCE_KEY not configured");

    const locations = [
      { name: "Bangkok", placeId: "bangkok" },
      { name: "Phuket", placeId: "phuket" },
      { name: "Chiang Mai", placeId: "chiang-mai" },
    ];

    const results: MeteosourcePoint[] = [];
    for (const loc of locations) {
      const url = `https://www.meteosource.com/api/v1/free/point?place_id=${loc.placeId}&sections=current&key=${key}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        current?: {
          temperature?: number;
          feels_like?: number;
          humidity?: number;
          wind?: { speed?: number };
          cloud_cover?: number;
          precipitation?: { total?: number };
          summary?: string;
        };
      };
      const c = json.current;
      if (c) {
        results.push({
          location: loc.name,
          temperature: c.temperature ?? 0,
          feelsLike: c.feels_like ?? 0,
          humidity: c.humidity ?? 0,
          windSpeed: c.wind?.speed ?? 0,
          cloudCover: c.cloud_cover ?? 0,
          precipitation: c.precipitation?.total ?? 0,
          summary: c.summary ?? "",
        });
      }
    }
    return results;
  },

  mockData: [
    { location: "Bangkok", temperature: 35, feelsLike: 39, humidity: 62, windSpeed: 2.8, cloudCover: 45, precipitation: 0, summary: "Partly cloudy" },
    { location: "Phuket", temperature: 31, feelsLike: 35, humidity: 80, windSpeed: 4.2, cloudCover: 70, precipitation: 3.5, summary: "Scattered showers" },
  ],
};
