import type { ModuleDefinition } from "../../types/modules";

interface FlightData {
  icao24: string;
  callsign: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  origin_country: string;
  on_ground: boolean;
}

export const openSkyNetwork: ModuleDefinition<FlightData[]> = {
  id: "opensky-network",
  label: "OpenSky Flight Tracking",
  category: "orbital-air-traffic",
  description:
    "Real-time ADS-B flight tracking over Thailand, Cambodia, Myanmar, and Malaysia via OpenSky Network.",
  pollInterval: 60,
  uiType: "table",
  wrapsExisting: "/api/flights",
  tableColumns: [
    { key: "callsign", label: "Callsign" },
    { key: "origin_country", label: "Country" },
    { key: "altitude", label: "Alt (m)" },
    { key: "velocity", label: "Speed (m/s)" },
    { key: "heading", label: "Heading" },
  ],

  async fetchData() {
    const res = await fetch("http://127.0.0.1:3000/api/flights", {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`OpenSky proxy: ${res.status}`);
    return (await res.json()) as FlightData[];
  },

  mockData: [
    {
      icao24: "883100",
      callsign: "THA601",
      longitude: 100.747,
      latitude: 13.69,
      altitude: 10668,
      velocity: 245,
      heading: 340,
      origin_country: "Thailand",
      on_ground: false,
    },
  ],
};
