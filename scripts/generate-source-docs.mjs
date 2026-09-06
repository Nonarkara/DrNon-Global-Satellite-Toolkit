#!/usr/bin/env node
/**
 * Generates docs/data-sources.md from src/sources/.
 *
 * The registry is the single source of truth; this file exists so the prose
 * cannot drift from the code. Regenerate with `npm run docs:sources`.
 */

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// The registry is TypeScript, so read it through a tiny tsx-free shim:
// compile-on-the-fly via Next's bundled swc is overkill here, so we ask
// TypeScript itself for the JSON by evaluating a transpiled module.
const json = execFileSync(
  "npx",
  [
    "--yes",
    "tsx",
    "--eval",
    `import {rankedSources} from "./src/sources/index.ts";
     process.stdout.write(JSON.stringify(rankedSources()));`,
  ],
  { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
);

const sources = JSON.parse(json);

const TIER_HEADINGS = {
  1: {
    title: "Tier 1 — Start here",
    blurb:
      "Keyless, global, stable and actively maintained. Everything in this tier works from a cold clone with no signup. If you are building something new, build it on these.",
  },
  2: {
    title: "Tier 2 — Worth the signup",
    blurb:
      "Excellent sources that need a free key or account, or that cover a narrower scope. Most keys here are issued instantly.",
  },
  3: {
    title: "Tier 3 — Specialist and regional",
    blurb:
      "Reach for these when tiers 1 and 2 cannot answer the question — higher resolution over a specific region, a particular sensor, or a national archive.",
  },
  4: {
    title: "Tier 4 — Documented so you don't waste an afternoon",
    blurb:
      "Deprecated, decommissioned or gated behind human approval. Listed because tutorials and older code still point at them.",
  },
};

const AUTH_LABEL = {
  none: "No credentials",
  "free-key": "Free key, instant",
  "free-account": "Free account",
  "approved-appname": "Human approval required",
  commercial: "Paid",
};

const STATUS_MARK = {
  ok: "🟢 verified working",
  "needs-auth": "🔑 reachable, needs credentials",
  deprecated: "🔴 dead or superseded",
  "rate-limited": "🟠 throttled during probing",
  manual: "⚪ not machine-probeable",
};

function renderSource(s) {
  const lines = [];
  lines.push(`#### ${s.name}`);
  lines.push("");
  lines.push(
    `\`${s.id}\` · ${s.agency} · ${s.country} · **${AUTH_LABEL[s.auth]}** · ${STATUS_MARK[s.verified.status]}`,
  );
  lines.push("");
  lines.push(`**Use when:** ${s.useWhen}`);
  lines.push("");
  lines.push("**Provides**");
  for (const p of s.provides) lines.push(`- ${p}`);
  lines.push("");

  const facts = [];
  if (s.resolution) facts.push(`| Resolution | ${s.resolution} |`);
  if (s.latency) facts.push(`| Latency | ${s.latency} |`);
  if (s.coverage) facts.push(`| Coverage | ${s.coverage} |`);
  if (s.endpoint) facts.push(`| Endpoint | \`${s.endpoint}\` |`);
  facts.push(`| Portal | ${s.portal} |`);
  if (s.docs) facts.push(`| Docs | ${s.docs} |`);
  if (s.requiredEnvVars?.length)
    facts.push(`| Env vars | \`${s.requiredEnvVars.join("`, `")}\` |`);
  if (facts.length) {
    lines.push("| | |");
    lines.push("|---|---|");
    lines.push(...facts);
    lines.push("");
  }

  lines.push(`**How to use it.** ${s.howTo}`);
  lines.push("");

  if (s.gotchas?.length) {
    lines.push("**Gotchas**");
    for (const g of s.gotchas) lines.push(`- ${g}`);
    lines.push("");
  }

  lines.push(
    `<sub>Last probed ${s.verified.at}${s.verified.note ? ` — ${s.verified.note}` : ""}</sub>`,
  );
  if (s.seeAlso?.length) {
    lines.push("");
    lines.push(`<sub>See also: ${s.seeAlso.map((x) => `\`${x}\``).join(", ")}</sub>`);
  }
  lines.push("");
  return lines.join("\n");
}

const byTier = new Map();
for (const s of sources) {
  if (!byTier.has(s.tier)) byTier.set(s.tier, []);
  byTier.get(s.tier).push(s);
}

const keyless = sources.filter(
  (s) => s.auth === "none" && s.verified.status === "ok",
);

const out = [];
out.push("# Data Sources — Curated and Verified");
out.push("");
out.push(
  "> **Generated from [`src/sources/`](../src/sources/). Do not edit by hand** —",
  "> run `npm run docs:sources` after changing the registry.",
);
out.push("");
out.push(
  `Every source below was probed against the live internet. ${sources.length} entries; ` +
    `**${keyless.length} need no credentials at all**. Re-verify at any time with \`npm run probe\`.`,
);
out.push("");

// ── Quick index ───────────────────────────────────────────────────────────
out.push("## At a glance");
out.push("");
out.push("| Source | Tier | Kind | Auth | Status |");
out.push("|---|---|---|---|---|");
for (const s of sources) {
  out.push(
    `| [${s.name}](#${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}) | ${s.tier} | ${s.kind} | ${AUTH_LABEL[s.auth]} | ${STATUS_MARK[s.verified.status]} |`,
  );
}
out.push("");

// ── Task routing ──────────────────────────────────────────────────────────
out.push("## Which source for which question");
out.push("");
out.push("| I need… | Use |");
out.push("|---|---|");
out.push(
  "| Recent optical imagery, anywhere, right now | `earth-search` (10 m Sentinel-2, keyless COGs) |",
  "| A multi-decade time series | `planetary-computer` (Landsat back to 1982) |",
  "| To see through cloud or work at night | `asf-search` (Sentinel-1 / ALOS SAR) |",
  "| A daily global basemap with zero processing | `nasa-gibs-wmts` |",
  "| Those pixels on a slippy map in one step | `titiler-public` → self-host `titiler` |",
  "| Active fires and burning-season haze | `nasa-firms` (free key) |",
  "| Air quality anywhere, including unmonitored areas | `open-meteo-aqi` (keyless model) |",
  "| Air quality actually measured by instruments | `openaq` or `aqicn` (free keys) |",
  "| Curated natural-disaster events | `nasa-eonet` (keyless) |",
  "| What people are reporting about an event | `gdelt` (keyless, throttled) |",
  "| Satellite overpass prediction | `celestrak` (keyless) |",
  "| Live aircraft positions | `opensky` |",
  "| Atmospheric chemistry (NO₂, SO₂, CH₄) | `cdse-stac` → Sentinel-5P |",
  "| Higher resolution over South Asia | `isro-bhoonidhi` via `bhoonidhi-downloader` |",
  "| 10-minute cadence over Asia-Pacific | `jaxa-earth` → Himawari |",
  "| To explore before committing to code | `leafmap` in a notebook |",
  "| An AI agent to query catalogs in natural language | `geo-mcp-servers` |",
);
out.push("");

for (const tier of [1, 2, 3, 4]) {
  const group = byTier.get(tier);
  if (!group?.length) continue;
  const heading = TIER_HEADINGS[tier];
  out.push(`## ${heading.title}`);
  out.push("");
  out.push(heading.blurb);
  out.push("");
  for (const s of group) out.push(renderSource(s));
}

out.push("---");
out.push("");
out.push(
  `<sub>Generated ${new Date().toISOString().slice(0, 10)} from \`src/sources/\`. ` +
    "Verification statuses reflect the last run of `npm run probe`.</sub>",
);
out.push("");

writeFileSync("docs/data-sources.md", out.join("\n"));
console.log(
  `Wrote docs/data-sources.md — ${sources.length} sources, ${keyless.length} keyless.`,
);
