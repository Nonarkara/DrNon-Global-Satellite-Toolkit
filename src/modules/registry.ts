// ─── Global Satellite Toolkit — Module Registry ───────────────────────────
// Central index of all available modules.
// To add a module: import it and add to ALL_MODULES.

import type {
  ModuleCategory,
  ModuleDefinition,
  ModuleMetadata,
} from "../types/modules";

// ── Module imports ─────────────────────────────────────────────────────────

// Earth Observation
import { nasaFirms } from "./earth-observation/nasa-firms";
import { nasaGibs } from "./earth-observation/nasa-gibs";
import { sentinelHub } from "./earth-observation/sentinel-hub";
import { isroBhoonidhi } from "./earth-observation/isro-bhoonidhi";
import { jaxaTellus } from "./earth-observation/jaxa-tellus";
import { gk2aKorea } from "./earth-observation/gk2a-korea";

// Orbital & Air Traffic
import { openSkyNetwork } from "./orbital-air-traffic/opensky-network";
import { celestrak } from "./orbital-air-traffic/celestrak";
import { spaceTrack } from "./orbital-air-traffic/space-track";
import { flightlabsThai } from "./orbital-air-traffic/flightlabs-thai";

// Conflict & Events
import { acled } from "./conflict-events/acled";
import { gdeltEvents } from "./conflict-events/gdelt-events";
import { gdeltNews } from "./conflict-events/gdelt-news";
import { reliefweb } from "./conflict-events/reliefweb";
import { predicthq } from "./conflict-events/predicthq";

// Environmental
import { openMeteoAqi } from "./environmental/open-meteo-aqi";
import { openaq } from "./environmental/openaq";
import { aqicnThailand } from "./environmental/aqicn-thailand";
import { tmdWeather } from "./environmental/tmd-weather";
import { meteoblue } from "./environmental/meteoblue";
import { meteosourceThai } from "./environmental/meteosource-thai";

// News & Information
import { googleTrends } from "./news-info/google-trends";
import { newsApi } from "./news-info/news-api";

// Thailand
import { pksbTransit } from "./thailand/pksb";
import { srtTrains } from "./thailand/srt-trains";
import { btsMrt } from "./thailand/bts-mrt";
import { longdoTraffic } from "./thailand/longdo-traffic";
import { highwayCameras } from "./thailand/highway-cameras";
import { thailandOpenData } from "./thailand/thailand-open-data";
import { thailandAdmin } from "./thailand/thailand-admin";
import { gtfsBuses } from "./thailand/gtfs-buses";

const ALL_MODULES: ModuleDefinition[] = [
  // Earth Observation
  nasaFirms,
  nasaGibs,
  sentinelHub,
  isroBhoonidhi,
  jaxaTellus,
  gk2aKorea,
  // Orbital & Air Traffic
  openSkyNetwork,
  celestrak,
  spaceTrack,
  flightlabsThai,
  // Conflict & Events
  acled,
  gdeltEvents,
  gdeltNews,
  reliefweb,
  predicthq,
  // Environmental
  openMeteoAqi,
  openaq,
  aqicnThailand,
  tmdWeather,
  meteoblue,
  meteosourceThai,
  // News & Information
  googleTrends,
  newsApi,
  // Thailand
  pksbTransit,
  srtTrains,
  btsMrt,
  longdoTraffic,
  highwayCameras,
  thailandOpenData,
  thailandAdmin,
  gtfsBuses,
];

// ── Lookup functions ───────────────────────────────────────────────────────

export function getModuleById(id: string): ModuleDefinition | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}

export function getModulesByCategory(
  category: ModuleCategory,
): ModuleDefinition[] {
  return ALL_MODULES.filter((m) => m.category === category);
}

export function getAllModules(): ModuleDefinition[] {
  return ALL_MODULES;
}

export function getModuleIds(): string[] {
  return ALL_MODULES.map((m) => m.id);
}

/** Check if all required env vars for a module are present */
function isModuleConfigured(mod: ModuleDefinition): boolean {
  if (!mod.requiredEnvVars || mod.requiredEnvVars.length === 0) return true;
  return mod.requiredEnvVars.every((key) => !!process.env[key]);
}

/** Extract client-safe metadata (strips fetchData/mockData) */
export function toMetadata(mod: ModuleDefinition): ModuleMetadata {
  return {
    id: mod.id,
    label: mod.label,
    category: mod.category,
    description: mod.description,
    pollInterval: mod.pollInterval,
    uiType: mod.uiType,
    tableColumns: mod.tableColumns,
    chartConfig: mod.chartConfig,
    wrapsExisting: mod.wrapsExisting,
    requiredEnvVars: mod.requiredEnvVars,
    configured: isModuleConfigured(mod),
  };
}

/** Get client-safe catalog of all modules */
export function getModuleCatalog(): ModuleMetadata[] {
  return ALL_MODULES.map(toMetadata);
}
