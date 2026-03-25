"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, X } from "lucide-react";
import type {
  ModuleCatalogResponse,
  ModuleCategory,
} from "../types/modules";
import { MODULE_CATEGORY_LABELS } from "../types/modules";
import ModuleRail from "../modules/components/ModuleRail";
import ModuleSelector from "../modules/components/ModuleSelector";

const STORAGE_KEY = "satellite-toolkit-enabled-modules";

export default function Home() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [catalog, setCatalog] = useState<ModuleCatalogResponse | null>(null);
  const [enabledCount, setEnabledCount] = useState(0);

  useEffect(() => {
    fetch("/api/modules/catalog")
      .then((r) => r.json())
      .then((d) => setCatalog(d))
      .catch(() => {});
  }, []);

  // Track enabled module count
  useEffect(() => {
    const sync = () => {
      try {
        const ids = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]",
        ) as string[];
        setEnabledCount(ids.length);
      } catch {
        setEnabledCount(0);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  // Count modules per category
  const categoryCounts: Partial<Record<ModuleCategory, number>> = {};
  if (catalog) {
    for (const mod of catalog.modules) {
      categoryCounts[mod.category] =
        (categoryCounts[mod.category] ?? 0) + 1;
    }
  }

  const totalModules = catalog?.modules.length ?? 0;

  return (
    <main className="relative flex h-[100dvh] w-screen flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="dashboard-panel flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-sm"
            style={{ background: "var(--cool)", color: "#fff" }}
          >
            <Layers size={16} />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              DrNon Global Satellite Toolkit
            </h1>
            <p className="text-[10px] tracking-wide" style={{ color: "var(--dim)" }}>
              {totalModules} modules &middot; {enabledCount} enabled
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectorOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wide"
          style={{
            background: "var(--cool-dim)",
            color: "var(--cool)",
            border: "1px solid rgba(15, 111, 136, 0.2)",
          }}
        >
          <Layers size={13} />
          Modules
        </button>
      </header>

      {/* ── Content ── */}
      <section className="flex flex-1 flex-col items-center justify-center overflow-auto px-6">
        {enabledCount === 0 ? (
          <WelcomeScreen
            totalModules={totalModules}
            categoryCounts={categoryCounts}
            onOpenSelector={() => setSelectorOpen(true)}
          />
        ) : (
          <div className="w-full max-w-4xl py-8">
            <p
              className="eyebrow mb-4"
              style={{ color: "var(--dim)" }}
            >
              {enabledCount} module{enabledCount !== 1 ? "s" : ""} active
              &mdash; switch tabs below or{" "}
              <button
                onClick={() => setSelectorOpen(true)}
                className="underline"
                style={{ color: "var(--cool)" }}
              >
                add more
              </button>
            </p>
          </div>
        )}
      </section>

      {/* ── Module Rail (bottom tabs + panel) ── */}
      <ModuleRail />

      {/* ── Module Selector drawer ── */}
      {selectorOpen && (
        <ModuleSelector onClose={() => setSelectorOpen(false)} />
      )}
    </main>
  );
}

/* ── Welcome Screen ── */

function WelcomeScreen({
  totalModules,
  categoryCounts,
  onOpenSelector,
}: {
  totalModules: number;
  categoryCounts: Partial<Record<ModuleCategory, number>>;
  onOpenSelector: () => void;
}) {
  const categories = Object.entries(categoryCounts) as [
    ModuleCategory,
    number,
  ][];

  return (
    <div className="max-w-lg text-center">
      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm"
        style={{ background: "var(--cool-dim)" }}
      >
        <Layers size={28} style={{ color: "var(--cool)" }} />
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Global Satellite Toolkit
      </h2>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        {totalModules} data-source modules across {categories.length} categories.
        <br />
        All modules work immediately with mock data &mdash; no API keys needed to
        start.
      </p>

      <button
        onClick={onOpenSelector}
        className="mb-8 px-5 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--cool)" }}
      >
        Enable Modules
      </button>

      <div className="text-left">
        {categories.map(([cat, count]) => (
          <div
            key={cat}
            className="flex items-center justify-between border-t py-2 text-xs"
            style={{ borderColor: "var(--line)" }}
          >
            <span style={{ color: "var(--muted)" }}>
              {MODULE_CATEGORY_LABELS[cat] ?? cat}
            </span>
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--dim)" }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
