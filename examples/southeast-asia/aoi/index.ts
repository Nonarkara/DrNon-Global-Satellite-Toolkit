// examples/southeast-asia/aoi/index.ts
// Aggregator — exports all AOIs + a typed picker.

import { THAILAND } from "./thailand";
import { VIETNAM } from "./vietnam";
import { CAMBODIA } from "./cambodia";
import { LAOS } from "./laos";
import { MYANMAR } from "./myanmar";
import { MALAYSIA } from "./malaysia";
import { INDONESIA } from "./indonesia";
import { PHILIPPINES } from "./philippines";
import { SINGAPORE } from "./singapore";
import { BRUNEI } from "./brunei";
import { TIMOR_LESTE } from "./timor-leste";
import { MEKONG } from "./mekong";
import { HAZE_CORRIDOR } from "./haze-corridor";
import { TYPHOON_BELT } from "./typhoon-belt";
import { PACIFIC } from "./pacific";

export interface AreaOfInterest {
  name: string;
  center: [number, number];   // [lon, lat]
  radiusKm: number;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

export const AOIS = {
  thailand: THAILAND,
  vietnam: VIETNAM,
  cambodia: CAMBODIA,
  laos: LAOS,
  myanmar: MYANMAR,
  malaysia: MALAYSIA,
  indonesia: INDONESIA,
  philippines: PHILIPPINES,
  singapore: SINGAPORE,
  brunei: BRUNEI,
  "timor-leste": TIMOR_LESTE,
  mekong: MEKONG,
  "haze-corridor": HAZE_CORRIDOR,
  "typhoon-belt": TYPHOON_BELT,
  pacific: PACIFIC,
} as const;

export type AOIKey = keyof typeof AOIS;

export const AOI_KEYS = Object.keys(AOIS) as AOIKey[];

export { THAILAND, VIETNAM, CAMBODIA, LAOS, MYANMAR, MALAYSIA, INDONESIA, PHILIPPINES, SINGAPORE, BRUNEI, TIMOR_LESTE, MEKONG, HAZE_CORRIDOR, TYPHOON_BELT, PACIFIC };
