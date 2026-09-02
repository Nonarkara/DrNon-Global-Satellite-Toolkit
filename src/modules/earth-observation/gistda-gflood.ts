import type { ModuleDefinition } from "../../types/modules";
import { GISTDA_ATTRIBUTION } from "../lib/thai-civic";
import {
  GISTDA_MAP_PATHS,
  GISTDA_OPEN_API_DOCS,
  GISTDA_PORTAL_LINKS,
  gistdaOpenApiUrl,
  probeGistdaOpenApi,
} from "../lib/gistda-open-api";

interface GfloodLayerRow {
  priority: number;
  service: string;
  layer: string;
  kind: string;
  endpoint: string;
  notes: string;
  attribution: string;
}

export const gistdaGflood: ModuleDefinition<GfloodLayerRow[]> = {
  id: "gistda-gflood",
  label: "GISTDA GFlood OGC Tiles",
  category: "earth-observation",
  description:
    "Priority 1 Open API flood WMS/WMTS/TMS (1/3/7/30-day), then fire and drought maps. Portal/STAC/S1 download is priority 5 retrospective — not a live tile CDN. Open API gateway only — not /app-api/proxy.",
  pollInterval: 0,
  uiType: "table",
  tableColumns: [
    { key: "priority", label: "P" },
    { key: "service", label: "Service" },
    { key: "layer", label: "Layer" },
    { key: "kind", label: "Kind" },
    { key: "endpoint", label: "Endpoint" },
  ],

  async fetchData() {
    const probe = await probeGistdaOpenApi("/maps/flood/1day/wms");

    const rows: GfloodLayerRow[] = [
      ...GISTDA_MAP_PATHS.map((item) => ({
        priority: item.priority,
        service: "Open API",
        layer: item.label,
        kind: item.kind.toUpperCase(),
        endpoint: gistdaOpenApiUrl(item.path),
        notes: `${item.evidence} Probe /maps/flood/1day/wms → HTTP ${probe.status}.`,
        attribution: GISTDA_ATTRIBUTION,
      })),
      ...GISTDA_PORTAL_LINKS.map((item) => ({
        priority: item.priority,
        service: "Portal",
        layer: item.label,
        kind: item.kind.toUpperCase(),
        endpoint: item.path,
        notes: item.evidence,
        attribution: GISTDA_ATTRIBUTION,
      })),
    ];

    return rows;
  },

  mockData: [
    {
      priority: 1,
      service: "Open API",
      layer: "Flood 1day TMS",
      kind: "TMS",
      endpoint: gistdaOpenApiUrl("/maps/flood/1day/tms/{z}/{x}/{y}"),
      notes: "Priority 1 live flood TMS. Requires GISTDA_API_KEY.",
      attribution: GISTDA_ATTRIBUTION,
    },
    {
      priority: 5,
      service: "Portal",
      layer: "Open API manual",
      kind: "HTML",
      endpoint: GISTDA_OPEN_API_DOCS,
      notes: "Official Swagger/manual UI. Knowledge nav has no other developer-docs URL.",
      attribution: GISTDA_ATTRIBUTION,
    },
  ],
};
