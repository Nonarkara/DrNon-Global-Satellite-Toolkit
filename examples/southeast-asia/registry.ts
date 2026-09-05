// examples/southeast-asia/registry.ts
// Full module set — all 30 modules enabled for regional multi-AOI use.

import type { ModuleDefinition } from "@/types/modules";

// Earth observation
import { nasaFirms } from "./earth-observation/nasa-firms";
import { nasaGibs } from "./earth-observation/nasa-gibs";
import { sentinelHub } from "./earth-observation/sentinel-hub";
import { isroBhoonidhi } from "./earth-observation/isro-bhoonidhi";
import { jaxaTellus } from "./earth-observation/jaxa-tellus";
import { gk2aKorea } from "./earth-observation/gk2a-korea";

// Orbital & air traffic
import { openskyNetwork } from "./orbital-air-traffic/opensky-network";
import { celestrak } from "./orbital-air-traffic/celestrak";
import { spaceTrack } from "./orbital-air-traffic/space-track";
import { flightLabsThai } from "./orbital-air-traffic/flightlabs-thai";

// Conflict & events
import { acled } from "./conflict-events/acled";
import { gdeltEvents } from "./conflict-events/gdelt-events";
import { gdeltNews } from "./conflict-events/gdelt-news";
import { reliefweb } from "./conflict-events/reliefweb";
import { predictHq } from "./news-info/predicthq";

// Environmental
import { openMeteoAqi } from "./environmental/open-meteo-aqi";
import { openaq } from "./environmental/openaq";
import { aqicnThailand } from "./environmental/aqicn-thailand";
import { tmdWeather } from "./environmental/tmd-weather";
import { meteoblue } from "./environmental/meteoblue";
import { meteosourceThai } from "./environmental/meteosource-thai";

// News
import { googleTrends } from "./news-info/google-trends";
import { newsApi } from "./news-info/news-api";

// Thailand-specific (works as a regional fallback for SEA-Thailand)
import { pksbTransit } from "./thailand/pksb-transit";
import { srtTrains } from "./thailand/srt-trains";
import { btsMrt } from "./thailand/bts-mrt";
import { longdoTraffic } from "./thailand/longdo-traffic";
import { highwayCameras } from "./thailand/highway-cameras";
import { thailandOpenData } from "./thailand/thailand-open-data";
import { thailandAdmin } from "./thailand/thailand-admin";
import { gtfsBuses } from "./thailand/gtfs-buses";

export const ALL_MODULES: ModuleDefinition<unknown>[] = [
  // Earth observation
  nasaFirms,
  nasaGibs,
  sentinelHub,
  isroBhoonidhi,
  jaxaTellus,
  gk2aKorea,

  // Orbital & air traffic
  openskyNetwork,
  celestrak,
  spaceTrack,
  flightLabsThai,

  // Conflict & events
  acled,
  gdeltEvents,
  gdeltNews,
  reliefweb,
  predictHq,

  // Environmental
  openMeteoAqi,
  openaq,
  aqicnThailand,
  tmdWeather,
  meteoblue,
  meteosourceThai,

  // News
  googleTrends,
  newsApi,

  // Thailand-specific
  pksbTransit,
  srtTrains,
  btsMrt,
  longdoTraffic,
  highwayCameras,
  thailandOpenData,
  thailandAdmin,
  gtfsBuses,
];
