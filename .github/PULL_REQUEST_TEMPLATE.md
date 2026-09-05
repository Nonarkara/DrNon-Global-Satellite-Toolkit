## What kind of change?

- [ ] New module (data source)
- [ ] New basemap / overlay
- [ ] Bug fix
- [ ] Refactor (no behavior change)
- [ ] Docs / examples
- [ ] CI / tooling
- [ ] Other (describe below)

## Summary

<!-- 1–3 sentences. What does this PR do, and why? -->

## Module contract (if adding a module)

- [ ] `id`, `label`, `category` set
- [ ] `fetchData()` returns `TData` with the documented shape
- [ ] `mockData` is realistic, matches the live shape, and the dashboard renders correctly with zero env keys
- [ ] `uiType` is one of the supported values; if `table`, `tableColumns` is filled
- [ ] Added to `src/modules/registry.ts` (one import + one array entry)
- [ ] If a new env var is required, it's documented in `.env.example`

## Verification

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run dev` shows the change with **no** env keys set (or only the keys needed for this change)
- [ ] Screenshot / recording attached if it affects the dashboard UI
- [ ] Python script (if any) imports cleanly and the smoke test in CI passes

## Attribution

- [ ] The attribution block in `README.md` (Author: Dr Non Arkaraprasertkul) is unchanged

## Linked issues

<!-- e.g. Closes #42, Refs #57 -->
