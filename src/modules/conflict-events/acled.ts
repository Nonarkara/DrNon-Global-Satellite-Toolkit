import type { ModuleDefinition } from "../../types/modules";

interface AcledEvent {
  event_date: string;
  event_type: string;
  sub_event_type: string;
  country: string;
  admin1: string;
  location: string;
  fatalities: number;
  notes: string;
  latitude?: number;
  longitude?: number;
}

const API = "https://api.acleddata.com/acled/read";
const COUNTRIES = "Thailand|Myanmar|Cambodia|Laos|Malaysia";
const LIMIT = 100;

/** ACLED returns every field as a string, including numerics. */
interface AcledRawRow {
  event_date?: string;
  event_type?: string;
  sub_event_type?: string;
  country?: string;
  admin1?: string;
  location?: string;
  fatalities?: string;
  notes?: string;
  latitude?: string;
  longitude?: string;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export const acled: ModuleDefinition<AcledEvent[]> = {
  id: "acled",
  label: "ACLED Conflict Data",
  category: "conflict-events",
  description:
    "Armed conflict events, protests and political violence across mainland Southeast Asia from ACLED. Requires a free ACLED access key and registered email.",
  pollInterval: 3600,
  uiType: "feed",
  requiredEnvVars: ["ACLED_KEY", "ACLED_EMAIL"],

  async fetchData(): Promise<AcledEvent[]> {
    const key = process.env.ACLED_KEY;
    const email = process.env.ACLED_EMAIL;
    if (!key || !email) {
      throw new Error(
        "ACLED_KEY and ACLED_EMAIL not set — register free at https://acleddata.com/register/",
      );
    }

    // ACLED filters use a `_where=OR` suffix for pipe-separated value lists.
    const params = new URLSearchParams({
      key,
      email,
      country: COUNTRIES,
      country_where: "OR",
      limit: String(LIMIT),
    });

    const res = await fetch(`${API}?${params}`, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`ACLED: ${res.status}`);

    const json = (await res.json()) as {
      success?: boolean;
      error?: unknown;
      data?: AcledRawRow[];
    };

    if (json.success === false) {
      throw new Error(`ACLED rejected the request: ${JSON.stringify(json.error).slice(0, 120)}`);
    }

    return (json.data ?? []).map((row) => ({
      event_date: row.event_date ?? "",
      event_type: row.event_type ?? "",
      sub_event_type: row.sub_event_type ?? "",
      country: row.country ?? "",
      admin1: row.admin1 ?? "",
      location: row.location ?? "",
      fatalities: toNumber(row.fatalities) ?? 0,
      notes: row.notes ?? "",
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
    }));
  },

  mockData: [
    {
      event_date: "2026-03-20",
      event_type: "Protests",
      sub_event_type: "Peaceful protest",
      country: "Thailand",
      admin1: "Bangkok",
      location: "Democracy Monument",
      fatalities: 0,
      notes: "Sample protest event",
    },
  ],
};
