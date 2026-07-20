"use client";
import { useRef, useState } from "react";
import { X } from "lucide-react";

const MAX_KEYWORDS = 20;
const MIN_CHARS = 3;

const SCOPES = [
  { value: "company_specialties",      label: "Company specialties" },
  { value: "social_media_description", label: "Social media description" },
  { value: "seo_description",          label: "SEO description" },
  { value: "ai_description",           label: "AI description" },
  { value: "product_service_tags",     label: "Product & service tags" },
  { value: "website_pages",            label: "Website pages" },
] as const;

interface Props {
  include: string[];
  matchMode: "any" | "all";
  scope: string[];
  exclude: string[];
  onIncludeChange: (v: string[]) => void;
  onMatchModeChange: (v: "any" | "all") => void;
  onScopeChange: (v: string[]) => void;
  onExcludeChange: (v: string[]) => void;
}

function KeywordInput({
  values,
  onChange,
  placeholder,
  disabled,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const val = raw.trim();
    if (val.length < MIN_CHARS) return;
    if (values.length >= MAX_KEYWORDS) return;
    if (values.some((v) => v.toLowerCase() === val.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, val]);
    setDraft("");
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[#D9E8DB] px-2 py-0.5 text-[11px] font-medium text-[#2d5a3d]">
              {v}
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(values.filter((x) => x !== v)); }} className="opacity-70 hover:opacity-100">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {values.length < MAX_KEYWORDS && (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => commit(draft)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 transition-colors focus:outline-none focus:border-red-400 ${
            values.length > 0 ? "border-red-300" : "border-gray-200"
          }`}
        />
      )}
    </div>
  );
}

export default function KeywordsFilter({
  include, matchMode, scope, exclude,
  onIncludeChange, onMatchModeChange, onScopeChange, onExcludeChange,
}: Props) {
  const searchEverywhere = scope.length === 0;

  function toggleScope(value: string) {
    if (scope.includes(value)) {
      onScopeChange(scope.filter((s) => s !== value));
    } else {
      onScopeChange([...scope, value]);
    }
  }

  return (
    <div className="space-y-3">
      {/* Include keywords */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Include keywords</span>
          <span className="text-[10px] text-gray-400">{include.length}/{MAX_KEYWORDS} — min {MIN_CHARS} characters</span>
        </div>
        <KeywordInput
          values={include}
          onChange={onIncludeChange}
          placeholder="Type keyword and press Enter…"
        />
      </div>

      {/* Match mode toggle */}
      {include.length > 0 && (
        <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5">
          {(["any", "all"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onMatchModeChange(mode)}
              className={`flex-1 rounded-md py-1 text-[12px] font-medium transition-colors ${
                matchMode === mode
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "any" ? "Any keyword (OR)" : "All keywords (AND)"}
            </button>
          ))}
        </div>
      )}

      {/* Search scope */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        {/* Search everywhere row */}
        <button
          type="button"
          onClick={() => onScopeChange([])}
          className="flex w-full items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-gray-700">Search everywhere</span>
            <span className="text-[10px] text-gray-400">Searching all available sources.</span>
          </div>
          {/* Toggle pill */}
          <span className={`relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors ${searchEverywhere ? "bg-red-600" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${searchEverywhere ? "translate-x-3.5" : "translate-x-0.5"}`} />
          </span>
        </button>

        {/* Individual scope checkboxes */}
        <div className="border-t border-gray-100 px-3 pb-1.5 pt-1 space-y-0.5">
          {SCOPES.map((s) => {
            const checked = !searchEverywhere && scope.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => { if (searchEverywhere) { onScopeChange([s.value]); } else { toggleScope(s.value); } }}
                className="flex w-full items-center gap-2 rounded px-1 py-[3px] text-left hover:bg-gray-50 transition-colors"
              >
                <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${checked ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
                  {checked && (
                    <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className="text-[12px] text-gray-600">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exclude keywords */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={`text-[12px] font-medium ${include.length === 0 ? "text-gray-300" : "text-red-600"}`}>
            Exclude keywords
          </span>
          {include.length === 0 && (
            <span className="text-[10px] text-gray-400">0/{MAX_KEYWORDS}</span>
          )}
        </div>
        {include.length === 0 ? (
          <>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-[12px] text-gray-300 cursor-not-allowed">
              Add include keywords first
            </div>
            <p className="mt-1 text-[10px] text-gray-400">Add at least one include keyword to enable excludes.</p>
          </>
        ) : (
          <KeywordInput
            values={exclude}
            onChange={onExcludeChange}
            placeholder="Type keyword and press Enter…"
          />
        )}
      </div>
    </div>
  );
}
