/**
 * Thailand-priority basemap chain + EO shortlist.
 *
 * A dashboard scoped to one Thai city/province benefits more from
 * Thai-language street names as its default free tile source than from
 * global aerial imagery — so this reorders the global fallback chain in
 * basemap-catalog.ts to put Longdo Map ahead of ESRI World Imagery, and
 * narrows the ~30-source global-satellite-apis.ts registry down to the
 * handful with real Thailand coverage and no-auth/free-key access.
 *
 * Built for the Thailand Godmode toolkit (Nonarkara/dr-non-vibecoding-skills,
 * thailand-godmode/) — kept here rather than duplicated there, since this
 * repo is the source of truth for map/satellite provider data.
 */

import { basemapCatalog, type BasemapDescriptor } from "./basemap-catalog";

/** basemapCatalog reordered: Mapbox (if token) -> Longdo Map (if key) -> OSM -> ESRI -> CartoDB -> Stadia -> gradient. */
export const thailandPriorityBasemaps: BasemapDescriptor[] = basemapCatalog.map((bm) => {
  if (bm.id === "longdo-map") return { ...bm, priority: 2 };
  if (bm.id === "osm-standard") return { ...bm, priority: 3 };
  if (bm.id === "esri-world-imagery" || bm.id === "esri-world-topo") return { ...bm, priority: 4 };
  if (bm.id === "carto-positron" || bm.id === "carto-dark-matter") return { ...bm, priority: 5 };
  return bm;
});

export function getThailandBasemapFallbackChain(availableTokens: Record<string, boolean> = {}): BasemapDescriptor[] {
  return thailandPriorityBasemaps
    .filter((bm) => !bm.requiresToken || (bm.tokenEnvVar ? availableTokens[bm.tokenEnvVar] === true : false))
    .sort((a, b) => a.priority - b.priority);
}

export function getBestThailandBasemap(availableTokens: Record<string, boolean> = {}): BasemapDescriptor {
  const chain = getThailandBasemapFallbackChain(availableTokens);
  return chain[0] ?? thailandPriorityBasemaps[thailandPriorityBasemaps.length - 1];
}

/**
 * The satellite/EO registry ids (from ../registry/global-satellite-apis.ts)
 * with real Thailand coverage and no-auth or free-key access. Start here
 * for a new Thai city rather than wiring the full global catalog in —
 * a province dashboard has no use for Roscosmos or DEA Australia.
 */
export const thailandRelevantEarthObservationIds = [
  "nasa-gibs", // free basemap-quality daily imagery, no auth
  "nasa-cmr-stac", // discovery across all NASA holdings
  "copernicus-cdse-stac", // Sentinel-1/2 catalog search, no auth
  "gistda-gateway", // Thailand flood/fire/drought disaster products
  "gistda-gflood", // Thailand disaster map tiles
  "nasa-power", // modelled meteorological fields, no auth
] as const;
