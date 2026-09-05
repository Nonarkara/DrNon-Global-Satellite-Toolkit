# AGENTS.md

Instructions for AI coding agents working on this repository. This file follows the [agents.md](https://agents.md) spec and is consumed by Codex, Cursor, Aider, Gemini CLI, and other agent runtimes. **For Claude Code, see [`CLAUDE.md`](./CLAUDE.md), which is more detailed.**

## Project at a glance

- **Type:** Next.js 15 + React 19 + TypeScript 5 + Tailwind 4 + Deck.gl 9 dashboard framework
- **Purpose:** Production-grade template for satellite / OSINT / smart-city dashboards — clone, pick a geography, deploy
- **Author / maintainer:** Dr Non Arkaraprasertkul ([@Nonarkara](https://github.com/Nonarkara))
- **License:** MIT

## Before you start

1. **Read `README.md`** for the user-facing pitch and capability list.
2. **Read `CLAUDE.md`** (Claude Code) or this file (other agents) for the module contract, the design system, and the architecture.
3. **Read `docs/architecture.md`** to understand how the module system, map engine, storage tier, and overlay system compose.
4. **Read `docs/authoring-a-module.md`** if you are adding or modifying a module — it is the most common contributor action.

## Ground rules

- **The default works with zero configuration.** Every module must ship a realistic `mockData` and degrade gracefully when API keys are missing. Do not introduce changes that break the zero-config path.
- **One file per module.** Adding a module = copy `src/modules/_template.ts` + one import + one array entry in `src/modules/registry.ts`. Removing = the reverse. Don't reach across module boundaries.
- **Server-side fetches only.** `fetchData()` runs on the server (Next.js route handlers). Never call external APIs from the React component.
- **Use the design tokens, not raw colors.** All visual values come from CSS custom properties defined in `src/app/globals.css` (`--bg`, `--ink`, `--cool`, `--danger`, `--line`, ...). See the design-system table in `CLAUDE.md`.
- **Mock data is part of the contract.** When you change a module's schema, update `mockData` in the same commit. The dashboard must look right with zero API keys.
- **Metadata everywhere.** Tile fetches and API calls log `provider`, `timestamp`, `latency`, `status`. Don't strip this — it's the audit trail.

## Common tasks

| Task | Where to look | How long it should take |
|---|---|---|
| Add a new data module | `src/modules/_template.ts` + `docs/authoring-a-module.md` | 10–30 min for a simple feed |
| Add a new basemap | `src/basemaps/basemap-catalog.ts` | 5 min |
| Add a new satellite overlay | `src/overlays/map-overlays.ts` | 5 min |
| Add a new API to the registry | `src/registry/global-satellite-apis.ts` | 5 min |
| Tweak a dashboard panel | `src/app/page.tsx` + `src/components/` | varies |
| Add an ingestion script | `ingestion/` (Python) | 30 min for a typical FIRMS-style ingest |

## Build, lint, test

```bash
npm install
npm run lint      # ESLint via next lint
npm run build     # next build
npm run dev       # local dev server on :3000
```

There is no separate test runner. Smoke-test by `npm run build` succeeding and `npm run dev` rendering mock data on every enabled module. The CI workflow (`.github/workflows/ci.yml`) runs lint + type check + build + Python import smoke test on every push and PR.

## Out of scope (don't add unless asked)

- Orbit propagation / TLE math — this repo consumes pre-processed tiles, not raw imagery
- Streamlit / Dash / Python dashboards — the dashboard *is* the Next.js app
- Database migrations — storage tiers are pluggable, not a single schema
- Authentication / user accounts — out of scope for the template; downstream forks add their own
- Internationalization — copy is English-only by design

## Attribution

Original compilation, system design, architecture, and product: **Dr Non Arkaraprasertkul** ([nonarkara.org](https://nonarkara.org), [GitHub @Nonarkara](https://github.com/Nonarkara)). PhD MA Harvard | MPhil Oxon | SM UrbanCertDes MIT | BArch First Class Honors. Senior Expert in Smart City Promotion, Digital Economy Promotion Agency of Thailand (depa).

If you contribute, keep this attribution intact in `README.md`.
