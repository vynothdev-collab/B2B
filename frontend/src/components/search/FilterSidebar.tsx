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
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-gray-200 bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-semibold text-gray-800">Filters</span>
        </div>
        <button
          onClick={onReset}
          type="button"
          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* People / Company underline tabs */}
      <div className="flex border-b border-gray-200 px-3">
        <button
          type="button"
          onClick={() => onTabChange("people")}
          className={`flex-1 pb-2 text-xs font-semibold transition-colors ${
            tab === "people"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          People
        </button>
        <button
          type="button"
          onClick={() => onTabChange("company")}
          className={`flex-1 pb-2 text-xs font-semibold transition-colors ${
            tab === "company"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Company
        </button>
      </div>

      {/* Scrollable filter sections */}
      <div className="flex-1 overflow-y-auto">
        {tab === "people" ? (
          <PeopleFilters filters={personFilters} onChange={onPersonChange} />
        ) : (
          <CompanyFiltersPanel filters={companyFilters} onChange={onCompanyChange} />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-gray-100 px-3 py-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-md bg-purple-600 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          Apply filters
        </button>
      </div>
    </aside>
  );
}
