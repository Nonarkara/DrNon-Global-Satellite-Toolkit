import type { ModuleDefinition } from "../../types/modules";
import { selectBestImage, classifyFreshness, type SatelliteImageMeta } from "../satellite-freshness";

interface BhoonidhiResult {
  selected: SatelliteImageMeta | null;
  catalog: SatelliteImageMeta[];
  freshness: "fresh" | "acceptable" | "stale" | "none";
  totalAvailable: number;
}

export const isroBhoonidhi: ModuleDefinition<BhoonidhiResult> = {
  id: "isro-bhoonidhi",
  label: "ISRO Bhoonidhi (India)",
  category: "earth-observation",
  description:
    "ISRO's 46-satellite Earth observation archive — optical, SAR, and weather data over South/Southeast Asia. Agriculture, floods, and coastal monitoring.",
  pollInterval: 3600,
  uiType: "stat-card",

  async fetchData() {
    // Bhoonidhi API catalog search
    const url =
      "https://bhoonidhi.nrsc.gov.in/api/v1/catalog/search";
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bbox: [92, 5, 110, 22], // Bay of Bengal + SE Asia
        dateRange: {
          start: twoWeeksAgo.toISOString(),
          end: now.toISOString(),
        },
        satellite: ["ResourceSat-2A", "EOS-04", "Cartosat-3"],
        limit: 30,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`Bhoonidhi: ${res.status}`);
    const json = (await res.json()) as {
      results?: Array<{
        productId: string;
        acquisitionDate: string;
        cloudCover?: number;
        satellite: string;
        thumbnailUrl?: string;
      }>;
      totalCount?: number;
    };

    const catalog: SatelliteImageMeta[] = (json.results ?? []).map((r) => ({
      id: r.productId,
      datetime: r.acquisitionDate,
      cloudCover: r.cloudCover,
      sensor: r.satellite,
      thumbnailUrl: r.thumbnailUrl,
      area: "South/SE Asia",
    }));

    const selected = selectBestImage(catalog, { maxAgeDays: 10, maxCloudCover: 25 });

    return {
      selected,
      catalog,
      freshness: selected ? classifyFreshness(selected, { maxAgeDays: 10, maxCloudCover: 25 }) : ("none" as const),
      totalAvailable: json.totalCount ?? catalog.length,
    };
  },

  mockData: {
    selected: {
      id: "RS2A_MOCK_001",
      datetime: "2026-03-23T05:15:00Z",
      cloudCover: 15,
      sensor: "ResourceSat-2A",
      area: "South/SE Asia",
    },
    catalog: [],
    freshness: "fresh" as const,
    totalAvailable: 42,
  },
};
