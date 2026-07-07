"use client";
import type { PersonFilters } from "@/types/search";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none";
const labelCls = "mb-1 block text-[12px] text-gray-500";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function TotalExperienceFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className={labelCls}>Total Years of Experience</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min years"
          min={0}
          value={filters.experienceYearsMin}
          onChange={(e) => onChange({ experienceYearsMin: e.target.value })}
          className={inputCls}
        />
        <span className="text-gray-400 text-[12px] shrink-0">–</span>
        <input
          type="number"
          placeholder="Max years"
          min={0}
          value={filters.experienceYearsMax}
          onChange={(e) => onChange({ experienceYearsMax: e.target.value })}
          className={inputCls}
        />
      </div>
    </div>
  );
}
