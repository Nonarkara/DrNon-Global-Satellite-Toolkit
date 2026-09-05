# Architecture

How the pieces fit together. Read this once and the rest of the repo stops being a maze.

## Bird's-eye view

```
                   ┌──────────────────────────────────────────────┐
                   │              Next.js (App Router)             │
                   │                                               │
  User browser ──► │  src/app/page.tsx  ── React shell + layout    │
                   │       │                                       │
                   │       ├── src/components/  (UI primitives)    │
                   │       ├── src/modules/     (data modules)    │
                   │       │     └── hooks/useModuleData          │
                   │       │                                       │
                   │       ├── src/engine/      (Deck.gl layers)  │
                   │       ├── src/overlays/    (overlay catalog) │
                   │       ├── src/basemaps/    (tile providers)  │
                   │       └── src/grid/        (distance grids)  │
                   │                                               │
                   │  src/app/api/modules/* (route handlers)      │
                   │       │                                       │
                   │       ▼                                       │
                   │  fetchData() — server-side, mock fallback    │
                   │       │                                       │
                   └───────┼───────────────────────────────────────┘
                           │
              ┌────────────┴─────────────┐
              ▼                          ▼
   External satellite / OSINT    ingestion/ (Python)
   APIs (NASA FIRMS, GIBS,       scheduled ingest into
   Sentinel, CelesTrak, ACLED)   local cache or DB
              │                          │
              └────────────┬─────────────┘
                           ▼
                src/storage/ (5-tier storage
                  abstraction: Supabase /
                  Firebase / PG / Sheets /
                  local cache)
```

## The five subsystems

| Subsystem | Path | Owns |
|---|---|---|
| **Module system** | `src/modules/` | The 30 data-source modules. Each is one file with `fetchData` + `mockData` + `uiType`. |
| **Map engine** | `src/engine/` | Deck.gl layer factories (GIBS, MODIS, VIIRS, fire hotspots). |
| **Overlays & basemaps** | `src/overlays/`, `src/basemaps/` | 10 satellite overlays + 12 basemaps with fallback chains. |
| **Distance grid** | `src/grid/` | 500 m – 10 km grids + nautical miles. Used for buffer, AOI sizing, and overflight analysis. |
| **Storage** | `src/storage/` | 5-tier storage abstraction (Supabase / Firebase / PG / Sheets / local cache). Pluggable. |

## Data flow

1. **`page.tsx`** mounts the React shell and instantiates `useModuleData(moduleId)` for each enabled module.
2. **`useModuleData`** calls `GET /api/modules/[id]`.
3. The **route handler** looks up the module in `src/modules/registry.ts`, calls `module.fetchData()` on the **server** (so secrets are safe), and falls back to `module.mockData` if the upstream API is down or the required env vars are missing.
4. The response carries a `tier: "live" | "mock"` field so the UI can label its source.
5. **Deck.gl** layers render the spatial data on top of the chosen basemap + overlays.

## Module contract (the most important thing in this repo)

```ts
// src/types/modules.ts
interface ModuleDefinition<TData> {
  id: string;               // kebab-case unique
  label: string;            // human-readable
  category: ModuleCategory; // 6 fixed values, see below
  description: string;
  pollInterval: number;     // seconds, 0 = fetch once
  fetchData: () => Promise<TData>;   // server-side
  mockData: TData;          // used when keys missing or fetch fails
  uiType: ModuleUiType;     // table | feed | chart | stat-card | ticker | map-layer
  tableColumns?: TableColumn[];      // required for `uiType: "table"`
  requiredEnvVars?: string[];        // env vars needed for live data
}
```

The categories are: `earth-observation`, `orbital-air-traffic`, `conflict-events`, `environmental`, `news-info`, `thailand`.

## Storage tiers (5 options, pick any)

| Tier | When to use |
|---|---|
| **Supabase** | Production, want managed Postgres + PostGIS + auth |
| **Firebase** | Production, want Firestore + real-time listeners |
| **PostgreSQL** | Self-hosted Postgres with PostGIS |
| **Google Sheets** | Non-engineer operators, ops teams, low-volume |
| **Local cache** | Dev, demos, anything offline — JSON files on disk |

The interface in `src/storage/database-architecture.ts` is the same for all five. Switching is one line in your config.

## Basemap & overlay fallback

Every basemap and overlay has a **fallback chain**. If Mapbox returns 429, the engine retries Carto, then OSM, then Stadia. If a GIBS layer is broken on the day of your demo, the dashboard still renders the next layer in the chain. This is the **resilience over features** design rule — see `README.md`.

## Ingestion

`ingestion/` is a separate Python workflow. It's for **pre-processing** heavy feeds (FIRMS fire points, etc.) into a cache that the Next.js app reads. The toolkit's runtime is JavaScript; ingestion is Python for the data-science libraries. They communicate through a shared cache layout, not a runtime API.

## Conventions

- **One file per module.** A new module = copy `_template.ts` + one import + one array entry in `registry.ts`. No exceptions.
- **Server-only fetches.** `fetchData()` never runs in the browser.
- **Design tokens.** No raw hex values in components; all colors are CSS custom properties from `src/app/globals.css`.
- **Metadata everywhere.** Every external call logs provider, timestamp, latency, status.

## See also

- [`docs/authoring-a-module.md`](./authoring-a-module.md) — step-by-step module walkthrough
- [`CLAUDE.md`](../CLAUDE.md) — Claude Code-specific agent instructions
- [`AGENTS.md`](../AGENTS.md) — cross-agent instructions (Codex, Cursor, Aider, Gemini CLI, etc.)
- [`README.md`](../README.md) — user-facing pitch and capability list
