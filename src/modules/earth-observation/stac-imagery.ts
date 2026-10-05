import type { ModuleDefinition } from "../../types/modules";
import { searchStac } from "../../stac/client";
import { toScenePreview } from "../../stac/preview";

interface SceneRow {
  id: string;
  date: string;
  cloud: string;
  platform: string;
  /** XYZ template — drop straight into deck.gl or MapLibre. */
  tileUrl: string;
}

/** Bangkok. Change to retarget the module. */
const BBOX: [number, number, number, number] = [100.3, 13.5, 100.9, 14.0];
const COLLECTION = "sentinel-2-l2a";
const MAX_CLOUD = 40;
const LIMIT = 10;
/**
 * Tropical monsoon regions can go two months without a clear scene — a
 * 60-day window returned zero rows over Bangkok in October while reporting
 * tier "live", which reads as a broken module rather than a cloudy sky.
 */
const LOOKBACK_DAYS = 120;

function lookbackWindow(days: number): string {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return `${start.toISOString()}/${end.toISOString()}`;
}

export const stacImagery: ModuleDefinition<SceneRow[]> = {
  id: "stac-imagery",
  label: "Sentinel-2 Scenes (STAC)",
  category: "earth-observation",
  description:
    "Recent low-cloud Sentinel-2 L2A scenes over the area of interest, discovered via STAC and returned with ready-to-render tile URLs. No API key required.",
  pollInterval: 3600,
  uiType: "table",
  sourceId: "earth-search",
  tableColumns: [
    { key: "date", label: "Acquired" },
    { key: "cloud", label: "Cloud" },
    { key: "platform", label: "Platform" },
    { key: "id", label: "Scene ID" },
  ],

  async fetchData(): Promise<SceneRow[]> {
    const result = await searchStac(
      {
        collections: [COLLECTION],
        bbox: BBOX,
        datetime: lookbackWindow(LOOKBACK_DAYS),
        maxCloudCover: MAX_CLOUD,
        limit: LIMIT,
        sortby: "-properties.datetime",
      },
      "earth-search",
    );

    const scenes = await Promise.all(
      result.items.map((item) => toScenePreview(item, "earth-search")),
    );

    return scenes.map((scene) => ({
      id: scene.id,
      date: scene.datetime?.slice(0, 10) ?? "",
      cloud: scene.cloudCover !== null ? `${scene.cloudCover}%` : "—",
      platform: scene.platform ?? "sentinel-2",
      tileUrl: scene.preview?.tileUrl ?? "",
    }));
  },

  mockData: [
    {
      id: "S2C_47PPQ_20260828_0_L2A",
      date: "2026-08-28",
      cloud: "12.4%",
      platform: "sentinel-2c",
      tileUrl: "",
    },
  ],
};
