"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Satellite } from "lucide-react";

interface Scene {
  id: string;
  collection?: string;
  datetime: string | null;
  cloudCover: number | null;
  platform: string | null;
  bbox: number[] | null;
  preview: { tileUrl: string; tileJsonUrl: string; assetHref: string } | null;
}

interface SearchResponse {
  backend: string;
  matched: number;
  returned: number;
  scenes: Scene[];
  error?: string;
}

interface Preset {
  label: string;
  bbox: string;
}

/** A few areas of interest to make the first click productive. */
const PRESETS: Preset[] = [
  { label: "Bangkok", bbox: "100.3,13.5,100.9,14.0" },
  { label: "Phuket", bbox: "98.2,7.7,98.5,8.2" },
  { label: "Chiang Mai", bbox: "98.8,18.6,99.1,18.9" },
  { label: "Singapore", bbox: "103.6,1.2,104.0,1.5" },
  { label: "Mekong Delta", bbox: "105.5,9.5,106.8,10.6" },
];

const BACKENDS = [
  { id: "earth-search", label: "Earth Search (AWS)" },
  { id: "planetary-computer", label: "Planetary Computer" },
  { id: "cdse", label: "Copernicus (ESA)" },
];

export default function ImageryExplorer() {
  const [bbox, setBbox] = useState(PRESETS[0].bbox);
  const [backend, setBackend] = useState(BACKENDS[0].id);
  const [maxCloud, setMaxCloud] = useState(30);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [selected, setSelected] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        bbox,
        backend,
        maxCloudCover: String(maxCloud),
        limit: "12",
      });
      const res = await fetch(`/api/stac/search?${params}`);
      const json = (await res.json()) as SearchResponse;
      if (!res.ok) throw new Error(json.error ?? `Search failed (${res.status})`);
      setResult(json);
      setSelected(json.scenes.find((s) => s.preview) ?? json.scenes[0] ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [bbox, backend, maxCloud]);

  // Search once on mount so the page is never empty.
  useEffect(() => {
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col gap-4">
      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="dashboard-panel flex flex-wrap items-end gap-3 rounded-lg p-4">
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Area of interest</span>
          <select
            value={bbox}
            onChange={(e) => setBbox(e.target.value)}
            className="rounded border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 text-sm"
          >
            {PRESETS.map((p) => (
              <option key={p.label} value={p.bbox}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow">Catalog</span>
          <select
            value={backend}
            onChange={(e) => setBackend(e.target.value)}
            className="rounded border border-[var(--line)] bg-[var(--bg-raised)] px-3 py-2 text-sm"
          >
            {BACKENDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow">Max cloud {maxCloud}%</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={maxCloud}
            onChange={(e) => setMaxCloud(Number(e.target.value))}
            className="w-40 accent-[var(--cool)]"
          />
        </label>

        <button
          onClick={() => void search()}
          disabled={loading}
          className="flex items-center gap-2 rounded bg-[var(--cool)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search scenes
        </button>
      </div>

      {error && (
        <p className="rounded border border-[var(--danger)] bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* ── Preview ────────────────────────────────────────────────── */}
        <div className="dashboard-panel-strong flex min-h-[420px] items-center justify-center overflow-hidden rounded-lg">
          {selected?.preview ? (
            <ScenePreviewImage scene={selected} />
          ) : (
            <p className="flex items-center gap-2 px-6 text-sm text-[var(--dim)]">
              <Satellite className="h-4 w-4" />
              {loading
                ? "Searching the catalog…"
                : result?.scenes.length
                  ? "This catalog publishes s3:// asset URIs, which a public tiler cannot read. Search Earth Search for previewable scenes."
                  : "No scenes matched — widen the cloud filter or try another catalog."}
            </p>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────────────── */}
        <div className="dashboard-panel flex max-h-[520px] flex-col overflow-hidden rounded-lg">
          <header className="border-b border-[var(--line)] px-4 py-3">
            <p className="eyebrow">Scenes</p>
            <p className="text-sm text-[var(--muted)]">
              {result
                ? `${result.returned} of ${result.matched} matching`
                : "—"}
            </p>
          </header>
          <ul className="no-scrollbar flex-1 overflow-y-auto">
            {result?.scenes.map((scene) => (
              <li key={scene.id}>
                <button
                  onClick={() => setSelected(scene)}
                  className={`w-full border-b border-[var(--line)] px-4 py-3 text-left text-xs transition ${
                    selected?.id === scene.id
                      ? "bg-[var(--cool-dim)]"
                      : "hover:bg-[var(--bg-raised)]"
                  }`}
                >
                  <span className="block font-medium text-[var(--ink)]">
                    {scene.datetime?.slice(0, 10) ?? "unknown date"}
                  </span>
                  <span className="block text-[var(--dim)]">
                    {scene.cloudCover !== null
                      ? `${scene.cloudCover}% cloud`
                      : "cloud n/a"}
                    {scene.platform ? ` · ${scene.platform}` : ""}
                    {scene.preview ? "" : " · no preview"}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[10px] text-[var(--dim)]">
                    {scene.id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * Renders a scene by asking the tiler for a single overview tile covering the
 * whole footprint — enough to prove the pipeline works without pulling in a
 * full map component.
 */
function ScenePreviewImage({ scene }: { scene: Scene }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset whenever the selected scene changes, so a previous scene's image is
  // never left on screen while a new one resolves.
  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [scene.id]);

  if (!scene.preview) return null;

  // TiTiler serves a whole-footprint render from /cog/preview.png — enough to
  // prove the pipeline without pulling in a full map component.
  const tilerBase = scene.preview.tileJsonUrl.split("/cog/")[0];
  const src =
    `${tilerBase}/cog/preview.png` +
    `?url=${encodeURIComponent(scene.preview.assetHref)}&max_size=1024`;

  if (failed) {
    return (
      <p className="px-6 text-sm text-[var(--dim)]">
        The tiler could not read this scene&apos;s asset.
      </p>
    );
  }

  return (
    <figure className="flex h-full w-full flex-col">
      <div className="relative flex flex-1 items-center justify-center">
        {!loaded && (
          <Loader2 className="absolute h-5 w-5 animate-spin text-[var(--dim)]" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={scene.id}
          src={src}
          alt={`Satellite scene ${scene.id}`}
          className={`h-full w-full object-contain transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </div>
      <figcaption className="border-t border-[var(--line)] px-4 py-2 font-mono text-[10px] text-[var(--dim)]">
        {scene.id} · {scene.datetime?.slice(0, 10)} ·{" "}
        {scene.cloudCover !== null ? `${scene.cloudCover}% cloud` : "cloud n/a"}
      </figcaption>
    </figure>
  );
}
