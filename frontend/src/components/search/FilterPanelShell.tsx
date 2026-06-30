"use client";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onReset: () => void;
  onApply: () => void;
  open?: boolean;
  onClose?: () => void;
}

export default function FilterPanelShell({ children, onReset, onApply, open, onClose }: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "lg:relative lg:inset-auto lg:z-auto",
          "flex w-[min(22rem,calc(100vw-1rem))] lg:w-64 xl:w-80 shrink-0 flex-col border border-gray-200 bg-white overflow-hidden",
          "lg:rounded-xl lg:shadow-sm",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-red-600 sm:h-4 sm:w-4" />
            <span className="text-sm font-semibold text-gray-800 sm:text-base">Filters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-gray-400 transition-colors hover:text-red-600 sm:text-sm"
            >
              Clear all
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden ml-1 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>

        <div className="flex shrink-0 gap-2 border-t border-gray-100 px-3 py-3 sm:px-4 sm:py-3.5">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:px-5 sm:py-2 sm:text-sm"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => { onApply(); onClose?.(); }}
            className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500 sm:py-2 sm:text-sm"
          >
            Apply filters
          </button>
        </div>
      </aside>
    </>
  );
}
