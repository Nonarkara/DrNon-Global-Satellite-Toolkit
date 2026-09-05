// examples/city-monitor/registry.ts
// Drop-in replacement for src/modules/registry.ts — city-monitor module set.

import type { ModuleDefinition } from "@/types/modules";

// Earth observation
import { nasaFirms } from "./earth-observation/nasa-firms";

// Environmental
import { openMeteoAqi } from "./environmental/open-meteo-aqi";
import { openaq } from "./environmental/openaq";
import { tmdWeather } from "./environmental/tmd-weather";
import { meteosourceThai } from "./environmental/meteosource-thai";

// Thailand
import { btsMrt } from "./thailand/bts-mrt";
import { srtTrains } from "./thailand/srt-trains";
import { longdoTraffic } from "./thailand/longdo-traffic";
import { highwayCameras } from "./thailand/highway-cameras";
import { gtfsBuses } from "./thailand/gtfs-buses";
import { pksbTransit } from "./thailand/pksb-transit";
import { thailandAdmin } from "./thailand/thailand-admin";

// News
import { googleTrends } from "./news-info/google-trends";
import { newsApi } from "./news-info/news-api";
import { gdeltNews } from "./conflict-events/gdelt-news";

export const ALL_MODULES: ModuleDefinition<unknown>[] = [
  // Earth observation
  nasaFirms,

  // Environmental
  openMeteoAqi,
  openaq,
  tmdWeather,
  meteosourceThai,

  // Thailand (city-relevant)
  btsMrt,
  srtTrains,
  longdoTraffic,
  highwayCameras,
  gtfsBuses,
  pksbTransit,
  thailandAdmin,

  // News
  googleTrends,
  newsApi,
  gdeltNews,
];
