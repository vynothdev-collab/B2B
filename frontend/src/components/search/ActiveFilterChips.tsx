"use client";
import { X } from "lucide-react";

export interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export default function ActiveFilterChips({ chips }: { chips: FilterChip[] }) {
  if (!chips.length) return null;
  return (
    <div
      className="flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-gray-100 px-3 sm:h-9 sm:gap-1.5 sm:px-4"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
    >
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 sm:px-2.5 sm:text-[11px]"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full hover:opacity-60 transition-opacity"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
