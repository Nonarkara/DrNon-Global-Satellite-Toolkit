import type { ModuleDefinition } from "../../types/modules";

interface TleEntry {
  name: string;
  line1: string;
  line2: string;
  noradId: string;
  epoch: string;
  inclination: number;
}

function parseTle(text: string): TleEntry[] {
  const lines = text.trim().split("\n");
  const entries: TleEntry[] = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i].trim();
    const line1 = lines[i + 1]?.trim() ?? "";
    const line2 = lines[i + 2]?.trim() ?? "";
    if (!line1.startsWith("1 ") || !line2.startsWith("2 ")) continue;
    const noradId = line1.substring(2, 7).trim();
    const epochYear = parseInt(line1.substring(18, 20));
    const epochDay = parseFloat(line1.substring(20, 32));
    const fullYear = epochYear > 56 ? 1900 + epochYear : 2000 + epochYear;
    const epoch = `${fullYear}-day-${Math.floor(epochDay)}`;
    const inclination = parseFloat(line2.substring(8, 16));
    entries.push({ name, line1, line2, noradId, epoch, inclination });
  }
  return entries;
}

const GP_URL = "https://celestrak.org/NORAD/elements/gp.php";

/** Earth-observation, weather and science platforms. CelesTrak asks callers
 *  to cache rather than re-fetch; pollInterval is set to an hour for that. */
const GROUPS = ["resource", "weather", "science", "stations"] as const;

const USER_AGENT = "drnon-satellite-toolkit/2.1";
const MAX_ENTRIES = 250;

export const celestrak: ModuleDefinition<TleEntry[]> = {
  id: "celestrak",
  label: "CelesTrak Satellite Tracking",
  category: "orbital-air-traffic",
  description:
    "Two-Line Element sets for Earth-observation, weather and science satellites from CelesTrak. Propagate with an SGP4 library to predict overpasses. No API key required.",
  pollInterval: 3600,
  uiType: "table",
  sourceId: "celestrak",
  tableColumns: [
    { key: "name", label: "Satellite" },
    { key: "noradId", label: "NORAD ID" },
    { key: "inclination", label: "Incl." },
    { key: "epoch", label: "Epoch" },
  ],

  async fetchData(): Promise<TleEntry[]> {
    // CelesTrak returns 403 for the bulk GROUP=active feed (verified
    // 2026-09-06). Targeted groups are served normally and are more useful
    // here anyway: these are the Earth-observation and weather platforms
    // whose overpasses actually matter for imagery planning.
    const results = await Promise.all(
      GROUPS.map(async (group) => {
        const res = await fetch(`${GP_URL}?GROUP=${group}&FORMAT=tle`, {
          headers: { "User-Agent": USER_AGENT },
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) throw new Error(`CelesTrak ${group}: ${res.status}`);
        return parseTle(await res.text());
      }),
    );

    // De-duplicate: a satellite can appear in more than one group.
    const seen = new Set<string>();
    return results
      .flat()
      .filter((entry) => {
        if (seen.has(entry.noradId)) return false;
        seen.add(entry.noradId);
        return true;
      })
      .slice(0, MAX_ENTRIES);
  },

  mockData: [
    {
      name: "ISS (ZARYA)",
      line1: "1 25544U 98067A   26084.51234568  .00001234  00000-0  33541-4 0  9999",
      line2: "2 25544  51.6444 247.5321 0007963  12.4521 347.6789 15.48905123999999",
      noradId: "25544",
      epoch: "2026-day-84",
      inclination: 51.6444,
    },
    {
      name: "SENTINEL-2A",
      line1: "1 40697U 15028A   26084.12345678  .00000012  00000-0  12345-4 0  9992",
      line2: "2 40697  98.5680 123.4567 0001234  89.1234  12.3456 14.30818321999999",
      noradId: "40697",
      epoch: "2026-day-84",
      inclination: 98.568,
    },
  ],
};
