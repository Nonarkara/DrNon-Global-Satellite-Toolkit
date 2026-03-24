import type { ModuleDefinition } from "../../types/modules";
import { selectBestImage, classifyFreshness, type SatelliteImageMeta } from "../satellite-freshness";

interface JaxaResult {
  selected: SatelliteImageMeta | null;
  catalog: SatelliteImageMeta[];
  freshness: "fresh" | "acceptable" | "stale" | "none";
  himawariLatest: string | null;
}

export const jaxaTellus: ModuleDefinition<JaxaResult> = {
  id: "jaxa-tellus",
  label: "JAXA Tellus (Japan)",
  category: "earth-observation",
  description:
    "JAXA/Tellus Earth observation — ALOS, GCOM-C, Himawari data. Typhoons, SST, precipitation, and snow cover over the Western Pacific.",
  pollInterval: 3600,
  uiType: "stat-card",

  async fetchData() {
    // JAXA G-Portal / Tellus API
    const url = "https://gportal.jaxa.jp/gpr/search/catalog";
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bbox: [90, 0, 145, 50],
        dateRange: {
          start: twoWeeksAgo.toISOString(),
          end: now.toISOString(),
        },
        satellite: ["GCOM-C", "ALOS-2"],
        limit: 20,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`JAXA: ${res.status}`);
    const json = (await res.json()) as {
      results?: Array<{
        productId: string;
        observationDate: string;
        cloudCover?: number;
        satellite: string;
        thumbnailUrl?: string;
      }>;
    };

    const catalog: SatelliteImageMeta[] = (json.results ?? []).map((r) => ({
      id: r.productId,
      datetime: r.observationDate,
      cloudCover: r.cloudCover,
      sensor: r.satellite,
      thumbnailUrl: r.thumbnailUrl,
      area: "Western Pacific",
    }));

    const selected = selectBestImage(catalog, { maxAgeDays: 10, maxCloudCover: 30 });

    // Also try Himawari latest image (geostationary, always available)
    let himawariLatest: string | null = null;
    try {
      const d = new Date();
      d.setUTCHours(d.getUTCHours() - 1);
      const timeStr = d.toISOString().slice(0, 13).replace(/[-T]/g, "") + "00";
      himawariLatest = `https://www.data.jma.go.jp/mscweb/data/himawari/img/fd_/fd__trm_${timeStr}.jpg`;
    } catch { /* empty */ }

    return {
      selected,
      catalog,
      freshness: selected ? classifyFreshness(selected, { maxAgeDays: 10, maxCloudCover: 30 }) : ("none" as const),
      himawariLatest,
    };
  },

  mockData: {
    selected: {
      id: "GCOM_MOCK_001",
      datetime: "2026-03-24T02:00:00Z",
      cloudCover: 18,
      sensor: "GCOM-C",
      area: "Western Pacific",
    },
    catalog: [],
    freshness: "fresh" as const,
    himawariLatest: null,
  },
};
