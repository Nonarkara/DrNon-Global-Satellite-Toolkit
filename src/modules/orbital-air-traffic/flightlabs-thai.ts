import type { ModuleDefinition } from "../../types/modules";

interface FlightLabsFlight {
  flightIata: string;
  airlineIata: string;
  departureIata: string;
  arrivalIata: string;
  status: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  direction: number;
}

export const flightlabsThai: ModuleDefinition<FlightLabsFlight[]> = {
  id: "flightlabs-thai",
  label: "FlightLabs Thai Aviation",
  category: "orbital-air-traffic",
  description:
    "Real-time flight tracking for BKK (Suvarnabhumi) and DMK (Don Mueang) — arrivals, departures, and live positions.",
  pollInterval: 120,
  uiType: "table",
  requiredEnvVars: ["FLIGHTLABS_KEY"],
  tableColumns: [
    { key: "flightIata", label: "Flight" },
    { key: "airlineIata", label: "Airline" },
    { key: "departureIata", label: "From" },
    { key: "arrivalIata", label: "To" },
    { key: "status", label: "Status" },
  ],

  async fetchData() {
    const key = process.env.FLIGHTLABS_KEY;
    if (!key) throw new Error("FLIGHTLABS_KEY not configured");
    const url = `https://airlabs.co/api/v9/flights?api_key=${key}&arr_iata=BKK&_fields=flight_iata,airline_iata,dep_iata,arr_iata,status,lat,lng,alt,speed,dir`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`FlightLabs: ${res.status}`);
    const json = (await res.json()) as {
      response?: Array<{
        flight_iata: string;
        airline_iata: string;
        dep_iata: string;
        arr_iata: string;
        status: string;
        lat: number;
        lng: number;
        alt: number;
        speed: number;
        dir: number;
      }>;
    };
    return (json.response ?? []).slice(0, 100).map((f) => ({
      flightIata: f.flight_iata ?? "",
      airlineIata: f.airline_iata ?? "",
      departureIata: f.dep_iata ?? "",
      arrivalIata: f.arr_iata ?? "",
      status: f.status ?? "",
      latitude: f.lat ?? 0,
      longitude: f.lng ?? 0,
      altitude: f.alt ?? 0,
      speed: f.speed ?? 0,
      direction: f.dir ?? 0,
    }));
  },

  mockData: [
    { flightIata: "TG401", airlineIata: "TG", departureIata: "LHR", arrivalIata: "BKK", status: "en-route", latitude: 30.5, longitude: 68.2, altitude: 11000, speed: 870, direction: 95 },
  ],
};
