/**
 * Satellite Source Health Indicator
 *
 * Displays multinational space agency source indicators.
 * Shows 8 agencies: NASA, JAXA, ESA, ISRO, ROSCOSMOS, CNSA, UKSA, KARI.
 *
 * In a live dashboard this component fetches health status from
 * /api/copernicus/preview and /api/sources. Here it renders
 * the static agency grid as a reference implementation.
 */

"use client";

import { useEffect, useState } from "react";
import type { CopernicusPreviewResponse } from "../types/satellite";

const SPACE_AGENCIES = [
  { flag: "US", name: "NASA" },
  { flag: "JP", name: "JAXA" },
  { flag: "EU", name: "ESA" },
  { flag: "IN", name: "ISRO" },
  { flag: "RU", name: "ROSCO" },
  { flag: "CN", name: "CNSA" },
  { flag: "UK", name: "UKSA" },
  { flag: "KR", name: "KARI" },
] as const;

const fallbackPreview: CopernicusPreviewResponse = {
  updatedAt: new Date().toISOString(),
  focusDate: "2024-03-01",
  imagerySources: [
    {
      id: "viirsTrueColor",
      label: "VIIRS True Color",
      description: "Broad true-color composite for fast regional situational review.",
    },
    {
      id: "modisFalseColor",
      label: "MODIS False Color",
      description: "False-color land and burn-scar view with terrain and vegetation contrast.",
    },
    {
      id: "blueMarble",
      label: "Blue Marble Relief",
      description: "Shaded relief base for terrain-first orientation.",
    },
  ],
};

export default function SourceStack() {
  const [preview, setPreview] = useState<CopernicusPreviewResponse>(fallbackPreview);

  useEffect(() => {
    // In production, fetch from your API endpoint:
    // fetch("/api/copernicus/preview").then(r => r.json()).then(setPreview)
    setPreview(fallbackPreview);
  }, []);

  return (
    <div className="flex flex-col gap-2 select-none overflow-hidden">
      {/* Imagery Sources */}
      <div className="space-y-1">
        {preview.imagerySources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between gap-1 border px-2 py-1 bg-white"
          >
            <span className="text-xs font-bold truncate">{source.label}</span>
            <span className="text-xs text-green-600 shrink-0">OK</span>
          </div>
        ))}
      </div>

      {/* Multi-national source indicators */}
      <div className="grid grid-cols-4 gap-1">
        {SPACE_AGENCIES.map((src) => (
          <div
            key={src.flag}
            className="flex flex-col items-center py-1 border bg-gray-50"
          >
            <span className="text-xs font-black opacity-50">{src.flag}</span>
            <span className="text-[10px] font-bold opacity-30 uppercase">
              {src.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
