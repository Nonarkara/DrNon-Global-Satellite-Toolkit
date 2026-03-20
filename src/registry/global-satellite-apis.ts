/**
 * Global Satellite API Registry
 * @author DrNon (https://github.com/Nonarkara)
 *
 * Definitive compilation of every publicly accessible satellite-related API
 * from all national and international space agencies worldwide (~80 countries
 * per UNOOSA/WMO OSCAR directories as of 2026).
 *
 * Original research, compilation, and system design by DrNon.
 *
 * KEY FINDINGS:
 * - Only ~12–14 true public/programmatic APIs exist (mostly STAC-based or REST).
 * - No undocumented or hidden public APIs were found anywhere.
 * - Most countries (~65-70) have ZERO public APIs — data is portal-only or commercial.
 * - STAC (SpatioTemporal Asset Catalog) is the universal standard for discovery.
 *   Use pystac-client in Python for any STAC endpoint.
 *
 * USAGE:
 *   import { popularApis, proApis, nicheApis, portalOnlyAgencies } from "./global-satellite-apis";
 *
 *   // Find all APIs with free access
 *   const freeApis = [...popularApis, ...proApis, ...nicheApis].filter(a => a.auth !== "subscription");
 *
 *   // Find STAC-compatible APIs
 *   const stacApis = [...popularApis, ...proApis, ...nicheApis].filter(a => a.protocol === "STAC");
 */

// ── Types ───────────────────────────────────────────────────────

export type ApiProtocol = "STAC" | "REST" | "WMTS" | "WMS" | "OGC" | "GraphQL" | "Custom";
export type ApiAuth = "none" | "api-key" | "oauth" | "jwt" | "registration" | "subscription";
export type ApiTier = "popular" | "pro" | "niche";
export type ApiDomain =
  | "imagery"
  | "tracking"
  | "meteorological"
  | "sar"
  | "processing"
  | "catalog"
  | "telemetry";

export interface SatelliteApi {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Operating agency or organization */
  agency: string;
  /** Country/region code (ISO 3166-1 alpha-2, or "INT" for international) */
  country: string;
  /** API root endpoint */
  rootUrl: string;
  /** Key endpoints with descriptions */
  endpoints: { path: string; description: string }[];
  /** Primary protocol */
  protocol: ApiProtocol;
  /** Authentication method */
  auth: ApiAuth;
  /** What the API provides */
  domain: ApiDomain[];
  /** Data coverage description */
  coverage: string;
  /** Satellites / instruments covered */
  satellites: string[];
  /** Why this API matters */
  notes: string;
  /** Popularity tier */
  tier: ApiTier;
  /** Documentation URL */
  docsUrl?: string;
  /** Whether this can serve as a fallback for imagery */
  imageryFallback?: boolean;
}

export interface PortalOnlyAgency {
  /** Agency name */
  agency: string;
  /** Country */
  country: string;
  /** Country code */
  countryCode: string;
  /** What they offer */
  offering: string;
  /** Portal URL if known */
  portalUrl?: string;
  /** Why no API */
  reason: string;
}

// ── Tier 1: Popular / Viral APIs (High Adoption) ────────────────

export const popularApis: SatelliteApi[] = [
  {
    id: "sentinel-hub",
    name: "Sentinel Hub / Copernicus Data Space",
    agency: "ESA / Sinergise",
    country: "EU",
    rootUrl: "https://services.sentinel-hub.com/api/v1",
    endpoints: [
      { path: "/process", description: "On-demand image processing (custom band composites, indices)" },
      { path: "/catalog/1.0.0/search", description: "STAC-compliant catalog search" },
      { path: "/batch/process", description: "Batch processing for large areas" },
      { path: "/statistics", description: "Statistical API for time-series analysis" },
    ],
    protocol: "STAC",
    auth: "oauth",
    domain: ["imagery", "processing", "catalog"],
    coverage: "Global — all Sentinel missions, Landsat, MODIS, DEM, commercial",
    satellites: ["Sentinel-1", "Sentinel-2", "Sentinel-3", "Sentinel-5P", "Landsat 8/9", "MODIS"],
    notes: "Most comprehensive free processing API. OAuth free tier available. Copernicus Data Space Ecosystem provides the underlying data.",
    tier: "popular",
    docsUrl: "https://docs.sentinel-hub.com/api/latest/",
    imageryFallback: true,
  },
  {
    id: "google-earth-engine",
    name: "Google Earth Engine",
    agency: "Google",
    country: "US",
    rootUrl: "https://earthengine.googleapis.com/",
    endpoints: [
      { path: "/v1/projects/{project}/image:computePixels", description: "Compute pixels for analysis" },
      { path: "/v1/projects/{project}/table:computeFeatures", description: "Vector analysis" },
      { path: "/v1/projects/{project}/value:compute", description: "Compute scalar values" },
    ],
    protocol: "REST",
    auth: "oauth",
    domain: ["imagery", "processing"],
    coverage: "Planetary-scale — petabytes of satellite and geospatial data",
    satellites: ["Landsat", "Sentinel", "MODIS", "VIIRS", "GOES", "GPM", "SRTM", "1000+ datasets"],
    notes: "Planetary analysis platform. Python (ee) and JavaScript clients. Free for research, education, and non-commercial use.",
    tier: "popular",
    docsUrl: "https://developers.google.com/earth-engine/reference",
    imageryFallback: true,
  },
  {
    id: "nasa-gibs",
    name: "NASA GIBS (Global Imagery Browse Services)",
    agency: "NASA",
    country: "US",
    rootUrl: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best",
    endpoints: [
      { path: "/{layer}/default/{date}/GoogleMapsCompatible_Level{z}/{z}/{y}/{x}.{format}", description: "WMTS tile endpoint — 1,000+ layers" },
      { path: "/1.0.0/WMTSCapabilities.xml", description: "WMTS capabilities document" },
    ],
    protocol: "WMTS",
    auth: "none",
    domain: ["imagery"],
    coverage: "Global — daily imagery from NASA missions",
    satellites: ["VIIRS", "MODIS Terra/Aqua", "IMERG", "OMI", "AIRS", "MISR"],
    notes: "Primary free satellite tile source. No auth required. 1,000+ layer catalog. Used as the backbone of this toolkit.",
    tier: "popular",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    imageryFallback: true,
  },
  {
    id: "nasa-cmr-stac",
    name: "NASA CMR STAC",
    agency: "NASA",
    country: "US",
    rootUrl: "https://cmr.earthdata.nasa.gov/stac",
    endpoints: [
      { path: "/", description: "STAC root catalog" },
      { path: "/search", description: "STAC item search across all NASA collections" },
      { path: "/collections", description: "List all available collections" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["catalog"],
    coverage: "All NASA EO data holdings",
    satellites: ["All NASA missions"],
    notes: "STAC interface to NASA's Common Metadata Repository. Discover any NASA dataset programmatically.",
    tier: "popular",
    docsUrl: "https://cmr.earthdata.nasa.gov/stac/docs/index.html",
  },
  {
    id: "planet-labs",
    name: "Planet Labs API",
    agency: "Planet Labs",
    country: "US",
    rootUrl: "https://api.planet.com",
    endpoints: [
      { path: "/data/v1/search", description: "Search imagery catalog" },
      { path: "/data/v1/item-types", description: "Available item types" },
      { path: "/basemaps/v1/mosaics", description: "Global basemap mosaics" },
      { path: "/orders/v2", description: "Order and download imagery" },
    ],
    protocol: "REST",
    auth: "api-key",
    domain: ["imagery", "catalog"],
    coverage: "Global — daily 3–5m optical imagery",
    satellites: ["PlanetScope", "SkySat", "RapidEye"],
    notes: "Commercial but has education/research trials. Daily global coverage at 3m resolution.",
    tier: "popular",
    docsUrl: "https://developers.planet.com/docs/apis/",
    imageryFallback: true,
  },
  {
    id: "n2yo",
    name: "N2YO Satellite Tracking",
    agency: "N2YO.com",
    country: "INT",
    rootUrl: "https://api.n2yo.com/rest/v1/satellite",
    endpoints: [
      { path: "/tle/{id}&apiKey={key}", description: "Get TLE for a satellite" },
      { path: "/positions/{id}/{lat}/{lng}/{alt}/{seconds}&apiKey={key}", description: "Predict positions" },
      { path: "/visualpasses/{id}/{lat}/{lng}/{alt}/{days}/{min_visibility}&apiKey={key}", description: "Visible passes" },
      { path: "/above/{lat}/{lng}/{alt}/{radius}/{category}&apiKey={key}", description: "Satellites above location" },
    ],
    protocol: "REST",
    auth: "api-key",
    domain: ["tracking"],
    coverage: "All cataloged objects — real-time orbital tracking",
    satellites: ["All tracked objects (30,000+)"],
    notes: "Free API key with rate limits. Real-time positions, pass predictions, visual passes.",
    tier: "popular",
    docsUrl: "https://www.n2yo.com/api/",
  },
  {
    id: "open-notify",
    name: "Open Notify / Where the ISS At",
    agency: "Community",
    country: "INT",
    rootUrl: "https://api.wheretheiss.at/v1",
    endpoints: [
      { path: "/satellites/25544", description: "Current ISS position" },
      { path: "/satellites/25544/positions?timestamps={t1},{t2}", description: "ISS position at timestamps" },
    ],
    protocol: "REST",
    auth: "none",
    domain: ["tracking"],
    coverage: "ISS real-time position",
    satellites: ["ISS"],
    notes: "Simplest satellite tracking API. No auth needed. Good for demos and education.",
    tier: "popular",
  },
  {
    id: "microsoft-planetary-computer",
    name: "Microsoft Planetary Computer STAC",
    agency: "Microsoft",
    country: "US",
    rootUrl: "https://planetarycomputer.microsoft.com/api/stac/v1",
    endpoints: [
      { path: "/search", description: "STAC search across all collections" },
      { path: "/collections", description: "List available collections" },
      { path: "/collections/{id}/items", description: "Browse collection items" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["catalog", "imagery"],
    coverage: "Global — Sentinel, Landsat, MODIS, NAIP, DEM, climate data",
    satellites: ["Sentinel-1/2", "Landsat", "MODIS", "GOES", "ASTER"],
    notes: "Free STAC aggregator with cloud-optimized GeoTIFFs. Excellent for analysis-ready data.",
    tier: "popular",
    docsUrl: "https://planetarycomputer.microsoft.com/docs/quickstarts/reading-stac/",
    imageryFallback: true,
  },
];

// ── Tier 2: Trusted Pro-Level APIs (Low Hype, High Reliability) ─

export const proApis: SatelliteApi[] = [
  {
    id: "celestrak",
    name: "Celestrak GP API",
    agency: "Celestrak / 18 SPCS",
    country: "US",
    rootUrl: "https://celestrak.org/NORAD/elements",
    endpoints: [
      { path: "/gp.php?GROUP=active&FORMAT=json", description: "All active satellites (OMM JSON)" },
      { path: "/gp.php?CATNR={id}&FORMAT=tle", description: "TLE by catalog number" },
      { path: "/gp.php?NAME={name}&FORMAT=json", description: "Search by name" },
      { path: "/gp.php?GROUP=stations&FORMAT=json", description: "Space stations group" },
    ],
    protocol: "REST",
    auth: "none",
    domain: ["tracking"],
    coverage: "All cataloged orbital objects — modern OMM/TLE format",
    satellites: ["All NORAD-cataloged objects"],
    notes: "Most reliable free TLE/OMM source. Frequently updated. No auth required. Preferred over Space-Track for basic lookups.",
    tier: "pro",
    docsUrl: "https://celestrak.org/NORAD/documentation/gp-data-formats.php",
  },
  {
    id: "space-track",
    name: "Space-Track.org",
    agency: "18th Space Control Squadron (USSF)",
    country: "US",
    rootUrl: "https://www.space-track.org",
    endpoints: [
      { path: "/basicspacedata/query/class/gp/NORAD_CAT_ID/{id}/format/json", description: "GP data by NORAD ID" },
      { path: "/basicspacedata/query/class/cdm_public/format/json", description: "Conjunction data messages" },
      { path: "/basicspacedata/query/class/decay/format/json", description: "Decay predictions" },
    ],
    protocol: "REST",
    auth: "registration",
    domain: ["tracking"],
    coverage: "Official US Space Force catalog — definitive orbital data",
    satellites: ["All tracked objects (40,000+)"],
    notes: "Official source of truth for orbital data. Free registration required. Rate-limited but comprehensive.",
    tier: "pro",
    docsUrl: "https://www.space-track.org/documentation",
  },
  {
    id: "satnogs",
    name: "SatNOGS API",
    agency: "Libre Space Foundation",
    country: "INT",
    rootUrl: "https://db.satnogs.org/api",
    endpoints: [
      { path: "/satellites/", description: "Satellite database" },
      { path: "/transmitters/", description: "Known transmitter frequencies" },
      { path: "/tle/", description: "TLE collection from ground stations" },
    ],
    protocol: "REST",
    auth: "none",
    domain: ["tracking", "telemetry"],
    coverage: "Amateur satellite telemetry and tracking from global ground station network",
    satellites: ["CubeSats", "Amateur satellites", "Weather satellites"],
    notes: "Open-source ground station network. Unique telemetry data not available elsewhere.",
    tier: "pro",
    docsUrl: "https://db.satnogs.org/api/",
  },
  {
    id: "tle-api",
    name: "TLE API (Ivan Stanojevic)",
    agency: "Community",
    country: "INT",
    rootUrl: "https://tle.ivanstanojevic.me/api/tle",
    endpoints: [
      { path: "/", description: "List all TLEs (paginated)" },
      { path: "/{norad_id}", description: "TLE by NORAD catalog number" },
      { path: "/?search={name}", description: "Search by satellite name" },
    ],
    protocol: "REST",
    auth: "none",
    domain: ["tracking"],
    coverage: "All cataloged satellites — JSON TLE wrapper",
    satellites: ["All NORAD-cataloged objects"],
    notes: "Clean JSON wrapper around TLE data. Good for frontend apps that need simple REST access.",
    tier: "pro",
  },
  {
    id: "openeo",
    name: "OpenEO",
    agency: "OpenEO Consortium",
    country: "EU",
    rootUrl: "https://openeo.cloud",
    endpoints: [
      { path: "/api/v1.2/collections", description: "Available data collections" },
      { path: "/api/v1.2/processes", description: "Processing capabilities" },
      { path: "/api/v1.2/jobs", description: "Submit processing jobs" },
    ],
    protocol: "REST",
    auth: "oauth",
    domain: ["processing"],
    coverage: "Unified processing across multiple EO backends",
    satellites: ["Sentinel", "Landsat", "MODIS", "backend-dependent"],
    notes: "Standardized API that works across different backends (VITO, EODC, etc.). Python client: openeo.",
    tier: "pro",
    docsUrl: "https://openeo.org/documentation/1.0/",
  },
  {
    id: "eumetsat",
    name: "EUMETSAT Data Store API",
    agency: "EUMETSAT",
    country: "EU",
    rootUrl: "https://data.eumetsat.int/api",
    endpoints: [
      { path: "/v1/products", description: "Product catalog search" },
      { path: "/v1/collections", description: "Available collections" },
      { path: "/v1/orders", description: "Data ordering" },
    ],
    protocol: "REST",
    auth: "registration",
    domain: ["meteorological", "imagery"],
    coverage: "Geostationary weather — Meteosat, Jason, Sentinel-3 marine",
    satellites: ["Meteosat", "Jason-3", "Sentinel-3"],
    notes: "European meteorological satellite data. Free registration. OpenSearch also available.",
    tier: "pro",
    docsUrl: "https://data.eumetsat.int/api/help",
  },
];

// ── Tier 3: Niche / Regional Agency APIs ────────────────────────

export const nicheApis: SatelliteApi[] = [
  {
    id: "isro-bhoonidhi",
    name: "ISRO Bhoonidhi STAC API",
    agency: "ISRO / NRSC",
    country: "IN",
    rootUrl: "https://bhoonidhi-api.nrsc.gov.in",
    endpoints: [
      { path: "/auth/token", description: "JWT authentication" },
      { path: "/data/collections", description: "Available collections" },
      { path: "/data/search", description: "STAC search (CQL2/bbox)" },
      { path: "/download", description: "Data download" },
    ],
    protocol: "STAC",
    auth: "jwt",
    domain: ["imagery", "catalog"],
    coverage: "India-centric — Resourcesat, EOS, Oceansat, NovaSAR products",
    satellites: ["Resourcesat", "EOS-04/06", "Oceansat", "NovaSAR", "Sentinel-1"],
    notes: "India's primary EO data API. Registration + IP whitelist. NDVI, AOD, and L2 products available.",
    tier: "niche",
    docsUrl: "https://bhoonidhi.nrsc.gov.in/",
    imageryFallback: true,
  },
  {
    id: "dea-australia",
    name: "DEA STAC API (Geoscience Australia)",
    agency: "Geoscience Australia",
    country: "AU",
    rootUrl: "https://explorer.dea.ga.gov.au/stac",
    endpoints: [
      { path: "/search", description: "STAC search (OGC + CQL2)" },
      { path: "/collections", description: "All collections" },
      { path: "/queryables", description: "Queryable properties" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["imagery", "catalog"],
    coverage: "Australia — Landsat/Sentinel ARD, water observations, land cover, InSAR, mangroves",
    satellites: ["Landsat", "Sentinel-2", "Sentinel-1"],
    notes: "Fully public, no auth. Analysis-ready data for the Australian continent.",
    tier: "niche",
    docsUrl: "https://explorer.dea.ga.gov.au/",
    imageryFallback: true,
  },
  {
    id: "digital-earth-africa",
    name: "Digital Earth Africa STAC API",
    agency: "SANSA / DEAfrica",
    country: "ZA",
    rootUrl: "https://explorer.digitalearth.africa/stac",
    endpoints: [
      { path: "/search", description: "STAC search" },
      { path: "/collections", description: "Available collections" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["imagery", "catalog"],
    coverage: "Africa continent — Sentinel/Landsat time-series, SAR RTC, crop/soil/fire data",
    satellites: ["Sentinel-1/2", "Landsat"],
    notes: "Regional EO powerhouse. Public, no auth. Underused globally despite excellent Africa coverage.",
    tier: "niche",
    imageryFallback: true,
  },
  {
    id: "dlr-eoc",
    name: "DLR EOC STAC API",
    agency: "DLR (German Aerospace Center)",
    country: "DE",
    rootUrl: "https://geoservice.dlr.de/eoc/ogc/stac/v1",
    endpoints: [
      { path: "/", description: "STAC root" },
      { path: "/collections", description: "National EO collections" },
      { path: "/search", description: "STAC search" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["imagery", "catalog"],
    coverage: "Germany-focused — national EO collections and processed products",
    satellites: ["TerraSAR-X", "TanDEM-X", "Sentinel", "Landsat"],
    notes: "Public STAC 1.0 compliant. German national EO hub.",
    tier: "niche",
  },
  {
    id: "csa-open-data",
    name: "CSA Open Data Catalog API",
    agency: "Canadian Space Agency (CSA)",
    country: "CA",
    rootUrl: "https://donnees-data.asc-csa.gc.ca/API",
    endpoints: [
      { path: "/", description: "Catalog root — search/download CSA open datasets" },
    ],
    protocol: "REST",
    auth: "none",
    domain: ["imagery", "catalog"],
    coverage: "Canada — RADARSAT-1/RCM (via EODMS), NEOSSat satellite imagery",
    satellites: ["RADARSAT-1", "RADARSAT Constellation Mission", "NEOSSat"],
    notes: "Official Canadian EO access. Rarely listed outside CSA circles. Jupyter tutorials available for RADARSAT search/visualization.",
    tier: "niche",
    docsUrl: "https://asc-csa.gc.ca/eng/open-data/api.asp",
    imageryFallback: true,
  },
  {
    id: "inpe-stac",
    name: "INPE STAC Server",
    agency: "INPE (Brazil)",
    country: "BR",
    rootUrl: "https://data.inpe.br/stac",
    endpoints: [
      { path: "/", description: "STAC root catalog" },
      { path: "/search", description: "Search CBERS and regional collections" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["imagery", "catalog"],
    coverage: "Brazil/South America — CBERS, Amazonia-1, regional products",
    satellites: ["CBERS-4/4A", "Amazonia-1"],
    notes: "AWS-hosted. Free Brazilian EO data including Amazon deforestation monitoring.",
    tier: "niche",
    imageryFallback: true,
  },
  {
    id: "jaxa-earth-api",
    name: "JAXA Earth API",
    agency: "JAXA",
    country: "JP",
    rootUrl: "https://data.earth.jaxa.jp",
    endpoints: [
      { path: "/api/v1/datasets", description: "Available datasets" },
      { path: "/api/v1/search", description: "Data search" },
    ],
    protocol: "REST",
    auth: "registration",
    domain: ["imagery", "catalog"],
    coverage: "Japan/Asia-Pacific — ALOS, GCOM, Himawari data",
    satellites: ["ALOS-2", "GCOM-C", "GCOM-W", "Himawari"],
    notes: "Japanese EO data hub. Registration required. ALOS-2 SAR and GCOM ocean/atmosphere data.",
    tier: "niche",
    docsUrl: "https://data.earth.jaxa.jp/",
    imageryFallback: true,
  },
  {
    id: "roscosmos-stac",
    name: "Roscosmos Open STAC",
    agency: "Roscosmos / GPTL",
    country: "RU",
    rootUrl: "https://s3ext.gptl.ru/stac-web-free",
    endpoints: [
      { path: "/", description: "STAC catalog root" },
      { path: "/search", description: "STAC search" },
    ],
    protocol: "STAC",
    auth: "none",
    domain: ["imagery", "catalog"],
    coverage: "Russia — free tier of Russian EO satellite data",
    satellites: ["Resurs-P", "Kanopus-V", "Meteor-M"],
    notes: "Limited free tier. Russian national EO data access.",
    tier: "niche",
  },
];

// ── Portal-Only Agencies (No Public API) ────────────────────────

export const portalOnlyAgencies: PortalOnlyAgency[] = [
  {
    agency: "CNSA / CRESDA (Gaofen)",
    country: "China",
    countryCode: "CN",
    offering: "Free 16m multispectral imagery since 2019",
    portalUrl: "https://www.cnsageo.com",
    reason: "Web UI search/download only — no REST, STAC, or API endpoint.",
  },
  {
    agency: "KARI (KOMPSAT)",
    country: "South Korea",
    countryCode: "KR",
    offering: "High-resolution optical/SAR imagery",
    reason: "Distributed via ground stations and commercial channels — no developer API or STAC.",
  },
  {
    agency: "CONAE (SAOCOM)",
    country: "Argentina",
    countryCode: "AR",
    offering: "SAR L-band test products",
    portalUrl: "https://catalogos.conae.gov.ar",
    reason: "Web catalog for test products — browser-only, no API.",
  },
  {
    agency: "ASAL",
    country: "Algeria",
    countryCode: "DZ",
    offering: "Alsat imagery via DMC consortium",
    reason: "Open data circulation via DMC consortium — no programmatic endpoint.",
  },
  {
    agency: "TUBITAK UZAY",
    country: "Turkey",
    countryCode: "TR",
    offering: "Gokturk satellite imagery",
    reason: "Military/commercial distribution — no public API.",
  },
  {
    agency: "MBRSC",
    country: "UAE",
    countryCode: "AE",
    offering: "KhalifaSat / DubaiSat imagery",
    reason: "Commercial distribution only.",
  },
  {
    agency: "ISA (Iranian Space Agency)",
    country: "Iran",
    countryCode: "IR",
    offering: "Khayyam / Nahid imagery",
    reason: "No public data distribution.",
  },
  {
    agency: "AEM (Mexican Space Agency)",
    country: "Mexico",
    countryCode: "MX",
    offering: "No domestic EO satellite",
    reason: "Uses third-party data; no API.",
  },
  {
    agency: "LAPAN / BRIN",
    country: "Indonesia",
    countryCode: "ID",
    offering: "LAPAN-A microsatellites",
    reason: "Data distributed internally; no public API.",
  },
  {
    agency: "VAST (Vietnam)",
    country: "Vietnam",
    countryCode: "VN",
    offering: "VNREDSat-1",
    reason: "Internal distribution only.",
  },
  {
    agency: "GISTDA",
    country: "Thailand",
    countryCode: "TH",
    offering: "THEOS-1/2 imagery",
    reason: "Web portal download only. Some data via regional ASEAN sharing agreements.",
  },
  {
    agency: "PhilSA",
    country: "Philippines",
    countryCode: "PH",
    offering: "Diwata microsatellites",
    reason: "Academic/research distribution; no public API.",
  },
];

// ── Aggregated Views ────────────────────────────────────────────

/** All APIs combined. */
export const allApis: SatelliteApi[] = [
  ...popularApis,
  ...proApis,
  ...nicheApis,
];

/** APIs that can serve as imagery fallbacks. */
export const imageryFallbackApis = allApis.filter((api) => api.imageryFallback);

/** APIs requiring no authentication. */
export const noAuthApis = allApis.filter((api) => api.auth === "none");

/** STAC-compatible APIs (use pystac-client for any of these). */
export const stacApis = allApis.filter((api) => api.protocol === "STAC");

/** Orbital tracking APIs. */
export const trackingApis = allApis.filter((api) => api.domain.includes("tracking"));

/** Total counts for documentation. */
export const registryStats = {
  totalApis: allApis.length,
  popularCount: popularApis.length,
  proCount: proApis.length,
  nicheCount: nicheApis.length,
  portalOnlyCount: portalOnlyAgencies.length,
  noAuthCount: noAuthApis.length,
  stacCount: stacApis.length,
  trackingCount: trackingApis.length,
  imageryFallbackCount: imageryFallbackApis.length,
};
