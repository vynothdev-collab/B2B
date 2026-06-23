"use client";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onReset: () => void;
  onApply: () => void;
}

export default function FilterPanelShell({ children, onReset, onApply }: Props) {
  return (
    <aside className="flex w-80 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-purple-600" />
          <span className="text-base font-semibold text-gray-800">Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-gray-400 transition-colors hover:text-purple-600"
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>

      <div className="flex gap-2 border-t border-gray-100 px-4 py-3.5">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
}
