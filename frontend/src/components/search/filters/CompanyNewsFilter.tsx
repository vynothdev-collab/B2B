"use client";
import type { CompanyFilters } from "@/types/search";
import { COMPANY_NEWS_CATEGORIES, COMPANY_NEWS_TIMEFRAMES } from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none";

export default function CompanyNewsFilter({ filters, onChange }: Props) {
  const toggleCategory = (val: string) => {
    const next = filters.companyNewsCategories.includes(val)
      ? filters.companyNewsCategories.filter((v) => v !== val)
      : [...filters.companyNewsCategories, val];
    onChange({ companyNewsCategories: next });
  };

  const toggleKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    const next = filters.companyNewsKeywords.includes(trimmed)
      ? filters.companyNewsKeywords.filter((v) => v !== trimmed)
      : [...filters.companyNewsKeywords, trimmed];
    onChange({ companyNewsKeywords: next });
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = (e.currentTarget.value ?? "").trim();
      if (val) {
        toggleKeyword(val);
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* News Keywords */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">News Keywords</p>
        {filters.companyNewsKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {filters.companyNewsKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => onChange({ companyNewsKeywords: filters.companyNewsKeywords.filter((v) => v !== kw) })}
                  className="hover:opacity-70 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Type keyword and press Enter…"
          onKeyDown={handleKeywordKeyDown}
          className={inputCls}
        />
      </div>

      {/* News Categories */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">News Categories</p>
        <div className="flex flex-col">
          {COMPANY_NEWS_CATEGORIES.map((opt) => {
            const selected = filters.companyNewsCategories.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleCategory(opt.value)}
                className={`flex w-full items-center gap-2 rounded px-1 py-[3px] text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                    selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
                  }`}
                >
                  {selected && (
                    <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className={`text-[12px] leading-none ${selected ? "font-medium" : ""}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeframe */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Timeframe</p>
        <div className="flex flex-col">
          {COMPANY_NEWS_TIMEFRAMES.map((opt) => {
            const selected = filters.companyNewsTimeframe === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ companyNewsTimeframe: selected ? "" : opt.value })}
                className={`flex w-full items-center gap-2 rounded px-1 py-[3px] text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-red-500" />}
                </span>
                <span className={`text-[12px] leading-none ${selected ? "font-medium" : ""}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
