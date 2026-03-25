/**
 * Resolves internal API route URLs for modules that wrap existing endpoints.
 * Falls back to localhost:3000 in development.
 */
export function internalUrl(path: string): string {
  const base =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return `${base}${path}`;
}
