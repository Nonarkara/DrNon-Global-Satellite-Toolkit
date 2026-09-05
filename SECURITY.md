# Security

## Reporting a vulnerability

**Please do not file public issues for security bugs.**

Report privately to **nonsmartcity@gmail.com** with:

- A clear description of the issue and impact
- Reproduction steps or a proof-of-concept
- The affected commit / version (commit SHA preferred)

You can expect:

- An acknowledgement within **3 business days**
- A status update within **7 business days**
- Credit in the fix's release notes (unless you ask to remain anonymous)

## Scope

In scope:

- Anything in `src/`, `ingestion/`, or build configuration that could compromise a user running the dashboard
- API keys / secrets handling in `.env.example` (should never be live keys)
- Dependency vulnerabilities (we monitor GitHub Dependabot alerts)
- GitHub Actions hardening (action pinning, permission scopes)

Out of scope:

- The third-party APIs the dashboard calls (file those with the respective provider)
- Upstream bugs in `next`, `react`, `@deck.gl/*` (file with the upstream project)

## Supported versions

| Version | Supported |
|---|---|
| `main` branch | ✅ Active |
| Tagged releases ≤ 6 months old | ✅ Critical fixes only |
| Older | ❌ Please upgrade |

## Secrets

This repo is a public template. **Never commit live API keys.** Use:

- `.env` locally (gitignored)
- GitHub repo Settings → Secrets for CI
- Runtime env vars for deployment (Vercel / Cloudflare / Fly secrets)

The `.env.example` file contains placeholder keys only.

## Threat model — what this template defends against

- **No data exfiltration by default** — the dashboard calls a fixed list of public APIs; no telemetry, no analytics, no phone-home
- **Graceful degradation** — every module has a mock-data fallback; an API going down does not break the dashboard
- **No filesystem writes from requests** — server-side `fetchData` is read-only against external APIs
- **CSP-friendly** — the default `next.config.mjs` does not enable unsafe-inline scripts

## Acknowledgments

We thank the following for responsible disclosures (will be updated as reports come in):

- _No reports yet._
