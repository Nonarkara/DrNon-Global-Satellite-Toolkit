import type { ModuleDefinition } from "../../types/modules";

interface ReliefWebReport {
  id: number;
  title: string;
  date: string;
  source: string;
  country: string;
  url: string;
  status: string;
}

export const reliefweb: ModuleDefinition<ReliefWebReport[]> = {
  id: "reliefweb",
  label: "ReliefWeb Disasters",
  category: "conflict-events",
  description:
    "Humanitarian disaster reports, situation updates, and emergency response data from ReliefWeb/OCHA.",
  pollInterval: 600,
  uiType: "feed",

  async fetchData() {
    const url =
      "https://api.reliefweb.int/v1/reports?appname=satellite-toolkit&filter[field]=country.name&filter[value]=Thailand&limit=25&sort[]=date:desc&fields[include][]=title&fields[include][]=date.original&fields[include][]=source.name&fields[include][]=country.name&fields[include][]=url_alias&fields[include][]=status";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`ReliefWeb: ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<{
        id: number;
        fields: {
          title: string;
          "date.original"?: string;
          "source.name"?: string;
          "country.name"?: string[];
          url_alias?: string;
          status?: string;
        };
      }>;
    };

    return (json.data ?? []).map((item) => ({
      id: item.id,
      title: item.fields.title,
      date: item.fields["date.original"] ?? "",
      source: item.fields["source.name"] ?? "",
      country: (item.fields["country.name"] ?? []).join(", "),
      url: item.fields.url_alias
        ? `https://reliefweb.int${item.fields.url_alias}`
        : `https://reliefweb.int/node/${item.id}`,
      status: item.fields.status ?? "",
    }));
  },

  mockData: [
    {
      id: 1,
      title: "Thailand: Flood situation update",
      date: "2026-03-20",
      source: "OCHA",
      country: "Thailand",
      url: "#",
      status: "published",
    },
  ],
};
