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

const TH = "border-b border-gray-200 bg-white px-4 py-3.5 text-left text-sm font-bold text-gray-900 whitespace-nowrap";
const STICKY_TH_CONTENT = "sticky z-30 bg-white border-r border-gray-200";
const STICKY_TD_CONTENT = "sticky z-20 border-r border-gray-200";

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      className={`
        group relative flex h-4 w-4 shrink-0 items-center justify-center rounded
        border transition-all duration-150
        ${checked || indeterminate
          ? "border-red-500 bg-red-500"
          : "border-gray-300 bg-white hover:border-red-400 hover:bg-red-50"
        }
      `}
    >
      {checked && !indeterminate && (
        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {indeterminate && (
        <span className="block h-0.5 w-2 rounded-full bg-white" />
      )}
    </button>
  );
}

export function Cell({
  children,
  className = "",
  overflowVisible = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  overflowVisible?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`border-b border-gray-200 px-4 py-0 align-middle ${className}`} style={style}>
      <div className={`flex h-[54px] items-center ${overflowVisible ? "overflow-visible" : "overflow-hidden"}`}>
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

  const selectedCount = selection ? data.filter((r) => selection.selected.has(rowKey(r))).length : 0;
  const allSelected = !!selection && data.length > 0 && selectedCount === data.length;
  const someSelected = !!selection && selectedCount > 0 && selectedCount < data.length;

  const stickyOffsets: number[] = [];
  {
    let acc = 0;
    for (let i = 0; i < stickyLeftColumns && i < visibleCols.length; i++) {
      stickyOffsets.push(acc);
      acc += visibleCols[i].minWidth ?? 200;
    }
  }

  return (
    <div className="relative flex h-full max-w-full flex-col">
      <div className="flex-1 min-h-0 max-w-full overflow-x-auto overflow-y-auto">
        <table
          className="w-full border-separate border-spacing-0 text-xs"
          style={{ minWidth: `${minTableWidth}px` }}
        >
          <thead className="sticky top-0 z-40">
            <tr className="bg-white">
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
                    {idx === 0 && selection ? (
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={(val) => selection.onSelectAll(val)}
                        />
                        <span>{col.label}</span>
                      </div>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
              {actions && <th className={TH}>{actions.label ?? "Actions"}</th>}
              {onOpenColumnSettings && (
                <th
                  className="sticky right-0 z-30 cursor-pointer border-b border-l border-gray-200 bg-white px-4 py-3.5 text-left text-sm font-bold text-gray-900 whitespace-nowrap hover:bg-gray-50 transition-colors"
                  onClick={onOpenColumnSettings}
                  title="Column settings"
                >
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Settings className="h-3.5 w-3.5" />
                    <span className="text-sm font-bold text-gray-900">Settings</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`sk-${i}`} className="animate-pulse bg-white">
                  {visibleCols.map((col, idx) => {
                    const isSticky = idx < stickyLeftColumns;
                    const stickyClass = isSticky ? STICKY_TD_CONTENT : "";
                    const barWidths = ["w-28", "w-20", "w-16", "w-24", "w-14", "w-20", "w-16", "w-10"];
                    const barW = barWidths[idx % barWidths.length];
                    return (
                      <td
                        key={col.key}
                        className={`border-b border-gray-200 px-4 py-0 align-middle ${stickyClass}`}
                        style={isSticky ? { left: `${stickyOffsets[idx]}px`, backgroundColor: "#fff" } : undefined}
                      >
                        <div className="flex h-[54px] items-center overflow-hidden">
                          {idx === 0 && selection ? (
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="h-4 w-4 shrink-0 rounded border border-gray-200 bg-gray-100" />
                              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                              <div className="h-3 w-24 rounded bg-gray-200" />
                            </div>
                          ) : idx === 0 ? (
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
                              <div className="h-3 w-24 rounded bg-gray-200" />
                            </div>
                          ) : (
                            <div className={`h-3 ${barW} rounded bg-gray-200`} />
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="border-b border-gray-200 px-4 py-0 align-middle">
                      <div className="flex h-[54px] items-center">
                        <div className="h-5 w-5 rounded bg-gray-200" />
                      </div>
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
                    className="bg-white transition-colors hover:bg-gray-50"
                  >
                    {visibleCols.map((col, idx) => {
                      const isSticky = idx < stickyLeftColumns;
                      const stickyClass = isSticky ? STICKY_TD_CONTENT : "";
                      return (
                        <td
                          key={col.key}
                          className={`border-b border-gray-200 px-4 py-0 align-middle ${col.className ?? ""} ${stickyClass}`}
                          style={isSticky ? { left: `${stickyOffsets[idx]}px`, backgroundColor: "#fff" } : undefined}
                        >
                          <div className="flex h-[54px] items-center overflow-hidden">
                            {idx === 0 && selection ? (
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <Checkbox
                                  checked={checked}
                                  onChange={() => selection.onSelect(id)}
                                />
                                <div className="flex-1 overflow-hidden">
                                  {col.render(row)}
                                </div>
                              </div>
                            ) : (
                              col.render(row)
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {actions && (
                      <td className="border-b border-gray-200 px-4 py-0 align-middle">
                        <div className="flex h-[54px] items-center overflow-visible">
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
