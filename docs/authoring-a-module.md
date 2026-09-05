# Authoring a Module

Adding a new data-source module is the most common contribution to this repo. It should take 10–30 minutes. Here's the full walkthrough.

## What you'll produce

```
src/modules/earth-observation/my-new-source.ts   ← the new module (1 file)
src/modules/registry.ts                          ← +1 import, +1 array entry (2 lines)
```

That's it. No other files need to change.

## Step 0 — pick the category

Your module goes in one of six categories. Pick the closest fit:

| Category | Use it for |
|---|---|
| `earth-observation` | Satellite imagery, fire/vegetation/temp products, EO archives |
| `orbital-air-traffic` | Satellite TLE/orbit data, plane tracking, launch schedules |
| `conflict-events` | Conflict events, humanitarian disasters, news-coded events |
| `environmental` | Air quality, weather, ocean / land / atmospheric data |
| `news-info` | Trends, news, social listening |
| `thailand` | Anything Thailand-specific (transit, traffic, government data) |

## Step 1 — copy the template

```bash
cp src/modules/_template.ts src/modules/earth-observation/my-new-source.ts
```

Open the new file. It has TODO markers for every field.

## Step 2 — fill in the metadata

```ts
import type { ModuleDefinition } from "@/types/modules";

interface MyData {
  // whatever your data looks like
  items: Array<{ id: string; value: number; timestamp: string }>;
}

export const myNewSource: ModuleDefinition<MyData> = {
  id: "my-new-source",                          // kebab-case, unique
  label: "My New Source",                       // shown in the module selector
  category: "earth-observation",                // one of the 6 categories
  description: "One-line description for the UI.",
  pollInterval: 300,                            // seconds; 0 = fetch once

  requiredEnvVars: ["MY_SOURCE_KEY"],           // omit if no key needed

  fetchData: async () => {
    // runs on the server (Next.js route handler)
    const res = await fetch("https://api.example.com/...", {
      headers: { "X-API-Key": process.env.MY_SOURCE_KEY! },
    });
    if (!res.ok) throw new Error(`my-new-source: ${res.status}`);
    return (await res.json()) as MyData;
  },

  mockData: {
    // Used when:
    //   1. required env var is missing
    //   2. fetchData throws (rate limit, network, etc.)
    //   3. the user is on a fresh clone with zero config
    // Make it look like real data — same shape, plausible values.
    items: [
      { id: "1", value: 12.4, timestamp: new Date().toISOString() },
      { id: "2", value: 8.7,  timestamp: new Date().toISOString() },
    ],
  },

  uiType: "table",                              // see Step 3
  tableColumns: [                               // required if uiType === "table"
    { key: "id",        label: "ID" },
    { key: "value",     label: "Value", format: "number" },
    { key: "timestamp", label: "When",  format: "datetime" },
  ],
};
```

## Step 3 — pick a `uiType`

The 7 supported UI types and when to use them:

| `uiType` | Use it for | Required extras |
|---|---|---|
| `table` | Tabular data with rows + columns | `tableColumns` |
| `feed` | Stream of timestamped events (news, conflicts, ACLED) | — |
| `chart` | Time series or category counts | — |
| `stat-card` | One headline number (e.g. "Active fires: 142") | — |
| `ticker` | Horizontally-scrolling live strip (markets, transit) | — |
| `map-layer` | GeoJSON / lat-lon points rendered on the map | — |

If you pick `map-layer`, your `TData` should be a GeoJSON FeatureCollection (or a wrapper with a `features` field). The map engine in `src/engine/` will pick it up.

## Step 4 — register the module

Open `src/modules/registry.ts`. Add **one import** and **one array entry**:

```ts
// at the top with the other imports
import { myNewSource } from "./earth-observation/my-new-source";

// inside the ALL_MODULES array
export const ALL_MODULES: ModuleDefinition<unknown>[] = [
  // ... existing modules
  myNewSource,
];
```

Done. The module now appears in the **ModuleSelector** drawer and can be toggled on by the user.

## Step 5 — verify it works

```bash
npm run dev
```

- Open `http://localhost:3000`
- Open the ModuleSelector drawer
- Find "My New Source" and toggle it on
- Confirm it renders the **mock data** (you should see real-looking values, not "No data")
- If you set the env var, the badge should switch from `mock` to `live`

Then run the production build to make sure nothing broke:

```bash
npm run lint
npm run build
```

## Step 6 — if you added an env var

Append a placeholder + comment to `.env.example`:

```bash
# My New Source (https://api.example.com/signup)
MY_SOURCE_KEY=
```

And mention the env var in your PR description so reviewers know to test the live path.

## Patterns and gotchas

### Don't fetch from the client

`fetchData` runs on the server (Next.js route handler). Don't call it from a React `useEffect`. Use the `useModuleData(moduleId)` hook from `src/modules/hooks/useModuleData.ts` — that handles polling, loading, and tier ("live" vs "mock") automatically.

### Make mock data believable

The point of the mock is that the dashboard looks right **with zero config**. Don't ship `[]` or `[{ id: "test" }`. Use the same shape as live data with plausible values. The user should not be able to tell mock from live at a glance.

### Log your fetches

If you're adding a new fetch path, log the provider, latency, and status somewhere — the existing route handlers do this in their catch blocks. This is the audit trail that lets you debug "why was the dashboard slow yesterday?"

### Rate limits

If your source has tight rate limits (e.g. NASA FIRMS WMS is keyed by IP, GDELT has a polite-pool), use a short `pollInterval` (300+ seconds) and cache the response in your storage tier. The fetchData function should be cheap to call.

## Examples

The fastest way to learn the patterns is to read the existing 30 modules. Start with:

- `src/modules/earth-observation/nasa-firms.ts` — fire detection, table, free
- `src/modules/environmental/open-meteo-aqi.ts` — air quality, chart, free
- `src/modules/conflict-events/acled.ts` — conflict events, table, requires key
- `src/modules/thailand/highway-cameras.ts` — geo points, map-layer, free

## See also

- [`docs/architecture.md`](./architecture.md) — the system overview
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — the PR checklist
- [`AGENTS.md`](../AGENTS.md) — for AI agents writing modules
