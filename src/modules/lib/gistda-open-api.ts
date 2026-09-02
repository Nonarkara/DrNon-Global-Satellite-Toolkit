/**
 * GISTDA Disaster Platform Open API — paths from the signed-in inventory
 * (2026-09-02). Do not add undocumented `/app-api/proxy/...` internals.
 *
 * Docs UI: https://disaster.gistda.or.th/services/open-api
 * Key portal: https://api-gateway.gistda.or.th/v2
 */
export const GISTDA_OPEN_API_BASE =
  "https://api-gateway.gistda.or.th/api/2.0/resources";
export const GISTDA_OPEN_API_DOCS =
  "https://disaster.gistda.or.th/services/open-api";
export const GISTDA_STAC_UI = "https://disaster.gistda.or.th/services/stac";
export const GISTDA_AIR = "https://air.gistda.or.th";
export const GISTDA_DOWNLOAD = "https://disaster.gistda.or.th/services/download";

const FLOOD_WINDOWS = ["1day", "3days", "7days", "30days"] as const;
const MAP_KINDS = ["wms", "wmts", "tms/{z}/{x}/{y}"] as const;

export interface GistdaOpenApiPath {
  family: "flood" | "fire" | "drought" | "portal";
  kind: "features" | "wms" | "wmts" | "tms" | "html";
  label: string;
  path: string;
  evidence: string;
}

function mapKind(suffix: string): GistdaOpenApiPath["kind"] {
  if (suffix.startsWith("tms")) return "tms";
  if (suffix === "wmts") return "wmts";
  return "wms";
}

function expandMaps(prefix: string, label: string, family: GistdaOpenApiPath["family"], evidence: string): GistdaOpenApiPath[] {
  return MAP_KINDS.map((suffix) => ({
    family,
    kind: mapKind(suffix),
    label: `${label} ${mapKind(suffix).toUpperCase()}`,
    path: `${prefix}/${suffix}`,
    evidence,
  }));
}

/** Feature feeds listed in the 2026-09-02 Open API inventory. */
export const GISTDA_FEATURE_PATHS: GistdaOpenApiPath[] = [
  ...FLOOD_WINDOWS.map((window) => ({
    family: "flood" as const,
    kind: "features" as const,
    label: `Flood features (${window})`,
    path: `/features/flood/${window}`,
    evidence: "Satellite-derived flood features — mapped water, not a hydrologic model.",
  })),
  {
    family: "flood",
    kind: "features",
    label: "Flood frequency",
    path: "/features/flood-freq",
    evidence: "Flood-frequency product — historical recurrence, not a live flood observation.",
  },
  {
    family: "flood",
    kind: "features",
    label: "Water hyacinth",
    path: "/features/water_hyacinth",
    evidence: "Mapped water-hyacinth features from GISTDA disaster products.",
  },
  ...FLOOD_WINDOWS.map((window) => ({
    family: "fire" as const,
    kind: "features" as const,
    label: `VIIRS thermal (${window})`,
    path: `/features/viirs/${window}`,
    evidence: "VIIRS thermal detections — hotspots, not confirmed ground fires.",
  })),
  {
    family: "fire",
    kind: "features",
    label: "Burn scar",
    path: "/features/burn-scar",
    evidence: "Satellite burn-scar mapping. Scars are observed; ignition cause is not.",
  },
  {
    family: "fire",
    kind: "features",
    label: "Burn frequency",
    path: "/features/burn-freq",
    evidence: "Burn-frequency product — historical, not a live fire perimeter.",
  },
];

/** Map templates listed in the 2026-09-02 Open API inventory (key required). */
export const GISTDA_MAP_PATHS: GistdaOpenApiPath[] = [
  ...FLOOD_WINDOWS.flatMap((window) =>
    expandMaps(
      `/maps/flood/${window}`,
      `Flood ${window}`,
      "flood",
      "Live flood tiles from the Disaster Platform Open API. Requires GISTDA_API_KEY.",
    ),
  ),
  ...expandMaps(
    "/maps/flood-freq",
    "Flood frequency",
    "flood",
    "Flood-frequency map — historical, not live inundation.",
  ),
  ...FLOOD_WINDOWS.flatMap((window) =>
    expandMaps(
      `/maps/viirs/${window}`,
      `VIIRS ${window}`,
      "fire",
      "VIIRS thermal map tiles matching /features/viirs/{window}.",
    ),
  ),
  ...expandMaps(
    "/maps/burn-scar",
    "Burn scar",
    "fire",
    "Burn-scar map tiles matching /features/burn-scar.",
  ),
  ...expandMaps(
    "/maps/burn-freq",
    "Burn frequency",
    "fire",
    "Burn-frequency map tiles matching /features/burn-freq.",
  ),
  ...(["dri", "ndwi", "smap"] as const).flatMap((product) =>
    expandMaps(
      `/maps/${product}/7days`,
      `Drought ${product} 7days`,
      "drought",
      product === "smap"
        ? "GISTDA drought SMAP 7-day map — not NASA GIBS SMAP L4."
        : `GISTDA drought ${product.toUpperCase()} 7-day map.`,
    ),
  ),
];

export const GISTDA_PORTAL_LINKS: GistdaOpenApiPath[] = [
  {
    family: "portal",
    kind: "html",
    label: "Open API manual",
    path: GISTDA_OPEN_API_DOCS,
    evidence: "Official Swagger/manual UI. No separate developer-docs URL in the Knowledge nav.",
  },
  {
    family: "portal",
    kind: "html",
    label: "STAC UI",
    path: GISTDA_STAC_UI,
    evidence:
      "STAC UI exists. Flood catalog was empty at inventory time. Retrospective only — not a live tile CDN. Sentinel-1C/1D SAR flood scenes are on the download portal.",
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (flood)",
    path: `${GISTDA_DOWNLOAD}?type=flood`,
    evidence: "Multi-format downloads including Sentinel-1C/1D SAR flood rows (e.g. S1D_YYYYMMDD_HHMM). Retrospective, not live TMS.",
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (fire)",
    path: `${GISTDA_DOWNLOAD}?type=fire`,
    evidence: "Download portal type=fire.",
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (drought)",
    path: `${GISTDA_DOWNLOAD}?type=drought`,
    evidence: "Download portal type=drought.",
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (other)",
    path: `${GISTDA_DOWNLOAD}?type=other`,
    evidence: "Download portal type=other.",
  },
  {
    family: "portal",
    kind: "html",
    label: "GISTDA Air (separate)",
    path: GISTDA_AIR,
    evidence: "air.gistda.or.th is a separate site, not this Open API.",
  },
];

export function gistdaOpenApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${GISTDA_OPEN_API_BASE}${path}`;
}

/**
 * Unauthenticated Open API calls return HTTP 407. Node/undici treats 407 as
 * proxy-auth failure and throws, so probes must send a placeholder `api_key`
 * (invalid key → 401 JSON) or a real `GISTDA_API_KEY`.
 */
export async function probeGistdaOpenApi(
  path: string,
): Promise<{ status: number; body: string }> {
  const url = new URL(gistdaOpenApiUrl(path));
  url.searchParams.set("api_key", process.env.GISTDA_API_KEY || "unconfigured");
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const body = await res.text();
    return { status: res.status, body: body.slice(0, 220) };
  } catch (error) {
    return {
      status: 0,
      body: error instanceof Error ? error.message : "probe failed",
    };
  }
}
