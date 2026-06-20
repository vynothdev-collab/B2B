"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Country, State } from "country-state-city";

interface Props {
  label?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  type: "country" | "state";
  selectedCountries?: string[];
}

const labelCls = "block text-xs text-gray-500 mb-1";
const DROPDOWN_MAX_H = 220;

const COUNTRY_ISO: Record<string, string> = Object.fromEntries(
  Country.getAllCountries().map((c) => [c.name, c.isoCode])
);

export default function LocationMultiSelect({
  label,
  placeholder,
  values,
  onChange,
  type,
  selectedCountries = [],
}: Props) {
  const [inputText, setInputText] = useState("");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo<string[]>(() => {
    if (type === "country") {
      return Country.getAllCountries().map((c) => c.name);
    }
    if (selectedCountries.length > 0) {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const countryName of selectedCountries) {
        const iso = COUNTRY_ISO[countryName];
        if (!iso) continue;
        for (const s of State.getStatesOfCountry(iso)) {
          if (!seen.has(s.name)) { seen.add(s.name); result.push(s.name); }
        }
      }
      return result.sort();
    }
    return [];
  }, [type, selectedCountries]);

  const suggestions = useMemo(() => {
    const q = inputText.toLowerCase();
    return allOptions
      .filter((o) => !values.includes(o) && (!q || o.toLowerCase().includes(q)))
      .slice(0, 50);
  }, [allOptions, values, inputText]);

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
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const openDropdown = () => {
    if (suggestions.length > 0 || (type === "state" && selectedCountries.length === 0)) {
      reposition();
      setOpen(true);
    }
  };

  const addValue = (name: string) => {
    if (!values.includes(name)) onChange([...values, name]);
    setInputText("");
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const removeValue = (val: string) => onChange(values.filter((v) => v !== val));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setActiveIdx(-1);
    if (e.target.value.trim()) { reposition(); setOpen(true); }
    else setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputText && values.length > 0) {
      removeValue(values[values.length - 1]);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); addValue(suggestions[activeIdx]); }
    else if (e.key === "Escape") setOpen(false);
  };

  const showEmpty = open && type === "state" && selectedCountries.length === 0;
  const showList = open && suggestions.length > 0;

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((val) => (
            <span key={val} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-gray-200 text-gray-700">
              {val}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); removeValue(val); }} className="hover:opacity-70">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full rounded-lg bg-gray-100 px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400/50 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={openDropdown}
          className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {(showList || showEmpty) && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxH }}
          >
            {showEmpty ? (
              <div className="px-3 py-3 text-[11px] text-gray-400 italic">
                Select a country first to see states
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: pos.maxH }}>
                {suggestions.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addValue(name); }}
                    className={`flex w-full items-center px-3 py-2 text-xs transition-colors ${
                      i === activeIdx ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
