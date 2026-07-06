"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { INDUSTRY_OPTIONS } from "@/types/search";
import type { PersonFilters } from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function IndustryFilter({ filters, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? INDUSTRY_OPTIONS.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : INDUSTRY_OPTIONS;

  const toggle = (value: string) => {
    const next = filters.industries.includes(value)
      ? filters.industries.filter((v) => v !== value)
      : [...filters.industries, value];
    onChange({ industries: next });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search industries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-[11px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none sm:border-2 sm:text-xs"
        />
      </div>

      {/* Selected chips */}
      {filters.industries.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.industries.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="text-red-400 hover:text-red-600 leading-none"
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* Scrollable list */}
      <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
        {filtered.length === 0 && (
          <p className="px-1 py-2 text-[11px] text-gray-400">No results for "{query}"</p>
        )}
        {filtered.map((opt) => {
          const selected = filters.industries.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`flex w-full items-center gap-2.5 rounded px-1 py-1.5 text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
                {selected && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className={`flex-1 text-[12px] ${selected ? "font-medium" : ""}`}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
