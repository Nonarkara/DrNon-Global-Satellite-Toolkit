import type { ModuleDefinition } from "../../types/modules";

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  author: string;
}

export const newsApi: ModuleDefinition<NewsArticle[]> = {
  id: "news-api",
  label: "News API Global",
  category: "news-info",
  description:
    "Global news aggregation from 80,000+ sources via NewsAPI — headlines, articles, and media coverage tracking.",
  pollInterval: 600,
  uiType: "feed",
  requiredEnvVars: ["NEWS_API_KEY"],

  async fetchData() {
    const key = process.env.NEWS_API_KEY;
    if (!key) throw new Error("NEWS_API_KEY not configured");
    const url = `https://newsapi.org/v2/everything?q=Thailand+OR+Bangkok+OR+Phuket&sortBy=publishedAt&pageSize=30&apiKey=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`NewsAPI: ${res.status}`);
    const json = (await res.json()) as {
      articles?: Array<{
        title: string;
        description: string;
        source: { name: string };
        url: string;
        publishedAt: string;
        author: string;
      }>;
    };
    return (json.articles ?? []).map((a) => ({
      title: a.title,
      description: (a.description ?? "").slice(0, 200),
      source: a.source?.name ?? "",
      url: a.url,
      publishedAt: a.publishedAt,
      author: a.author ?? "",
    }));
  },

  mockData: [
    { title: "Thailand economic outlook strong for 2026", description: "Analysts forecast continued growth", source: "Reuters", url: "#", publishedAt: "2026-03-25T10:00:00Z", author: "Staff" },
  ],
};
