"use client";
import { JOB_CHANGE_TIMEFRAMES } from "@/types/search";
import type { PersonFilters } from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function JobChangeFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1 px-0.5 text-[10px] text-gray-400">
        People who started their current role within the selected timeframe.
      </p>
      {JOB_CHANGE_TIMEFRAMES.map((opt) => {
        const selected = filters.jobChangeTimeframe === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ jobChangeTimeframe: selected ? "" : opt.value })}
            className={`flex w-full items-center gap-2.5 rounded px-1 py-1.5 text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
          >
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
              {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <span className={`flex-1 text-[12px] ${selected ? "font-medium" : ""}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
