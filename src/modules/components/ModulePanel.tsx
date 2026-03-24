"use client";

import { useModuleData } from "../hooks/useModuleData";

interface ModulePanelProps {
  moduleId: string;
}

export default function ModulePanel({ moduleId }: ModulePanelProps) {
  const { data, loading, error, tier, meta } = useModuleData(moduleId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-4 text-xs" style={{ color: "var(--dim)" }}>
        <span className="inline-block h-3 w-3 animate-pulse" style={{ background: "var(--line-bright)" }} />
        Loading {meta?.label ?? moduleId}…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-4 text-xs" style={{ color: "var(--danger)" }}>
        {meta?.label ?? moduleId}: {error}
      </div>
    );
  }

  if (!data || !meta) {
    return (
      <div className="px-3 py-4 text-xs" style={{ color: "var(--dim)" }}>
        No data for {moduleId}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          {meta.label}
        </span>
        {tier === "mock" && (
          <span
            className="text-[9px] px-1.5 py-0.5 font-medium uppercase tracking-wider"
            style={{ background: "var(--cool-dim)", color: "var(--cool)" }}
          >
            Mock
          </span>
        )}
      </div>

      {/* Content by uiType */}
      {meta.uiType === "table" && <TableView data={data} columns={meta.tableColumns} />}
      {meta.uiType === "feed" && <FeedView data={data} />}
      {meta.uiType === "stat-card" && <StatCardView data={data} />}
      {meta.uiType === "chart" && <ChartPlaceholder label={meta.label} />}
      {meta.uiType === "ticker" && <FeedView data={data} />}
    </div>
  );
}

// ── Table renderer ──────────────────────────────────────────────────────────

function TableView({
  data,
  columns,
}: {
  data: unknown;
  columns?: { key: string; label: string }[];
}) {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) return <EmptyState />;

  const cols =
    columns ??
    Object.keys(rows[0] as Record<string, unknown>)
      .slice(0, 5)
      .map((key) => ({ key, label: key }));

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[260px]">
      <table className="w-full text-[11px]" style={{ color: "var(--ink)" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)" }}>
            {cols.map((col) => (
              <th
                key={col.key}
                className="px-3 py-1.5 text-left font-medium uppercase tracking-wider"
                style={{ color: "var(--dim)", fontSize: "9px" }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid var(--line)" }}
              className="hover:bg-black/[0.02]"
            >
              {cols.map((col) => (
                <td key={col.key} className="px-3 py-1.5 truncate max-w-[180px]">
                  {formatCell((row as Record<string, unknown>)[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <div className="px-3 py-1 text-[10px]" style={{ color: "var(--dim)" }}>
          Showing 50 of {rows.length}
        </div>
      )}
    </div>
  );
}

// ── Feed renderer ───────────────────────────────────────────────────────────

function FeedView({ data }: { data: unknown }) {
  const items = Array.isArray(data) ? data : [];
  if (items.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-0 overflow-y-auto max-h-[260px]">
      {items.slice(0, 30).map((item, i) => {
        const record = item as Record<string, unknown>;
        const title =
          (record.title as string) ??
          (record.label as string) ??
          (record.event_type as string) ??
          (record.keyword as string) ??
          `Item ${i + 1}`;
        const subtitle =
          (record.notes as string) ??
          (record.description as string) ??
          (record.summary as string) ??
          (record.location as string) ??
          "";
        const date =
          (record.event_date as string) ??
          (record.seendate as string) ??
          (record.datetime as string) ??
          (record.timestamp as string) ??
          "";

        return (
          <div
            key={i}
            className="px-3 py-2"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <div className="text-[11px] font-medium leading-tight truncate" style={{ color: "var(--ink)" }}>
              {title}
            </div>
            {subtitle && (
              <div className="text-[10px] mt-0.5 line-clamp-2" style={{ color: "var(--muted)" }}>
                {subtitle}
              </div>
            )}
            {date && (
              <div className="text-[9px] mt-0.5" style={{ color: "var(--dim)" }}>
                {date}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Stat card renderer ──────────────────────────────────────────────────────

function StatCardView({ data }: { data: unknown }) {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    const entries = Object.entries(record).slice(0, 6);
    return (
      <div className="grid grid-cols-2 gap-2 px-3 py-2">
        {entries.map(([key, val]) => (
          <div key={key}>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: "var(--dim)" }}>
              {key}
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              {formatCell(val)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <FeedView data={data} />;
}

// ── Chart placeholder ───────────────────────────────────────────────────────

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-[11px]" style={{ color: "var(--dim)" }}>
      Chart: {label}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="px-3 py-4 text-[11px]" style={{ color: "var(--dim)" }}>
      No data available
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
