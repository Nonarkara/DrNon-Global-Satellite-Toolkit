import { NextResponse } from "next/server";
import { rankedSources } from "../../../sources";

export const dynamic = "force-static";

/**
 * GET /api/sources
 *
 * The curated source registry as JSON, tier-ranked. Exposed so an agent or
 * an external tool can read what this deployment knows how to talk to,
 * including the auth each source needs and the gotchas that bite.
 */
export async function GET() {
  const sources = rankedSources();
  return NextResponse.json({
    count: sources.length,
    keyless: sources.filter(
      (s) => s.auth === "none" && s.verified.status === "ok",
    ).length,
    sources,
  });
}
