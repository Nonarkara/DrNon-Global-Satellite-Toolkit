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

export const acled: ModuleDefinition<AcledEvent[]> = {
  id: "acled",
  label: "ACLED Conflict Data",
  category: "conflict-events",
  description:
    "Armed conflict events, protests, and political violence from the Armed Conflict Location & Event Data Project.",
  pollInterval: 600,
  uiType: "feed",
  wrapsExisting: "/api/incidents",
  requiredEnvVars: ["ACLED_KEY"],

  async fetchData() {
    const res = await fetch("http://127.0.0.1:3000/api/incidents", {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`ACLED proxy: ${res.status}`);
    const json = await res.json();
    if (json && json.features) {
      return json.features.map(
        (f: {
          properties: {
            eventDate?: string;
            type?: string;
            location?: string;
            fatalities?: number;
            notes?: string;
          };
          geometry?: { coordinates?: [number, number] };
        }) => ({
          event_date: f.properties.eventDate ?? "",
          event_type: f.properties.type ?? "",
          sub_event_type: "",
          country: "Thailand",
          admin1: "",
          location: f.properties.location ?? "",
          fatalities: f.properties.fatalities ?? 0,
          notes: f.properties.notes ?? "",
          latitude: f.geometry?.coordinates?.[1],
          longitude: f.geometry?.coordinates?.[0],
        }),
      ) as AcledEvent[];
    }
    return [];
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
