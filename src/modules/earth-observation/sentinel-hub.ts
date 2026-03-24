import type { ModuleDefinition } from "../../types/modules";
import { selectBestImage, type SatelliteImageMeta } from "../satellite-freshness";

interface SentinelImageResult {
  selected: SatelliteImageMeta | null;
  catalog: SatelliteImageMeta[];
  freshness: "fresh" | "acceptable" | "stale" | "none";
}

export const sentinelHub: ModuleDefinition<SentinelImageResult> = {
  id: "sentinel-hub",
  label: "Sentinel Hub Imagery",
  category: "earth-observation",
  description:
    "Processed Sentinel-2 optical imagery via Sentinel Hub REST API — true-color, NDVI, burn-scar indices for Thailand.",
  pollInterval: 3600,
  uiType: "stat-card",
  requiredEnvVars: ["SENTINEL_HUB_KEY"],

  async fetchData() {
    const key = process.env.SENTINEL_HUB_KEY;
    if (!key) throw new Error("SENTINEL_HUB_KEY not configured");

    // Search Sentinel-2 catalog for Thailand area
    const searchUrl = "https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search";
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 14 * 86_400_000);

    const res = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        bbox: [97.5, 5.6, 105.7, 20.5],
        datetime: `${weekAgo.toISOString().slice(0, 10)}T00:00:00Z/${now.toISOString().slice(0, 10)}T23:59:59Z`,
        collections: ["sentinel-2-l2a"],
        limit: 20,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`Sentinel Hub: ${res.status}`);
    const json = (await res.json()) as {
      features?: Array<{
        id: string;
        properties: {
          datetime: string;
          "eo:cloud_cover"?: number;
          "s2:product_uri"?: string;
        };
      }>;
    };

    const catalog: SatelliteImageMeta[] = (json.features ?? []).map((f) => ({
      id: f.id,
      datetime: f.properties.datetime,
      cloudCover: f.properties["eo:cloud_cover"],
      sensor: "Sentinel-2",
      area: "Thailand",
    }));

    const selected = selectBestImage(catalog, { maxAgeDays: 7, maxCloudCover: 20 });

    return {
      selected,
      catalog,
      freshness: selected
        ? catalog.indexOf(selected) === 0
          ? "fresh"
          : "acceptable"
        : "none",
    };
  },

  mockData: {
    selected: {
      id: "S2A_MOCK_001",
      datetime: "2026-03-24T03:30:00Z",
      cloudCover: 12,
      sensor: "Sentinel-2",
      area: "Thailand",
    },
    catalog: [],
    freshness: "fresh" as const,
  },
};
