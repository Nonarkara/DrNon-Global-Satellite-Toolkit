// ─── Satellite Image Freshness Selector ────────────────────────────────────
// Shared utility for all earth-observation modules.
// Always picks the most recent usable satellite image with fallback.

export interface SatelliteImageMeta {
  id: string;
  datetime: string;
  cloudCover?: number;
  sensor: string;
  resolution?: number;
  thumbnailUrl?: string;
  downloadUrl?: string;
  tileUrl?: string;
  area?: string;
}

export interface FreshnessPolicy {
  maxAgeDays: number;
  maxCloudCover?: number;
}

const DEFAULT_POLICY: FreshnessPolicy = {
  maxAgeDays: 7,
  maxCloudCover: 20,
};

/**
 * Select the best satellite image from a list of metadata entries.
 *
 * Strategy:
 * 1. Fresh (within maxAgeDays) + low cloud cover → pick newest
 * 2. Fresh but any cloud cover → pick newest
 * 3. Newest overall (stale fallback)
 */
export function selectBestImage(
  images: SatelliteImageMeta[],
  policy: FreshnessPolicy = DEFAULT_POLICY,
): SatelliteImageMeta | null {
  if (images.length === 0) return null;

  const now = Date.now();
  const cutoff = now - policy.maxAgeDays * 86_400_000;

  const byNewest = (a: SatelliteImageMeta, b: SatelliteImageMeta) =>
    new Date(b.datetime).getTime() - new Date(a.datetime).getTime();

  // 1. Fresh + low cloud
  if (policy.maxCloudCover != null) {
    const freshClean = images
      .filter(
        (img) =>
          new Date(img.datetime).getTime() >= cutoff &&
          (img.cloudCover ?? 0) <= policy.maxCloudCover!,
      )
      .sort(byNewest);
    if (freshClean.length > 0) return freshClean[0];
  }

  // 2. Fresh, any cloud
  const freshAny = images
    .filter((img) => new Date(img.datetime).getTime() >= cutoff)
    .sort(byNewest);
  if (freshAny.length > 0) return freshAny[0];

  // 3. Stale fallback — newest overall
  return [...images].sort(byNewest)[0];
}

/**
 * Classify how fresh a selected image is relative to the policy.
 */
export function classifyFreshness(
  image: SatelliteImageMeta,
  policy: FreshnessPolicy = DEFAULT_POLICY,
): "fresh" | "acceptable" | "stale" {
  const ageMs = Date.now() - new Date(image.datetime).getTime();
  const ageDays = ageMs / 86_400_000;

  if (ageDays <= policy.maxAgeDays) {
    if (
      policy.maxCloudCover != null &&
      (image.cloudCover ?? 0) <= policy.maxCloudCover
    ) {
      return "fresh";
    }
    return "acceptable";
  }
  return "stale";
}
