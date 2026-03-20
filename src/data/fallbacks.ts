/**
 * Fallback / Mock Data for Satellite Features
 *
 * These fallbacks keep the UI rendering when live satellite
 * endpoints are unavailable or rate-limited.
 */

import type {
  CopernicusPreviewResponse,
  FireEvent,
} from "../types/satellite";

export const fallbackCopernicusPreview: CopernicusPreviewResponse = {
  updatedAt: new Date().toISOString(),
  focusDate: "2024-03-01",
  imagerySources: [
    {
      id: "viirsTrueColor",
      label: "VIIRS True Color",
      description: "Broad true-color composite for fast regional situational review.",
    },
    {
      id: "modisFalseColor",
      label: "MODIS False Color",
      description:
        "False-color land and burn-scar view with stronger terrain and vegetation contrast.",
    },
    {
      id: "blueMarble",
      label: "Blue Marble Relief",
      description:
        "Shaded relief base for terrain-first orientation across coastlines, hills, and island approaches.",
    },
  ],
};

export const fallbackFires: FireEvent[] = [
  {
    latitude: 9.97,
    longitude: 98.63,
    brightness: 304,
    confidence: "nominal",
    acq_date: "2024-03-01T17:00:00.000Z",
  },
];
