"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import ModulePanel from "./ModulePanel";

const STORAGE_KEY = "satellite-toolkit-enabled-modules";

function loadEnabledIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as string[];
  } catch { /* empty */ }
  return [];
}

export default function ModuleRail() {
  const [enabledIds, setEnabledIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Sync with localStorage (re-check on focus to catch changes from ModuleSelector)
  useEffect(() => {
    const sync = () => {
      const ids = loadEnabledIds();
      setEnabledIds(ids);
      setActiveTab((prev) => {
        if (prev && ids.includes(prev)) return prev;
        return ids[0] ?? null;
      });
    };
    sync();

    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    // Also poll every 2s to catch same-window localStorage changes
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      clearInterval(interval);
    };
  }, []);

  if (enabledIds.length === 0) return null;

  return (
    <div
      className="w-full shrink-0"
      style={{
        borderTop: "1px solid var(--line)",
        background: "var(--panel)",
      }}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-0 overflow-x-auto" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="px-2 py-1.5 shrink-0" style={{ color: "var(--dim)" }}>
          <Layers size={12} />
        </div>
        {enabledIds.map((id) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap transition-colors shrink-0"
              style={{
                color: isActive ? "var(--cool)" : "var(--dim)",
                borderBottom: isActive ? "2px solid var(--cool)" : "2px solid transparent",
                background: isActive ? "var(--cool-dim)" : "transparent",
              }}
            >
              {formatTabLabel(id)}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      {activeTab && (
        <div className="min-h-[100px]">
          <ModulePanel moduleId={activeTab} />
        </div>
      )}
    </div>
  );
}

/** Convert module ID to short tab label: "nasa-firms" → "FIRMS", "opensky-network" → "OpenSky" */
function formatTabLabel(id: string): string {
  const labels: Record<string, string> = {
    "nasa-firms": "FIRMS",
    "opensky-network": "OpenSky",
    "open-meteo-aqi": "Air Quality",
    "google-trends": "Trends",
    acled: "ACLED",
    "pksb-transit": "Smart Bus",
    "gdelt-events": "GDELT Events",
    "gdelt-news": "GDELT News",
    celestrak: "CelesTrak",
    "space-track": "Space-Track",
    openaq: "OpenAQ",
    reliefweb: "ReliefWeb",
    "aqicn-thailand": "AQICN",
    "tmd-weather": "TMD Weather",
    "srt-trains": "SRT Trains",
    "bts-mrt": "BTS/MRT",
    "longdo-traffic": "Traffic",
    "highway-cameras": "Highway Cam",
    "thailand-admin": "Admin",
    "thailand-open-data": "Gov Data",
    "gtfs-buses": "GTFS Bus",
    "sentinel-hub": "Sentinel",
    "isro-bhoonidhi": "ISRO",
    "jaxa-tellus": "JAXA",
    "gk2a-korea": "GK2A",
    "flightlabs-thai": "FlightLabs",
    "meteoblue": "Meteoblue",
    "meteosource-thai": "Meteosource",
    predicthq: "PredictHQ",
    "news-api": "News API",
  };
  return labels[id] ?? id.replace(/-/g, " ");
}
