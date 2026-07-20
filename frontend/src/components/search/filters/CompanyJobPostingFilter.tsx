"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { fetchTitleSuggestions } from "@/lib/searchApi";
import type { CompanyFilters } from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none";

const DROPDOWN_MAX_H = 260;

export default function CompanyJobPostingFilter({ filters, onChange }: Props) {
  const values = filters.jobPostingKeywords;
  const setValues = (next: string[]) => onChange({ jobPostingKeywords: next });

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
    if (text.trim().length < 2) { setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchTitleSuggestions(text);
      setSuggestions(results);
      setLoading(false);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const toggleValue = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setValues(values.includes(trimmed) ? values.filter((x) => x !== trimmed) : [...values, trimmed]);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && open) { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); return; }
    if (e.key === "ArrowUp" && open) { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIdx >= 0 && suggestions[activeIdx]) { toggleValue(suggestions[activeIdx]); }
      else if (text.trim()) { toggleValue(text); }
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Backspace" && !text && values.length) setValues(values.slice(0, -1));
  };

  const showDropdown = open && (loading || suggestions.length > 0 || text.trim().length >= 2);

  return (
    <div className="flex flex-col gap-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[#D9E8DB] px-1.5 py-0.5 text-[11px] font-medium text-[#2d5a3d]">
              {v}
              <button type="button" onClick={() => setValues(values.filter((x) => x !== v))} className="opacity-70 hover:opacity-100">
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
          placeholder='e.g. "Software Engineer", "Marketing"'
          value={text}
          onChange={(e) => { setText(e.target.value); setActiveIdx(-1); reposition(); setOpen(true); }}
          onFocus={() => { reposition(); setOpen(true); }}
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
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-gray-400">No matches — press Enter to add anyway</div>
              ) : (
                suggestions.map((s, i) => {
                  const checked = values.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); toggleValue(s); }}
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
                      <span className={`flex-1 truncate ${checked ? "font-medium" : ""}`}>{s}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
      <p className="px-0.5 text-[10px] text-gray-400">
        Filters companies actively hiring for matching roles.
      </p>
    </div>
  );
}
