import type { ModuleDefinition } from "../../types/modules";

interface GovDataset {
  id: string;
  title: string;
  organization: string;
  description: string;
  format: string;
  lastUpdated: string;
  url: string;
}

export const thailandOpenData: ModuleDefinition<GovDataset[]> = {
  id: "thailand-open-data",
  label: "Thailand Gov Open Data",
  category: "thailand",
  description:
    "Thailand Government Open Data Portal (data.go.th) — demographics, transport, economy, environment, and health datasets.",
  pollInterval: 3600,
  uiType: "feed",

  async fetchData() {
    const url =
      "https://data.go.th/api/3/action/package_search?q=&rows=30&sort=metadata_modified%20desc";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`data.go.th: ${res.status}`);
    const json = (await res.json()) as {
      result?: {
        results?: Array<{
          id: string;
          title: string;
          organization?: { title?: string };
          notes?: string;
          resources?: Array<{ format?: string; url?: string }>;
          metadata_modified?: string;
        }>;
      };
    };

    return (json.result?.results ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      organization: d.organization?.title ?? "",
      description: (d.notes ?? "").slice(0, 200),
      format: d.resources?.[0]?.format ?? "",
      lastUpdated: d.metadata_modified ?? "",
      url: `https://data.go.th/dataset/${d.id}`,
    }));
  },

  mockData: [
    { id: "1", title: "Thailand Population Statistics 2025", organization: "NSO", description: "National population data by province", format: "CSV", lastUpdated: "2026-01-15", url: "#" },
  ],
};
