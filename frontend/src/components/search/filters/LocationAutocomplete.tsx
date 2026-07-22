"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin } from "lucide-react";
import { Country, State, City } from "country-state-city";

type LocKind = "country" | "state" | "city";

interface Props {
  kind: LocKind;
  placeholder?: string;
  values: string[];
  onChange: (v: string[]) => void;
  filterCountries?: string[];
  filterStates?: string[];
}

interface LocOption {
  display: string;
  stored: string;
  kind: LocKind;
  countryStored?: string;
  stateStored?: string;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none";
const DROPDOWN_MAX_H = 260;

const KIND_LABEL: Record<LocKind, string> = {
  country: "Country",
  state: "State",
  city: "City",
};

const DEFAULT_PLACEHOLDER: Record<LocKind, string> = {
  country: "Search country…",
  state: "Search state / region…",
  city: "Search city…",
};

function buildCountryIndex(): LocOption[] {
  const all = Country.getAllCountries().map((c) => ({
    display: c.name,
    stored: c.name.toLowerCase(),
    kind: "country" as const,
  }));
  const us = all.find((c) => c.stored === "united states");
  const rest = all.filter((c) => c.stored !== "united states");
  return us ? [us, ...rest] : all;
}

function buildStateIndex(): LocOption[] {
  const out: LocOption[] = [];
  for (const c of Country.getAllCountries()) {
    for (const s of State.getStatesOfCountry(c.isoCode)) {
      out.push({
        display: `${s.name}, ${c.name}`,
        stored: s.name.toLowerCase(),
        kind: "state" as const,
        countryStored: c.name.toLowerCase(),
      });
    }
  }
  return out;
}

function buildCityIndex(): LocOption[] {
  const countryMap = new Map(Country.getAllCountries().map((c) => [c.isoCode, c.name]));
  const stateMap = new Map<string, string>();
  for (const c of Country.getAllCountries()) {
    for (const s of State.getStatesOfCountry(c.isoCode)) {
      stateMap.set(`${c.isoCode}-${s.isoCode}`, s.name);
    }
  }
  return City.getAllCities().map((city) => {
    const countryName = countryMap.get(city.countryCode) ?? city.countryCode;
    const stateName = stateMap.get(`${city.countryCode}-${city.stateCode}`) ?? city.stateCode;
    return {
      display: `${city.name}, ${stateName}, ${countryName}`,
      stored: city.name.toLowerCase(),
      kind: "city" as const,
      countryStored: countryName.toLowerCase(),
      stateStored: stateName.toLowerCase(),
    };
  });
}

const INDEXES: Partial<Record<LocKind, LocOption[]>> = {};
function getIndex(kind: LocKind): LocOption[] {
  if (!INDEXES[kind]) {
    if (kind === "country") INDEXES[kind] = buildCountryIndex();
    else if (kind === "state") INDEXES[kind] = buildStateIndex();
    else INDEXES[kind] = buildCityIndex();
  }
  return INDEXES[kind]!;
}

export default function LocationAutocomplete({
  kind,
  placeholder,
  values,
  onChange,
  filterCountries,
  filterStates,
}: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const avail = Math.max(80, window.innerHeight - r.bottom - 8);
    setPos({ top: r.bottom + 4, left: r.left, width: r.width, maxH: Math.min(DROPDOWN_MAX_H, avail) });
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setFocused(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const hasCountryFilter = filterCountries && filterCountries.length > 0;
  const hasStateFilter = filterStates && filterStates.length > 0;

  const suggestions = useMemo<LocOption[]>(() => {
    const q = text.trim().toLowerCase();
    const index = getIndex(kind);
    const out: LocOption[] = [];
    for (const item of index) {
      if (values.includes(item.stored)) continue;
      if (hasCountryFilter && item.countryStored && !filterCountries!.includes(item.countryStored)) continue;
      if (hasStateFilter && item.stateStored && !filterStates!.includes(item.stateStored)) continue;
      if (!q || item.display.toLowerCase().includes(q)) {
        out.push(item);
        if (out.length >= 60) break;
      }
    }
    if (q) {
      out.sort((a, b) => {
        const aStarts = a.stored.startsWith(q) ? 0 : 1;
        const bStarts = b.stored.startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.display.localeCompare(b.display);
      });
    }
    return out.slice(0, 20);
  }, [text, values, kind, filterCountries, filterStates, hasCountryFilter, hasStateFilter]);

  useEffect(() => {
    if (focused) {
      reposition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [focused, suggestions, reposition]);

  const add = (item: LocOption) => {
    if (values.includes(item.stored)) return;
    onChange([...values, item.stored]);
    setText("");
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const addText = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const stored = trimmed.toLowerCase();
    if (values.includes(stored)) return;
    onChange([...values, stored]);
    setText("");
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIdx >= 0) {
        add(suggestions[activeIdx]);
      } else if (text.trim()) {
        addText(text);
      }
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Backspace" && !text && values.length) onChange(values.slice(0, -1));
  };

  const isDisabled =
    (kind === "state" || kind === "city") &&
    filterCountries !== undefined &&
    filterCountries.length === 0;

  const effectivePlaceholder =
    placeholder ??
    (isDisabled
      ? "Select a country first…"
      : DEFAULT_PLACEHOLDER[kind]);

  return (
    <div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[#D9E8DB] px-1.5 py-0.5 text-[11px] font-medium capitalize text-[#2d5a3d]">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:opacity-70">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={effectivePlaceholder}
          value={text}
          onChange={(e) => { if (!isDisabled) { setText(e.target.value); setActiveIdx(-1); } }}
          onKeyDown={handleKey}
          onFocus={() => { if (!isDisabled) { setFocused(true); reposition(); setOpen(true); } }}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className={`${inputCls} ${isDisabled ? "cursor-not-allowed bg-gray-50 text-gray-400 placeholder-gray-300" : ""}`}
          disabled={isDisabled}
        />
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxH }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: pos.maxH }}>
              {suggestions.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-gray-400">
                  {kind === "state" && hasCountryFilter ? "No states for selected country" :
                   kind === "city" && (hasCountryFilter || hasStateFilter) ? "No cities found" :
                   kind !== "country" ? "Select a country to filter results" :
                   "No matches"}
                </div>
              ) : (
                suggestions.map((s, i) => {
                  const checked = values.includes(s.display);
                  return (
                    <button
                      key={s.display}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); add(s); }}
                      className={`flex w-full items-center gap-2 px-2.5 py-1 text-left text-[12px] transition-colors ${
                        i === activeIdx ? "bg-red-50 text-red-700" : checked ? "text-red-700 hover:bg-gray-50" : "text-gray-700 hover:bg-gray-50"
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
                      <span className="truncate flex-1">{s.display}</span>
                      <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                        {KIND_LABEL[s.kind]}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
