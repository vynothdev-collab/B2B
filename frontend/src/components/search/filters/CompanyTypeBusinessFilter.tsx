"use client";
import { useState } from "react";
import type { CompanyFilters } from "@/types/search";
import {
  COMPANY_STATUS_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  COMPANY_HOW_THEY_SELL_OPTIONS,
  COMPANY_MORE_FLAGS_OPTIONS,
  COMPANY_REVENUE_MODEL_OPTIONS,
} from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

interface CheckOption {
  value: string;
  label: string;
  count?: string;
}

function CheckList({
  options,
  values,
  onToggle,
}: {
  options: CheckOption[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`flex w-full min-h-0 items-center gap-2 rounded px-1 py-[3px] text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
              }`}
            >
              {selected && (
                <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span className={`flex-1 text-[12px] leading-none ${selected ? "font-medium" : ""}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function tog(values: string[], v: string): string[] {
  return values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
}

export default function CompanyTypeBusinessFilter({ filters, onChange }: Props) {
  const [typeSearch, setTypeSearch] = useState("");

  const filteredTypes = typeSearch
    ? COMPANY_TYPE_OPTIONS.filter((o) => o.label.toLowerCase().includes(typeSearch.toLowerCase()))
    : COMPANY_TYPE_OPTIONS;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Company Status */}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Company Status</p>
        <CheckList
          options={COMPANY_STATUS_OPTIONS}
          values={filters.companyStatus}
          onToggle={(v) => onChange({ companyStatus: tog(filters.companyStatus, v) })}
        />
      </div>

      {/* Company Type — What They Are */}
      <div>
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Company Type</p>
        <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-300">What they are</p>
        <input
          type="text"
          placeholder="Search types..."
          value={typeSearch}
          onChange={(e) => setTypeSearch(e.target.value)}
          className="mb-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none sm:border-2 sm:text-xs"
        />
        <CheckList
          options={filteredTypes}
          values={filters.type}
          onToggle={(v) => onChange({ type: tog(filters.type, v) })}
        />
      </div>

      {/* How They Sell */}
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-wider text-gray-300">How they sell</p>
        <CheckList
          options={COMPANY_HOW_THEY_SELL_OPTIONS}
          values={filters.companyHowTheySell}
          onToggle={(v) => onChange({ companyHowTheySell: tog(filters.companyHowTheySell, v) })}
        />
      </div>

      {/* More Flags */}
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-wider text-gray-300">More flags</p>
        <CheckList
          options={COMPANY_MORE_FLAGS_OPTIONS}
          values={filters.companyMoreFlags}
          onToggle={(v) => onChange({ companyMoreFlags: tog(filters.companyMoreFlags, v) })}
        />
      </div>

      {/* Revenue Model */}
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-wider text-gray-300">Revenue model</p>
        <CheckList
          options={COMPANY_REVENUE_MODEL_OPTIONS}
          values={filters.companyRevenueModel}
          onToggle={(v) => onChange({ companyRevenueModel: tog(filters.companyRevenueModel, v) })}
        />
      </div>
    </div>
  );
}
