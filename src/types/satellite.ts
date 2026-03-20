/**
 * Satellite Imagery Type Definitions
 *
 * Core type system for satellite overlay catalogs, tile rendering,
 * and imagery source management.
 */

export type Coordinates = [number, number];

/** Discriminates raster (satellite tile) overlays from vector (GeoJSON) overlays. */
export type MapOverlayKind = "raster" | "vector";

/** Imagery family grouping for operator controls. */
export type MapOverlayFamily =
  | "imagery"
  | "vegetation"
  | "terrain"
  | "weather"
  | "air"
  | "lights"
  | "thermal"
  | "operational";

/** Role determines how the overlay appears in the control panel. */
export type MapOverlayRole = "base-option" | "analytic" | "operational";

/**
 * A single map overlay descriptor — raster (satellite tiles) or vector.
 * Raster overlays include a WMTS tile template and max zoom level.
 */
export interface MapOverlay {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  source: string;
  kind: MapOverlayKind;
  family: MapOverlayFamily;
  role: MapOverlayRole;
  defaultOpacity: number;
  updatedAt: string;
  enabledByDefault: boolean;
  maxZoom?: number;
  tileTemplate?: string;
  timeMode?: "dated" | "default";
}

/** Full overlay catalog response. */
export interface MapOverlayCatalogResponse {
  updatedAt: string;
  defaultBasemap: "detailed-streets";
  defaultImageryOverlayId: string;
  overlays: MapOverlay[];
}

/** A single imagery source entry in the Copernicus preview. */
export interface CopernicusPreviewLayer {
  id: string;
  label: string;
  description: string;
}

/** Response from the imagery preview endpoint. */
export interface CopernicusPreviewResponse {
  updatedAt: string;
  focusDate: string;
  imagerySources: CopernicusPreviewLayer[];
}

/** NASA FIRMS fire/thermal detection event. */
export interface FireEvent {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string;
  acq_date: string;
}

/** External satellite provider descriptor. */
export interface SatelliteProviderDescriptor {
  id: string;
  label: string;
  category: string;
  description: string;
  surfaces: string[];
  endpoints: string[];
  optional?: boolean;
}
