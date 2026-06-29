"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Upload } from "lucide-react";
import { fetchAutocomplete, type AutocompleteSuggestion } from "@/lib/searchApi";

interface Props {
  label?: string;
  placeholder?: string;
  values: string[];
  onChange: (v: string[]) => void;
}

const inputCls =
  "w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors";
const labelCls = "block text-xs text-gray-500 mb-1";
const DROPDOWN_MAX_H = 220;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function BulkCompanyInput({ label, placeholder, values, onChange }: Props) {
  const [text, setText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

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
    if (!text.trim()) {
      setSuggestions([]);
      setOpen(false);
      skipFetch.current = false;
      return;
    }
    if (skipFetch.current) { skipFetch.current = false; return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchAutocomplete("company", text, 8);
        const filtered = results.filter((s) => !values.includes(s.name));
        setSuggestions(filtered);
        if (filtered.length > 0) { reposition(); setOpen(true); }
        else setOpen(false);
      } catch { setOpen(false); }
      finally { setLoading(false); }
    }, 500);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, values, reposition]);

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (values.includes(v)) return;
    skipFetch.current = true;
    onChange([...values, v]);
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
    if (e.key === "Enter" && open && activeIdx >= 0) {
      e.preventDefault();
      add(suggestions[activeIdx].name);
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
      return;
    }
    if (e.key === "Backspace" && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const applyBulk = () => {
    const items = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...values, ...items]));
    onChange(merged);
    setBulkText("");
    setBulkOpen(false);
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-red-100 text-red-700">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:opacity-70">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <div ref={containerRef} className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder ?? "Search company…"}
            value={text}
            onChange={(e) => { skipFetch.current = false; setText(e.target.value); setActiveIdx(-1); }}
            onKeyDown={handleKey}
            onFocus={() => { if (suggestions.length > 0) { reposition(); setOpen(true); } }}
            onBlur={() => { if (text.trim() && !open) { add(text); } }}
            className={inputCls + " pr-7"}
          />
          {loading && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-red-500 inline-block" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen((o) => !o)}
          title="Bulk add"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Upload className="h-3 w-3" />
          Bulk
        </button>
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
                  onMouseDown={(e) => { e.preventDefault(); add(s.name); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
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

      {bulkOpen && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste companies — one per line or comma-separated"
            className="block w-full min-h-[90px] resize-y rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50"
          />
          <div className="mt-2 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => { setBulkOpen(false); setBulkText(""); }}
              className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyBulk}
              className="rounded-md bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-500"
            >
              Add all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
