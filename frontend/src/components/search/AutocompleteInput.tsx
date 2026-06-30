"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { fetchAutocomplete, getAutocompleteSuggestionKey, type AutocompleteSuggestion } from "@/lib/searchApi";

interface Props {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  field: string;
  size?: number;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 pr-7 text-[11px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none sm:border-2 sm:px-3 sm:py-2 sm:text-xs";
const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";
const DROPDOWN_MAX_H = 220;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function AutocompleteInput({ label, placeholder, value, onChange, field, size = 8 }: Props) {
  const [inputText, setInputText] = useState(value);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFetch = useRef(false);

  useEffect(() => {
    if (value !== inputText) {
      skipFetch.current = true;
      setInputText(value);
      if (!value) { setSuggestions([]); setOpen(false); }
    }
  }, [value]);

  const reposition = useCallback(() => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
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

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!inputText.trim()) { setSuggestions([]); setOpen(false); skipFetch.current = false; return; }
    if (skipFetch.current) { skipFetch.current = false; return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchAutocomplete(field, inputText, size);
        setSuggestions(results);
        if (results.length > 0) { reposition(); setOpen(true); }
        else setOpen(false);
      } catch { setOpen(false); }
      finally { setLoading(false); }
    }, 700);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [inputText, field, size, reposition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    skipFetch.current = false;
    setInputText(e.target.value);
    onChange(e.target.value);
    setActiveIdx(-1);
  };

  const select = (name: string) => {
    skipFetch.current = true;
    setInputText(name);
    onChange(name);
    setOpen(false);
    setActiveIdx(-1);
  };

  const clear = () => {
    skipFetch.current = false;
    setInputText("");
    onChange("");
    setSuggestions([]);
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); select(suggestions[activeIdx].name); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => { if (suggestions.length > 0) { reposition(); setOpen(true); } }}
          className={inputCls}
        />
        {inputText && (
          <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-3 w-3" />
          </button>
        )}
        {loading && !open && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-red-500 inline-block" />
          </span>
        )}
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
              {suggestions.map((s, i) => (
                <button
                  key={getAutocompleteSuggestionKey(s, i)}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); select(s.name); }}
                  className={`flex w-full items-center justify-between px-2.5 py-1.5 text-[11px] transition-colors sm:px-3 sm:py-2 sm:text-xs ${
                    i === activeIdx ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="ml-2 shrink-0 text-[10px] text-gray-400">{formatCount(s.count)}</span>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
