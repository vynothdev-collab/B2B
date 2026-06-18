"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function getChipColor(_val: string): string {
  return "bg-gray-200 text-gray-700";
}

export default function MultiChipAutocomplete({
  label,
  placeholder,
  values,
  onChange,
  field,
  size = 8,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFetch = useRef(false);

  const reposition = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!inputText.trim() || !field) {
      setSuggestions([]);
      setOpen(false);
      skipFetch.current = false;
      return;
    }

    if (skipFetch.current) {
      skipFetch.current = false;
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchAutocomplete(field, inputText, size);
        const filtered = results.filter((s) => !values.includes(s.name));
        setSuggestions(filtered);
        if (filtered.length > 0) {
          reposition();
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch {
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [inputText, field, size, values, reposition]);

  const addValue = (name: string) => {
    if (!values.includes(name)) {
      onChange([...values, name]);
    }
    skipFetch.current = true;
    setInputText("");
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const removeValue = (val: string) => {
    onChange(values.filter((v) => v !== val));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    skipFetch.current = false;
    setInputText(e.target.value);
    setActiveIdx(-1);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputText && values.length > 0) {
      removeValue(values[values.length - 1]);
      return;
    }
    // Free-form entry (no PDL field): Enter or comma adds the typed value as a chip
    if (!field && (e.key === "Enter" || e.key === ",") && inputText.trim()) {
      e.preventDefault();
      addValue(inputText.trim());
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      addValue(suggestions[activeIdx].name);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((val) => (
            <span
              key={val}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${getChipColor(val)}`}
            >
              {val}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); removeValue(val); }}
                className="hover:opacity-70 transition-opacity"
              >
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
          onFocus={() => { if (suggestions.length > 0) { reposition(); setOpen(true); } }}
          className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {loading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500 inline-block" />
          </span>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: 220 }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
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
        </>
      )}
    </div>
  );
}
