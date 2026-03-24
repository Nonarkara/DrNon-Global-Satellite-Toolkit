/**
 * DrNon Global Satellite Toolkit
 * @author Dr Non Arkaraprasertkul (https://github.com/Nonarkara)
 *         PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors
 *         Senior Expert in Smart City Promotion, depa Thailand
 * @license MIT
 *
 * Original compilation, system design, architecture & product by Dr Non Arkaraprasertkul.
 * Built as a hobby project with serious potential — layered satellite data
 * can surface insights about environment, infrastructure, conflict, economics,
 * and human movement, all from open data most people don't know is free.
 *
 * Comprehensive satellite imagery overlay engine with:
 *   - 20+ satellite APIs from global space agencies
 *   - 10+ free base map options with automatic fallback
 *   - 10 raster satellite overlays (VIIRS, MODIS, Sentinel-2, etc.)
 *   - Distance grids (500m–10km) with nautical mile support
 *   - NASA FIRMS fire detection ingestion
 *   - Multi-backend storage (Supabase, Firebase, PostgreSQL, Google Sheets)
 *
 * @module drnon-global-satellite-toolkit
 */

// ── Types ───────────────────────────────────────────────────────
export type {
  MapOverlay,
  MapOverlayKind,
  MapOverlayFamily,
  MapOverlayRole,
  MapOverlayCatalogResponse,
  CopernicusPreviewLayer,
  CopernicusPreviewResponse,
  FireEvent,
  SatelliteProviderDescriptor,
} from "./types/satellite";

// ── Satellite Overlay Catalog ───────────────────────────────────
export {
  buildMapOverlayCatalog,
  getOverlayById,
  isRasterOverlay,
} from "./overlays/map-overlays";

// ── Deck.gl Map Engine ──────────────────────────────────────────
export {
  createRasterTileLayer,
  createGIBSLayer,
  createRasterOverlayLayer,
  createModisTerraLayer,
  createModisAquaLayer,
  createModisFalseColorLayer,
  createViirsTrueColorLayer,
  createBlueMarbleLayer,
  createNightlightLayer,
  createPrecipitationLayer,
  createCopernicusLayer,
  createDetailedSatelliteLayer,
  createFireLayer,
} from "./engine/map-engine";

// ── Base Map Catalog ────────────────────────────────────────────
export {
  basemapCatalog,
  freeBasemaps,
  getBasemapFallbackChain,
  getBestBasemap,
} from "./basemaps/basemap-catalog";

// ── Distance Grid ───────────────────────────────────────────────
export {
  GRID_PRESETS,
  createDistanceGridLayer,
  autoSelectGridPreset,
  kmToNauticalMiles,
  nauticalMilesToKm,
} from "./grid/distance-grid";

// ── Global Satellite API Registry ───────────────────────────────
export {
  popularApis,
  proApis,
  nicheApis,
  allApis,
  portalOnlyAgencies,
  imageryFallbackApis,
  noAuthApis,
  stacApis,
  trackingApis,
  registryStats,
} from "./registry/global-satellite-apis";

// ── Satellite Provider Catalog ──────────────────────────────────
export {
  activeProviders,
  optionalProviders,
  allProviders,
} from "./providers/satellite-providers";

// ── Storage Architecture ────────────────────────────────────────
export {
  POSTGRESQL_SCHEMA,
  FIRESTORE_COLLECTIONS,
  GOOGLE_SHEETS_LAYOUT,
  resolveStorageBackend,
} from "./storage/database-architecture";

// ── API / Preview ───────────────────────────────────────────────
export { generateCopernicusPreview } from "./api/copernicus-preview";

// ── Fallback Data ───────────────────────────────────────────────
export {
  fallbackCopernicusPreview,
  fallbackFires,
} from "./data/fallbacks";

// ── Module System (Global Satellite Toolkit) ────────────────────
// Pluggable data-source modules with self-contained fetch logic,
// mock data, and UI rendering hints. Add/remove modules by editing
// the registry — one file per data source.
export type {
  ModuleCategory,
  ModuleUiType,
  ModuleDefinition,
  ModuleMetadata,
  ModuleApiResponse,
  ModuleCatalogResponse,
  ModuleDataState,
} from "./types/modules";
export { MODULE_CATEGORY_LABELS } from "./types/modules";

export {
  getModuleById,
  getModulesByCategory,
  getAllModules,
  getModuleIds,
  getModuleCatalog,
  toMetadata,
} from "./modules/registry";

// ── Satellite Image Freshness Selector ──────────────────────────
export type { SatelliteImageMeta, FreshnessPolicy } from "./modules/satellite-freshness";
export { selectBestImage, classifyFreshness } from "./modules/satellite-freshness";
