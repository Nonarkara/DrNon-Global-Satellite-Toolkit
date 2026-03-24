import type { ModuleDefinition } from "../../types/modules";

interface ThaiProvince {
  id: number;
  nameEn: string;
  nameTh: string;
  region: string;
  population: number | null;
  area: number | null;
}

export const thailandAdmin: ModuleDefinition<ThaiProvince[]> = {
  id: "thailand-admin",
  label: "Thailand Provinces",
  category: "thailand",
  description:
    "Administrative metadata for all 77 Thai provinces — names, regions, and basic statistics from OpenThailand API.",
  pollInterval: 0,
  uiType: "table",
  tableColumns: [
    { key: "nameEn", label: "Province" },
    { key: "nameTh", label: "ชื่อ" },
    { key: "region", label: "Region" },
  ],

  async fetchData() {
    const url = "https://raw.githubusercontent.com/nicemak/Thailand-Train-Stations/main/provinces.json";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      // Fallback to a simple province list
      const altUrl = "https://api.openthailand.org/provinces";
      const altRes = await fetch(altUrl, { signal: AbortSignal.timeout(10000) });
      if (!altRes.ok) throw new Error(`Thai provinces: ${altRes.status}`);
      return (await altRes.json()) as ThaiProvince[];
    }
    const json = (await res.json()) as Array<{
      id?: number;
      name_en?: string;
      name_th?: string;
      region?: string;
      population?: number;
      area?: number;
    }>;
    return (Array.isArray(json) ? json : []).map((p) => ({
      id: p.id ?? 0,
      nameEn: p.name_en ?? "",
      nameTh: p.name_th ?? "",
      region: p.region ?? "",
      population: p.population ?? null,
      area: p.area ?? null,
    }));
  },

  mockData: [
    { id: 1, nameEn: "Bangkok", nameTh: "กรุงเทพมหานคร", region: "Central", population: 5676648, area: 1568.7 },
    { id: 83, nameEn: "Phuket", nameTh: "ภูเก็ต", region: "South", population: 416582, area: 543 },
  ],
};
