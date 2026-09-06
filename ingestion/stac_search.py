"""
STAC scene search — the Python entry point to this toolkit's imagery stack.

Mirrors what `src/stac/client.ts` does in the Next.js app, so a scene you find
in the dashboard is the same scene you get here.

Usage:
    python stac_search.py --bbox 100.3 13.5 100.9 14.0 --days 60
    python stac_search.py --aoi bangkok --max-cloud 10 --backend planetary-computer
    python stac_search.py --aoi phuket --download-preview out/

No API key is required for any backend. Verified 2026-09-06.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

# ── Backends ──────────────────────────────────────────────────────────────
# Mirrors src/stac/backends.ts. Keep the two in sync when adding a backend.

BACKENDS: dict[str, dict] = {
    "earth-search": {
        "url": "https://earth-search.aws.element84.com/v1",
        "sentinel2": "sentinel-2-l2a",
        "landsat": "landsat-c2-l2",
        "needs_signing": False,
    },
    "planetary-computer": {
        "url": "https://planetarycomputer.microsoft.com/api/stac/v1",
        "sentinel2": "sentinel-2-l2a",
        "landsat": "landsat-c2-l2",
        "needs_signing": True,
    },
    "cdse": {
        "url": "https://stac.dataspace.copernicus.eu/v1",
        "sentinel2": "sentinel-2-l2a",
        "landsat": None,
        "needs_signing": True,
    },
}

# ── Areas of interest ─────────────────────────────────────────────────────
# west, south, east, north (WGS84)

AOIS: dict[str, tuple[float, float, float, float]] = {
    "bangkok": (100.3, 13.5, 100.9, 14.0),
    "phuket": (98.2, 7.7, 98.5, 8.2),
    "chiang-mai": (98.8, 18.6, 99.1, 18.9),
    "singapore": (103.6, 1.2, 104.0, 1.5),
    "mekong-delta": (105.5, 9.5, 106.8, 10.6),
    "haze-corridor": (97.0, 14.0, 105.0, 21.0),
}

TITILER = "https://titiler.xyz"
RGB_ASSET_KEYS = ("visual", "rendered_preview", "TCI")


@dataclass
class Scene:
    """A search hit, flattened to what a pipeline actually needs."""

    id: str
    datetime: str
    cloud_cover: float | None
    platform: str | None
    visual_href: str | None

    def preview_url(self, max_size: int = 1024) -> str | None:
        """Whole-footprint PNG via the dynamic tiler. No download required."""
        if not self.visual_href:
            return None
        return (
            f"{TITILER}/cog/preview.png"
            f"?url={quote(self.visual_href, safe='')}&max_size={max_size}"
        )

    def tile_url(self) -> str | None:
        """XYZ template for slippy maps (deck.gl, MapLibre, leafmap)."""
        if not self.visual_href:
            return None
        return (
            f"{TITILER}/cog/tiles/WebMercatorQuad/{{z}}/{{x}}/{{y}}.png"
            f"?url={quote(self.visual_href, safe='')}"
        )


def find_visual_href(item) -> str | None:
    """Pick a directly viewable RGB composite from an item's assets."""
    for key in RGB_ASSET_KEYS:
        asset = item.assets.get(key)
        if asset is not None:
            return asset.href
    for asset in item.assets.values():
        roles = asset.roles or []
        if "visual" in roles or "overview" in roles:
            return asset.href
    return None


def search(
    bbox: tuple[float, float, float, float],
    *,
    backend: str = "earth-search",
    days: int = 60,
    max_cloud: float = 30.0,
    limit: int = 10,
    collection: str | None = None,
) -> list[Scene]:
    """Search a STAC API and return scenes newest-first."""
    try:
        from pystac_client import Client
    except ImportError:  # pragma: no cover
        sys.exit(
            "pystac-client is not installed.\n"
            "  pip install -r ingestion/requirements.txt"
        )

    if backend not in BACKENDS:
        sys.exit(f"Unknown backend '{backend}'. Choose from: {', '.join(BACKENDS)}")

    config = BACKENDS[backend]
    collection = collection or config["sentinel2"]

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)

    client = Client.open(config["url"])
    result = client.search(
        collections=[collection],
        bbox=list(bbox),
        datetime=f"{start.isoformat()}/{end.isoformat()}",
        query={"eo:cloud_cover": {"lt": max_cloud}},
        max_items=limit,
    )

    scenes: list[Scene] = []
    for item in result.items():
        # Planetary Computer assets live behind a SAS token. Signing is free
        # and unauthenticated, but unsigned hrefs return 404.
        if config["needs_signing"]:
            try:
                import planetary_computer

                item = planetary_computer.sign(item)
            except ImportError:
                pass

        scenes.append(
            Scene(
                id=item.id,
                datetime=str(item.datetime),
                cloud_cover=item.properties.get("eo:cloud_cover"),
                platform=item.properties.get("platform"),
                visual_href=find_visual_href(item),
            )
        )

    scenes.sort(key=lambda s: s.datetime, reverse=True)
    return scenes


def download_previews(scenes: list[Scene], out_dir: Path) -> int:
    """Save a PNG preview per scene. Handy for eyeballing a time series."""
    import requests

    out_dir.mkdir(parents=True, exist_ok=True)
    saved = 0
    for scene in scenes:
        url = scene.preview_url()
        if not url:
            print(f"  skip {scene.id}: no viewable asset")
            continue
        response = requests.get(url, timeout=120)
        if not response.ok:
            print(f"  skip {scene.id}: tiler returned {response.status_code}")
            continue
        path = out_dir / f"{scene.id}.png"
        path.write_bytes(response.content)
        print(f"  saved {path} ({len(response.content) // 1024} KB)")
        saved += 1
    return saved


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Search public STAC catalogs for satellite imagery.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"Named areas: {', '.join(AOIS)}",
    )
    location = parser.add_mutually_exclusive_group()
    location.add_argument(
        "--bbox",
        nargs=4,
        type=float,
        metavar=("W", "S", "E", "N"),
        help="Bounding box in WGS84 degrees",
    )
    location.add_argument("--aoi", choices=sorted(AOIS), help="Named area of interest")
    parser.add_argument(
        "--backend", choices=sorted(BACKENDS), default="earth-search"
    )
    parser.add_argument("--collection", help="Override the collection id")
    parser.add_argument("--days", type=int, default=60, help="Look-back window")
    parser.add_argument("--max-cloud", type=float, default=30.0)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument(
        "--download-preview",
        metavar="DIR",
        help="Save a PNG preview per scene into DIR",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()

    if args.bbox:
        bbox = tuple(args.bbox)  # type: ignore[assignment]
        label = "custom bbox"
    else:
        aoi = args.aoi or "bangkok"
        bbox = AOIS[aoi]
        label = aoi

    print(
        f"\n  Searching {args.backend} over {label} "
        f"({args.days}d, <{args.max_cloud}% cloud)…\n"
    )

    scenes = search(
        bbox,
        backend=args.backend,
        days=args.days,
        max_cloud=args.max_cloud,
        limit=args.limit,
        collection=args.collection,
    )

    if not scenes:
        print("  No scenes matched. Try a wider --days or higher --max-cloud.\n")
        return

    for scene in scenes:
        cloud = f"{scene.cloud_cover:.1f}%" if scene.cloud_cover is not None else "n/a"
        print(f"  {scene.datetime[:10]}  cloud={cloud:<7} {scene.id}")

    print(f"\n  {len(scenes)} scenes.")
    preview = scenes[0].preview_url()
    if preview:
        print(f"  Preview the newest: {preview}\n")

    if args.download_preview:
        print(f"  Downloading previews to {args.download_preview}/ …")
        count = download_previews(scenes, Path(args.download_preview))
        print(f"  {count} previews saved.\n")


if __name__ == "__main__":
    main()
