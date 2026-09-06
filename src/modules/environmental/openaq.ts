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

const API = "https://api.openaq.org/v3/locations";
/** Bangkok centre, 50 km — retarget by editing these. */
const CENTRE = "13.75,100.5";
const RADIUS_M = 25_000;
const LIMIT = 50;

/** v3 location shape — sensors carry the latest reading inline. */
interface OpenAqV3Location {
  name?: string;
  locality?: string | null;
  country?: { name?: string; code?: string };
  coordinates?: { latitude?: number; longitude?: number };
  sensors?: {
    parameter?: { name?: string; units?: string };
    latest?: { value?: number; datetime?: { utc?: string } };
  }[];
  datetimeLast?: { utc?: string };
}

export const openaq: ModuleDefinition<OpenAqMeasurement[]> = {
  id: "openaq",
  label: "OpenAQ Ground Stations",
  category: "environmental",
  description:
    "Measured air quality from OpenAQ reference and low-cost ground stations around Bangkok. OpenAQ v3 requires a free API key — set OPENAQ_KEY to activate.",
  pollInterval: 900,
  uiType: "table",
  sourceId: "openaq",
  requiredEnvVars: ["OPENAQ_KEY"],
  tableColumns: [
    { key: "location", label: "Station" },
    { key: "city", label: "City" },
    { key: "parameter", label: "Param" },
    { key: "value", label: "Value" },
    { key: "unit", label: "Unit" },
  ],

  async fetchData(): Promise<OpenAqMeasurement[]> {
    // OpenAQ v2 was retired; v3 requires an X-API-Key header on every call.
    const key = process.env.OPENAQ_KEY;
    if (!key) {
      throw new Error(
        "OPENAQ_KEY not set — get a free key at https://explore.openaq.org/ (v3 requires one; v2 is retired)",
      );
    }

    const params = new URLSearchParams({
      coordinates: CENTRE,
      radius: String(RADIUS_M),
      limit: String(LIMIT),
    });

    const res = await fetch(`${API}?${params}`, {
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "application/json", "X-API-Key": key },
    });
    if (!res.ok) throw new Error(`OpenAQ v3: ${res.status}`);

    const json = (await res.json()) as { results?: OpenAqV3Location[] };

    return (json.results ?? []).flatMap((loc) =>
      (loc.sensors ?? [])
        .filter((sensor) => typeof sensor.latest?.value === "number")
        .map((sensor) => ({
          location: loc.name ?? "Unknown station",
          city: loc.locality ?? "",
          country: loc.country?.name ?? loc.country?.code ?? "",
          parameter: sensor.parameter?.name ?? "",
          value: sensor.latest?.value ?? 0,
          unit: sensor.parameter?.units ?? "",
          lastUpdated:
            sensor.latest?.datetime?.utc ?? loc.datetimeLast?.utc ?? "",
          latitude: loc.coordinates?.latitude ?? 0,
          longitude: loc.coordinates?.longitude ?? 0,
        })),
    );
  },

  mockData: [
    {
      location: "Bangkok — Din Daeng",
      city: "Bangkok",
      country: "Thailand",
      parameter: "pm25",
      value: 27.4,
      unit: "µg/m³",
      lastUpdated: "2026-03-24T09:00:00Z",
      latitude: 13.7649,
      longitude: 100.5501,
    },
  ],
};
