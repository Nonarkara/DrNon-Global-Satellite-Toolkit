import type { ModuleDefinition } from "../../types/modules";

interface BusPosition {
  id: string;
  route: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

export const pksbTransit: ModuleDefinition<BusPosition[]> = {
  id: "pksb-transit",
  label: "Phuket Smart Bus",
  category: "thailand",
  description:
    "Live positions and routes of Phuket Smart Bus (PKSB) transit vehicles.",
  pollInterval: 60,
  uiType: "table",
  wrapsExisting: "/api/transit/pksb",
  tableColumns: [
    { key: "route", label: "Route" },
    { key: "latitude", label: "Lat" },
    { key: "longitude", label: "Lng" },
    { key: "speed", label: "Speed" },
  ],

  async fetchData() {
    const res = await fetch("http://127.0.0.1:3000/api/transit/pksb", {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`PKSB proxy: ${res.status}`);
    const json = await res.json();
    if (json && Array.isArray(json.vehicles)) return json.vehicles as BusPosition[];
    if (Array.isArray(json)) return json as BusPosition[];
    return [];
  },

  mockData: [
    {
      id: "bus-01",
      route: "Airport-Patong",
      latitude: 7.88,
      longitude: 98.39,
      speed: 35,
      heading: 180,
    },
  ],
};
