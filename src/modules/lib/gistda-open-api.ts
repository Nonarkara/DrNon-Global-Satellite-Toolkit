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

/** Civic dashboard ranking for this PR (1 = live flood tiles … 5 = retrospective only). */
export type GistdaCivicPriority = 1 | 2 | 3 | 4 | 5;

export interface GistdaOpenApiPath {
  family: "flood" | "fire" | "drought" | "portal";
  kind: "features" | "wms" | "wmts" | "tms" | "html";
  label: string;
  path: string;
  evidence: string;
  /** 1 flood tiles, 2 flood features, 3 fire, 4 drought, 5 STAC/S1/docs (not live). */
  priority: GistdaCivicPriority;
}

function mapKind(suffix: string): GistdaOpenApiPath["kind"] {
  if (suffix.startsWith("tms")) return "tms";
  if (suffix === "wmts") return "wmts";
  return "wms";
}

function expandMaps(
  prefix: string,
  label: string,
  family: GistdaOpenApiPath["family"],
  evidence: string,
  priority: GistdaCivicPriority,
): GistdaOpenApiPath[] {
  return MAP_KINDS.map((suffix) => ({
    family,
    kind: mapKind(suffix),
    label: `${label} ${mapKind(suffix).toUpperCase()}`,
    path: `${prefix}/${suffix}`,
    evidence,
    priority,
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
    priority: 2 as const,
  })),
  {
    family: "flood",
    kind: "features",
    label: "Flood frequency",
    path: "/features/flood-freq",
    evidence: "Flood-frequency product — historical recurrence, not a live flood observation.",
    priority: 2,
  },
  {
    family: "flood",
    kind: "features",
    label: "Water hyacinth",
    path: "/features/water_hyacinth",
    evidence: "Mapped water-hyacinth features from GISTDA disaster products.",
    priority: 2,
  },
  ...FLOOD_WINDOWS.map((window) => ({
    family: "fire" as const,
    kind: "features" as const,
    label: `VIIRS thermal (${window})`,
    path: `/features/viirs/${window}`,
    evidence: "VIIRS thermal detections — hotspots, not confirmed ground fires.",
    priority: 3 as const,
  })),
  {
    family: "fire",
    kind: "features",
    label: "Burn scar",
    path: "/features/burn-scar",
    evidence: "Satellite burn-scar mapping. Scars are observed; ignition cause is not.",
    priority: 3,
  },
  {
    family: "fire",
    kind: "features",
    label: "Burn frequency",
    path: "/features/burn-freq",
    evidence: "Burn-frequency product — historical, not a live fire perimeter.",
    priority: 3,
  },
];

/** Map templates listed in the 2026-09-02 Open API inventory (key required). */
export const GISTDA_MAP_PATHS: GistdaOpenApiPath[] = [
  ...FLOOD_WINDOWS.flatMap((window) =>
    expandMaps(
      `/maps/flood/${window}`,
      `Flood ${window}`,
      "flood",
      "Primary live civic flood tiles (priority 1). Requires GISTDA_API_KEY. Open API gateway only.",
      1,
    ),
  ),
  ...expandMaps(
    "/maps/flood-freq",
    "Flood frequency",
    "flood",
    "Flood-frequency map — historical recurrence companion to /features/flood-freq (priority 2).",
    2,
  ),
  ...FLOOD_WINDOWS.flatMap((window) =>
    expandMaps(
      `/maps/viirs/${window}`,
      `VIIRS ${window}`,
      "fire",
      "VIIRS thermal map tiles matching /features/viirs/{window} (priority 3).",
      3,
    ),
  ),
  ...expandMaps(
    "/maps/burn-scar",
    "Burn scar",
    "fire",
    "Burn-scar map tiles matching /features/burn-scar (priority 3).",
    3,
  ),
  ...expandMaps(
    "/maps/burn-freq",
    "Burn frequency",
    "fire",
    "Burn-frequency map tiles matching /features/burn-freq (priority 3).",
    3,
  ),
  ...(["dri", "ndwi", "smap"] as const).flatMap((product) =>
    expandMaps(
      `/maps/${product}/7days`,
      `Drought ${product} 7days`,
      "drought",
      product === "smap"
        ? "GISTDA drought SMAP 7-day map — not NASA GIBS SMAP L4 (priority 4)."
        : `GISTDA drought ${product.toUpperCase()} 7-day map (priority 4).`,
      4,
    ),
  ),
];

export const GISTDA_PORTAL_LINKS: GistdaOpenApiPath[] = [
  {
    family: "portal",
    kind: "html",
    label: "Open API manual",
    path: GISTDA_OPEN_API_DOCS,
    evidence: "Official Swagger/manual UI. Knowledge nav has no separate developer-docs URL.",
    priority: 5,
  },
  {
    family: "portal",
    kind: "html",
    label: "STAC UI",
    path: GISTDA_STAC_UI,
    evidence:
      "Priority 5 (retrospective). STAC UI exists; flood catalog was empty at inventory time. Not a live tile CDN.",
    priority: 5,
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (flood)",
    path: `${GISTDA_DOWNLOAD}?type=flood`,
    evidence:
      "Priority 5 (retrospective). Multi-format downloads including Sentinel-1C/1D SAR flood rows (IDs like S1D_YYYYMMDD_HHMM). Not a live TMS.",
    priority: 5,
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (fire)",
    path: `${GISTDA_DOWNLOAD}?type=fire`,
    evidence: "Download portal type=fire. Retrospective files, not a live tile CDN.",
    priority: 5,
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (drought)",
    path: `${GISTDA_DOWNLOAD}?type=drought`,
    evidence: "Download portal type=drought. Retrospective files, not a live tile CDN.",
    priority: 5,
  },
  {
    family: "portal",
    kind: "html",
    label: "Download portal (other)",
    path: `${GISTDA_DOWNLOAD}?type=other`,
    evidence: "Download portal type=other. Retrospective files, not a live tile CDN.",
    priority: 5,
  },
  {
    family: "portal",
    kind: "html",
    label: "GISTDA Air (separate)",
    path: GISTDA_AIR,
    evidence: "air.gistda.or.th is a separate site, not this Open API.",
    priority: 5,
  },
];

/** Deck.gl / XYZ overlays for the civic priority list (TMS only; WMS/WMTS stay in the module catalog). */
export interface GistdaCivicTmsOverlay {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  family: "flood" | "fire" | "drought";
  priority: GistdaCivicPriority;
  path: string;
}

export const GISTDA_CIVIC_TMS_OVERLAYS: GistdaCivicTmsOverlay[] = [
  ...FLOOD_WINDOWS.map((window) => ({
    id: `gistdaFlood${window}`,
    label: `GISTDA Flood ${window}`,
    shortLabel:
      window === "1day" ? "FL1" : window === "3days" ? "FL3" : window === "7days" ? "FL7" : "FL30",
    description:
      `Open API live flood TMS (${window}). Primary civic overlay. Requires GISTDA_API_KEY as api_key. Not /app-api/proxy.`,
    family: "flood" as const,
    priority: 1 as const,
    path: `/maps/flood/${window}/tms/{z}/{x}/{y}`,
  })),
  {
    id: "gistdaFloodFreq",
    label: "GISTDA Flood frequency",
    shortLabel: "FLFQ",
    description:
      "Open API flood-frequency TMS — historical recurrence, not live inundation. Companion to /features/flood-freq.",
    family: "flood",
    priority: 2,
    path: "/maps/flood-freq/tms/{z}/{x}/{y}",
  },
  {
    id: "gistdaViirs1day",
    label: "GISTDA VIIRS 1-day",
    shortLabel: "VIIRS",
    description:
      "Open API VIIRS thermal TMS (1day). Hotspots, not confirmed ground fires. Matching /features/viirs/1day.",
    family: "fire",
    priority: 3,
    path: "/maps/viirs/1day/tms/{z}/{x}/{y}",
  },
  {
    id: "gistdaBurnScar",
    label: "GISTDA Burn scar",
    shortLabel: "BURN",
    description: "Open API burn-scar TMS matching /features/burn-scar.",
    family: "fire",
    priority: 3,
    path: "/maps/burn-scar/tms/{z}/{x}/{y}",
  },
  {
    id: "gistdaBurnFreq",
    label: "GISTDA Burn frequency",
    shortLabel: "BRNF",
    description: "Open API burn-frequency TMS — historical, not a live fire perimeter.",
    family: "fire",
    priority: 3,
    path: "/maps/burn-freq/tms/{z}/{x}/{y}",
  },
  {
    id: "gistdaDri7days",
    label: "GISTDA Drought DRI 7-day",
    shortLabel: "DRI",
    description: "Open API drought DRI 7-day TMS. Requires GISTDA_API_KEY.",
    family: "drought",
    priority: 4,
    path: "/maps/dri/7days/tms/{z}/{x}/{y}",
  },
  {
    id: "gistdaNdwi7days",
    label: "GISTDA Drought NDWI 7-day",
    shortLabel: "NDWI",
    description: "Open API drought NDWI 7-day TMS. Requires GISTDA_API_KEY.",
    family: "drought",
    priority: 4,
    path: "/maps/ndwi/7days/tms/{z}/{x}/{y}",
  },
  {
    id: "gistdaSmap7days",
    label: "GISTDA Drought SMAP 7-day",
    shortLabel: "SM7",
    description:
      "Open API drought SMAP 7-day TMS — GISTDA product, not NASA GIBS SMAP L4.",
    family: "drought",
    priority: 4,
    path: "/maps/smap/7days/tms/{z}/{x}/{y}",
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
