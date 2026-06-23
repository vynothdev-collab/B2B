"use client";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onReset: () => void;
  onApply: () => void;
}

export default function FilterPanelShell({ children, onReset, onApply }: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-sm font-semibold text-gray-800">Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-gray-400 transition-colors hover:text-purple-600"
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">{children}</div>

      <div className="flex gap-2 border-t border-gray-100 px-3 py-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-purple-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
}
