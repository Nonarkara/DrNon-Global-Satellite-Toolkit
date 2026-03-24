import type { ModuleDefinition } from "../../types/modules";

interface SrtTrain {
  trainNo: string;
  trainName: string;
  origin: string;
  destination: string;
  status: string;
  delay: number;
  lastStation: string;
  lastUpdate: string;
}

export const srtTrains: ModuleDefinition<SrtTrain[]> = {
  id: "srt-trains",
  label: "SRT Train Tracking",
  category: "thailand",
  description:
    "State Railway of Thailand (SRT) train positions and status — Bangkok-Chiang Mai, Bangkok-Padang Besar, and other routes.",
  pollInterval: 120,
  uiType: "table",
  tableColumns: [
    { key: "trainNo", label: "Train" },
    { key: "trainName", label: "Name" },
    { key: "lastStation", label: "Last Station" },
    { key: "delay", label: "Delay (min)" },
    { key: "status", label: "Status" },
  ],

  async fetchData() {
    // SRT TTS (Train Tracking System) — proxy the status page
    const url = "https://ttsview.railway.co.th/SRT_Schedule/GetTrainRunning";
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`SRT TTS: ${res.status}`);
    const json = (await res.json()) as Array<{
      TrainNo?: string;
      TrainName?: string;
      Origin?: string;
      Destination?: string;
      TrainStatus?: string;
      DelayMinute?: number;
      LastStation?: string;
      LastUpdate?: string;
    }>;

    return (Array.isArray(json) ? json : []).slice(0, 40).map((t) => ({
      trainNo: t.TrainNo ?? "",
      trainName: t.TrainName ?? "",
      origin: t.Origin ?? "",
      destination: t.Destination ?? "",
      status: t.TrainStatus ?? "Unknown",
      delay: t.DelayMinute ?? 0,
      lastStation: t.LastStation ?? "",
      lastUpdate: t.LastUpdate ?? "",
    }));
  },

  mockData: [
    { trainNo: "9", trainName: "Special Express", origin: "Bangkok", destination: "Chiang Mai", status: "Running", delay: 12, lastStation: "Ayutthaya", lastUpdate: "2026-03-25T14:30:00" },
    { trainNo: "43", trainName: "Express", origin: "Bangkok", destination: "Padang Besar", status: "Running", delay: 0, lastStation: "Hua Hin", lastUpdate: "2026-03-25T14:30:00" },
  ],
};
