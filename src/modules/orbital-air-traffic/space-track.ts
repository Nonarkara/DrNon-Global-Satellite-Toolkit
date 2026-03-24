import type { ModuleDefinition } from "../../types/modules";

interface SpaceTrackObject {
  noradCatId: string;
  objectName: string;
  objectType: string;
  country: string;
  launchDate: string;
  decayDate: string | null;
  period: number;
  inclination: number;
  apogee: number;
  perigee: number;
}

export const spaceTrack: ModuleDefinition<SpaceTrackObject[]> = {
  id: "space-track",
  label: "Space-Track NORAD Catalog",
  category: "orbital-air-traffic",
  description:
    "NORAD-style satellite catalog from Space-Track.org — orbital elements, satellite info, and debris tracking.",
  pollInterval: 3600,
  uiType: "table",
  requiredEnvVars: ["SPACE_TRACK_USER", "SPACE_TRACK_PASS"],
  tableColumns: [
    { key: "objectName", label: "Object" },
    { key: "noradCatId", label: "NORAD" },
    { key: "objectType", label: "Type" },
    { key: "country", label: "Country" },
    { key: "inclination", label: "Incl." },
  ],

  async fetchData() {
    const user = process.env.SPACE_TRACK_USER;
    const pass = process.env.SPACE_TRACK_PASS;
    if (!user || !pass) throw new Error("Space-Track credentials not configured");

    // Login
    const loginRes = await fetch(
      "https://www.space-track.org/ajaxauth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `identity=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!loginRes.ok) throw new Error(`Space-Track login: ${loginRes.status}`);

    const cookies = loginRes.headers.get("set-cookie") ?? "";

    // Query recent satellites
    const dataRes = await fetch(
      "https://www.space-track.org/basicspacedata/query/class/satcat/CURRENT/Y/OBJECT_TYPE/PAYLOAD/orderby/LAUNCH%20desc/limit/100/format/json",
      {
        headers: { Cookie: cookies },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!dataRes.ok) throw new Error(`Space-Track data: ${dataRes.status}`);
    const json = (await dataRes.json()) as Array<{
      NORAD_CAT_ID: string;
      OBJECT_NAME: string;
      OBJECT_TYPE: string;
      COUNTRY: string;
      LAUNCH: string;
      DECAY: string | null;
      PERIOD: string;
      INCLINATION: string;
      APOGEE: string;
      PERIGEE: string;
    }>;

    return json.map((s) => ({
      noradCatId: s.NORAD_CAT_ID,
      objectName: s.OBJECT_NAME,
      objectType: s.OBJECT_TYPE,
      country: s.COUNTRY,
      launchDate: s.LAUNCH,
      decayDate: s.DECAY,
      period: parseFloat(s.PERIOD) || 0,
      inclination: parseFloat(s.INCLINATION) || 0,
      apogee: parseFloat(s.APOGEE) || 0,
      perigee: parseFloat(s.PERIGEE) || 0,
    }));
  },

  mockData: [
    { noradCatId: "25544", objectName: "ISS", objectType: "PAYLOAD", country: "ISS", launchDate: "1998-11-20", decayDate: null, period: 92.65, inclination: 51.64, apogee: 422, perigee: 418 },
  ],
};
