// examples/southeast-asia/page.tsx
// Drop-in replacement for src/app/page.tsx — regional picker dashboard.

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { ModuleRail } from "@/modules/components/ModuleRail";
import { ModuleSelector } from "@/modules/components/ModuleSelector";
import { DashboardMap } from "@/components/DashboardMap";
import { Sidebar } from "@/components/Sidebar";
import { AOIS, AOI_KEYS, type AOIKey } from "@/data/aoi";

export default function RegionalPage() {
  const [aoiKey, setAoiKey] = useState<AOIKey>("thailand");
  const aoi = AOIS[aoiKey];

  return (
    <main className="dashboard-shell">
      <TopBar
        title="DrNon Regional — Southeast Asia"
        subtitle={`Active AOI: ${aoi.name}`}
        aoi={aoi}
        rightSlot={
          <select
            value={aoiKey}
            onChange={(e) => setAoiKey(e.target.value as AOIKey)}
            className="aoi-picker"
          >
            {AOI_KEYS.map((k) => (
              <option key={k} value={k}>
                {AOIS[k].name}
              </option>
            ))}
          </select>
        }
      />
      <div className="dashboard-grid">
        <DashboardMap aoi={aoi} overlays={["firms", "gibs-truecolor", "viirs-nightlights", "modis-aod"]} />
        <Sidebar aoi={aoi} />
      </div>
      <ModuleRail />
      <ModuleSelector />
    </main>
  );
}
