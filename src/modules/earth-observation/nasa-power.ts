import type { ModuleDefinition } from "../../types/modules";
import { THAI_CIVIC_POINTS } from "../lib/thai-civic";

interface PowerRow {
  location: string;
  date: string;
  t2mC: number | string;
  precipMm: number | string;
  evidence: string;
}

interface PowerResponse {
  header?: { fill_value?: number; sources?: string[] };
  properties?: {
    parameter?: {
      T2M?: Record<string, number>;
      PRECTOTCORR?: Record<string, number>;
    };
  };
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export const nasaPower: ModuleDefinition<PowerRow[]> = {
  id: "nasa-power",
  label: "NASA POWER Climate",
  category: "earth-observation",
  description:
    "NASA POWER daily 2 m temperature and corrected precipitation for Thai civic points. Analysis-ready climate fields from GEOS — modelled, not weather-station observations.",
  pollInterval: 21600,
  uiType: "table",
  tableColumns: [
    { key: "location", label: "City" },
    { key: "date", label: "Date" },
    { key: "t2mC", label: "T2M °C" },
    { key: "precipMm", label: "Precip mm" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    const end = new Date();
    const start = new Date(end.getTime() - 5 * 86_400_000);
    const cities = THAI_CIVIC_POINTS.filter((p) =>
      ["bangkok", "chiang-mai", "hat-yai"].includes(p.id),
    );

    const rows: PowerRow[] = [];
    for (const city of cities) {
      const url = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
      url.searchParams.set("parameters", "T2M,PRECTOTCORR");
      url.searchParams.set("community", "AG");
      url.searchParams.set("longitude", String(city.lon));
      url.searchParams.set("latitude", String(city.lat));
      url.searchParams.set("start", ymd(start));
      url.searchParams.set("end", ymd(end));
      url.searchParams.set("format", "JSON");

      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`NASA POWER ${city.id}: HTTP ${res.status}`);
      const json = (await res.json()) as PowerResponse;
      const fill = json.header?.fill_value ?? -999;
      const t2m = json.properties?.parameter?.T2M ?? {};
      const pr = json.properties?.parameter?.PRECTOTCORR ?? {};
      const dates = Object.keys(t2m)
        .filter((date) => t2m[date] !== fill && pr[date] !== fill)
        .sort()
        .reverse();
      const sources = (json.header?.sources ?? ["GEOS"]).join(", ");

      const picked = dates.length > 0 ? dates.slice(0, 3) : Object.keys(t2m).sort().reverse().slice(0, 3);
      for (const date of picked) {
        const t = t2m[date];
        const p = pr[date];
        rows.push({
          location: city.label,
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          t2mC: t === fill ? "pending" : t,
          precipMm: p === fill ? "pending" : p,
          evidence: `NASA POWER daily ARD (${sources}) — modelled meteorological fields, ~0.5° native resolution. Not a rain gauge.`,
        });
      }
    }

    if (rows.length === 0) throw new Error("NASA POWER: empty series");
    return rows;
  },

  mockData: [
    {
      location: "Bangkok",
      date: "2026-08-30",
      t2mC: 26.92,
      precipMm: 4.49,
      evidence:
        "NASA POWER daily ARD (GEOSIT) — modelled meteorological fields, ~0.5° native resolution. Not a rain gauge.",
    },
  ],
};
