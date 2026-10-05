import type { ModuleDefinition } from "../../types/modules";

interface JaxaRow {
  product: string;
  status: string;
  endpoint: string;
  evidence: string;
  notes: string;
}

async function probe(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    return `HTTP ${res.status}`;
  } catch (error) {
    return error instanceof Error ? error.message : "unreachable";
  }
}

export const jaxaGsmap: ModuleDefinition<JaxaRow[]> = {
  id: "jaxa-gsmap",
  label: "JAXA GSMaP + Himawari",
  category: "earth-observation",
  description:
    "JAXA GSMaP rainfall watch plus Himawari browse freshness (NICT timestamp). GSMaP is satellite-estimated precipitation, not a rain gauge.",
  pollInterval: 900,
  uiType: "table",
  tableColumns: [
    { key: "product", label: "Product" },
    { key: "status", label: "Status" },
    { key: "evidence", label: "Evidence" },
    { key: "notes", label: "Notes" },
  ],

  async fetchData() {
    const gsmapStatus = await probe("https://sharaku.eorc.jaxa.jp/GSMaP/");
    const ptreeStatus = await probe("https://www.eorc.jaxa.jp/ptree/");
    const earthApiStatus = await probe("https://data.earth.jaxa.jp/");

    let himawariStatus = "unavailable";
    let himawariWhen = "";
    try {
      const res = await fetch("https://himawari8.nict.go.jp/img/D531106/latest.json", {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`NICT ${res.status}`);
      const json = (await res.json()) as { date?: string; file?: string };
      himawariWhen = json.date ?? json.file ?? "";
      himawariStatus = `latest ${himawariWhen || "ok"}`;
    } catch (error) {
      himawariStatus = error instanceof Error ? error.message : "NICT fetch failed";
    }

    return [
      {
        product: "GSMaP Global Rainfall Watch",
        status: gsmapStatus,
        endpoint: "https://sharaku.eorc.jaxa.jp/GSMaP/",
        evidence: "Modelled / satellite-estimated rain rates (microwave + IR algorithm), not station gauges.",
        notes:
          "Near-real-time and archive maps at 0.1°. Binary/CSV/FTP after free JAXA registration. Guide: https://sharaku.eorc.jaxa.jp/GSMaP/guide.html",
      },
      {
        product: "Himawari browse (NICT real-time PNG)",
        status: himawariStatus,
        endpoint: "https://himawari8.nict.go.jp/img/D531106/latest.json",
        evidence:
          "Geostationary true-color browse image. Useful for cloud/storm context; not a rainfall retrieval.",
        notes:
          "NICT public timestamp for Himawari-8/9 full-disk PNG. Science archives: JAXA P-Tree (https://www.eorc.jaxa.jp/ptree/) and JMA MSC (https://www.data.jma.go.jp/mscweb/data/himawari/).",
      },
      {
        product: "JAXA Himawari Monitor (P-Tree)",
        status: ptreeStatus,
        endpoint: "https://www.eorc.jaxa.jp/ptree/",
        evidence: "JAXA geophysical products from JMA Himawari Standard Data (SST, aerosol, solar, etc.).",
        notes:
          "FTP after free account. Terms differ by date — see https://www.eorc.jaxa.jp/ptree/faq.html. Not a production tile CDN.",
      },
      {
        product: "JAXA Earth API",
        status: earthApiStatus,
        endpoint: "https://data.earth.jaxa.jp/",
        evidence: "COG/STAC analysis access to JAXA datasets including precipitation.",
        notes:
          "Portal + Python client: https://data.earth.jaxa.jp/api/python. Prefer this over scraping G-Portal HTML.",
      },
    ];
  },

  mockData: [
    {
      product: "GSMaP Global Rainfall Watch",
      status: "HTTP 200",
      endpoint: "https://sharaku.eorc.jaxa.jp/GSMaP/",
      evidence: "Modelled / satellite-estimated rain rates (microwave + IR algorithm), not station gauges.",
      notes: "Near-real-time global rainfall maps at 0.1°.",
    },
    {
      product: "Himawari browse (NICT real-time PNG)",
      status: "latest 2026-09-02 09:20:00",
      endpoint: "https://himawari8.nict.go.jp/img/D531106/latest.json",
      evidence: "Geostationary true-color browse image. Useful for cloud/storm context; not a rainfall retrieval.",
      notes: "Public NICT timestamp. P-Tree/JMA hold the science data.",
    },
  ],
};
