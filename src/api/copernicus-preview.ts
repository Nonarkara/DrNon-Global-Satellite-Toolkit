/**
 * Copernicus / Satellite Imagery Preview API
 *
 * Returns the available base imagery options and a focus date
 * for satellite preview clients. In a Next.js app this would
 * be a route handler; here it's exported as a standalone function
 * so it can be integrated into any Node.js server framework.
 */

import { buildMapOverlayCatalog } from "../overlays/map-overlays";
import { fallbackCopernicusPreview } from "../data/fallbacks";
import type { CopernicusPreviewResponse } from "../types/satellite";

function getSafeDate() {
  // NASA GIBS only serves imagery up to the current real-world date.
  // Use a known-good historical date to prevent blank tiles.
  return "2024-03-01";
}

/**
 * Generate the imagery preview response.
 * Filters the overlay catalog to base-option imagery and
 * returns their id, label, and description.
 */
export function generateCopernicusPreview(): CopernicusPreviewResponse {
  try {
    const focusDate = getSafeDate();
    const catalog = buildMapOverlayCatalog(focusDate);
    const imagerySources = catalog.overlays
      .filter((overlay) => overlay.role === "base-option")
      .map((overlay) => ({
        id: overlay.id,
        label: overlay.label,
        description: overlay.description,
      }));

    return {
      updatedAt: catalog.updatedAt,
      focusDate,
      imagerySources,
    };
  } catch {
    return fallbackCopernicusPreview;
  }
}
