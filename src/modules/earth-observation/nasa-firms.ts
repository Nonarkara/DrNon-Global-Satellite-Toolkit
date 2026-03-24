import type { ModuleDefinition } from "../../types/modules";

interface FireEvent {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string;
  acq_date: string;
}

export const nasaFirms: ModuleDefinition<FireEvent[]> = {
  id: "nasa-firms",
  label: "NASA FIRMS Fire Detection",
  category: "earth-observation",
  description:
    "Near-real-time fire detection from NASA VIIRS/MODIS satellite sensors across Southeast Asia.",
  pollInterval: 120,
  uiType: "table",
  wrapsExisting: "/api/fires",
  tableColumns: [
    { key: "acq_date", label: "Date" },
    { key: "latitude", label: "Lat" },
    { key: "longitude", label: "Lng" },
    { key: "brightness", label: "Brightness" },
    { key: "confidence", label: "Confidence" },
  ],

  async fetchData() {
    const res = await fetch("http://127.0.0.1:3000/api/fires", {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`FIRMS proxy: ${res.status}`);
    return (await res.json()) as FireEvent[];
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
      latitude: 8.45,
      longitude: 98.53,
      brightness: 298,
      confidence: "low",
      acq_date: "2026-03-24",
    },
  ],
};
