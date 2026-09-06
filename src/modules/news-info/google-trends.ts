import type { ModuleDefinition } from "../../types/modules";

interface TrendingTopic {
  keyword: string;
  volume: number;
}

/** Google's public daily-trends RSS. No key, no quota headers, no SDK. */
const RSS = "https://trends.google.com/trending/rss";
const GEO = "TH";

/** "20K+" / "1M+" → a comparable integer. */
function parseApproxTraffic(raw: string): number {
  const match = raw.match(/([\d.,]+)\s*([KMB]?)/i);
  if (!match) return 0;
  const value = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(value)) return 0;
  const multiplier = { K: 1e3, M: 1e6, B: 1e9 }[match[2].toUpperCase()] ?? 1;
  return Math.round(value * multiplier);
}

function tagContent(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim();
}

export const googleTrends: ModuleDefinition<TrendingTopic[]> = {
  id: "google-trends",
  label: "Google Trends (Thailand)",
  category: "news-info",
  description:
    "Daily trending search topics for Thailand from Google's public trends RSS feed. No API key required.",
  pollInterval: 1800,
  uiType: "table",
  tableColumns: [
    { key: "keyword", label: "Topic" },
    { key: "volume", label: "Approx. searches" },
  ],

  async fetchData() {
    const res = await fetch(`${RSS}?geo=${GEO}`, {
      headers: { "User-Agent": "drnon-satellite-toolkit/2.1" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`Google Trends RSS: ${res.status}`);

    const xml = await res.text();
    const items = xml.split("<item>").slice(1);
    if (items.length === 0) throw new Error("Google Trends RSS returned no items");

    return items.map((item) => ({
      keyword: tagContent(item, "title"),
      volume: parseApproxTraffic(tagContent(item, "ht:approx_traffic")),
    }));
  },

  mockData: [
    { keyword: "Phuket tourism", volume: 12000 },
    { keyword: "Thailand weather", volume: 8500 },
    { keyword: "Bangkok traffic", volume: 6200 },
  ],
};
