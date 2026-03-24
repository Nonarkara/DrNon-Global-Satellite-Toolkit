"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ModuleCatalogResponse, ModuleCategory, ModuleMetadata } from "../../types/modules";
import { MODULE_CATEGORY_LABELS } from "../../types/modules";

const STORAGE_KEY = "satellite-toolkit-enabled-modules";

interface ModuleSelectorProps {
  onClose: () => void;
  onEnabledChange?: (ids: string[]) => void;
}

function loadEnabledIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as string[];
  } catch { /* empty */ }
  return [];
}

function saveEnabledIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* empty */ }
}

export function getEnabledModuleIds(): string[] {
  return loadEnabledIds();
}

export default function ModuleSelector({ onClose, onEnabledChange }: ModuleSelectorProps) {
  const [modules, setModules] = useState<ModuleMetadata[]>([]);
  const [enabledIds, setEnabledIds] = useState<string[]>(loadEnabledIds);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/modules/catalog")
      .then((res) => res.json())
      .then((json: ModuleCatalogResponse) => {
        setModules(json.modules ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setEnabledIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        saveEnabledIds(next);
        onEnabledChange?.(next);
        return next;
      });
    },
    [onEnabledChange],
  );

  // Group modules by category
  const grouped = modules.reduce(
    (acc, mod) => {
      const cat = mod.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(mod);
      return acc;
    },
    {} as Record<ModuleCategory, ModuleMetadata[]>,
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      style={{ background: "rgba(0,0,0,0.25)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-[380px] max-w-[90vw] h-full overflow-y-auto"
        style={{
          background: "var(--panel-strong)",
          borderLeft: "1px solid var(--line)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
          style={{
            background: "var(--panel-strong)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              Global Satellite Toolkit
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--dim)" }}>
              {enabledIds.length} module{enabledIds.length !== 1 ? "s" : ""} active
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {loading && (
          <div className="px-4 py-8 text-center text-[11px]" style={{ color: "var(--dim)" }}>
            Loading modules…
          </div>
        )}

        {/* Categories */}
        {Object.entries(grouped).map(([category, mods]) => (
          <div key={category}>
            <div
              className="px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] sticky top-[52px] z-[5]"
              style={{
                color: "var(--cool)",
                background: "var(--bg-raised)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {MODULE_CATEGORY_LABELS[category as ModuleCategory] ?? category}
            </div>

            {mods.map((mod) => {
              const isEnabled = enabledIds.includes(mod.id);
              const notConfigured =
                mod.requiredEnvVars &&
                mod.requiredEnvVars.length > 0 &&
                !mod.configured;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    if (!notConfigured) toggle(mod.id);
                  }}
                  disabled={!!notConfigured}
                  className="w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors hover:bg-black/[0.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderBottom: "1px solid var(--line)" }}
                >
                  {/* Toggle indicator */}
                  <div
                    className="mt-0.5 w-3 h-3 shrink-0 flex items-center justify-center"
                    style={{
                      border: `1.5px solid ${isEnabled ? "var(--cool)" : "var(--line-bright)"}`,
                      background: isEnabled ? "var(--cool)" : "transparent",
                    }}
                  >
                    {isEnabled && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.2" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium" style={{ color: "var(--ink)" }}>
                        {mod.label}
                      </span>
                      {mod.pollInterval > 0 && (
                        <span className="text-[9px]" style={{ color: "var(--dim)" }}>
                          {mod.pollInterval < 60
                            ? `${mod.pollInterval}s`
                            : `${Math.round(mod.pollInterval / 60)}m`}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] mt-0.5 line-clamp-2" style={{ color: "var(--muted)" }}>
                      {mod.description}
                    </div>
                    {notConfigured && (
                      <div className="text-[9px] mt-1 font-medium" style={{ color: "var(--danger)" }}>
                        API key needed: {mod.requiredEnvVars?.join(", ")}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {!loading && modules.length === 0 && (
          <div className="px-4 py-8 text-center text-[11px]" style={{ color: "var(--dim)" }}>
            No modules available
          </div>
        )}
      </div>
    </div>
  );
}
