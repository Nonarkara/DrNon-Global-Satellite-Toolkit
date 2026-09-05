// examples/disaster-watch/registry.ts
// Drop-in replacement for src/modules/registry.ts — disaster-response module set.

import type { ModuleDefinition } from "@/types/modules";

// Earth observation (primary signals)
import { nasaFirms } from "./earth-observation/nasa-firms";
import { nasaGibs } from "./earth-observation/nasa-gibs";

// Conflict / events
import { reliefweb } from "./conflict-events/reliefweb";
import { acled } from "./conflict-events/acled";
import { gdeltEvents } from "./conflict-events/gdelt-events";

// Environmental
import { openMeteoAqi } from "./environmental/open-meteo-aqi";
import { openaq } from "./environmental/openaq";
import { tmdWeather } from "./environmental/tmd-weather";
import { meteoblue } from "./environmental/meteoblue";

// News
import { googleTrends } from "./news-info/google-trends";
import { gdeltNews } from "./conflict-events/gdelt-news";

// Events (logistics)
import { predictHq } from "./news-info/predicthq";

export const ALL_MODULES: ModuleDefinition<unknown>[] = [
  // EO — primary signals
  nasaFirms,
  nasaGibs,

  // Conflict / events
  reliefweb,
  acled,
  gdeltEvents,

  // Environmental (smoke, haze, weather)
  openMeteoAqi,
  openaq,
  tmdWeather,
  meteoblue,

  // Logistics & attention
  predictHq,
  googleTrends,
  gdeltNews,
];
