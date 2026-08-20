import React from "react";

function Bar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded skeleton-shimmer ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function SkeletonBar({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <Bar className={className} style={style} />;
}

export function StatCardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4"
      aria-hidden="true"
    >
      <div className="h-10 w-10 shrink-0 rounded-full skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <Bar className="h-2.5 w-24" />
        <Bar className="h-6 w-14" />
        <Bar className="h-2 w-32" style={{ opacity: 0.6 }} />
      </div>
    </div>
  );
}

const CELL_WIDTHS = ["w-24", "w-20", "w-16", "w-28", "w-14", "w-20", "w-12", "w-16", "w-14"];

export function TableRowSkeleton({
  columns,
  withAvatar = true,
}: {
  columns: number;
  withAvatar?: boolean;
}) {
  return (
    <tr className="border-b border-slate-100" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          {i === 0 && withAvatar ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full skeleton-shimmer" />
              <div className="min-w-0 space-y-1.5">
                <Bar className="h-3 w-28" />
                <Bar className="h-2 w-16" style={{ opacity: 0.6 }} />
              </div>
            </div>
          ) : (
            <Bar className={`h-3 ${CELL_WIDTHS[i % CELL_WIDTHS.length]}`} />
          )}
        </td>
      ))}
    </tr>
  );
}

export function SettingsRowSkeleton({ control = "input" }: { control?: "input" | "toggle" }) {
  return (
    <div className="flex items-center justify-between px-6 py-5" aria-hidden="true">
      <div className="flex-1 max-w-sm space-y-2">
        <Bar className="h-3 w-36" />
        <Bar className="h-2.5 w-56" style={{ opacity: 0.6 }} />
      </div>
      {control === "toggle" ? (
        <div className="h-6 w-11 shrink-0 rounded-full skeleton-shimmer" />
      ) : (
        <Bar className="h-9 w-64 rounded-lg" />
      )}
    </div>
  );
}

export function PlanTableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100" aria-hidden="true">
      {/* Plan Name */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-lg skeleton-shimmer" />
          <div className="space-y-1.5">
            <Bar className="h-3 w-32" />
            <Bar className="h-2 w-20" style={{ opacity: 0.55 }} />
          </div>
        </div>
      </td>
      {/* Type badge */}
      <td className="px-5 py-3.5">
        <Bar className="h-5 w-16 rounded-full" />
      </td>
      {/* Credits */}
      <td className="px-5 py-3.5">
        <Bar className="h-3 w-10" />
      </td>
      {/* Validity */}
      <td className="px-5 py-3.5">
        <Bar className="h-3 w-14" />
      </td>
      {/* Price */}
      <td className="px-5 py-3.5">
        <Bar className="h-3.5 w-12" />
      </td>
      {/* Status badge */}
      <td className="px-5 py-3.5">
        <Bar className="h-5 w-16 rounded-full" />
      </td>
      {/* Actions */}
      <td className="px-4 py-3.5">
        <Bar className="h-6 w-6 rounded-md" />
      </td>
    </tr>
  );
}
