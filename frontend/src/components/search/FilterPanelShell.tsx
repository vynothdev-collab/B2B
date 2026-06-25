"use client";
import { SlidersHorizontal, X } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onReset: () => void;
  onApply: () => void;
  /** Mobile: whether the drawer is open */
  open?: boolean;
  /** Mobile: callback to close the drawer */
  onClose?: () => void;
}

export default function FilterPanelShell({ children, onReset, onApply, open, onClose }: Props) {
  return (
    <>
      {/* Mobile backdrop — only visible when drawer is open on small screens */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          /* Mobile: fixed slide-in overlay from left */
          "fixed inset-y-0 left-0 z-50",
          /* Desktop (lg+): back to normal flex child */
          "lg:relative lg:inset-auto lg:z-auto",
          /* Base layout */
          "flex w-80 lg:w-64 xl:w-80 shrink-0 flex-col border border-gray-200 bg-white overflow-hidden",
          /* Rounded corners only on desktop (mobile spans full height) */
          "lg:rounded-xl lg:shadow-sm",
          /* Slide animation */
          "transition-transform duration-300 ease-in-out",
          /* Mobile hidden/open state; desktop always visible via lg:translate-x-0 */
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-purple-600" />
            <span className="text-base font-semibold text-gray-800">Filters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-medium text-gray-400 transition-colors hover:text-purple-600"
            >
              Clear all
            </button>
            {/* Close button — mobile only */}
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

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer actions */}
        <div className="flex shrink-0 gap-2 border-t border-gray-100 px-4 py-3.5">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => { onApply(); onClose?.(); }}
            className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Apply filters
          </button>
        </div>
      </aside>
    </>
  );
}
