import type { ModuleDefinition } from "../../types/modules";

const GIBS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

interface SmapLayerRow {
  layer: string;
  product: string;
  tileUrl: string;
  tileStatus: string;
  evidence: string;
  docs: string;
}

const LAYERS = [
  {
    id: "SMAP_L4_Analyzed_Surface_Soil_Moisture",
    product: "SPL4 surface soil moisture (0–5 cm)",
    evidence:
      "GIBS browse of SMAP L4 analyzed surface moisture — land-surface model assimilating SMAP observations. Modelled analysis, not an in-situ probe.",
  },
  {
    id: "SMAP_L4_Analyzed_Root_Zone_Soil_Moisture",
    product: "SPL4 root-zone soil moisture (0–100 cm)",
    evidence:
      "GIBS browse of SMAP L4 analyzed root-zone moisture. Root zone is modelled (not directly measured by the L-band radiometer).",
  },
] as const;

function isoDate(offsetDays: number): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export const nasaSmap: ModuleDefinition<SmapLayerRow[]> = {
  id: "nasa-smap",
  label: "NASA SMAP Soil Moisture",
  category: "earth-observation",
  description:
    "NASA SMAP L4 soil-moisture browse via GIBS WMTS. L4 is a modelled analysis (SMAP + land model), useful for drought context — not a field sensor network.",
  pollInterval: 21600,
  uiType: "table",
  tableColumns: [
    { key: "layer", label: "GIBS layer" },
    { key: "product", label: "Product" },
    { key: "tileStatus", label: "Tile" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    // L4 GIBS layers lag a few days; probe a conservative recent date.
    const date = isoDate(4);
    const rows: SmapLayerRow[] = [];

    for (const layer of LAYERS) {
      const tileUrl = `${GIBS}/${layer.id}/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
      const probe = `${GIBS}/${layer.id}/default/${date}/GoogleMapsCompatible_Level6/0/0/0.png`;
      let tileStatus = "unprobed";
      try {
        const res = await fetch(probe, { signal: AbortSignal.timeout(10000) });
        const type = res.headers.get("content-type") ?? "";
        tileStatus = res.ok && type.includes("image")
          ? `HTTP ${res.status} image @ ${date}`
          : `HTTP ${res.status} ${type || "no content-type"}`;
      } catch (error) {
        tileStatus = error instanceof Error ? error.message : "probe failed";
      }

      rows.push({
        layer: layer.id,
        product: layer.product,
        tileUrl,
        tileStatus,
        evidence: layer.evidence,
        docs: "https://nsidc.org/data/smap — granules via NASA Earthdata; GIBS is browse, not the HDF5 science product.",
      });
    }

    return rows;
  },

  mockData: [
    {
      layer: "SMAP_L4_Analyzed_Surface_Soil_Moisture",
      product: "SPL4 surface soil moisture (0–5 cm)",
      tileUrl: `${GIBS}/SMAP_L4_Analyzed_Surface_Soil_Moisture/default/2024-03-01/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
      tileStatus: "HTTP 200 image @ 2024-03-01",
      evidence:
        "GIBS browse of SMAP L4 analyzed surface moisture — land-surface model assimilating SMAP observations. Modelled analysis, not an in-situ probe.",
      docs: "https://nsidc.org/data/smap",
    },
  ],
};
