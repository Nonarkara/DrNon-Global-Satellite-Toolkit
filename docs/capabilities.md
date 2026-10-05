# Capabilities

What this toolkit can do, how each piece was verified, and the constraints that
are real rather than incidental.

Everything below works from a cold clone with **no API key**.

---

## 1. Find imagery — STAC search

Four catalogs, one query shape. [`src/stac/`](../src/stac/)

| Backend | Covers | Assets readable by a public tiler? |
|---|---|---|
| `earth-search` (default) | Sentinel-2, Sentinel-1 GRD, Landsat, Copernicus DEM | **Yes** — anonymous public COGs |
| `planetary-computer` | 138 collections, Landsat to 1982, WorldCover, NASADEM | Preview only — assets need SAS signing |
| `cdse` | Authoritative ESA, newest processing baselines, Sentinel-5P | No — `s3://` URIs |
| `nasa-cmr` | NASA DAACs, HLS | No — needs Earthdata Login |

```bash
curl "localhost:3000/api/stac/search?bbox=100.3,13.5,100.9,14.0&maxCloudCover=20"
```

Returns scenes already carrying XYZ tile URLs, so a map can render them without
a second round trip.

### Collections

[`src/stac/collections.ts`](../src/stac/collections.ts) — nine collections,
each probed against a real bounding box on 2026-10-05.

| Collection | Kind | Resolution | Use when |
|---|---|---|---|
| `sentinel-2-l2a` | optical | 10 m | The default for anything optical |
| `landsat-c2-l2` | optical | 30 m | Pre-2015, long time series, surface temperature |
| `sentinel-1-rtc` | radar | 10 m | Cloud is blocking the view, or it happened at night |
| `sentinel-1-grd` | radar | 10 m | You want to process SAR yourself |
| `cop-dem-glo-30` | elevation | 30 m | Terrain, watersheds, flood routing |
| `nasadem` | elevation | 30 m | Reference DEM for change comparison |
| `esa-worldcover` | land cover | 10 m | Land-cover baseline to classify against |
| `io-lulc-annual-v02` | land cover | 10 m | Year-on-year land-use change |
| `modis-13A1-061` | derived | 500 m | 25-year vegetation trend at continental scale |

---

## 2. Measure it — spectral indices

[`src/stac/indices.ts`](../src/stac/indices.ts) ·
[`src/stac/index-render.ts`](../src/stac/index-render.ts)

```bash
curl "localhost:3000/api/stac/indices?index=ndvi&bbox=100.3,13.5,100.9,14.0"
```

Returns a rendered image, XYZ tiles, **and** a statistics endpoint — so you get
numbers, not only pictures.

| Index | Bands | Reads as |
|---|---|---|
| `ndvi` | nir, red | <0 water · 0–0.2 bare/built · >0.6 dense canopy |
| `savi` | nir, red | NDVI with a soil correction — better in sparse/arid canopy |
| `ndwi` | green, nir | >0 is open water. The standard flood-extent index |
| `ndmi` | nir, swir16 | Canopy moisture. Falling NDMI precedes fire season |
| `nbr` | nir, swir22 | Burn severity. Difference two dates for dNBR |
| `ndbi` | swir16, nir | Built-up and impervious surface (bare soil also reads positive) |
| `ndsi` | green, swir16 | >0.4 is snow or ice, and separates it from cloud |

### Verified constraints

These were established by probing, and are not negotiable without changing
infrastructure:

- **Expressions use positional band names** — `b1`, `b2`, … in the order the
  `assets` parameters appear, with `asset_as_band=true`. Writing
  `(nir-red)/(nir+red)` returns **HTTP 400 "Invalid expression"**.
- **Band math works only on `earth-search` + Sentinel-2.**
  - Planetary Computer → **HTTP 409**: assets need a SAS token, and a public
    tiler cannot sign the per-asset URLs behind a STAC item.
  - Earth Search + Landsat → **AccessDenied**: Landsat COGs live in the USGS
    requester-pays bucket.
  - CDSE → assets are `s3://` URIs, not HTTP.
- **Landsat names its near-infrared band `nir08`.** `resolveAssets()` translates
  canonical Sentinel-2 names per collection.

Running your own tiler lifts the first two limits:

```bash
docker run -p 8000:8000 ghcr.io/developmentseed/titiler:latest
echo 'NEXT_PUBLIC_TITILER_URL=http://localhost:8000' >> .env
```

With AWS credentials for requester-pays, or a Planetary Computer signing proxy,
widen `TILER_READABLE_BACKENDS` in `src/stac/indices.ts`.

---

## 3. Plan it — overpass prediction

[`src/orbital/`](../src/orbital/)

```bash
curl "localhost:3000/api/orbital/overpass?lat=13.75&lon=100.5&imageableOnly=true"
```

SGP4 propagation of live CelesTrak elements, filtered by instrument swath and
solar illumination.

| Platform | Swath | Repeat | Notes |
|---|---|---|---|
| Sentinel-2A / 2B | 290 km | ~5 days combined | 10 m optical |
| Sentinel-1A | 250 km | ~12 days | **Radar** — images at night and through cloud |
| Landsat 8 / 9 | 185 km | 8 days combined | 30 m, 8 days out of phase |
| Terra / Aqua | 2330 km | Daily | MODIS, 250 m–1 km |
| Suomi NPP / NOAA-20 | 3060 km | Daily | VIIRS — the sensor behind FIRMS |

### How it was validated

Independent checks against documented orbital facts, not against a previous run
of this code:

- Great-circle distance: Bangkok→Singapore **1426 km** (known ~1430); 90° of
  equator **10008 km** (known 10007).
- ISS altitude **418–424 km** across predicted passes — correct for the ISS.
- Landsat 9 passes Bangkok at **10:38 local**, Sentinel-2 at **10:54** — both
  fly ~10:30 sun-synchronous descending nodes.
- Sentinel-1A passes at **06:22 and 18:09 local** — the dawn-dusk orbit SAR
  satellites use.
- Solar elevation: London at the June solstice, **61.9°** — exactly
  90 − 51.5 + 23.44.

### Why the default horizon is 10 days

Sentinel-2A alone repeats every 10 days. A 72-hour window routinely reports "no
passes" for a satellite that is working perfectly, so the default is 240 hours.
Wide-swath platforms fill the near term regardless.

### Illumination

Optical passes in darkness are excluded when `imageableOnly=true`; radar passes
are kept, because SAR provides its own illumination. The threshold is 15° solar
elevation — below that, atmospheric path length and shadow length degrade
surface reflectance badly.

---

## 4. Know where to look — the source registry

[`src/sources/`](../src/sources/) → [`docs/data-sources.md`](data-sources.md)

39 sources, each with a tier, the credentials it needs, a dated probe result,
usage instructions and the gotchas that cost time.

```bash
npm run probe          # keyless sources — must be all green
npm run probe:all      # include credentialed sources
npm run probe -- --json
curl localhost:3000/api/sources
```

---

## 5. Hand it to an agent — MCP server

[`mcp/server.mjs`](../mcp/server.mjs)

```bash
claude mcp add satellite -- node /abs/path/to/mcp/server.mjs
```

| Tool | Standalone? | Does |
|---|---|---|
| `search_imagery` | Yes | Finds scenes, returns previews and tile URLs |
| `spectral_index` | Yes | Computes an index with real pixel statistics |
| `next_overpass` | Needs `npm run dev` | Predicts imageable passes |
| `list_data_sources` | Needs `npm run dev` | Reads the curated registry |

Empty results are actionable rather than dead ends: asking for a clear scene
over Bangkok in monsoon season returns the clearest scene available in the past
year, plus the suggestion to switch to radar.

---

## Testing

```bash
npm test     # 47 tests, offline
npm run probe  # the network check
```

Tests cover solar geometry against closed-form values, great-circle distance
including the antimeridian, index-expression correctness (including that no
index uses asset names in its expression), and registry integrity — unique ids,
dated verification on every source, resolvable cross-references, and that
nothing non-previewable fails to explain why.
