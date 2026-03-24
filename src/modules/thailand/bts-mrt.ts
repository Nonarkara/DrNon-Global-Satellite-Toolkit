import type { ModuleDefinition } from "../../types/modules";

interface TransitStation {
  id: string;
  name: string;
  nameThai: string;
  line: string;
  latitude: number;
  longitude: number;
  isInterchange: boolean;
}

export const btsMrt: ModuleDefinition<TransitStation[]> = {
  id: "bts-mrt",
  label: "BTS/MRT Routes",
  category: "thailand",
  description:
    "Bangkok BTS Skytrain and MRT subway station data — routes, interchanges, and station coordinates from community APIs.",
  pollInterval: 0, // Static data, fetch once
  uiType: "table",
  tableColumns: [
    { key: "name", label: "Station" },
    { key: "line", label: "Line" },
    { key: "isInterchange", label: "Interchange" },
  ],

  async fetchData() {
    // Community-built Thai train data from GitHub
    const url =
      "https://raw.githubusercontent.com/nicemak/Thailand-Train-Stations/main/stations.json";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`BTS/MRT data: ${res.status}`);
    const json = (await res.json()) as Array<{
      id?: string;
      name?: string;
      name_th?: string;
      line?: string;
      lat?: number;
      lng?: number;
      is_interchange?: boolean;
    }>;
    return (Array.isArray(json) ? json : []).map((s) => ({
      id: s.id ?? "",
      name: s.name ?? "",
      nameThai: s.name_th ?? "",
      line: s.line ?? "",
      latitude: s.lat ?? 0,
      longitude: s.lng ?? 0,
      isInterchange: s.is_interchange ?? false,
    }));
  },

  mockData: [
    { id: "BTS-N8", name: "Mo Chit", nameThai: "หมอชิต", line: "BTS Sukhumvit", latitude: 13.8025, longitude: 100.5536, isInterchange: true },
    { id: "MRT-BL13", name: "Chatuchak Park", nameThai: "สวนจตุจักร", line: "MRT Blue", latitude: 13.8027, longitude: 100.5534, isInterchange: true },
    { id: "BTS-S2", name: "Sala Daeng", nameThai: "ศาลาแดง", line: "BTS Silom", latitude: 13.7285, longitude: 100.5345, isInterchange: true },
  ],
};
