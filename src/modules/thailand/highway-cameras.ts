import type { ModuleDefinition } from "../../types/modules";

interface HighwayCamera {
  id: string;
  name: string;
  route: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  imageUrl: string | null;
  status: string;
}

export const highwayCameras: ModuleDefinition<HighwayCamera[]> = {
  id: "highway-cameras",
  label: "Thai Highway Cameras",
  category: "thailand",
  description:
    "Real-time highway CCTV camera feeds, speed data, and traffic flow for Thailand's major highways.",
  pollInterval: 300,
  uiType: "table",
  tableColumns: [
    { key: "name", label: "Camera" },
    { key: "route", label: "Route" },
    { key: "speed", label: "Speed (km/h)" },
    { key: "status", label: "Status" },
  ],

  async fetchData() {
    // DOH (Dept of Highways) camera data — semi-public API
    const url = "https://its.doh.go.th/api/cctv/list";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Highway cameras: ${res.status}`);
    const json = (await res.json()) as Array<{
      id?: string;
      name?: string;
      route?: string;
      lat?: number;
      lng?: number;
      speed?: number;
      image_url?: string;
      status?: string;
    }>;

    return (Array.isArray(json) ? json : []).slice(0, 60).map((c) => ({
      id: c.id ?? "",
      name: c.name ?? "",
      route: c.route ?? "",
      latitude: c.lat ?? 0,
      longitude: c.lng ?? 0,
      speed: c.speed ?? null,
      imageUrl: c.image_url ?? null,
      status: c.status ?? "unknown",
    }));
  },

  mockData: [
    { id: "cam-001", name: "Motorway 7 km 42", route: "M7", latitude: 13.45, longitude: 100.98, speed: 95, imageUrl: null, status: "online" },
    { id: "cam-002", name: "Hwy 4 Phuket km 12", route: "H4", latitude: 8.05, longitude: 98.35, speed: 65, imageUrl: null, status: "online" },
  ],
};
