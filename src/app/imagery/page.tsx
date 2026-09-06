import ImageryExplorer from "../../components/ImageryExplorer";

export const metadata = {
  title: "Imagery Explorer — DrNon Satellite Toolkit",
  description:
    "Search Sentinel-2 and Landsat scenes via STAC and preview them with no API key.",
};

export default function ImageryPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="eyebrow">Earth Observation</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Imagery Explorer
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Live STAC search across Earth Search, Planetary Computer and
          Copernicus, previewed through a dynamic COG tiler. Everything on this
          page works with no API key — the imagery is fetched from public
          archives at request time.
        </p>
      </header>
      <ImageryExplorer />
    </main>
  );
}
