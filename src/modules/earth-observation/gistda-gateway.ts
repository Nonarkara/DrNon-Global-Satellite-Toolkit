import type { ModuleDefinition } from "../../types/modules";
import { GISTDA_ATTRIBUTION, THAI_CIVIC_POINTS } from "../lib/thai-civic";

/**
 * GISTDA API Gateway disaster products published on GISTDA Open Data (CKAN).
 * Register a key at https://api-gateway.gistda.or.th/v2
 * Do not scrape disaster.gistda.or.th or any private FloodDash UI.
 */
const GATEWAY_BASE =
  "https://api-gateway.gistda.or.th/api/2.0/resources/gi-service/v1.0/disasters";

const PRODUCTS = [
  {
    id: "flood-extent-1day",
    label: "Flood extent (1-day lookback)",
    catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-03",
    evidence:
      "Satellite-derived flood extent for the previous day — mapped water, not a hydrologic model.",
  },
  {
    id: "flood-recurrence",
    label: "Flood recurrence (2011–2023)",
    catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-01",
    evidence:
      "Historical flood-frequency layer (13 years). Not a live flood observation.",
  },
  {
    id: "burnt-area-latest",
    label: "Burnt area (latest, 365-day lookback)",
    catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-04",
    evidence:
      "Satellite burnt-area mapping. Burn scars are observed; fire ignition cause is not.",
  },
  {
    id: "drought-recurrence",
    label: "Drought recurrence (2018–2023)",
    catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-02",
    evidence:
      "Historical drought-frequency layer. Not a live drought monitor.",
  },
] as const;

interface GistdaGatewayRow {
  product: string;
  location: string;
  lat: number;
  lon: number;
  summary: string;
  evidence: string;
  catalogUrl: string;
  attribution: string;
}

function summarizePayload(payload: unknown): string {
  if (payload == null) return "empty response";
  if (typeof payload === "string") return payload.slice(0, 220);
  if (typeof payload !== "object") return String(payload);

  const rec = payload as Record<string, unknown>;
  if (rec.type === "FeatureCollection" && Array.isArray(rec.features)) {
    return `GeoJSON FeatureCollection (${rec.features.length} feature${rec.features.length === 1 ? "" : "s"})`;
  }
  if (rec.type === "Feature") return "GeoJSON Feature";

  const interesting = ["message", "status", "result", "data", "value", "found", "count"]
    .filter((key) => rec[key] != null)
    .map((key) => `${key}=${typeof rec[key] === "object" ? "object" : String(rec[key])}`);
  if (interesting.length > 0) return interesting.join("; ").slice(0, 220);

  try {
    return JSON.stringify(payload).slice(0, 220);
  } catch {
    return "unserializable JSON";
  }
}

export const gistdaGateway: ModuleDefinition<GistdaGatewayRow[]> = {
  id: "gistda-gateway",
  label: "GISTDA Disaster Gateway",
  category: "earth-observation",
  description:
    "GISTDA API Gateway point queries for Thai flood extent, flood/drought recurrence, and burnt area. Free registration. Attribute GISTDA; do not scrape private FloodDash.",
  pollInterval: 1800,
  uiType: "table",
  requiredEnvVars: ["GISTDA_API_KEY"],
  tableColumns: [
    { key: "product", label: "Product" },
    { key: "location", label: "Location" },
    { key: "summary", label: "Summary" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    const key = process.env.GISTDA_API_KEY;
    if (!key) throw new Error("GISTDA_API_KEY not configured");

    const points = THAI_CIVIC_POINTS.filter((p) =>
      ["bangkok", "chiang-mai", "hat-yai"].includes(p.id),
    );

    const jobs: Array<Promise<GistdaGatewayRow>> = [];
    for (const product of PRODUCTS) {
      const targets =
        product.id === "flood-extent-1day" ? points : points.slice(0, 1);
      for (const point of targets) {
        jobs.push(
          (async () => {
            const url = new URL(`${GATEWAY_BASE}/${product.id}`);
            url.searchParams.set("lat", String(point.lat));
            url.searchParams.set("lon", String(point.lon));
            url.searchParams.set("api_key", key);
            const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
            if (!res.ok) {
              throw new Error(`${product.id} @ ${point.id}: HTTP ${res.status}`);
            }
            const payload: unknown = await res.json();
            return {
              product: product.label,
              location: point.label,
              lat: point.lat,
              lon: point.lon,
              summary: summarizePayload(payload),
              evidence: product.evidence,
              catalogUrl: product.catalogUrl,
              attribution: GISTDA_ATTRIBUTION,
            };
          })(),
        );
      }
    }

    const settled = await Promise.allSettled(jobs);
    const rows = settled
      .filter((r): r is PromiseFulfilledResult<GistdaGatewayRow> => r.status === "fulfilled")
      .map((r) => r.value);

    if (rows.length === 0) {
      const first = settled.find((r) => r.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      const reason = first?.reason instanceof Error ? first.reason.message : "all queries failed";
      throw new Error(`GISTDA Gateway: ${reason}`);
    }

    return rows;
  },

  mockData: [
    {
      product: "Flood extent (1-day lookback)",
      location: "Bangkok",
      lat: 13.7563,
      lon: 100.5018,
      summary: "Mock — live queries need GISTDA_API_KEY from api-gateway.gistda.or.th/v2",
      evidence:
        "Satellite-derived flood extent for the previous day — mapped water, not a hydrologic model.",
      catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-03",
      attribution: GISTDA_ATTRIBUTION,
    },
    {
      product: "Flood recurrence (2011–2023)",
      location: "Bangkok",
      lat: 13.7563,
      lon: 100.5018,
      summary: "Mock historical recurrence sample",
      evidence: "Historical flood-frequency layer (13 years). Not a live flood observation.",
      catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-01",
      attribution: GISTDA_ATTRIBUTION,
    },
  ],
};
