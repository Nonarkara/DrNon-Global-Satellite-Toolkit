import type { ModuleDefinition } from "../../types/modules";

interface OpenAqMeasurement {
  location: string;
  city: string;
  country: string;
  parameter: string;
  value: number;
  unit: string;
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export const openaq: ModuleDefinition<OpenAqMeasurement[]> = {
  id: "openaq",
  label: "OpenAQ Global Air Quality",
  category: "environmental",
  description:
    "Real-time air quality from 30,000+ stations worldwide via OpenAQ. PM2.5, PM10, O3, NO2, SO2, CO measurements.",
  pollInterval: 600,
  uiType: "table",
  tableColumns: [
    { key: "location", label: "Station" },
    { key: "city", label: "City" },
    { key: "parameter", label: "Param" },
    { key: "value", label: "Value" },
    { key: "unit", label: "Unit" },
  ],

  async fetchData() {
    // Thailand + surrounding countries, PM2.5 focus
    const url =
      "https://api.openaq.org/v2/latest?country=TH&parameter=pm25&limit=50&sort=desc&order_by=lastUpdated";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`OpenAQ: ${res.status}`);
    const json = (await res.json()) as {
      results?: Array<{
        location: string;
        city: string;
        country: string;
        coordinates: { latitude: number; longitude: number };
        measurements: Array<{
          parameter: string;
          value: number;
          unit: string;
          lastUpdated: string;
        }>;
      }>;
    };

    const items: OpenAqMeasurement[] = [];
    for (const result of json.results ?? []) {
      for (const m of result.measurements) {
        items.push({
          location: result.location,
          city: result.city,
          country: result.country,
          parameter: m.parameter,
          value: m.value,
          unit: m.unit,
          lastUpdated: m.lastUpdated,
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude,
        });
      }
    }
    return items;
  },

  mockData: [
    {
      location: "Bangkok BMDC",
      city: "Bangkok",
      country: "TH",
      parameter: "pm25",
      value: 28.5,
      unit: "µg/m³",
      lastUpdated: "2026-03-25T10:00:00Z",
      latitude: 13.756,
      longitude: 100.502,
    },
  ],
};
