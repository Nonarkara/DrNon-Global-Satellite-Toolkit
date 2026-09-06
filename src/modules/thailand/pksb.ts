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

/**
 * Phuket Smart Bus publishes no open real-time feed. This module ships a
 * route fixture so the panel renders, and is flagged `fixtureOnly` so the
 * catalog never claims it is live.
 *
 * To make it live: obtain a GTFS-Realtime VehiclePositions URL from the
 * operator, then replace fetchData with a protobuf decode
 * (`gtfs-realtime-bindings`) and drop the fixtureOnly flag.
 */
export const pksbTransit: ModuleDefinition<BusPosition[]> = {
  id: "pksb-transit",
  label: "Phuket Smart Bus (fixture)",
  category: "thailand",
  description:
    "Phuket Smart Bus route reference. No public real-time feed exists — this is a static fixture, not live vehicle data.",
  pollInterval: 0,
  uiType: "table",
  fixtureOnly: true,
  tableColumns: [
    { key: "route", label: "Route" },
    { key: "latitude", label: "Lat" },
    { key: "longitude", label: "Lng" },
    { key: "speed", label: "Speed" },
  ],

  async fetchData(): Promise<BusPosition[]> {
    throw new Error(
      "pksb-transit is fixture-only: Phuket Smart Bus publishes no open real-time API.",
    );
  },

  mockData: [
    {
      id: "bus-01",
      route: "Airport – Patong",
      latitude: 7.88,
      longitude: 98.39,
      speed: 35,
      heading: 180,
    },
    {
      id: "bus-02",
      route: "Airport – Rawai",
      latitude: 8.11,
      longitude: 98.31,
      speed: 52,
      heading: 165,
    },
  ],
};
