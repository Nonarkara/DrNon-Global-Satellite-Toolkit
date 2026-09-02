import type { ModuleDefinition } from "../../types/modules";
import { GISTDA_ATTRIBUTION } from "../lib/thai-civic";

/**
 * GISTDA Disaster Platform Open API (API Gateway).
 * Docs UI: https://disaster.gistda.or.th/services/open-api
 * Register a key at https://api-gateway.gistda.or.th/v2
 *
 * Do not scrape private FloodDash UIs and do not call undocumented
 * `/app-api/proxy/...` session internals.
 */
const OPEN_API_BASE = "https://api-gateway.gistda.or.th/api/2.0/resources";
const OPEN_API_DOCS = "https://disaster.gistda.or.th/services/open-api";

const FEATURE_PRODUCTS = [
  {
    path: "/features/flood/1day",
    label: "Flood features (1 day)",
    evidence: "Satellite-derived flood features — mapped water, not a hydrologic model.",
  },
  {
    path: "/features/flood/3days",
    label: "Flood features (3 days)",
    evidence: "Satellite-derived flood features over a 3-day window.",
  },
  {
    path: "/features/flood/7days",
    label: "Flood features (7 days)",
    evidence: "Satellite-derived flood features over a 7-day window.",
  },
  {
    path: "/features/flood-freq",
    label: "Flood frequency",
    evidence: "Flood-frequency product — historical recurrence, not a live flood observation.",
  },
  {
    path: "/features/water_hyacinth",
    label: "Water hyacinth",
    evidence: "Mapped water-hyacinth features from GISTDA disaster products.",
  },
  {
    path: "/features/viirs/1day",
    label: "VIIRS thermal (1 day)",
    evidence: "VIIRS thermal detections — hotspots, not confirmed ground fires.",
  },
  {
    path: "/features/burn-scar",
    label: "Burn scar",
    evidence: "Satellite burn-scar mapping. Scars are observed; ignition cause is not.",
  },
  {
    path: "/features/burn-freq",
    label: "Burn frequency",
    evidence: "Burn-frequency product — historical, not a live fire perimeter.",
  },
] as const;

const CKAN_POINT_PRODUCTS = [
  {
    path: "/gi-service/v1.0/disasters/flood-extent-1day",
    label: "CKAN flood-extent-1day (Bangkok point)",
    catalogUrl: "https://opendata.gistda.or.th/en/dataset/disasters-03",
    lat: 13.7563,
    lon: 100.5018,
    evidence: "Open Data Gateway point query — satellite-derived 1-day flood extent.",
  },
] as const;

interface GistdaGatewayRow {
  product: string;
  endpoint: string;
  summary: string;
  evidence: string;
  docs: string;
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

  const interesting = ["message", "status", "detail", "result", "data", "count"]
    .filter((key) => rec[key] != null)
    .map((key) => `${key}=${typeof rec[key] === "object" ? "object" : String(rec[key])}`);
  if (interesting.length > 0) return interesting.join("; ").slice(0, 220);

  try {
    return JSON.stringify(payload).slice(0, 220);
  } catch {
    return "unserializable JSON";
  }
}

async function gatewayGet(path: string, key: string, extra?: Record<string, string>) {
  const url = new URL(`${OPEN_API_BASE}${path}`);
  url.searchParams.set("api_key", key);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  const payload: unknown = await res.json().catch(() => ({ status: res.status }));
  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status}`);
  }
  return payload;
}

export const gistdaGateway: ModuleDefinition<GistdaGatewayRow[]> = {
  id: "gistda-gateway",
  label: "GISTDA Disaster Gateway",
  category: "earth-observation",
  description:
    "GISTDA Disaster Platform Open API — flood/VIIRS/burn features via api-gateway.gistda.or.th. Free key. Attribute GISTDA. Do not call /app-api/proxy internals or scrape FloodDash.",
  pollInterval: 1800,
  uiType: "table",
  requiredEnvVars: ["GISTDA_API_KEY"],
  tableColumns: [
    { key: "product", label: "Product" },
    { key: "summary", label: "Summary" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    const key = process.env.GISTDA_API_KEY;
    if (!key) throw new Error("GISTDA_API_KEY not configured");

    const jobs: Array<Promise<GistdaGatewayRow>> = FEATURE_PRODUCTS.map((product) =>
      (async () => {
        const payload = await gatewayGet(product.path, key);
        return {
          product: product.label,
          endpoint: `${OPEN_API_BASE}${product.path}`,
          summary: summarizePayload(payload),
          evidence: product.evidence,
          docs: OPEN_API_DOCS,
          attribution: GISTDA_ATTRIBUTION,
        };
      })(),
    );

    for (const product of CKAN_POINT_PRODUCTS) {
      jobs.push(
        (async () => {
          const payload = await gatewayGet(product.path, key, {
            lat: String(product.lat),
            lon: String(product.lon),
          });
          return {
            product: product.label,
            endpoint: `${OPEN_API_BASE}${product.path}`,
            summary: summarizePayload(payload),
            evidence: product.evidence,
            docs: product.catalogUrl,
            attribution: GISTDA_ATTRIBUTION,
          };
        })(),
      );
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
      product: "Flood features (1 day)",
      endpoint: `${OPEN_API_BASE}/features/flood/1day`,
      summary: "Mock — live queries need GISTDA_API_KEY (Open API returns HTTP 407 without it)",
      evidence: "Satellite-derived flood features — mapped water, not a hydrologic model.",
      docs: OPEN_API_DOCS,
      attribution: GISTDA_ATTRIBUTION,
    },
    {
      product: "Burn scar",
      endpoint: `${OPEN_API_BASE}/features/burn-scar`,
      summary: "Mock burn-scar feature feed",
      evidence: "Satellite burn-scar mapping. Scars are observed; ignition cause is not.",
      docs: OPEN_API_DOCS,
      attribution: GISTDA_ATTRIBUTION,
    },
  ],
};
