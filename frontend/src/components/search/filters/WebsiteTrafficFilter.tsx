"use client";
import CountrySelect from "./CountrySelect";
import { WEBSITE_TRAFFIC_TIMEFRAMES } from "@/types/search";
import type { PersonFilters } from "@/types/search";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none sm:border-2 sm:px-3 sm:py-2 sm:text-xs";
const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function WebsiteTrafficFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Total Monthly Visits */}
      <div>
        <span className={labelCls}>Total Monthly Visits</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.websiteVisitsMin}
            onChange={(e) => onChange({ websiteVisitsMin: e.target.value })}
            className={inputCls}
            min={0}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.websiteVisitsMax}
            onChange={(e) => onChange({ websiteVisitsMax: e.target.value })}
            className={inputCls}
            min={0}
          />
        </div>
      </div>

      {/* Visit Change */}
      <div>
        <span className={labelCls}>Visit Change (%)</span>
        <div className="mb-2 flex gap-1">
          {WEBSITE_TRAFFIC_TIMEFRAMES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ visitChangeTimeframe: opt.value as PersonFilters["visitChangeTimeframe"] })}
              className={`flex-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
                filters.visitChangeTimeframe === opt.value
                  ? "border-red-500 bg-red-50 text-red-700 font-medium"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min %"
            value={filters.visitChangeMin}
            onChange={(e) => onChange({ visitChangeMin: e.target.value })}
            className={inputCls}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            placeholder="Max %"
            value={filters.visitChangeMax}
            onChange={(e) => onChange({ visitChangeMax: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      {/* Audience by Country */}
      <div>
        <span className={labelCls}>Audience by Country</span>
        <CountrySelect
          label=""
          placeholder="Search country…"
          value={filters.trafficCountry}
          onChange={(v) => onChange({ trafficCountry: v })}
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min %"
            value={filters.trafficCountryMin}
            onChange={(e) => onChange({ trafficCountryMin: e.target.value })}
            className={inputCls}
            min={0}
            max={100}
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            placeholder="Max %"
            value={filters.trafficCountryMax}
            onChange={(e) => onChange({ trafficCountryMax: e.target.value })}
            className={inputCls}
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}
