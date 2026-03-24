import type { ModuleDefinition } from "../../types/modules";

interface GdeltNewsItem {
  url: string;
  title: string;
  domain: string;
  language: string;
  seendate: string;
  socialimage: string;
  tone: number;
}

export const gdeltNews: ModuleDefinition<GdeltNewsItem[]> = {
  id: "gdelt-news",
  label: "GDELT News Search",
  category: "news-info",
  description:
    "Global news search across 100+ languages via GDELT — tracks media attention, information flow, and narrative spikes.",
  pollInterval: 300,
  uiType: "feed",

  async fetchData() {
    const url =
      "https://api.gdeltproject.org/api/v2/doc/doc?query=(Thailand%20OR%20ASEAN%20OR%20Southeast%20Asia)&mode=ArtList&maxrecords=40&format=json&sort=DateDesc";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`GDELT News: ${res.status}`);
    const json = (await res.json()) as { articles?: GdeltNewsItem[] };
    return json.articles ?? [];
  },

  mockData: [
    {
      url: "#",
      title: "ASEAN economic outlook improves amid trade shifts",
      domain: "nikkei.com",
      language: "English",
      seendate: "20260325T100000Z",
      socialimage: "",
      tone: 2.1,
    },
  ],
};
