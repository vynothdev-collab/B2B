"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { fetchTitleSuggestions } from "@/lib/searchApi";

interface Props {
  label?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none";

const DROPDOWN_MAX_H = 260;

export default function JobTitleAutocomplete({ label, placeholder, values, onChange }: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchTitleSuggestions(text);
      setSuggestions(results.filter((s) => !values.includes(s)));
      setLoading(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const addValue = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setText("");
    setSuggestions([]);
    setOpen(false);
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
      if (open && activeIdx >= 0 && suggestions[activeIdx]) {
        addValue(suggestions[activeIdx]);
      } else if (text.trim()) {
        addValue(text);
      }
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Backspace" && !text && values.length) onChange(values.slice(0, -1));
  };

  const showDropdown = open && (loading || suggestions.length > 0 || text.trim().length >= 2);

  return (
    <div>
      {label && (
        <label className="mb-1 block text-[11px] font-medium text-gray-500">{label}</label>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="hover:opacity-70"
              >
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
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActiveIdx(-1);
            reposition();
            setOpen(true);
          }}
          onFocus={() => { reposition(); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKey}
          className={inputCls}
        />
      </div>

      {showDropdown && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxH }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: pos.maxH }}>
              {loading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching…
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-gray-400">No matches</div>
              ) : (
                suggestions.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); addValue(s); }}
                    className={`flex w-full items-center px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                      i === activeIdx ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
