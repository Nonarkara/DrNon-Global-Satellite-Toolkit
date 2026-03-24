import type { ModuleDefinition } from "../../types/modules";

interface GdeltEvent {
  url: string;
  title: string;
  domain: string;
  language: string;
  seendate: string;
  socialimage: string;
  tone: number;
}

export const gdeltEvents: ModuleDefinition<GdeltEvent[]> = {
  id: "gdelt-events",
  label: "GDELT Global Events",
  category: "conflict-events",
  description:
    "Real-time global event stream from GDELT Project — protests, conflict, diplomacy, and cooperation events across 100+ languages.",
  pollInterval: 300,
  uiType: "feed",

  async fetchData() {
    const url =
      "https://api.gdeltproject.org/api/v2/doc/doc?query=Thailand%20OR%20Bangkok%20OR%20Phuket&mode=ArtList&maxrecords=30&format=json&sort=DateDesc";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`GDELT: ${res.status}`);
    const json = (await res.json()) as { articles?: GdeltEvent[] };
    return json.articles ?? [];
  },

  mockData: [
    {
      url: "#",
      title: "Thailand announces new climate adaptation strategy",
      domain: "bangkokpost.com",
      language: "English",
      seendate: "20260325T120000Z",
      socialimage: "",
      tone: 1.2,
    },
    {
      url: "#",
      title: "Protest activity reported in central Bangkok",
      domain: "reuters.com",
      language: "English",
      seendate: "20260325T090000Z",
      socialimage: "",
      tone: -3.5,
    },
  ],
};
