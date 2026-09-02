import type { ModuleDefinition } from "../../types/modules";
import { GISTDA_ATTRIBUTION } from "../lib/thai-civic";
import {
  GISTDA_FEATURE_PATHS,
  GISTDA_OPEN_API_DOCS,
  gistdaOpenApiUrl,
  probeGistdaOpenApi,
} from "../lib/gistda-open-api";

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

export const gistdaGateway: ModuleDefinition<GistdaGatewayRow[]> = {
  id: "gistda-gateway",
  label: "GISTDA Disaster Gateway",
  category: "earth-observation",
  description:
    "GISTDA Disaster Platform Open API feature feeds: /features/flood/{1day,3days,7days,30days}, flood-freq, water_hyacinth, /features/viirs/…, burn-scar, burn-freq. Key optional for live JSON. Do not call /app-api/proxy.",
  pollInterval: 1800,
  uiType: "table",
  tableColumns: [
    { key: "product", label: "Product" },
    { key: "endpoint", label: "Endpoint" },
    { key: "summary", label: "Summary" },
    { key: "evidence", label: "Evidence" },
  ],

  async fetchData() {
    const key = process.env.GISTDA_API_KEY;
    const rows: GistdaGatewayRow[] = [];

    if (!key) {
      // Catalog the exact inventory. Probe with a placeholder key — bare 407
      // makes Node/undici throw ("proxy authentication required").
      const probe = await probeGistdaOpenApi("/features/flood/1day");
      for (const product of GISTDA_FEATURE_PATHS) {
        rows.push({
          product: product.label,
          endpoint: gistdaOpenApiUrl(product.path),
          summary: `Probe /features/flood/1day → HTTP ${probe.status} — set GISTDA_API_KEY for live GeoJSON. ${probe.body}`,
          evidence: product.evidence,
          docs: GISTDA_OPEN_API_DOCS,
          attribution: GISTDA_ATTRIBUTION,
        });
      }
      return rows;
    }

    const settled = await Promise.allSettled(
      GISTDA_FEATURE_PATHS.map(async (product) => {
        const url = new URL(gistdaOpenApiUrl(product.path));
        url.searchParams.set("api_key", key);
        const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
        const payload: unknown = await res.json().catch(() => ({ status: res.status }));
        if (!res.ok) throw new Error(`${product.path}: HTTP ${res.status}`);
        return {
          product: product.label,
          endpoint: gistdaOpenApiUrl(product.path),
          summary: summarizePayload(payload),
          evidence: product.evidence,
          docs: GISTDA_OPEN_API_DOCS,
          attribution: GISTDA_ATTRIBUTION,
        };
      }),
    );

    for (const result of settled) {
      if (result.status === "fulfilled") rows.push(result.value);
    }

    if (rows.length === 0) {
      const first = settled.find((r) => r.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      const reason = first?.reason instanceof Error ? first.reason.message : "all queries failed";
      throw new Error(`GISTDA Gateway: ${reason}`);
    }

    return rows;
  },

  mockData: GISTDA_FEATURE_PATHS.slice(0, 3).map((product) => ({
    product: product.label,
    endpoint: gistdaOpenApiUrl(product.path),
    summary: "Mock — live Open API needs GISTDA_API_KEY (HTTP 407 without it)",
    evidence: product.evidence,
    docs: GISTDA_OPEN_API_DOCS,
    attribution: GISTDA_ATTRIBUTION,
  })),
};
