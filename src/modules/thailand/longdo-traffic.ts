import type { ModuleDefinition } from "../../types/modules";

interface TrafficIncident {
  title: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  severity: string;
  reportedAt: string;
}

export const longdoTraffic: ModuleDefinition<TrafficIncident[]> = {
  id: "longdo-traffic",
  label: "Longdo Traffic/ITS",
  category: "thailand",
  description:
    "Thai traffic incidents, congestion, and ITS data from Longdo Map — road closures, accidents, and speed reports.",
  pollInterval: 120,
  uiType: "feed",

  async fetchData() {
    // Longdo Map traffic events RSS/JSON feed
    const url = "https://traffic.longdo.com/feed/json";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Longdo traffic: ${res.status}`);
    const json = (await res.json()) as {
      events?: Array<{
        title?: string;
        description?: string;
        type?: string;
        lat?: number;
        lng?: number;
        severity?: string;
        reported_at?: string;
      }>;
    };

    return (json.events ?? []).slice(0, 40).map((e) => ({
      title: e.title ?? "Traffic incident",
      description: e.description ?? "",
      type: e.type ?? "incident",
      latitude: e.lat ?? 0,
      longitude: e.lng ?? 0,
      severity: e.severity ?? "unknown",
      reportedAt: e.reported_at ?? new Date().toISOString(),
    }));
  },

  mockData: [
    { title: "Accident on Rama IV", description: "Two-vehicle collision causing lane closure", type: "accident", latitude: 13.722, longitude: 100.537, severity: "moderate", reportedAt: "2026-03-25T08:30:00" },
    { title: "Road closure Sukhumvit Soi 21", description: "Construction work until April 2026", type: "closure", latitude: 13.738, longitude: 100.562, severity: "low", reportedAt: "2026-03-20T06:00:00" },
  ],
};
