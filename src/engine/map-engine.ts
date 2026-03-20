/**
 * Satellite Map Engine — Deck.gl Layer Factories
 *
 * Creates renderable Deck.gl layers from satellite tile endpoints.
 * Supports NASA GIBS (1,000+ layers via WMTS), Sentinel-2, ESRI,
 * and any XYZ/WMTS raster tile source.
 *
 * Layer pipeline:
 *   1. createGIBSLayer()           — NASA GIBS shorthand
 *   2. createRasterTileLayer()     — Generic raster tile renderer
 *   3. createRasterOverlayLayer()  — Wraps a MapOverlay into a layer
 *   4. Named helpers               — MODIS, VIIRS, Blue Marble, etc.
 */

import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { MapOverlay, FireEvent } from "../types/satellite";

// ── Tile Bounds Extraction ──────────────────────────────────────

interface TileBounds {
  bbox: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

interface TileDataRequest {
  url?: string | null;
}

function extractTileBounds(tile: unknown): TileBounds["bbox"] | null {
  if (typeof tile !== "object" || tile === null || !("bbox" in tile)) {
    return null;
  }

  const bbox = tile.bbox;
  if (typeof bbox !== "object" || bbox === null) {
    return null;
  }

  const box = bbox as Record<string, unknown>;

  if (
    "west" in box &&
    "south" in box &&
    "east" in box &&
    "north" in box &&
    [box.west, box.south, box.east, box.north].every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  ) {
    return {
      west: box.west as number,
      south: box.south as number,
      east: box.east as number,
      north: box.north as number,
    };
  }

  if (
    "left" in box &&
    "bottom" in box &&
    "right" in box &&
    "top" in box &&
    [box.left, box.bottom, box.right, box.top].every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  ) {
    return {
      west: box.left as number,
      south: box.bottom as number,
      east: box.right as number,
      north: box.top as number,
    };
  }

  return null;
}

// ── Core Raster Tile Layer ──────────────────────────────────────

/**
 * Generic raster tile layer.
 * Fetches tiles as ImageBitmaps and renders them with BitmapLayer.
 */
export function createRasterTileLayer({
  id,
  data,
  maxZoom,
  opacity = 1,
  onTileError,
}: {
  id: string;
  data: string;
  maxZoom: number;
  opacity?: number;
  onTileError?: (error: unknown) => void;
}) {
  return new TileLayer({
    id,
    data,
    minZoom: 0,
    maxZoom,
    tileSize: 256,
    opacity,
    onTileError,
    getTileData: async (tile: TileDataRequest) => {
      if (!tile.url) return null;
      try {
        const response = await fetch(tile.url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        return await createImageBitmap(blob);
      } catch (e) {
        if (onTileError) onTileError(e);
        return null;
      }
    },
    renderSubLayers: (props) => {
      const { data: image, tile, ...layerProps } = props;
      const bounds = extractTileBounds(tile);

      if (!image || !bounds) {
        return null;
      }

      const { west, south, east, north } = bounds;
      const layerId = typeof layerProps.id === "string" ? layerProps.id : id;

      return new BitmapLayer({
        ...layerProps,
        id: `${layerId}-bitmap`,
        data: undefined,
        image,
        opacity,
        bounds: [west, south, east, north],
      });
    },
  });
}

// ── NASA GIBS Factory ───────────────────────────────────────────

/**
 * NASA GIBS Layer Factory.
 * Supports 1,000+ layers via WMTS tile endpoints.
 *
 * @example
 *   createGIBSLayer({
 *     id: "viirs-true-color",
 *     layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
 *     date: "2024-03-01",
 *   })
 */
export const createGIBSLayer = ({
  id,
  layer,
  date,
  opacity = 1,
  maxZoom = 9,
  format = "jpg",
}: {
  id: string;
  layer: string;
  date: string;
  opacity?: number;
  maxZoom?: number;
  format?: "jpg" | "png";
}) => {
  const level = maxZoom >= 9 ? "Level9" : `Level${maxZoom}`;
  return createRasterTileLayer({
    id,
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${date}/GoogleMapsCompatible_${level}/{z}/{y}/{x}.${format}`,
    maxZoom,
    opacity,
  });
};

// ── Overlay Wrapper ─────────────────────────────────────────────

/**
 * Convert a MapOverlay descriptor into a renderable Deck.gl layer.
 * Returns null for overlays without a valid tile template.
 */
export function createRasterOverlayLayer(
  overlay: MapOverlay,
  opacity = overlay.defaultOpacity,
) {
  if (!overlay.tileTemplate || typeof overlay.maxZoom !== "number") {
    return null;
  }

  return createRasterTileLayer({
    id: overlay.id,
    data: overlay.tileTemplate,
    maxZoom: overlay.maxZoom,
    opacity,
    onTileError: (error: unknown) => {
      console.warn(`${overlay.label} tile load failed`, error);
    },
  });
}

// ── Named Satellite Layer Helpers ───────────────────────────────

/** MODIS Terra true-color corrected reflectance. */
export const createModisTerraLayer = (date: string, opacity = 0.72) =>
  createRasterTileLayer({
    id: "modis-terra-true-color",
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    maxZoom: 9,
    opacity,
    onTileError: (error: unknown) => {
      console.warn("MODIS Terra tile load failed", error);
    },
  });

/** MODIS Aqua true-color corrected reflectance. */
export const createModisAquaLayer = (date: string, opacity = 0.72) =>
  createRasterTileLayer({
    id: "modis-aqua-true-color",
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    maxZoom: 9,
    opacity,
    onTileError: (error: unknown) => {
      console.warn("MODIS Aqua tile load failed", error);
    },
  });

/** MODIS Terra false-color (Bands 7-2-1) for vegetation and burn scars. */
export const createModisFalseColorLayer = (date: string, opacity = 0.72) =>
  createRasterTileLayer({
    id: "modis-terra-false-color",
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands721/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    maxZoom: 9,
    opacity,
    onTileError: (error: unknown) => {
      console.warn("MODIS false color tile load failed", error);
    },
  });

/** VIIRS SNPP true-color corrected reflectance. */
export const createViirsTrueColorLayer = (date: string, opacity = 0.72) =>
  createRasterTileLayer({
    id: "viirs-true-color",
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    maxZoom: 9,
    opacity,
    onTileError: (error: unknown) => {
      console.warn("VIIRS true color tile load failed", error);
    },
  });

/** Blue Marble shaded relief. */
export const createBlueMarbleLayer = (date: string, opacity = 0.72) =>
  createRasterTileLayer({
    id: "blue-marble-relief",
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`,
    maxZoom: 8,
    opacity,
    onTileError: (error: unknown) => {
      console.warn("Blue Marble tile load failed", error);
    },
  });

/** VIIRS night lights (day-night band). */
export const createNightlightLayer = () =>
  createRasterTileLayer({
    id: "viirs-nightlights",
    data: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_AtSensor_M15/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
    maxZoom: 8,
  });

/** IMERG precipitation rate. */
export const createPrecipitationLayer = (date: string) =>
  createRasterTileLayer({
    id: "imerg-precipitation",
    data: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
    maxZoom: 6,
    opacity: 0.6,
  });

/** Copernicus / MODIS Terra alias for preview clients. */
export const createCopernicusLayer = (date: string, opacity = 0.72) =>
  createModisTerraLayer(date, opacity);

/** Detailed satellite view via MODIS Aqua. */
export const createDetailedSatelliteLayer = (date: string, opacity = 0.72) =>
  createModisAquaLayer(date, opacity);

// ── NASA FIRMS Fire Layer ───────────────────────────────────────

/** Render NASA FIRMS thermal hotspot detections as scatter points. */
export const createFireLayer = (data: FireEvent[]) =>
  new ScatterplotLayer({
    id: "nasa-firms-fires",
    data: data || [],
    getPosition: (d: FireEvent) => [d?.longitude || 0, d?.latitude || 0],
    getFillColor: [255, 165, 0, 180],
    getRadius: (d: FireEvent) => Math.sqrt(d?.brightness || 1) * 300,
    pickable: true,
  });
