/**
 * Base Map Catalog with Fallback Chain
 *
 * Free and open base maps that serve as the foundation layer.
 * Satellite imagery and analytic overlays are rendered ON TOP of these.
 *
 * FALLBACK ARCHITECTURE:
 *   The system tries base maps in priority order. If a tile server is
 *   unreachable or returns errors, the next fallback is used automatically.
 *   The map ALWAYS renders — worst case is a gradient background.
 *
 *   Priority chain:
 *     1. Mapbox (if token configured) — styled vector tiles
 *     2. OpenStreetMap — universal free tiles
 *     3. LongDoMap — Thai-optimized street tiles
 *     4. ESRI World Imagery — aerial/satellite fallback
 *     5. CartoDB Positron — clean minimal base
 *     6. Stadia/Stamen — terrain/toner alternatives
 *     7. Gradient background — final fallback (always works)
 *
 * OVERLAY LAYERING:
 *   Base map (bottom) → Satellite imagery → Analytic overlays → Grid → Labels (top)
 *
 *   Each overlay layer checks availability before rendering:
 *     - Fetches a test tile from the provider
 *     - If the tile loads → use this provider
 *     - If it fails → try the next fallback in the chain
 *     - Record the result (provider, timestamp, latency) as metadata
 *
 * METADATA TRACKING:
 *   Every tile fetch records:
 *     - provider: which service served the tile
 *     - timestamp: when the tile was fetched
 *     - latency_ms: how long it took
 *     - zoom_level: what zoom level was requested
 *     - tile_age: how old the imagery is (from GIBS date parameter)
 *     - status: "ok" | "fallback" | "offline"
 *   This metadata is stored in the configured database for audit and accuracy tracking.
 */

export type BasemapId =
  | "mapbox-streets"
  | "mapbox-dark"
  | "mapbox-satellite"
  | "osm-standard"
  | "longdo-map"
  | "esri-world-imagery"
  | "esri-world-topo"
  | "carto-positron"
  | "carto-dark-matter"
  | "stadia-terrain"
  | "stadia-toner"
  | "gradient-fallback";

export interface BasemapDescriptor {
  id: BasemapId;
  label: string;
  description: string;
  tileUrl: string;
  attribution: string;
  maxZoom: number;
  requiresToken: boolean;
  tokenEnvVar?: string;
  priority: number;
  style?: "vector" | "raster";
  region?: string;
  notes?: string;
}

export interface TileFetchMetadata {
  provider: string;
  timestamp: string;
  latencyMs: number;
  zoomLevel: number;
  tileAge?: string;
  status: "ok" | "fallback" | "offline";
}

// ── Base Map Catalog ────────────────────────────────────────────

export const basemapCatalog: BasemapDescriptor[] = [
  // Priority 1: Mapbox (optional — requires token)
  {
    id: "mapbox-streets",
    label: "Mapbox Streets",
    description: "Styled vector street map with custom theming support.",
    tileUrl: "mapbox://styles/mapbox/streets-v12",
    attribution: "Mapbox",
    maxZoom: 22,
    requiresToken: true,
    tokenEnvVar: "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
    priority: 1,
    style: "vector",
    notes: "Best visual quality. Requires free Mapbox account and token.",
  },
  {
    id: "mapbox-dark",
    label: "Mapbox Dark",
    description: "Dark-themed vector map for operations/monitoring dashboards.",
    tileUrl: "mapbox://styles/mapbox/dark-v11",
    attribution: "Mapbox",
    maxZoom: 22,
    requiresToken: true,
    tokenEnvVar: "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
    priority: 1,
    style: "vector",
  },
  {
    id: "mapbox-satellite",
    label: "Mapbox Satellite",
    description: "High-resolution satellite imagery with street labels.",
    tileUrl: "mapbox://styles/mapbox/satellite-streets-v12",
    attribution: "Mapbox",
    maxZoom: 22,
    requiresToken: true,
    tokenEnvVar: "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
    priority: 1,
    style: "raster",
  },

  // Priority 2: OpenStreetMap (free, no token)
  {
    id: "osm-standard",
    label: "OpenStreetMap",
    description: "Universal free street map. Community-maintained, global coverage.",
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "OpenStreetMap contributors",
    maxZoom: 19,
    requiresToken: false,
    priority: 2,
    style: "raster",
    notes: "Always available. Good default for any region.",
  },

  // Priority 3: LongDoMap (Thai-optimized)
  {
    id: "longdo-map",
    label: "LongDo Map",
    description: "Thai-language optimized street map with local POI data.",
    tileUrl: "https://ms.longdo.com/mmmap/tile.php?zoom={z}&x={x}&y={y}&key={key}&proj=epsg3857&layer=NORMAL",
    attribution: "Metamedia Technology / LongDo Map",
    maxZoom: 18,
    requiresToken: true,
    tokenEnvVar: "LONGDO_MAP_KEY",
    priority: 3,
    style: "raster",
    region: "Thailand / Southeast Asia",
    notes: "Excellent Thai street names and local detail. Free API key available at map.longdo.com.",
  },

  // Priority 4: ESRI (free, no token)
  {
    id: "esri-world-imagery",
    label: "ESRI World Imagery",
    description: "High-resolution aerial/satellite imagery. Token-free.",
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
    requiresToken: false,
    priority: 4,
    style: "raster",
    notes: "Great aerial fallback when Mapbox satellite is unavailable.",
  },
  {
    id: "esri-world-topo",
    label: "ESRI World Topographic",
    description: "Topographic map with terrain, boundaries, and labels.",
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri",
    maxZoom: 19,
    requiresToken: false,
    priority: 4,
    style: "raster",
  },

  // Priority 5: CartoDB (free, no token)
  {
    id: "carto-positron",
    label: "CartoDB Positron",
    description: "Clean, minimal light base map. Good for data-heavy overlays.",
    tileUrl: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
    attribution: "CARTO",
    maxZoom: 20,
    requiresToken: false,
    priority: 5,
    style: "raster",
    notes: "Excellent for dashboards where overlays are the focus.",
  },
  {
    id: "carto-dark-matter",
    label: "CartoDB Dark Matter",
    description: "Dark minimal base map for night/operations themes.",
    tileUrl: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
    attribution: "CARTO",
    maxZoom: 20,
    requiresToken: false,
    priority: 5,
    style: "raster",
  },

  // Priority 6: Stadia / Stamen (free with API key)
  {
    id: "stadia-terrain",
    label: "Stadia Terrain",
    description: "Terrain-focused map with hillshading and natural features.",
    tileUrl: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}@2x.png",
    attribution: "Stadia Maps, Stamen Design, OpenStreetMap",
    maxZoom: 18,
    requiresToken: true,
    tokenEnvVar: "STADIA_API_KEY",
    priority: 6,
    style: "raster",
  },
  {
    id: "stadia-toner",
    label: "Stadia Toner",
    description: "High-contrast black and white map for print/overlay clarity.",
    tileUrl: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}@2x.png",
    attribution: "Stadia Maps, Stamen Design, OpenStreetMap",
    maxZoom: 18,
    requiresToken: true,
    tokenEnvVar: "STADIA_API_KEY",
    priority: 6,
    style: "raster",
  },

  // Priority 7: Gradient fallback (always works)
  {
    id: "gradient-fallback",
    label: "Gradient Background",
    description: "CSS gradient fallback when all tile servers are unreachable.",
    tileUrl: "",
    attribution: "",
    maxZoom: 22,
    requiresToken: false,
    priority: 99,
    style: "raster",
    notes: "Final fallback. Overlays still render on top of the gradient.",
  },
];

// ── Fallback Resolution ─────────────────────────────────────────

/**
 * Get the ordered fallback chain for base maps.
 * Maps with missing tokens are automatically skipped.
 */
export function getBasemapFallbackChain(
  availableTokens: Record<string, boolean> = {},
): BasemapDescriptor[] {
  return basemapCatalog
    .filter((bm) => {
      if (!bm.requiresToken) return true;
      return bm.tokenEnvVar ? availableTokens[bm.tokenEnvVar] === true : false;
    })
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get the best available base map given the current environment.
 */
export function getBestBasemap(
  availableTokens: Record<string, boolean> = {},
): BasemapDescriptor {
  const chain = getBasemapFallbackChain(availableTokens);
  return chain[0] || basemapCatalog[basemapCatalog.length - 1]; // gradient fallback
}

/** Free base maps that require no tokens at all. */
export const freeBasemaps = basemapCatalog.filter((bm) => !bm.requiresToken && bm.id !== "gradient-fallback");
