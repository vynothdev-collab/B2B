"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin } from "lucide-react";
import { Country, State } from "country-state-city";

interface Props {
  placeholder?: string;
  values: string[];
  onChange: (v: string[]) => void;
}

interface LocOption {
  display: string;
  stored: string;
  kind: "country" | "state";
}

const inputCls =
  "w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors";
const DROPDOWN_MAX_H = 240;

function buildIndex(): LocOption[] {
  const out: LocOption[] = [];
  for (const c of Country.getAllCountries()) {
    const countryNameLc = c.name.toLowerCase();
    out.push({
      display: c.name,
      stored: countryNameLc,
      kind: "country",
    });
    for (const s of State.getStatesOfCountry(c.isoCode)) {
      const stateNameLc = s.name.toLowerCase();
      out.push({
        display: `${s.name}, ${c.name}`,
        stored: `${stateNameLc}, ${countryNameLc}`,
        kind: "state",
      });
    }
  }
  return out;
}

let LOCATION_INDEX: LocOption[] | null = null;
function getIndex(): LocOption[] {
  if (!LOCATION_INDEX) LOCATION_INDEX = buildIndex();
  return LOCATION_INDEX;
}

export default function LocationAutocomplete({ placeholder, values, onChange }: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
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
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const suggestions = useMemo<LocOption[]>(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    const index = getIndex();
    const out: LocOption[] = [];
    for (const item of index) {
      if (values.includes(item.stored)) continue;
      if (item.display.toLowerCase().includes(q)) {
        out.push(item);
        if (out.length >= 30) break;
      }
    }
    out.sort((a, b) => {
      const aStarts = a.display.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.display.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      if (a.kind !== b.kind) return a.kind === "country" ? -1 : 1;
      return a.display.localeCompare(b.display);
    });
    return out.slice(0, 20);
  }, [text, values]);

  useEffect(() => {
    if (suggestions.length > 0 && text.trim()) {
      reposition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [suggestions, text, reposition]);

  const add = (item: LocOption) => {
    if (values.includes(item.stored)) return;
    onChange([...values, item.stored]);
    setText("");
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
      add(suggestions[activeIdx]);
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Backspace" && !text && values.length) onChange(values.slice(0, -1));
  };

  return (
    <div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-700">
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
          placeholder={placeholder ?? "Enter location"}
          value={text}
          onChange={(e) => { setText(e.target.value); setActiveIdx(-1); }}
          onKeyDown={handleKey}
          onFocus={() => { if (suggestions.length > 0) { reposition(); setOpen(true); } }}
          className={inputCls}
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
                <div className="px-3 py-2 text-xs text-gray-400">No matches</div>
              ) : (
                suggestions.map((s, i) => (
                  <button
                    key={s.stored}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); add(s); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      i === activeIdx ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                    <span className="truncate">{s.display}</span>
                    <span className="ml-auto shrink-0 text-[10px] uppercase text-gray-400">{s.kind}</span>
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
