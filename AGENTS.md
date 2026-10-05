# AGENTS.md

Instructions for AI coding agents working on this repository. Follows the
[agents.md](https://agents.md) spec and is consumed by Claude Code, Codex,
Cursor, Aider, Gemini CLI and other agent runtimes.

**If you are an agent that has just been pointed at this repo: read this file,
then run `npm run probe`. That one command tells you which of the 39 catalogued
data sources are alive right now.**

**Or skip the codebase entirely** — this repo ships an MCP server:

```bash
claude mcp add satellite -- node /abs/path/to/mcp/server.mjs
```

Four tools, no API key: `search_imagery`, `spectral_index` (NDVI/NDWI/NBR with
real pixel statistics), `next_overpass`, `list_data_sources`. `search_imagery`
and `spectral_index` are fully standalone; `next_overpass` and
`list_data_sources` call a running instance (`npm run dev`) for orbital
propagation and the source registry.

## The 60-second orientation

```bash
npm install && npm run dev     # dashboard on :3000
npm run probe                  # verify every keyless data source is alive
open http://localhost:3000/imagery
```

`/imagery` searches real Sentinel-2 and Landsat scenes and renders them. It
needs no API key, because the whole imagery path runs on public archives:

```
STAC search  →  public COG asset  →  dynamic tiler  →  XYZ tiles  →  deck.gl
Earth Search    sentinel-cogs S3     TiTiler           map layer
```

Verified end-to-end on 2026-09-06 over Bangkok.

## What this project is

- **Type:** Next.js 15 + React 19 + TypeScript 5 + Tailwind 4 + Deck.gl 9
- **Purpose:** A template for satellite / situational-awareness dashboards —
  clone it, pick a geography, ship it
- **Author:** Dr Non Arkaraprasertkul ([@Nonarkara](https://github.com/Nonarkara))
- **License:** MIT

## Map of the codebase

| You want to… | Go to |
|---|---|
| Know which data source to use | `src/sources/` → rendered as `docs/data-sources.md` |
| Search satellite imagery | `src/stac/` (`client.ts`, `backends.ts`, `preview.ts`) |
| Know which collection to search | `src/stac/collections.ts` |
| Compute NDVI/NDWI/NBR | `src/stac/indices.ts`, `src/stac/index-render.ts` |
| Predict a satellite overpass | `src/orbital/` (`tle.ts`, `solar.ts`, `overpass.ts`) |
| Expose it all to an agent | `mcp/server.mjs` |
| Render imagery on a map | `src/engine/cog-layer.ts`, `src/engine/map-engine.ts` |
| Add or edit a data feed | `src/modules/` + `src/modules/registry.ts` |
| Add an API route | `src/app/api/` |
| Do analysis in Python | `ingestion/stac_search.py` |
| Verify a source still works | `scripts/probe-sources.mjs` |

## Ground rules

### 1. Never claim data is live when it is not

This is the rule that matters most here. The module contract has three honest
states, and the API enforces them:

| State | Meaning |
|---|---|
| `tier: "live"` | `fetchData()` succeeded against a real upstream |
| `tier: "mock"` | The fetch failed or a key is missing; `mockData` is served |
| `fixtureOnly: true` | No public API exists. The fetch is never attempted |

If you find a module whose upstream is dead, **mark it `fixtureOnly: true` with
a dated comment recording what the endpoint returned.** Do not leave it looking
live. Do not `return []` on failure — throw, so the route can label it honestly.

### 2. The zero-config path must keep working

`npm run dev` on a fresh clone with no `.env` must render real data. Six
modules are live with no credentials at all. If a change breaks that, it is
the wrong change.

### 3. Verify before you document

Every entry in `src/sources/` carries a `verified` block with a date, the exact
probe URL and what came back. If you add a source, **probe it first** and add a
matching case to `scripts/probe-sources.mjs`. A source that has not been probed
does not go in the registry.

### 4. One file per module

Adding a module = copy `src/modules/_template.ts` + one import + one array
entry in `src/modules/registry.ts`. Don't reach across module boundaries.

### 5. Server-side fetches only

`fetchData()` runs in a Next.js route handler. Never call an external API from
a React component — keys leak and CORS breaks.

### 6. Use the design tokens

All colour comes from CSS custom properties in `src/app/globals.css`
(`--bg`, `--ink`, `--cool`, `--danger`, `--line`, …). No raw hex.

### 7. Respect the verified rendering constraints

These cost real debugging to establish. Do not "simplify" them away:

- **Band math uses positional `b1`, `b2` naming**, with `asset_as_band=true`,
  in the order the `assets` parameters appear. Asset names in an expression
  (`(nir-red)/(nir+red)`) return HTTP 400 "Invalid expression".
- **Only `earth-search` + Sentinel-2 supports band math on a public tiler.**
  Planetary Computer assets need SAS signing a public tiler cannot do (409);
  Earth Search's Landsat is in the USGS requester-pays bucket (AccessDenied);
  CDSE publishes `s3://` URIs that are not HTTP at all.
- **Landsat calls near-infrared `nir08`, not `nir`.** `resolveAssets()` in
  `src/stac/indices.ts` translates; new collections need an entry there.
- **CelesTrak 403s the bulk `GROUP=active` feed** and 500s on concurrent
  requests. `src/orbital/tle.ts` serialises and caches for 6 hours — leave it.
- **Sentinel-2A alone repeats every 10 days**, so a short overpass horizon
  legitimately returns nothing. The default is 240 hours for that reason.

### 8. Regenerate docs, don't hand-edit them

`docs/data-sources.md` is generated. Change `src/sources/`, then run
`npm run docs:sources`.

## Commands

```bash
npm run dev            # dev server on :3000
npm run verify         # typecheck + lint + test + build — what CI runs
npm test               # 47 tests, no network required
npm run mcp            # the MCP server on stdio
npm run probe          # probe keyless sources against the live internet
npm run probe:all      # include sources needing credentials
npm run probe -- --json  # machine-readable, for an agent to parse
npm run docs:sources   # regenerate docs/data-sources.md from src/sources/

make python            # Python STAC env in ingestion/.venv
make notebook          # + JupyterLab and leafmap
docker compose up      # app plus a self-hosted TiTiler
```

`npm run verify` passing plus `npm run probe` reporting all green is the bar.
Tests are pure and offline; `npm run probe` is the network check.

## Task recipes

<details>
<summary><b>Retarget the dashboard to a different city or country</b></summary>

1. `src/modules/earth-observation/stac-imagery.ts` — change `BBOX`
2. `src/components/ImageryExplorer.tsx` — change `PRESETS`
3. `src/modules/environmental/open-meteo-aqi.ts` — change `STATIONS`
4. `src/modules/earth-observation/nasa-firms.ts` — change `AREA`
   (west,south,east,north — the reverse of most APIs)
5. `src/modules/orbital-air-traffic/opensky-network.ts` — change `BBOX`
6. `ingestion/stac_search.py` — add to `AOIS`
7. Drop Thailand-specific modules from `src/modules/registry.ts`
</details>

<details>
<summary><b>Add a new data source</b></summary>

1. **Probe it first.** `curl` the endpoint; record the status, size and shape.
2. Add a `DataSource` entry to the right file in `src/sources/` with a real
   `verified` block, an honest `tier`, and the gotchas you hit.
3. Add a probe case to `scripts/probe-sources.mjs`; run `npm run probe`.
4. If it should surface in the UI, copy `src/modules/_template.ts`, set
   `sourceId` to your new source's id, and register it.
5. `npm run docs:sources && npm run verify`
</details>

<details>
<summary><b>Revive a fixture-only module</b></summary>

Twelve modules are `fixtureOnly` because their upstream returned 404/403 or
timed out on 2026-09-06 — mostly Thai government feeds and agency portals with
no open API. Each carries a comment saying exactly what happened. To revive one:
find a working endpoint, rewrite `fetchData()`, delete the `fixtureOnly` flag
and the stale comment, and confirm `tier: "live"` at
`/api/modules/<id>`.
</details>

<details>
<summary><b>Move off the public tiler</b></summary>

`https://titiler.xyz` is a courtesy demo with no SLA. For anything real:

```bash
docker run -p 8000:8000 ghcr.io/developmentseed/titiler:latest
echo 'NEXT_PUBLIC_TITILER_URL=http://localhost:8000' >> .env
```

`src/stac/preview.ts` reads that variable; nothing else changes.
</details>

## Out of scope (don't add unless asked)

- Authentication or user accounts — forks add their own
- Database migrations — storage tiers are pluggable, not one schema
- Heavy raster processing in Node — that belongs in `ingestion/` (Python) or
  ESA SNAP; the web app consumes tiles
- Internationalization — copy is English-only by design

## Attribution

Original compilation, system design and architecture: **Dr Non Arkaraprasertkul**
([nonarkara.org](https://nonarkara.org), [@Nonarkara](https://github.com/Nonarkara)).
PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors.
Senior Expert in Smart City Promotion, Digital Economy Promotion Agency of
Thailand (depa).

Keep this attribution intact in `README.md` if you contribute.
