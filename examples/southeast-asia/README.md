# Example: Southeast Asia Regional

A multi-country, multi-AOI configuration for regional monitoring across the Mekong subregion, mainland Southeast Asia, and adjacent Pacific island states. This is the template that powers the regional situational awareness deployments in Dr Non's smart-city practice.

## What it does

A single dashboard that can switch between **11 country AOIs** (10 ASEAN + Pacific subregion) plus 5 **thematic overlays**:

- **Country view** — pick a country, see everything happening in it
- **Mekong view** — country + subregion (Mekong delta, Lancang upstream)
- **Haze corridor** — Indonesia / Malaysia / Singapore / Thailand (trans-boundary haze)
- **Typhoon belt** — Philippines / Vietnam / Hainan / Taiwan (Pacific typhoon track)
- **Pacific islands** — Pacific Island Countries (PICs) and territories

Modules are region-aware: switching AOI re-queries the data sources with the new bbox.

## Files

```
examples/southeast-asia/
├── README.md
├── aoi/
│   ├── index.ts             # exports all AOIs + a country picker
│   ├── thailand.ts
│   ├── vietnam.ts
│   ├── cambodia.ts
│   ├── laos.ts
│   ├── myanmar.ts
│   ├── malaysia.ts
│   ├── indonesia.ts
│   ├── philippines.ts
│   ├── singapore.ts
│   ├── brunei.ts
│   ├── timor-leste.ts
│   ├── mekong.ts
│   ├── haze-corridor.ts
│   ├── typhoon-belt.ts
│   └── pacific.ts
├── page.tsx                 # drop-in page with AOI selector
└── registry.ts              # all 30 modules — full set
```

## How to use

```bash
cp -r examples/southeast-asia/aoi       src/data/aoi/
cp examples/southeast-asia/page.tsx     src/app/page.tsx
cp examples/southeast-asia/registry.ts  src/modules/registry.ts
npm install
npm run dev
```

You'll get a country picker in the top bar. Selecting a country re-bounds the map, re-queries every module, and re-fits the AOI on the dashboard.

## AOIs

| AOI | bbox (minLon, minLat, maxLon, maxLat) | Notes |
|---|---|---|
| Thailand | 97.0, 5.5, 105.5, 20.5 | 77 provinces, 5 regions |
| Vietnam | 102.0, 8.5, 110.0, 23.5 | North–Central–South splits |
| Cambodia | 102.0, 10.0, 108.0, 15.0 | 25 provinces |
| Laos | 100.0, 13.5, 108.0, 22.5 | Landlocked, Mekong upstream |
| Myanmar | 92.0, 9.0, 101.5, 28.5 | Includes Rakhine / Shan |
| Malaysia | 99.0, 0.5, 119.5, 7.5 | Peninsula + Borneo |
| Indonesia | 95.0, -11.0, 141.0, 6.0 | 17k islands, multiple bboxes |
| Philippines | 117.0, 4.5, 127.0, 21.0 | 7k islands, typhoon belt |
| Singapore | 103.6, 1.2, 104.0, 1.5 | City-state |
| Brunei | 114.0, 4.0, 115.5, 5.5 | Small but oil-rich |
| Timor-Leste | 124.0, -9.5, 127.5, -8.0 | Newest ASEAN state |
| Mekong (regional) | 95.0, 5.5, 110.0, 28.0 | Trans-boundary river system |
| Haze corridor | 95.0, -5.0, 110.0, 8.0 | Ind/Mly/Sin/Thai haze |
| Typhoon belt | 110.0, 4.0, 130.0, 25.0 | W. Pacific typhoon track |
| Pacific (PICs) | 130.0, -25.0, 180.0, 15.0 | Pacific Island Countries |

## Policy / regional angle

This configuration is designed to support common regional use cases:

- **Flood early warning** — Mekong-level flood forecasting (Lancang upstream → Mekong delta)
- **Haze / air quality** — annual June–October haze across the corridor (Indonesia fires → Mly/Sin/Thai PM2.5)
- **Typhoon preparedness** — W. Pacific typhoon tracks (Philippines, Vietnam, Hainan, Taiwan)
- **Maritime surveillance** — South China Sea, Malacca Strait, Sunda Strait
- **Agricultural monitoring** — rice bowl (Vietnam Mekong delta, Thailand Central Plains, Myanmar Irrawaddy)
- **Coastal erosion / sea-level rise** — Mekong delta, Bangkok, Jakarta, Manila, Pacific atolls
- **Coral reef & fisheries** — Coral Triangle (Indonesia, Philippines, Malaysia, Timor-Leste, PNG, Solomon Islands)

For policy briefs on each, see [`docs/policy-briefs/`](../../docs/policy-briefs/) (planned).

## Attribution

This AOI catalog was compiled by **Dr Non Arkaraprasertkul** through official sources: UN Statistics Division, FAO GAUL, national mapping agencies (Royal Thai Survey Dept, Vientiane GeoDept, etc.), and the ASEAN Statistical Yearbook. Country bbox values are approximate — for legal or operational use, cross-check with the official gazetteer.
