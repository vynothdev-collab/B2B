import React from "react";

export function SkeletonBar({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`rounded bg-gray-200 ${className}`} style={style} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="h-11 w-11 shrink-0 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-24 rounded bg-gray-200" />
        <div className="h-5 w-14 rounded bg-gray-200" />
        <div className="h-2.5 w-32 rounded bg-gray-100" />
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
    <tr className="border-b border-slate-100 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          {i === 0 && withAvatar ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
              <div className="min-w-0 space-y-1.5">
                <div className="h-3 w-28 rounded bg-gray-200" />
                <div className="h-2 w-16 rounded bg-gray-100" />
              </div>
            </div>
          ) : (
            <div className={`h-3 rounded bg-gray-200 ${CELL_WIDTHS[i % CELL_WIDTHS.length]}`} />
          )}
        </td>
      ))}
    </tr>
  );
}
