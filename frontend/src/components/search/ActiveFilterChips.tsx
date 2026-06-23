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
      className="flex h-9 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-gray-100 px-4"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
    >
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 whitespace-nowrap"
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
