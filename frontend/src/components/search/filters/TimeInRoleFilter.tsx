"use client";
import type { PersonFilters } from "@/types/search";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none";
const labelCls = "mb-0.5 block text-[10px] text-gray-400";

interface RangeRowProps {
  label: string;
  years: string;
  months: string;
  onYears: (v: string) => void;
  onMonths: (v: string) => void;
}

function RangeRow({ label, years, months, onYears, onMonths }: RangeRowProps) {
  return (
    <div>
      <span className="mb-1 block text-[12px] font-medium text-gray-600">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className={labelCls}>Years</span>
          <input
            type="number"
            placeholder="Enter #"
            min={0}
            value={years}
            onChange={(e) => onYears(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <span className={labelCls}>Months</span>
          <input
            type="number"
            placeholder="Enter #"
            min={0}
            max={11}
            value={months}
            onChange={(e) => onMonths(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  mode: "role" | "company";
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function TimeInRoleFilter({ mode, filters, onChange }: Props) {
  const isRole = mode === "role";
  const minYearsKey  = isRole ? "timeInRoleMinYears"    : "timeInCompanyMinYears";
  const minMonthsKey = isRole ? "timeInRoleMinMonths"   : "timeInCompanyMinMonths";
  const maxYearsKey  = isRole ? "timeInRoleMaxYears"    : "timeInCompanyMaxYears";
  const maxMonthsKey = isRole ? "timeInRoleMaxMonths"   : "timeInCompanyMaxMonths";

  return (
    <div className="flex flex-col gap-3">
      <RangeRow
        label="Min"
        years={filters[minYearsKey]}
        months={filters[minMonthsKey]}
        onYears={(v) => onChange({ [minYearsKey]: v })}
        onMonths={(v) => onChange({ [minMonthsKey]: v })}
      />
      <RangeRow
        label="Max"
        years={filters[maxYearsKey]}
        months={filters[maxMonthsKey]}
        onYears={(v) => onChange({ [maxYearsKey]: v })}
        onMonths={(v) => onChange({ [maxMonthsKey]: v })}
      />
    </div>
  );
}
