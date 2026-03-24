import type { ModuleDefinition } from "../../types/modules";

interface Gk2aProduct {
  satellite: string;
  dataType: string;
  area: string;
  datetime: string;
  imageUrl: string | null;
  resolution: string;
}

export const gk2aKorea: ModuleDefinition<Gk2aProduct[]> = {
  id: "gk2a-korea",
  label: "GK2A Korea Weather Sat",
  category: "earth-observation",
  description:
    "GK2A geostationary weather satellite from KMA (Korea) — cloud imagery, atmospheric motion vectors, and sea surface data over East/Southeast Asia.",
  pollInterval: 1800,
  uiType: "table",
  tableColumns: [
    { key: "dataType", label: "Product" },
    { key: "area", label: "Area" },
    { key: "datetime", label: "Time" },
    { key: "resolution", label: "Resolution" },
  ],

  async fetchData() {
    // KMA NMSC (National Meteorological Satellite Center) public API
    const url =
      "https://nmsc.kma.go.kr/IMG/GK2A/AMI/PRIMARY/L1B/COMPLETE/EA/gk2a_ami_le1b_rgb-true_ea050lc_latest.json";
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) {
      // Fallback: try the image catalog list
      const altUrl = "https://nmsc.kma.go.kr/api/GK2A/data/list?satellite=GK2A&dataType=AMV&area=EA&limit=20";
      const altRes = await fetch(altUrl, { signal: AbortSignal.timeout(10000) });
      if (!altRes.ok) throw new Error(`GK2A: ${altRes.status}`);
      const altJson = (await altRes.json()) as Array<{
        satellite?: string;
        dataType?: string;
        area?: string;
        datetime?: string;
        imageUrl?: string;
        resolution?: string;
      }>;
      return (Array.isArray(altJson) ? altJson : []).map((p) => ({
        satellite: p.satellite ?? "GK2A",
        dataType: p.dataType ?? "",
        area: p.area ?? "East Asia",
        datetime: p.datetime ?? "",
        imageUrl: p.imageUrl ?? null,
        resolution: p.resolution ?? "",
      }));
    }

    const json = (await res.json()) as {
      products?: Array<{
        satellite: string;
        dataType: string;
        area: string;
        datetime: string;
        imageUrl?: string;
        resolution?: string;
      }>;
    };

    return (json.products ?? []).map((p) => ({
      satellite: p.satellite,
      dataType: p.dataType,
      area: p.area,
      datetime: p.datetime,
      imageUrl: p.imageUrl ?? null,
      resolution: p.resolution ?? "",
    }));
  },

  mockData: [
    {
      satellite: "GK2A",
      dataType: "True Color RGB",
      area: "East Asia",
      datetime: "2026-03-25T06:00:00Z",
      imageUrl: null,
      resolution: "500m",
    },
    {
      satellite: "GK2A",
      dataType: "Atmospheric Motion Vector",
      area: "East Asia",
      datetime: "2026-03-25T06:00:00Z",
      imageUrl: null,
      resolution: "2km",
    },
  ],
};
