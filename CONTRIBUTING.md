# Contributing

Thanks for building with us. This template is designed to be cloned and adapted — but improvements to the core also flow back through pull requests.

## TL;DR

- **Small, focused PRs** — one module, one fix, one refactor per PR
- **One file per module** — adding a module = 1 new file + 1 import + 1 array entry in `src/modules/registry.ts`
- **Mock data is part of the contract** — every module must work with zero API keys
- **Design tokens only** — no hardcoded colors, use the CSS custom properties in `src/app/globals.css`
- **CI must pass** — `.github/workflows/ci.yml` runs lint + type-check + build on every PR

## Ways to contribute

| Type | Examples | Where to look |
|---|---|---|
| **New module** | Add a public satellite / weather / transit feed | [`docs/authoring-a-module.md`](./docs/authoring-a-module.md) |
| **New basemap** | Add a tile provider | `src/basemaps/basemap-catalog.ts` |
| **New satellite overlay** | Add a GIBS layer or MODIS product | `src/overlays/map-overlays.ts` |
| **Bug fix** | Off-by-one in distance grid, broken fallback | `src/grid/distance-grid.ts`, etc. |
| **Docs** | Better example, new tutorial, fixed typo | `docs/`, `examples/`, `README.md` |
| **Ingestion script** | New Python ingest into the toolkit's data flow | `ingestion/` |

## Module contract — the 30-second version

Every module implements `ModuleDefinition<TData>` (see `src/types/modules.ts`):

```ts
{
  id: string;               // kebab-case unique
  label: string;            // human-readable
  category: ModuleCategory; // earth-observation | orbital-air-traffic | conflict-events | environmental | news-info | thailand
  description: string;
  pollInterval: number;     // seconds, 0 = fetch once
  fetchData: () => Promise<TData>;
  mockData: TData;          // used when API key missing or fetch fails
  uiType: ModuleUiType;     // table | feed | chart | stat-card | ticker | map-layer
  tableColumns?: [];        // required for `uiType: "table"`
  requiredEnvVars?: [];     // env vars needed for live data
}
```

Full walkthrough with examples: [`docs/authoring-a-module.md`](./docs/authoring-a-module.md).

## Code style

- TypeScript strict mode (see `tsconfig.json`)
- 2-space indentation, single quotes, no semicolons (matches existing code)
- No `any` unless you're wrapping an untyped upstream library — comment why
- Server-only code in `src/app/api/**` and `src/modules/**/fetchData()`; never call external APIs from React components
- React 19 patterns: server components by default, `"use client"` only when you need state/effects

## PR checklist

- [ ] Module (if adding) follows the contract and has working `mockData` with no keys
- [ ] Registered in `src/modules/registry.ts` (one import + one array entry)
- [ ] Lint passes (`npm run lint`)
- [ ] Build passes (`npm run build`)
- [ ] Dev server renders the new module on the dashboard with zero env keys
- [ ] If you added an env var, it's documented in `.env.example`
- [ ] If you changed a module's data shape, you updated `mockData` to match
- [ ] If you added a Python script, it's in `ingestion/` and imports cleanly
- [ ] Attribution block in `README.md` is intact

## Reporting bugs

Open a [bug report issue](../../issues/new?template=bug_report.md) and include:

- Node / npm / OS version
- Reproduction steps (which module, what env keys were set)
- Expected vs. actual behavior
- Console output (server-side, since `fetchData` runs on the server)

## Suggesting a feature

Open a [feature request](../../issues/new?template=feature_request.md). For new modules, use the [new-module template](../../issues/new?template=new_module.md) so the maintainer can triage the source quality and category fit.

## Security

See [`SECURITY.md`](./SECURITY.md). Please don't file public issues for security bugs — use the private channel there.

## Code of conduct

By participating, you agree to abide by the [Contributor Covenant](./CODE_OF_CONDUCT.md). Be kind, be technical, ship.
