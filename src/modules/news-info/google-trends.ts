import type { ModuleDefinition } from "../../types/modules";
import { internalUrl } from "../lib/module-fetch";

interface TrendingTopic {
  keyword: string;
  volume?: number;
  source?: string;
}

export const googleTrends: ModuleDefinition<TrendingTopic[]> = {
  id: "google-trends",
  label: "Google Trends",
  category: "news-info",
  description: "Trending search topics related to Thailand and Southeast Asia.",
  pollInterval: 600,
  uiType: "table",
  wrapsExisting: "/api/trends",
  tableColumns: [
    { key: "keyword", label: "Topic" },
    { key: "volume", label: "Volume" },
  ],

  async fetchData() {
    const res = await fetch(internalUrl("/api/trends"), {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Trends proxy: ${res.status}`);
    const json = await res.json();
    // Handle both array and object-with-keywords shapes
    if (Array.isArray(json)) return json as TrendingTopic[];
    if (json && Array.isArray(json.keywords)) return json.keywords as TrendingTopic[];
    return [];
  },

  mockData: [
    { keyword: "Phuket tourism", volume: 12000 },
    { keyword: "Thailand weather", volume: 8500 },
    { keyword: "Bangkok traffic", volume: 6200 },
  ],
};
