import { NextResponse } from "next/server";
import { getModuleCatalog } from "../../../../modules/registry";

export async function GET() {
  return NextResponse.json({
    modules: getModuleCatalog(),
    generatedAt: new Date().toISOString(),
  });
}
