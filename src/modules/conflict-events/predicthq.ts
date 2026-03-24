import type { ModuleDefinition } from "../../types/modules";

interface PredictHqEvent {
  id: string;
  title: string;
  category: string;
  start: string;
  end: string;
  rank: number;
  country: string;
  location: string;
  lat?: number;
  lng?: number;
}

export const predicthq: ModuleDefinition<PredictHqEvent[]> = {
  id: "predicthq",
  label: "PredictHQ Events",
  category: "conflict-events",
  description:
    "Scheduled and unscheduled real-world events — sports, concerts, protests, disasters with impact ranking scores.",
  pollInterval: 600,
  uiType: "feed",
  requiredEnvVars: ["PREDICTHQ_KEY"],

  async fetchData() {
    const key = process.env.PREDICTHQ_KEY;
    if (!key) throw new Error("PREDICTHQ_KEY not configured");
    const url =
      "https://api.predicthq.com/v1/events/?country=TH&sort=rank&limit=30&active.gte=today";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`PredictHQ: ${res.status}`);
    const json = (await res.json()) as {
      results?: Array<{
        id: string;
        title: string;
        category: string;
        start: string;
        end: string;
        rank: number;
        country: string;
        location?: [number, number];
      }>;
    };
    return (json.results ?? []).map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      start: e.start,
      end: e.end,
      rank: e.rank,
      country: e.country,
      location: "",
      lat: e.location?.[1],
      lng: e.location?.[0],
    }));
  },

  mockData: [
    { id: "1", title: "Songkran Festival", category: "festivals", start: "2026-04-13", end: "2026-04-15", rank: 85, country: "TH", location: "Nationwide" },
  ],
};
