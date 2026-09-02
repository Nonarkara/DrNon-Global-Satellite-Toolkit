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
    "GISTDA Open API flood/fire/drought WMS, WMTS, and TMS templates (1/3/7/30-day flood, flood-freq, VIIRS, burn, dri/ndwi/smap). Key required to fetch tiles. Do not use /app-api/proxy.",
  pollInterval: 0,
  uiType: "table",
  tableColumns: [
    { key: "service", label: "Service" },
    { key: "layer", label: "Layer" },
    { key: "kind", label: "Kind" },
    { key: "endpoint", label: "Endpoint" },
  ],

  async fetchData() {
    const probe = await probeGistdaOpenApi("/maps/flood/1day/wms");

    const rows: GfloodLayerRow[] = [
      ...GISTDA_MAP_PATHS.map((item) => ({
        service: "Open API",
        layer: item.label,
        kind: item.kind.toUpperCase(),
        endpoint: gistdaOpenApiUrl(item.path),
        notes: `${item.evidence} Probe /maps/flood/1day/wms → HTTP ${probe.status}.`,
        attribution: GISTDA_ATTRIBUTION,
      })),
      ...GISTDA_PORTAL_LINKS.map((item) => ({
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
      service: "Open API",
      layer: "Flood 1day TMS",
      kind: "TMS",
      endpoint: gistdaOpenApiUrl("/maps/flood/1day/tms/{z}/{x}/{y}"),
      notes: "Live flood TMS. Requires GISTDA_API_KEY.",
      attribution: GISTDA_ATTRIBUTION,
    },
    {
      service: "Portal",
      layer: "Open API manual",
      kind: "HTML",
      endpoint: GISTDA_OPEN_API_DOCS,
      notes: "Official Swagger/manual UI.",
      attribution: GISTDA_ATTRIBUTION,
    },
  ],
};
