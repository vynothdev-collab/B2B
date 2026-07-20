"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { INDUSTRY_OPTIONS_HIERARCHICAL } from "@/types/search";
import type { DepartmentOption } from "@/types/search";

function flatten(opts: DepartmentOption[]): { value: string; label: string }[] {
  return opts.flatMap((o) => [
    { value: o.value, label: o.label },
    ...(o.children ? flatten(o.children) : []),
  ]);
}

const ALL_INDUSTRIES = flatten(INDUSTRY_OPTIONS_HIERARCHICAL);

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
}

export default function IndustryFilter({ values, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const q = query.toLowerCase().trim();

  const suggestions = ALL_INDUSTRIES.filter(
    (o) => !q || o.label.toLowerCase().includes(q)
  ).slice(0, 50);

  const toggle = (val: string) => {
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val]);
  };

  const remove = (val: string) => onChange(values.filter((v) => v !== val));

  const showList = focused;

  return (
    <div className="flex flex-col gap-1">
      {/* Selected chips */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-full bg-[#D9E8DB] px-2 py-0.5 text-[11px] text-[#2d5a3d] max-w-full"
            >
              <span className="truncate max-w-[150px]">{v}</span>
              <button
                type="button"
                onClick={() => remove(v)}
                className="shrink-0 text-red-400 hover:text-red-600 leading-none ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search industries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none sm:border-2"
        />
      </div>

      {/* Results list — inline (not absolutely positioned) so no overflow-hidden clipping */}
      {showList && (
        <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          {suggestions.length === 0 ? (
            <p className="px-3 py-3 text-[12px] text-gray-400">{q ? `No results for "${query}"` : "No industries"}</p>
          ) : (
            <ul>
              {suggestions.map((opt) => {
                const checked = values.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(opt.value)}
                      className={`flex w-full items-center gap-2 px-2.5 py-1 text-left text-[12px] transition-colors ${
                        checked ? "text-red-700 hover:bg-gray-50" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                        checked ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
                      }`}>
                        {checked && (
                          <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className={`flex-1 truncate ${checked ? "font-medium" : ""}`}>{opt.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
