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

const API = "https://opensky-network.org/api/states/all";

/** Mainland SEA: Myanmar through Malaysia. Narrow this to cut quota use. */
const BBOX = { lamin: 5.5, lomin: 92.0, lamax: 21.0, lomax: 106.0 };

/**
 * OpenSky returns state vectors as positional arrays, not objects.
 * Index map: https://openskynetwork.github.io/opensky-api/rest.html
 */
const IDX = {
  icao24: 0,
  callsign: 1,
  originCountry: 2,
  longitude: 5,
  latitude: 6,
  baroAltitude: 7,
  onGround: 8,
  velocity: 9,
  trueTrack: 10,
} as const;

type StateVector = (string | number | boolean | null)[];

const MAX_ROWS = 150;

export const openSkyNetwork: ModuleDefinition<FlightData[]> = {
  id: "opensky-network",
  label: "OpenSky Flight Tracking",
  category: "orbital-air-traffic",
  description:
    "Live ADS-B aircraft positions over mainland Southeast Asia. Works anonymously with a small quota; set OPENSKY_CLIENT_ID/SECRET for a much higher rate limit.",
  pollInterval: 60,
  uiType: "table",
  tableColumns: [
    { key: "callsign", label: "Callsign" },
    { key: "origin_country", label: "Country" },
    { key: "altitude", label: "Alt (m)" },
    { key: "velocity", label: "Speed (m/s)" },
    { key: "heading", label: "Heading" },
  ],

  async fetchData() {
    const params = new URLSearchParams(
      Object.entries(BBOX).map(([k, v]) => [k, String(v)]),
    );

    // Basic auth lifts the anonymous quota from ~400 credits/day.
    const headers: Record<string, string> = {};
    const user = process.env.OPENSKY_CLIENT_ID;
    const pass = process.env.OPENSKY_CLIENT_SECRET;
    if (user && pass) {
      headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
    }

    const res = await fetch(`${API}?${params}`, {
      headers,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`OpenSky: ${res.status}`);

    const json = (await res.json()) as { states: StateVector[] | null };
    const states = json.states ?? [];

    return states
      .filter(
        (s) =>
          typeof s[IDX.longitude] === "number" &&
          typeof s[IDX.latitude] === "number",
      )
      .slice(0, MAX_ROWS)
      .map((s) => ({
        icao24: String(s[IDX.icao24] ?? ""),
        callsign: String(s[IDX.callsign] ?? "").trim() || "—",
        longitude: Number(s[IDX.longitude]),
        latitude: Number(s[IDX.latitude]),
        altitude: Math.round(Number(s[IDX.baroAltitude] ?? 0)),
        velocity: Math.round(Number(s[IDX.velocity] ?? 0)),
        heading: Math.round(Number(s[IDX.trueTrack] ?? 0)),
        origin_country: String(s[IDX.originCountry] ?? "Unknown"),
        on_ground: Boolean(s[IDX.onGround]),
      }));
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
