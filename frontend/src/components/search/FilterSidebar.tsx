"use client";
import { SlidersHorizontal } from "lucide-react";
import type { CompanyFilters, PersonFilters, TabType } from "@/types/search";
import PeopleFilters from "./PeopleFilters";
import CompanyFiltersPanel from "./CompanyFilters";

interface Props {
  tab: TabType;
  onTabChange: (t: TabType) => void;
  personFilters: PersonFilters;
  companyFilters: CompanyFilters;
  onPersonChange: (patch: Partial<PersonFilters>) => void;
  onCompanyChange: (patch: Partial<CompanyFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function FilterSidebar({
  tab, onTabChange,
  personFilters, companyFilters,
  onPersonChange, onCompanyChange,
  onApply, onReset,
}: Props) {
  return (
    <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-sm font-semibold text-gray-800">Filters</span>
        </div>
        <button
          onClick={onReset}
          type="button"
          className="text-xs text-gray-400 hover:text-purple-600 font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="px-3 py-2.5 border-b border-gray-100">
        <div className="flex gap-1 rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => onTabChange("people")}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
              tab === "people"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            People
          </button>
          <button
            type="button"
            onClick={() => onTabChange("company")}
            className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
              tab === "company"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Company
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {tab === "people" ? (
          <PeopleFilters filters={personFilters} onChange={onPersonChange} />
        ) : (
          <CompanyFiltersPanel filters={companyFilters} onChange={onCompanyChange} />
        )}
      </div>

      <div className="flex gap-2 border-t border-gray-100 px-3 py-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-purple-600 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
}
