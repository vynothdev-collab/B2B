"use client";
import { useState } from "react";
import { RotateCcw, Search, X } from "lucide-react";
import type { ColumnDef } from "@/hooks/useColumnSettings";

interface Props {
  open: boolean;
  onClose: () => void;
  cols: ColumnDef[];
  visible: Record<string, boolean>;
  onToggle: (key: string) => void;
  onReset: () => void;
}

export default function ColumnSettingsPanel({
  open,
  onClose,
  cols,
  visible,
  onToggle,
  onReset,
}: Props) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const filtered = cols.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-4 top-16 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
          <span className="text-[12px] font-semibold text-gray-800">Column settings</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="border-b border-gray-50 px-3 py-2">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5">
            <Search className="h-3 w-3 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search columns..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-[11px] text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.map((col) => {
            const checked = col.locked ? true : (visible[col.key] ?? col.defaultVisible);
            return (
              <div
                key={col.key}
                className={`flex items-center justify-between px-3 py-2 ${
                  col.locked
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-gray-50"
                }`}
                onClick={() => !col.locked && onToggle(col.key)}
              >
                <span className="select-none text-[11px] text-gray-700">{col.label}</span>
                <div className="flex items-center gap-2">
                  {col.locked && (
                    <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                      locked
                    </span>
                  )}
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly={col.locked}
                    onChange={() => !col.locked && onToggle(col.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600"
                  />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-3 text-center text-[11px] text-gray-400">No columns match</p>
          )}
        </div>

        <div className="border-t border-gray-100 px-3 py-2">
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to defaults
          </button>
        </div>
      </div>
    </>
  );
}
