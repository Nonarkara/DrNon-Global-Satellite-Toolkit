import type { ModuleDefinition } from "../../types/modules";
import {
  classifyFreshness,
  selectBestImage,
  type SatelliteImageMeta,
} from "../satellite-freshness";
import { THAILAND_BBOX } from "../lib/thai-civic";

const CDSE_STAC_SEARCH = "https://stac.dataspace.copernicus.eu/v1/search";

interface CdseScene {
  id: string;
  collection: string;
  datetime: string;
  cloudCover: string;
  sensor: string;
  evidence: string;
  freshness: string;
}

interface StacFeature {
  id?: string;
  collection?: string;
  properties?: {
    datetime?: string;
    start_datetime?: string;
    "eo:cloud_cover"?: number;
    platform?: string;
    instruments?: string[];
  };
}

interface StacSearchResponse {
  features?: StacFeature[];
}

async function searchCollection(collection: string, limit: number): Promise<StacFeature[]> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 14 * 86_400_000);
  const res = await fetch(CDSE_STAC_SEARCH, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/geo+json" },
    body: JSON.stringify({
      collections: [collection],
      bbox: [...THAILAND_BBOX],
      datetime: `${weekAgo.toISOString()}/${now.toISOString()}`,
      limit,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`CDSE ${collection}: HTTP ${res.status}`);
  const json = (await res.json()) as StacSearchResponse;
  return json.features ?? [];
}

function toMeta(feature: StacFeature, sensor: string): SatelliteImageMeta {
  return {
    id: feature.id ?? "unknown",
    datetime: feature.properties?.datetime ?? feature.properties?.start_datetime ?? "",
    cloudCover: feature.properties?.["eo:cloud_cover"],
    sensor,
    area: "Thailand",
  };
}

export const copernicusCdse: ModuleDefinition<CdseScene[]> = {
  id: "copernicus-cdse",
  label: "Copernicus CDSE Sentinel",
  category: "earth-observation",
  description:
    "Native Copernicus Data Space STAC search for Sentinel-2 L2A (optical) and Sentinel-1 GRD (SAR) over Thailand. Catalog is public; asset download needs a CDSE account.",
  pollInterval: 3600,
  uiType: "table",
  tableColumns: [
    { key: "collection", label: "Collection" },
    { key: "datetime", label: "Datetime" },
    { key: "cloudCover", label: "Cloud" },
    { key: "freshness", label: "Freshness" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    const [s2, s1] = await Promise.all([
      searchCollection("sentinel-2-l2a", 8),
      searchCollection("sentinel-1-grd", 6),
    ]);

    const s2Meta = s2.map((f) => toMeta(f, "Sentinel-2 L2A"));
    const s1Meta = s1.map((f) => toMeta(f, "Sentinel-1 GRD"));
    const bestS2 = selectBestImage(s2Meta, { maxAgeDays: 10, maxCloudCover: 40 });

    const rows: CdseScene[] = [];
    const push = (feature: StacFeature, sensor: string, evidence: string) => {
      const meta = toMeta(feature, sensor);
      const cloud = feature.properties?.["eo:cloud_cover"];
      rows.push({
        id: feature.id ?? "",
        collection: feature.collection ?? sensor,
        datetime: meta.datetime,
        cloudCover: cloud == null ? "—" : `${cloud}%`,
        sensor,
        evidence,
        freshness: meta.datetime
          ? classifyFreshness(meta, { maxAgeDays: 10, maxCloudCover: 40 })
          : "none",
      });
    };

    if (bestS2) {
      const match = s2.find((f) => f.id === bestS2.id);
      if (match) {
        push(
          match,
          "Sentinel-2 L2A",
          "Measured optical surface reflectance (atmospherically corrected). Clouds still hide the ground.",
        );
      }
    }
    for (const feature of s2.slice(0, 4)) {
      if (feature.id === bestS2?.id) continue;
      push(
        feature,
        "Sentinel-2 L2A",
        "Measured optical surface reflectance (atmospherically corrected). Clouds still hide the ground.",
      );
    }
    for (const feature of s1.slice(0, 4)) {
      push(
        feature,
        "Sentinel-1 GRD",
        "Measured C-band SAR backscatter — all-weather. Flood mapping needs processing; GRD is not a flood mask.",
      );
    }

    if (rows.length === 0) throw new Error("CDSE: no Sentinel items over Thailand");
    return rows;
  },

  mockData: [
    {
      id: "S2A_MSIL2A_MOCK",
      collection: "sentinel-2-l2a",
      datetime: "2026-09-01T03:52:01Z",
      cloudCover: "12%",
      sensor: "Sentinel-2 L2A",
      evidence:
        "Measured optical surface reflectance (atmospherically corrected). Clouds still hide the ground.",
      freshness: "fresh",
    },
    {
      id: "S1A_IW_GRDH_MOCK",
      collection: "sentinel-1-grd",
      datetime: "2026-09-01T11:22:00Z",
      cloudCover: "—",
      sensor: "Sentinel-1 GRD",
      evidence:
        "Measured C-band SAR backscatter — all-weather. Flood mapping needs processing; GRD is not a flood mask.",
      freshness: "fresh",
    },
  ],
};
