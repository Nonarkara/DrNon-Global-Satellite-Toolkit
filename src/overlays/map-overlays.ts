/**
 * Satellite & Raster Overlay Catalog
 *
 * Authoritative catalog of all satellite imagery and raster overlays.
 * Each overlay specifies its WMTS tile template, max zoom, opacity,
 * and operational role so the map engine and UI controls can consume
 * them uniformly.
 *
 * Tile sources:
 *   - NASA GIBS (VIIRS, MODIS, IMERG, Blue Marble, Night Lights, Aerosol)
 *   - EOX/ESA Sentinel-2 Cloudless
 *   - JRC/Google Global Surface Water
 *   - EMODnet Bathymetry
 */

import type {
  MapOverlay,
  MapOverlayCatalogResponse,
  MapOverlayKind,
} from "../types/satellite";

/**
 * NASA GIBS only serves imagery up to the current real-world date.
 * We anchor to a known-good historical date to prevent blank tiles
 * when the dashboard loads without a user-specified date.
 */
const NASA_GIBS_SAFE_DATE = "2024-03-01";

function getSafeDate() {
  return NASA_GIBS_SAFE_DATE;
}

function rasterOverlay(overlay: Omit<MapOverlay, "kind" | "updatedAt">): MapOverlay {
  return {
    ...overlay,
    kind: "raster",
    updatedAt: new Date().toISOString(),
  };
}

function vectorOverlay(overlay: Omit<MapOverlay, "kind" | "updatedAt">): MapOverlay {
  return {
    ...overlay,
    kind: "vector",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Build the complete overlay catalog for a given focus date.
 *
 * Returns raster satellite overlays (VIIRS, MODIS, Sentinel-2, etc.)
 * and vector operational overlays (boundaries, thermal hotspots, etc.).
 */
export function buildMapOverlayCatalog(
  focusDate = getSafeDate(),
): MapOverlayCatalogResponse {
  const overlays: MapOverlay[] = [
    // ── Satellite Imagery (Raster) ──────────────────────────────
    rasterOverlay({
      id: "viirsTrueColor",
      label: "VIIRS True Color",
      shortLabel: "TRUE",
      description: "Natural-color daily scan for first-pass regional review.",
      source: "NASA GIBS / VIIRS",
      family: "imagery",
      role: "base-option",
      defaultOpacity: 0.74,
      enabledByDefault: true,
      maxZoom: 9,
      timeMode: "dated",
      tileTemplate:
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${focusDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    }),
    rasterOverlay({
      id: "modisFalseColor",
      label: "MODIS False Color",
      shortLabel: "FALSE",
      description:
        "Vegetation and burn-scar contrast for terrain, canopy health, and disturbance.",
      source: "NASA GIBS / MODIS Terra",
      family: "vegetation",
      role: "base-option",
      defaultOpacity: 0.78,
      enabledByDefault: false,
      maxZoom: 9,
      timeMode: "dated",
      tileTemplate:
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands721/default/${focusDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    }),
    rasterOverlay({
      id: "blueMarble",
      label: "Blue Marble Relief",
      shortLabel: "RELIEF",
      description: "Terrain-first relief framing for ridgelines, approach routes, and coastlines.",
      source: "NASA GIBS / Blue Marble",
      family: "terrain",
      role: "base-option",
      defaultOpacity: 0.72,
      enabledByDefault: false,
      maxZoom: 8,
      timeMode: "dated",
      tileTemplate:
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/${focusDate}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`,
    }),
    rasterOverlay({
      id: "vegetationIndex",
      label: "Vegetation Index",
      shortLabel: "EVI",
      description:
        "Eight-day vegetation intensity surface for canopy stress and seasonal greenness.",
      source: "NASA GIBS / MODIS Terra EVI",
      family: "vegetation",
      role: "analytic",
      defaultOpacity: 0.46,
      enabledByDefault: false,
      maxZoom: 9,
      timeMode: "default",
      tileTemplate:
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_EVI_8Day/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
    }),
    rasterOverlay({
      id: "nightLights",
      label: "Night Lights",
      shortLabel: "LIGHTS",
      description:
        "Hourly VIIRS day-night band for settlement brightness and infrastructure activity.",
      source: "NASA GIBS / VIIRS",
      family: "lights",
      role: "analytic",
      defaultOpacity: 0.48,
      enabledByDefault: false,
      maxZoom: 8,
      timeMode: "default",
      tileTemplate:
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_AtSensor_M15/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
    }),
    rasterOverlay({
      id: "precipitationRate",
      label: "Precipitation Rate",
      shortLabel: "RAIN",
      description: "IMERG precipitation rate for recent rain-field pressure and mobility impact.",
      source: "NASA GIBS / IMERG",
      family: "weather",
      role: "analytic",
      defaultOpacity: 0.56,
      enabledByDefault: false,
      maxZoom: 6,
      timeMode: "dated",
      tileTemplate:
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/${focusDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
    }),
    rasterOverlay({
      id: "aerosolOpticalDepth",
      label: "Aerosol Optical Depth",
      shortLabel: "AER",
      description:
        "MODIS aerosol optical depth surface for pollution drift context.",
      source: "NASA GIBS / MODIS",
      family: "air",
      role: "analytic",
      defaultOpacity: 0.58,
      enabledByDefault: false,
      maxZoom: 6,
      timeMode: "dated",
      tileTemplate:
        `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Combined_Value_Added_AOD/default/${focusDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
    }),
    rasterOverlay({
      id: "s2Cloudless",
      label: "Sentinel-2 Cloudless",
      shortLabel: "S2CL",
      description:
        "10m cloud-free annual mosaic from Sentinel-2 for high-resolution visual baseline.",
      source: "EOX / Sentinel-2",
      family: "imagery",
      role: "base-option",
      defaultOpacity: 0.8,
      enabledByDefault: false,
      maxZoom: 15,
      tileTemplate:
        "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg",
    }),
    rasterOverlay({
      id: "surfaceWater",
      label: "Surface Water",
      shortLabel: "WATER",
      description:
        "30m global surface water occurrence for flood risk monitoring.",
      source: "JRC / Google",
      family: "terrain",
      role: "analytic",
      defaultOpacity: 0.6,
      enabledByDefault: false,
      maxZoom: 13,
      tileTemplate:
        "https://storage.googleapis.com/global-surface-water/tiles2021/occurrence/{z}/{x}/{y}.png",
    }),
    rasterOverlay({
      id: "bathymetry",
      label: "Ocean Bathymetry",
      shortLabel: "BATHY",
      description:
        "Ocean depth and land elevation for maritime context.",
      source: "EMODnet / GEBCO",
      family: "terrain",
      role: "analytic",
      defaultOpacity: 0.55,
      enabledByDefault: false,
      maxZoom: 12,
      tileTemplate:
        "https://tiles.emodnet-bathymetry.eu/v12/mean_atlas_land_latest/web_mercator/{z}/{x}/{y}.png",
    }),

    // ── Vector Overlays ─────────────────────────────────────────
    vectorOverlay({
      id: "thermalHotspots",
      label: "Thermal Hotspots",
      shortLabel: "FIRE",
      description: "Thermal anomalies and active fire detections from NASA FIRMS.",
      source: "NASA FIRMS",
      family: "thermal",
      role: "analytic",
      defaultOpacity: 0.88,
      enabledByDefault: false,
    }),
  ];

  return {
    updatedAt: new Date().toISOString(),
    defaultBasemap: "detailed-streets",
    defaultImageryOverlayId: "viirsTrueColor",
    overlays,
  };
}

/** Retrieve a single overlay by ID. */
export function getOverlayById(
  overlayId: string,
  focusDate = getSafeDate(),
): MapOverlay | undefined {
  return buildMapOverlayCatalog(focusDate).overlays.find(
    (overlay) => overlay.id === overlayId,
  );
}

/** Type guard: does this overlay have a renderable raster tile template? */
export function isRasterOverlay(overlay: MapOverlay): overlay is MapOverlay & {
  kind: Extract<MapOverlayKind, "raster">;
  tileTemplate: string;
  maxZoom: number;
} {
  return overlay.kind === "raster" && Boolean(overlay.tileTemplate);
}
