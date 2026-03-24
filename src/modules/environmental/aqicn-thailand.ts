import type { ModuleDefinition } from "../../types/modules";

interface AqicnStation {
  uid: number;
  aqi: string;
  station: string;
  time: string;
  lat: number;
  lng: number;
}

export const aqicnThailand: ModuleDefinition<AqicnStation[]> = {
  id: "aqicn-thailand",
  label: "AQICN Thailand",
  category: "environmental",
  description:
    "Real-time PM2.5 and PM10 readings from AQICN/WAQI stations across Thailand, including Bangkok and Chiang Mai.",
  pollInterval: 600,
  uiType: "table",
  tableColumns: [
    { key: "station", label: "Station" },
    { key: "aqi", label: "AQI" },
    { key: "time", label: "Updated" },
  ],

  async fetchData() {
    // WAQI map bounds API — Thailand bounding box
    const url =
      "https://api.waqi.info/v2/map/bounds?latlng=5.6,97.3,20.5,105.7&networks=all&token=demo";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`AQICN: ${res.status}`);
    const json = (await res.json()) as {
      status?: string;
      data?: Array<{
        uid: number;
        aqi: string;
        station: { name: string; time: string };
        lat: number;
        lon: number;
      }>;
    };

    if (json.status !== "ok" || !json.data) return [];

    return json.data
      .filter((s) => s.aqi !== "-" && s.aqi !== "")
      .slice(0, 60)
      .map((s) => ({
        uid: s.uid,
        aqi: s.aqi,
        station: s.station.name,
        time: s.station.time,
        lat: s.lat,
        lng: s.lon,
      }));
  },

  mockData: [
    { uid: 5773, aqi: "85", station: "Bangkok US Embassy", time: "2026-03-25T10:00:00Z", lat: 13.73, lng: 100.53 },
    { uid: 9574, aqi: "42", station: "Phuket Town", time: "2026-03-25T10:00:00Z", lat: 7.88, lng: 98.39 },
  ],
};
