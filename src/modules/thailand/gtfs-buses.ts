import type { ModuleDefinition } from "../../types/modules";

interface GtfsRoute {
  routeId: string;
  routeName: string;
  routeType: string;
  agency: string;
  color: string;
  stops: number;
}

export const gtfsBuses: ModuleDefinition<GtfsRoute[]> = {
  id: "gtfs-buses",
  label: "GTFS Bus Routes",
  category: "thailand",
  description:
    "GTFS bus route data for Bangkok and Thai cities — routes, stops, schedules from open transit data.",
  pollInterval: 0,
  uiType: "table",
  tableColumns: [
    { key: "routeId", label: "Route" },
    { key: "routeName", label: "Name" },
    { key: "agency", label: "Agency" },
    { key: "stops", label: "Stops" },
  ],

  async fetchData() {
    // Transitland API for Thai GTFS feeds
    const url =
      "https://transit.land/api/v2/rest/routes?operator_onestop_id=o-w4-bmta&limit=50&format=json";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`GTFS: ${res.status}`);
    const json = (await res.json()) as {
      routes?: Array<{
        route_id: string;
        route_long_name?: string;
        route_short_name?: string;
        route_type?: number;
        agency?: { agency_name?: string };
        route_color?: string;
        route_stops?: Array<unknown>;
      }>;
    };

    return (json.routes ?? []).map((r) => ({
      routeId: r.route_short_name ?? r.route_id,
      routeName: r.route_long_name ?? r.route_short_name ?? r.route_id,
      routeType: String(r.route_type ?? 3),
      agency: r.agency?.agency_name ?? "BMTA",
      color: r.route_color ?? "",
      stops: r.route_stops?.length ?? 0,
    }));
  },

  mockData: [
    { routeId: "1", routeName: "BMTA Route 1 — Tha Phra-Sanam Luang", routeType: "3", agency: "BMTA", color: "red", stops: 28 },
    { routeId: "8", routeName: "BMTA Route 8 — Saphan Khwai-Happy Land", routeType: "3", agency: "BMTA", color: "red", stops: 35 },
  ],
};
