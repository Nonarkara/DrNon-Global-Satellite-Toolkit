/** Sample civic points used by Thai disaster modules (not a complete gazetteer). */
export const THAI_CIVIC_POINTS = [
  { id: "bangkok", label: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { id: "chiang-mai", label: "Chiang Mai", lat: 18.7883, lon: 98.9853 },
  { id: "khon-kaen", label: "Khon Kaen", lat: 16.4419, lon: 102.836 },
  { id: "hat-yai", label: "Hat Yai", lat: 7.0086, lon: 100.4767 },
  { id: "phuket", label: "Phuket", lat: 7.8804, lon: 98.3923 },
] as const;

/** Approximate national bbox used for catalog searches (minLon, minLat, maxLon, maxLat). */
export const THAILAND_BBOX = [97.3, 5.6, 105.7, 20.5] as const;

export const GISTDA_ATTRIBUTION =
  "Geo-Informatics and Space Technology Development Agency (GISTDA)";
