import type { ModuleDefinition } from "../../types/modules";

interface AirQualityPoint {
  label: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  category: string;
}

export const openMeteoAqi: ModuleDefinition<AirQualityPoint[]> = {
  id: "open-meteo-aqi",
  label: "Air Quality (Open-Meteo)",
  category: "environmental",
  description:
    "Real-time US AQI and PM2.5 readings from Open-Meteo for 12 stations across Phuket, Andaman coast, Bangkok, and Singapore.",
  pollInterval: 300,
  uiType: "table",
  wrapsExisting: "/api/air-quality",
  tableColumns: [
    { key: "label", label: "Station" },
    { key: "aqi", label: "AQI" },
    { key: "pm25", label: "PM2.5" },
    { key: "category", label: "Category" },
  ],

  async fetchData() {
    const res = await fetch("http://127.0.0.1:3000/api/air-quality", {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`AQI proxy: ${res.status}`);
    return (await res.json()) as AirQualityPoint[];
  },

  mockData: [
    { label: "Phuket Town", lat: 7.88, lng: 98.39, aqi: 44, pm25: 9, category: "Good" },
    { label: "Bangkok", lat: 13.76, lng: 100.5, aqi: 92, pm25: 27, category: "Moderate" },
  ],
};
