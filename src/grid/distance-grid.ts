/**
 * Distance Grid Overlay System
 *
 * Renders kilometer and nautical mile grid overlays on top of maps.
 * Grids provide spatial reference for operators to estimate distances
 * without needing a ruler tool.
 *
 * AVAILABLE GRIDS:
 *   - 500 meters  (fine grid — visible at high zoom)
 *   - 1 kilometer (standard operating grid)
 *   - 5 kilometers (medium area reference)
 *   - 10 kilometers (wide area reference)
 *
 * NAUTICAL MILE CONVERSION:
 *   1 nautical mile = 1.852 km
 *   Grid labels show both km and nm where appropriate.
 *
 * RENDERING:
 *   - Major grid lines (every 5th line) are drawn thicker/brighter
 *   - Minor grid lines are subtle to avoid visual clutter
 *   - Grid automatically adjusts longitude spacing by latitude
 *     (accounts for Mercator distortion)
 *   - Excessive grid lines are suppressed to prevent performance issues
 *
 * USAGE:
 *   import { createDistanceGridLayer, GRID_PRESETS } from "./distance-grid";
 *
 *   // 1km grid
 *   const gridLayer = createDistanceGridLayer(viewportBounds, GRID_PRESETS.ONE_KM);
 *
 *   // 500m grid with nautical mile labels
 *   const fineGrid = createDistanceGridLayer(viewportBounds, GRID_PRESETS.HALF_KM);
 */

import { GeoJsonLayer } from "@deck.gl/layers";

// ── Constants ───────────────────────────────────────────────────

const KM_PER_DEGREE_LATITUDE = 110.574;
const KM_PER_NAUTICAL_MILE = 1.852;
const MAX_GRID_LINES_PER_AXIS = 200;

// ── Types ───────────────────────────────────────────────────────

export interface GridBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface GridPreset {
  /** Grid identifier */
  id: string;
  /** Display label */
  label: string;
  /** Cell size in kilometers */
  cellSizeKm: number;
  /** Equivalent in nautical miles */
  cellSizeNm: number;
  /** How many cells between major (thicker) lines */
  majorInterval: number;
  /** Line color for minor grid lines [R, G, B, A] */
  minorColor: [number, number, number, number];
  /** Line color for major grid lines [R, G, B, A] */
  majorColor: [number, number, number, number];
  /** Line width for minor lines (pixels) */
  minorWidth: number;
  /** Line width for major lines (pixels) */
  majorWidth: number;
}

interface GridFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    axis: "vertical" | "horizontal";
    major: boolean;
    distanceKm: number;
    distanceNm: number;
  };
}

interface GridFeatureCollection {
  type: "FeatureCollection";
  features: GridFeature[];
}

// ── Grid Presets ────────────────────────────────────────────────

export const GRID_PRESETS: Record<string, GridPreset> = {
  /** 500 meter grid — fine detail for high-zoom views */
  HALF_KM: {
    id: "grid-500m",
    label: "500m Grid",
    cellSizeKm: 0.5,
    cellSizeNm: 0.5 / KM_PER_NAUTICAL_MILE,
    majorInterval: 2, // major line every 1 km
    minorColor: [148, 163, 184, 40],
    majorColor: [226, 232, 240, 70],
    minorWidth: 0.8,
    majorWidth: 1.2,
  },

  /** 1 kilometer grid — standard operating reference */
  ONE_KM: {
    id: "grid-1km",
    label: "1km Grid",
    cellSizeKm: 1,
    cellSizeNm: 1 / KM_PER_NAUTICAL_MILE,
    majorInterval: 5, // major line every 5 km
    minorColor: [148, 163, 184, 58],
    majorColor: [226, 232, 240, 96],
    minorWidth: 1,
    majorWidth: 1.4,
  },

  /** 5 kilometer grid — medium area reference */
  FIVE_KM: {
    id: "grid-5km",
    label: "5km Grid",
    cellSizeKm: 5,
    cellSizeNm: 5 / KM_PER_NAUTICAL_MILE,
    majorInterval: 2, // major line every 10 km
    minorColor: [148, 163, 184, 50],
    majorColor: [226, 232, 240, 90],
    minorWidth: 1,
    majorWidth: 1.6,
  },

  /** 10 kilometer grid — wide area reference */
  TEN_KM: {
    id: "grid-10km",
    label: "10km Grid",
    cellSizeKm: 10,
    cellSizeNm: 10 / KM_PER_NAUTICAL_MILE,
    majorInterval: 5, // major line every 50 km
    minorColor: [148, 163, 184, 45],
    majorColor: [226, 232, 240, 85],
    minorWidth: 1,
    majorWidth: 1.8,
  },
};

// ── Grid Construction ───────────────────────────────────────────

/**
 * Get the number of kilometers per degree of longitude at a given latitude.
 * This corrects for Mercator distortion.
 */
function getKmPerDegreeLongitude(latitude: number): number {
  return Math.max(111.320 * Math.cos((latitude * Math.PI) / 180), 0.01);
}

/**
 * Convert kilometers to nautical miles.
 */
export function kmToNauticalMiles(km: number): number {
  return km / KM_PER_NAUTICAL_MILE;
}

/**
 * Convert nautical miles to kilometers.
 */
export function nauticalMilesToKm(nm: number): number {
  return nm * KM_PER_NAUTICAL_MILE;
}

/**
 * Build a GeoJSON FeatureCollection of grid lines for the given bounds.
 * Returns null if the grid would produce too many lines (zoom out or use a larger cell size).
 */
function buildGridCollection(
  bounds: GridBounds,
  preset: GridPreset,
): GridFeatureCollection | null {
  const { cellSizeKm, majorInterval } = preset;
  const centerLatitude = (bounds.south + bounds.north) / 2;

  const latStep = cellSizeKm / KM_PER_DEGREE_LATITUDE;
  const lonStep = cellSizeKm / getKmPerDegreeLongitude(centerLatitude);

  if (!Number.isFinite(latStep) || !Number.isFinite(lonStep)) {
    return null;
  }

  const lonStartIndex = Math.floor(bounds.west / lonStep);
  const lonEndIndex = Math.ceil(bounds.east / lonStep);
  const latStartIndex = Math.floor(bounds.south / latStep);
  const latEndIndex = Math.ceil(bounds.north / latStep);

  const verticalCount = lonEndIndex - lonStartIndex + 1;
  const horizontalCount = latEndIndex - latStartIndex + 1;

  if (verticalCount > MAX_GRID_LINES_PER_AXIS || horizontalCount > MAX_GRID_LINES_PER_AXIS) {
    return null; // Too many lines — caller should use a larger cell size
  }

  const features: GridFeature[] = [];

  // Vertical lines (longitude)
  for (let i = lonStartIndex; i <= lonEndIndex; i++) {
    const longitude = i * lonStep;
    const distKm = Math.abs(i) * cellSizeKm;
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [longitude, bounds.south],
          [longitude, bounds.north],
        ],
      },
      properties: {
        axis: "vertical",
        major: i % majorInterval === 0,
        distanceKm: distKm,
        distanceNm: kmToNauticalMiles(distKm),
      },
    });
  }

  // Horizontal lines (latitude)
  for (let i = latStartIndex; i <= latEndIndex; i++) {
    const latitude = i * latStep;
    const distKm = Math.abs(i) * cellSizeKm;
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [bounds.west, latitude],
          [bounds.east, latitude],
        ],
      },
      properties: {
        axis: "horizontal",
        major: i % majorInterval === 0,
        distanceKm: distKm,
        distanceNm: kmToNauticalMiles(distKm),
      },
    });
  }

  return { type: "FeatureCollection", features };
}

// ── Deck.gl Layer Factory ───────────────────────────────────────

/**
 * Create a Deck.gl GeoJsonLayer for the distance grid.
 *
 * @param bounds   Current map viewport bounds
 * @param preset   Grid configuration (use GRID_PRESETS.ONE_KM, etc.)
 * @returns        Deck.gl layer or null if grid would be too dense
 *
 * @example
 *   const grid = createDistanceGridLayer(
 *     { west: 98.0, south: 7.5, east: 99.0, north: 8.5 },
 *     GRID_PRESETS.ONE_KM
 *   );
 */
export function createDistanceGridLayer(
  bounds: GridBounds,
  preset: GridPreset = GRID_PRESETS.ONE_KM,
) {
  const collection = buildGridCollection(bounds, preset);

  if (!collection || collection.features.length === 0) {
    return null;
  }

  return new GeoJsonLayer({
    id: preset.id,
    data: collection as never,
    pickable: false,
    stroked: true,
    filled: false,
    lineWidthUnits: "pixels",
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: 2,
    getLineColor: (feature) =>
      (feature as GridFeature).properties.major
        ? preset.majorColor
        : preset.minorColor,
    getLineWidth: (feature) =>
      (feature as GridFeature).properties.major
        ? preset.majorWidth
        : preset.minorWidth,
    parameters: {
      depthTest: false,
    },
  });
}

/**
 * Auto-select the best grid preset based on current zoom level.
 *
 * @param zoom  Current map zoom level
 * @returns     Appropriate grid preset
 */
export function autoSelectGridPreset(zoom: number): GridPreset {
  if (zoom >= 14) return GRID_PRESETS.HALF_KM;
  if (zoom >= 11) return GRID_PRESETS.ONE_KM;
  if (zoom >= 8) return GRID_PRESETS.FIVE_KM;
  return GRID_PRESETS.TEN_KM;
}
