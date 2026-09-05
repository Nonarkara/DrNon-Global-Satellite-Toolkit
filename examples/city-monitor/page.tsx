// examples/city-monitor/page.tsx
// Drop-in replacement for src/app/page.tsx in a single-city deployment.
// Retarget by changing the AOI constant.

import { TopBar } from "@/components/TopBar";
import { ModuleRail } from "@/modules/components/ModuleRail";
import { ModuleSelector } from "@/modules/components/ModuleSelector";
import { DashboardMap } from "@/components/DashboardMap";
import { Sidebar } from "@/components/Sidebar";

// Center on Bangkok. Change these four numbers to retarget the dashboard.
const AOI = {
  name: "Bangkok",
  center: [100.5018, 13.7563] as [number, number], // [lon, lat]
  radiusKm: 50,
  bbox: [100.35, 13.55, 100.85, 13.95] as [number, number, number, number],
};

export default function CityMonitorPage() {
  return (
    <main className="dashboard-shell">
      <TopBar
        title={`${AOI.name} City Monitor`}
        subtitle={`${AOI.radiusKm} km around ${AOI.center[1].toFixed(4)}° N, ${AOI.center[0].toFixed(4)}° E`}
        aoi={AOI}
      />
      <div className="dashboard-grid">
        <DashboardMap aoi={AOI} />
        <Sidebar aoi={AOI} />
      </div>
      <ModuleRail />
      <ModuleSelector />
    </main>
  );
}
