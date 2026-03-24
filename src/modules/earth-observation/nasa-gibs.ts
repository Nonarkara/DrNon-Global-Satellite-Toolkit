import type { ModuleDefinition } from "../../types/modules";

interface GibsLayer {
  id: string;
  label: string;
  source: string;
  tileUrl: string;
  date: string;
  type: string;
}

export const nasaGibs: ModuleDefinition<GibsLayer[]> = {
  id: "nasa-gibs",
  label: "NASA GIBS Imagery",
  category: "earth-observation",
  description:
    "NASA Global Imagery Browse Services — VIIRS True Color, MODIS False Color, and Blue Marble satellite imagery tiles.",
  pollInterval: 0,
  uiType: "table",
  wrapsExisting: "/api/map/overlays",
  tableColumns: [
    { key: "label", label: "Layer" },
    { key: "source", label: "Source" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type" },
  ],

  async fetchData() {
    const res = await fetch("http://127.0.0.1:3000/api/map/overlays", {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`GIBS proxy: ${res.status}`);
    const json = (await res.json()) as {
      overlays?: Array<{
        id: string;
        label: string;
        source: string;
        tileTemplate: string;
        family: string;
      }>;
      focusDate?: string;
    };

    return (json.overlays ?? [])
      .filter((o) => o.source.includes("NASA") || o.source.includes("GIBS"))
      .map((o) => ({
        id: o.id,
        label: o.label,
        source: o.source,
        tileUrl: o.tileTemplate,
        date: json.focusDate ?? new Date().toISOString().slice(0, 10),
        type: o.family,
      }));
  },

  mockData: [
    {
      id: "viirsTrueColor",
      label: "VIIRS True Color",
      source: "NASA GIBS / VIIRS",
      tileUrl: "",
      date: "2026-03-24",
      type: "imagery",
    },
  ],
};
