// ─── Module Template ───────────────────────────────────────────────────────
// Copy this file to create a new module.
// 1. Copy to the appropriate category folder (e.g. earth-observation/)
// 2. Rename and update all fields
// 3. Add one import + one array entry in registry.ts
//
// That's it — the module will appear in the ModuleSelector and be
// servable via GET /api/modules/{id}

import type { ModuleDefinition } from "../types/modules";

interface MyDataItem {
  id: string;
  label: string;
  value: number;
  timestamp: string;
}

export const myModule: ModuleDefinition<MyDataItem[]> = {
  id: "my-module",
  label: "My Module",
  category: "environmental", // pick from ModuleCategory
  description: "Short description of what this module provides.",
  pollInterval: 300, // seconds (0 = fetch once)
  uiType: "table", // table | feed | chart | stat-card | map-layer | ticker
  tableColumns: [
    { key: "label", label: "Name" },
    { key: "value", label: "Value" },
    { key: "timestamp", label: "Time" },
  ],

  async fetchData() {
    const res = await fetch("https://example.com/api/data", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = (await res.json()) as { items: MyDataItem[] };
    return json.items;
  },

  mockData: [
    { id: "1", label: "Sample", value: 42, timestamp: "2026-01-01T00:00:00Z" },
  ],

  // Uncomment if this module needs API keys:
  // requiredEnvVars: ["MY_API_KEY"],

  // Uncomment if wrapping an existing route:
  // wrapsExisting: "/api/my-existing-route",
};
