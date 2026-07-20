"use client";
import React from "react";
import { Settings } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  minWidth?: number;
  className?: string;
  visible?: boolean;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  minTableWidth?: number;

  selection?: {
    selected: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (all: boolean) => void;
  };

  onOpenColumnSettings?: () => void;

  actions?: {
    label?: string;
    render: (row: T) => React.ReactNode;
  };

  stickyLeftColumns?: number;

  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
}

const TH = "border-b border-gray-100 px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap";
const STICKY_TH_CHECKBOX = "sticky left-0 z-30 bg-gray-50 shadow-[1px_0_0_0_rgb(243,244,246)]";
const STICKY_TD_CHECKBOX = "sticky left-0 z-20 bg-[inherit] shadow-[1px_0_0_0_rgb(243,244,246)]";
const STICKY_TH_CONTENT = "sticky z-30 bg-gray-50 shadow-[1px_0_0_0_rgb(229,231,235)]";
const STICKY_TD_CONTENT = "sticky z-20 bg-[inherit] shadow-[1px_0_0_0_rgb(229,231,235)]";

export function Cell({
  children,
  className = "",
  overflowVisible = false,
}: {
  children: React.ReactNode;
  className?: string;
  overflowVisible?: boolean;
}) {
  return (
    <td className={`px-4 py-0 align-middle ${className}`}>
      <div className={`flex h-[64px] items-center ${overflowVisible ? "overflow-visible" : "overflow-hidden"}`}>
        {children}
      </div>
    </td>
  );
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  minTableWidth = 640,
  selection,
  onOpenColumnSettings,
  actions,
  stickyLeftColumns = 1,
  loading = false,
  loadingRows = 8,
  emptyMessage = "No records",
}: DataTableProps<T>) {
  const visibleCols = columns.filter((c) => c.visible !== false);
  const allSelected =
    !!selection && data.length > 0 && data.every((r) => selection.selected.has(rowKey(r)));

  // Sticky-left offsets: checkbox is 36px (w-9). Then each sticky content col adds its minWidth.
  const checkboxOffset = selection ? 36 : 0;
  const stickyOffsets: number[] = [];
  {
    let acc = checkboxOffset;
    for (let i = 0; i < stickyLeftColumns && i < visibleCols.length; i++) {
      stickyOffsets.push(acc);
      acc += visibleCols[i].minWidth ?? 200;
    }
  }

  return (
    <div className="relative max-w-full">
      {onOpenColumnSettings && (
        <button
          type="button"
          onClick={onOpenColumnSettings}
          title="Column settings"
          className="absolute right-2 top-1.5 z-40 flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="max-w-full overflow-x-auto">
        <table
          className="w-full border-separate border-spacing-0 text-xs"
          style={{ minWidth: `${minTableWidth}px` }}
        >
          <thead>
            <tr className="bg-gray-50">
              {selection && (
                <th className={`w-9 border-b border-gray-100 px-3 py-2.5 ${STICKY_TH_CHECKBOX}`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => selection.onSelectAll(e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-red-600"
                  />
                </th>
              )}
              {visibleCols.map((col, idx) => {
                const isSticky = idx < stickyLeftColumns;
                const stickyClass = isSticky ? STICKY_TH_CONTENT : "";
                const style: React.CSSProperties = {};
                if (col.minWidth) style.minWidth = `${col.minWidth}px`;
                if (isSticky) style.left = `${stickyOffsets[idx]}px`;
                return (
                  <th
                    key={col.key}
                    className={`${TH} ${col.className ?? ""} ${stickyClass}`}
                    style={style}
                  >
                    {col.label}
                  </th>
                );
              })}
              {actions && <th className={TH}>{actions.label ?? "Actions"}</th>}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`sk-${i}`} className="animate-pulse bg-white">
                  {selection && (
                    <td className={`px-3 py-2.5 ${STICKY_TD_CHECKBOX}`}>
                      <div className="mx-auto h-3.5 w-3.5 rounded bg-gray-200" />
                    </td>
                  )}
                  {visibleCols.map((col, idx) => {
                    const isSticky = idx < stickyLeftColumns;
                    const stickyClass = isSticky ? STICKY_TD_CONTENT : "";
                    return (
                      <td
                        key={col.key}
                        className={`px-3 py-2.5 ${stickyClass}`}
                        style={isSticky ? { left: `${stickyOffsets[idx]}px` } : undefined}
                      >
                        <div className="h-3 w-24 rounded bg-gray-200" />
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-3 py-2.5">
                      <div className="h-5 w-5 rounded bg-gray-200" />
                    </td>
                  )}
                </tr>
              ))}

            {!loading &&
              data.map((row) => {
                const id = rowKey(row);
                const checked = !!selection?.selected.has(id);
                return (
                  <tr
                    key={id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50/60 ${
                      checked ? "bg-red-50/40" : "bg-white"
                    }`}
                  >
                    {selection && (
                      <Cell className={STICKY_TD_CHECKBOX}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => selection.onSelect(id)}
                          className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-red-600"
                        />
                      </Cell>
                    )}
                    {visibleCols.map((col, idx) => {
                      const isSticky = idx < stickyLeftColumns;
                      const stickyClass = isSticky ? STICKY_TD_CONTENT : "";
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-0 align-middle ${col.className ?? ""} ${stickyClass}`}
                          style={isSticky ? { left: `${stickyOffsets[idx]}px` } : undefined}
                        >
                          <div className="flex h-[64px] items-center overflow-hidden">
                            {col.render(row)}
                          </div>
                        </td>
                      );
                    })}
                    {actions && (
                      <td className="px-4 py-0 align-middle">
                        <div className="flex h-[64px] items-center overflow-visible">
                          {actions.render(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={99}
                  className="px-4 py-16 text-center text-[13px] text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
