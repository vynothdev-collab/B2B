"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { fetchAutocomplete, type AutocompleteSuggestion } from "@/lib/searchApi";

interface Props {
  label?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  field?: string;
  size?: number;
}

const labelCls = "block text-xs text-gray-500 mb-1";
const DROPDOWN_MAX_H = 220;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function MultiChipAutocomplete({ label, placeholder, values, onChange, field, size = 8 }: Props) {
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFetch = useRef(false);

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

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!inputText.trim() || !field) {
      setSuggestions([]);
      setOpen(false);
      skipFetch.current = false;
      return;
    }
    if (skipFetch.current) { skipFetch.current = false; return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchAutocomplete(field, inputText, size);
        const filtered = results.filter((s) => !values.includes(s.name));
        setSuggestions(filtered);
        if (filtered.length > 0) { reposition(); setOpen(true); }
        else setOpen(false);
      } catch { setOpen(false); }
      finally { setLoading(false); }
    }, 700);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [inputText, field, size, values, reposition]);

  const addValue = (name: string) => {
    if (!values.includes(name)) onChange([...values, name]);
    skipFetch.current = true;
    setInputText("");
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const removeValue = (val: string) => onChange(values.filter((v) => v !== val));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    skipFetch.current = false;
    setInputText(e.target.value);
    setActiveIdx(-1);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputText && values.length > 0) { removeValue(values[values.length - 1]); return; }
    if (e.key === "ArrowDown" && open) { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); return; }
    if (e.key === "ArrowUp" && open) { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); return; }
    if (e.key === "Enter" && open && activeIdx >= 0) { e.preventDefault(); addValue(suggestions[activeIdx].name); return; }
    if (e.key === "Escape") { setOpen(false); return; }
    if ((e.key === "Enter" || (!field && e.key === ",")) && inputText.trim()) { e.preventDefault(); addValue(inputText.trim()); }
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((val) => (
            <span key={val} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-700">
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
        className="relative w-full rounded-lg border-2 border-gray-200 bg-white px-2 py-1 focus-within:border-purple-500 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => { if (suggestions.length > 0) { reposition(); setOpen(true); } }}
          className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {loading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500 inline-block" />
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
                  key={s.name}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addValue(s.name); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                    i === activeIdx ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
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
