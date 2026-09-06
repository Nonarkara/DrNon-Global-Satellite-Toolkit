import { NextResponse } from "next/server";
import { getModuleById, toMetadata } from "../../../../modules/registry";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const mod = getModuleById(id);
  if (!mod) {
    return NextResponse.json(
      { error: `Module "${id}" not found` },
      { status: 404 },
    );
  }

  const fetchedAt = new Date().toISOString();
  const meta = toMetadata(mod);

  // Fixture-only modules have no upstream to call — serve the fixture and
  // label it honestly rather than attempting a fetch that always fails.
  if (mod.fixtureOnly) {
    return NextResponse.json({
      data: mod.mockData,
      tier: "mock" as const,
      fetchedAt,
      module: meta,
    });
  }

  try {
    const data = await mod.fetchData();
    return NextResponse.json({
      data,
      tier: "live" as const,
      fetchedAt,
      module: meta,
    });
  } catch (error: unknown) {
    console.error(
      `Module ${id} fetch error:`,
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({
      data: mod.mockData,
      tier: "mock" as const,
      fetchedAt,
      module: meta,
    });
  }
}
