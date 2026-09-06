import type { ModuleDefinition } from "../../types/modules";

interface GibsLayer {
  id: string;
  label: string;
  source: string;
  tileUrl: string;
  date: string;
  type: string;
}

const GIBS_BASE = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

/**
 * GIBS tile paths are {z}/{y}/{x} — y before x. Getting this backwards is the
 * single most common GIBS integration bug, so the template is built in one
 * place here and reused everywhere.
 */
function gibsTemplate(
  layer: string,
  date: string,
  matrixSet: string,
  ext: "jpg" | "png",
): string {
  return `${GIBS_BASE}/${layer}/default/${date}/${matrixSet}/{z}/{y}/{x}.${ext}`;
}

/** Catalog of the GIBS layers this toolkit renders. Extend freely — GIBS
 *  publishes 1000+ layers; these are the ones worth a dashboard slot. */
const LAYERS: {
  id: string;
  label: string;
  layer: string;
  matrixSet: string;
  ext: "jpg" | "png";
  type: string;
  /** Layers with a fixed epoch rather than a daily cadence. */
  fixedDate?: string;
}[] = [
  {
    id: "viirs-true-color",
    label: "VIIRS SNPP True Color",
    layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    matrixSet: "GoogleMapsCompatible_Level9",
    ext: "jpg",
    type: "imagery",
  },
  {
    id: "modis-terra-true-color",
    label: "MODIS Terra True Color",
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    matrixSet: "GoogleMapsCompatible_Level9",
    ext: "jpg",
    type: "imagery",
  },
  {
    id: "modis-aqua-true-color",
    label: "MODIS Aqua True Color",
    layer: "MODIS_Aqua_CorrectedReflectance_TrueColor",
    matrixSet: "GoogleMapsCompatible_Level9",
    ext: "jpg",
    type: "imagery",
  },
  {
    id: "modis-false-color",
    label: "MODIS Terra False Color (7-2-1) — burn scars",
    layer: "MODIS_Terra_CorrectedReflectance_Bands721",
    matrixSet: "GoogleMapsCompatible_Level9",
    ext: "jpg",
    type: "analysis",
  },
  {
    id: "viirs-thermal",
    label: "VIIRS Thermal Anomalies (day)",
    layer: "VIIRS_SNPP_Thermal_Anomalies_375m_Day",
    matrixSet: "GoogleMapsCompatible_Level8",
    ext: "png",
    type: "hazard",
  },
  {
    id: "viirs-night-lights",
    label: "VIIRS Night Lights (Black Marble 2016)",
    layer: "VIIRS_Black_Marble",
    matrixSet: "GoogleMapsCompatible_Level8",
    ext: "png",
    type: "imagery",
    fixedDate: "2016-01-01",
  },
];

/** GIBS NRT imagery lands ~3 h after overpass; yesterday is always safe. */
function latestSafeDate(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export const nasaGibs: ModuleDefinition<GibsLayer[]> = {
  id: "nasa-gibs",
  label: "NASA GIBS Imagery Layers",
  category: "earth-observation",
  description:
    "Ready-to-render NASA GIBS tile templates — VIIRS/MODIS true colour, false colour burn scars, thermal anomalies and night lights. No API key required.",
  pollInterval: 0,
  uiType: "table",
  tableColumns: [
    { key: "label", label: "Layer" },
    { key: "source", label: "Source" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
  ],

  // Deterministic: GIBS layer templates are constructed, not fetched.
  // Kept async to satisfy the ModuleDefinition contract.
  async fetchData() {
    const date = latestSafeDate();
    return LAYERS.map((l) => ({
      id: l.id,
      label: l.label,
      source: "NASA GIBS",
      tileUrl: gibsTemplate(l.layer, l.fixedDate ?? date, l.matrixSet, l.ext),
      date: l.fixedDate ?? date,
      type: l.type,
    }));
  },

  mockData: [
    {
      id: "viirs-true-color",
      label: "VIIRS SNPP True Color",
      source: "NASA GIBS",
      tileUrl: "",
      date: "2026-03-24",
      type: "imagery",
    },
  ],
};

export { gibsTemplate, GIBS_BASE };
