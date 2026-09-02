import type { ModuleDefinition } from "../../types/modules";
import { GISTDA_ATTRIBUTION } from "../lib/thai-civic";

const GFLOOD_FOLDER =
  "https://gistdaportal.gistda.or.th/data/rest/services/GFlood";
const GFLOOD_WMS =
  "https://gistdaportal.gistda.or.th/data/rest/services/GFlood/GFlood_Inno_WMS/MapServer";
const GFLOOD_WMTS =
  "https://gistdaportal.gistda.or.th/data/rest/services/GFlood/GFlood_Inno_WMTS3857/MapServer";
const GFLOOD_WMS_OGC =
  "https://gistdaportal.gistda.or.th/data/services/GFlood/GFlood_Inno_WMS/MapServer/WMSServer";

interface GfloodLayerRow {
  service: string;
  layer: string;
  kind: string;
  endpoint: string;
  notes: string;
  attribution: string;
}

interface ArcGisFolder {
  services?: Array<{ name: string; type: string }>;
}

interface ArcGisMapServer {
  layers?: Array<{
    id: number;
    name: string;
    type?: string;
    geometryType?: string;
  }>;
  mapName?: string;
  copyrightText?: string;
  singleFusedMapCache?: boolean;
}

export const gistdaGflood: ModuleDefinition<GfloodLayerRow[]> = {
  id: "gistda-gflood",
  label: "GISTDA GFlood OGC Tiles",
  category: "earth-observation",
  description:
    "Public GISTDA GFlood ArcGIS REST / WMS / WMTS services — rain, flood polygons, and a 2011 flood tile cache. Attribute GISTDA. Not a scrape of FloodDash.",
  pollInterval: 3600,
  uiType: "table",
  tableColumns: [
    { key: "service", label: "Service" },
    { key: "layer", label: "Layer" },
    { key: "kind", label: "Kind" },
    { key: "notes", label: "Notes" },
  ],

  async fetchData() {
    const [folderRes, wmsRes, wmtsRes] = await Promise.all([
      fetch(`${GFLOOD_FOLDER}?f=pjson`, { signal: AbortSignal.timeout(12000) }),
      fetch(`${GFLOOD_WMS}?f=pjson`, { signal: AbortSignal.timeout(12000) }),
      fetch(`${GFLOOD_WMTS}?f=pjson`, { signal: AbortSignal.timeout(12000) }),
    ]);

    if (!folderRes.ok) throw new Error(`GFlood folder: ${folderRes.status}`);
    if (!wmsRes.ok) throw new Error(`GFlood WMS: ${wmsRes.status}`);
    if (!wmtsRes.ok) throw new Error(`GFlood WMTS: ${wmtsRes.status}`);

    const folder = (await folderRes.json()) as ArcGisFolder;
    const wms = (await wmsRes.json()) as ArcGisMapServer;
    const wmts = (await wmtsRes.json()) as ArcGisMapServer;

    const rows: GfloodLayerRow[] = [];

    for (const svc of folder.services ?? []) {
      rows.push({
        service: svc.name,
        layer: "(service)",
        kind: svc.type,
        endpoint: `${GFLOOD_FOLDER.replace(/\/GFlood$/, "")}/${svc.name}/${svc.type}`,
        notes: "Public ArcGIS REST directory. Use OGC WMS/WMTS, not private dashboards.",
        attribution: GISTDA_ATTRIBUTION,
      });
    }

    for (const layer of wms.layers ?? []) {
      const modelled = /predict/i.test(layer.name);
      rows.push({
        service: "GFlood_Inno_WMS",
        layer: `${layer.id}: ${layer.name}`,
        kind: layer.type ?? "WMS",
        endpoint: `${GFLOOD_WMS_OGC}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layer.id}&CRS=EPSG:4326&STYLES=&FORMAT=image/png&TRANSPARENT=true`,
        notes: modelled
          ? "Flood prediction polygon — modelled, not a satellite measurement."
          : layer.name.includes("rain")
            ? "Rain raster served by GISTDA — treat as a mapped product, cite GISTDA."
            : "Flood area polygon from GISTDA GFlood WMS.",
        attribution: wmts.copyrightText || GISTDA_ATTRIBUTION,
      });
    }

    for (const layer of wmts.layers ?? []) {
      rows.push({
        service: "GFlood_Inno_WMTS3857",
        layer: `${layer.id}: ${layer.name}`,
        kind: "WMTS / XYZ cache",
        endpoint: `${GFLOOD_WMTS}/tile/{z}/{y}/{x}`,
        notes:
          layer.name.includes("2011")
            ? "Cached 2011 flood footprint (Flood_Y2011), not a live flood extent."
            : "Web Mercator tile cache from GISTDA GFlood.",
        attribution: GISTDA_ATTRIBUTION,
      });
    }

    if (rows.length === 0) throw new Error("GFlood: no services advertised");
    return rows;
  },

  mockData: [
    {
      service: "GFlood/GFlood_Inno_WMS",
      layer: "1: FloodArea_Poly",
      kind: "Feature Layer",
      endpoint: `${GFLOOD_WMS_OGC}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=1`,
      notes: "Flood area polygon from GISTDA GFlood WMS.",
      attribution: GISTDA_ATTRIBUTION,
    },
    {
      service: "GFlood/GFlood_Inno_WMTS3857",
      layer: "0: Flood_Y2011",
      kind: "WMTS / XYZ cache",
      endpoint: `${GFLOOD_WMTS}/tile/{z}/{y}/{x}`,
      notes: "Cached 2011 flood footprint (Flood_Y2011), not a live flood extent.",
      attribution: GISTDA_ATTRIBUTION,
    },
  ],
};
