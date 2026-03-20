/**
 * Satellite & Imagery Provider Catalog
 *
 * Registry of all satellite data providers — both active and optional.
 * Each entry describes what the provider surfaces, its endpoints,
 * and whether it requires credentials.
 */

import type { SatelliteProviderDescriptor } from "../types/satellite";

/** Providers that are live and require no authentication. */
export const activeProviders: SatelliteProviderDescriptor[] = [
  {
    id: "nasa-gibs",
    label: "NASA GIBS WMTS",
    category: "Imagery",
    description:
      "Primary satellite imagery source. Serves VIIRS, MODIS, IMERG, Blue Marble, Night Lights, and Aerosol Optical Depth via WMTS tiles.",
    surfaces: [
      "Base imagery",
      "Precipitation",
      "Night lights",
      "Vegetation index",
      "Aerosol optical depth",
    ],
    endpoints: [
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{date}/GoogleMapsCompatible_Level{z}/{z}/{y}/{x}.{format}",
    ],
  },
  {
    id: "eox-sentinel2",
    label: "EOX Sentinel-2 Cloudless",
    category: "Imagery",
    description:
      "10m cloud-free annual mosaic from Sentinel-2 via EOX. Highest resolution free imagery available.",
    surfaces: ["High-resolution base imagery"],
    endpoints: [
      "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/g/{z}/{y}/{x}.jpg",
    ],
  },
  {
    id: "esri-world-imagery",
    label: "ESRI World Imagery",
    category: "Imagery",
    description: "Token-free aerial imagery fallback for the map base layer.",
    surfaces: ["Aerial basemap"],
    endpoints: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
  },
  {
    id: "nasa-firms",
    label: "NASA FIRMS",
    category: "Thermal",
    description:
      "Fire Information for Resource Management System. Provides VIIRS and MODIS thermal hotspot detections.",
    surfaces: ["Thermal hotspots", "Fire detection"],
    endpoints: [
      "https://firms.modaps.eosdis.nasa.gov/api/country/csv/{key}/VIIRS_SNPP/{country}/{days}",
    ],
  },
  {
    id: "jrc-surface-water",
    label: "JRC Global Surface Water",
    category: "Terrain",
    description:
      "30m global surface water occurrence from the Joint Research Centre / Google Earth Engine.",
    surfaces: ["Flood monitoring", "Water occurrence"],
    endpoints: [
      "https://storage.googleapis.com/global-surface-water/tiles2021/occurrence/{z}/{x}/{y}.png",
    ],
  },
  {
    id: "emodnet-bathymetry",
    label: "EMODnet Bathymetry",
    category: "Terrain",
    description: "Ocean depth and land elevation tiles for maritime context.",
    surfaces: ["Bathymetry", "Maritime planning"],
    endpoints: [
      "https://tiles.emodnet-bathymetry.eu/v12/mean_atlas_land_latest/web_mercator/{z}/{x}/{y}.png",
    ],
  },
];

/** Providers that need API keys or future integration. */
export const optionalProviders: SatelliteProviderDescriptor[] = [
  {
    id: "sentinel-hub",
    label: "Sentinel Hub",
    category: "Processing",
    description:
      "Copernicus processing layer for on-demand Sentinel imagery, statistics, and time-series analysis.",
    surfaces: ["Change detection", "Custom band composites", "Statistical API"],
    endpoints: ["https://services.sentinel-hub.com/api/v1/process"],
    optional: true,
  },
  {
    id: "google-earth-engine",
    label: "Google Earth Engine",
    category: "Analytics",
    description:
      "Planetary analysis platform for scripted Sentinel and Landsat change detection.",
    surfaces: ["Time-series analysis", "NDVI computation", "SAR processing"],
    endpoints: ["https://earthengine.googleapis.com/"],
    optional: true,
  },
];

/** All providers combined. */
export const allProviders: SatelliteProviderDescriptor[] = [
  ...activeProviders,
  ...optionalProviders,
];
