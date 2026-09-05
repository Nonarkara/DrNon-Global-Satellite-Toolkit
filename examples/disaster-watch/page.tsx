// examples/disaster-watch/page.tsx
// Drop-in replacement for src/app/page.tsx for a disaster response dashboard.

import { TopBar } from "@/components/TopBar";
import { ModuleRail } from "@/modules/components/ModuleRail";
import { ModuleSelector } from "@/modules/components/ModuleSelector";
import { DashboardMap } from "@/components/DashboardMap";
import { Sidebar } from "@/components/Sidebar";
import { THAILAND_AOI } from "@/data/aoi/thailand";

export default function DisasterWatchPage() {
  return (
    <main className="dashboard-shell">
      <TopBar
        title="Disaster Watch"
        subtitle={`Active AOI: ${THAILAND_AOI.name} — ${THAILAND_AOI.bbox[1]}° – ${THAILAND_AOI.bbox[3]}° N`}
        aoi={THAILAND_AOI}
        pollIntervalSeconds={60}
        accent="danger"
      />
      <div className="dashboard-grid">
        <DashboardMap aoi={THAILAND_AOI} overlays={["firms", "gibs-aerosol", "viirs-nightlights"]} />
        <Sidebar aoi={THAILAND_AOI} priority={["firms", "reliefweb", "acled", "open-meteo-aqi"]} />
      </div>
      <ModuleRail />
      <ModuleSelector />
    </main>
  );
}
