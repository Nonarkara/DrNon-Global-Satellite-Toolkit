import type { ModuleDefinition } from "../../types/modules";

interface TmdWarning {
  title: string;
  description: string;
  date: string;
  type: string;
  area: string;
}

export const tmdWeather: ModuleDefinition<TmdWarning[]> = {
  id: "tmd-weather",
  label: "TMD Weather Warnings",
  category: "environmental",
  description:
    "Thai Meteorological Department weather warnings, forecasts, and severe weather alerts for Thailand.",
  pollInterval: 600,
  uiType: "feed",

  async fetchData() {
    // TMD RSS feed for weather warnings
    const rssUrl = "https://www.tmd.go.th/rss/warning.xml";
    const res = await fetch(rssUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`TMD: ${res.status}`);
    const text = await res.text();

    // Simple XML parse for RSS items
    const items: TmdWarning[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? block.match(/<description>(.*?)<\/description>/)?.[1] ?? "";
      const date = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

      items.push({
        title: title.trim(),
        description: desc.trim().replace(/<[^>]*>/g, "").slice(0, 300),
        date,
        type: "warning",
        area: "Thailand",
      });
    }

    return items.slice(0, 20);
  },

  mockData: [
    {
      title: "Heavy rainfall warning for southern Thailand",
      description: "TMD warns of heavy to very heavy rainfall in Phuket, Krabi, and Phang Nga provinces.",
      date: "2026-03-25",
      type: "warning",
      area: "Southern Thailand",
    },
  ],
};
