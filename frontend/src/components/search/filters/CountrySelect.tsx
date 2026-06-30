"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Country } from "country-state-city";

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}

const inputCls =
  "w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors pr-7";
const labelCls = "block text-xs text-gray-500 mb-1";
const DROPDOWN_MAX_H = 220;

export default function CountrySelect({ label, placeholder, value, onChange }: Props) {
  const allCountries = useMemo<string[]>(
    () => Country.getAllCountries().map((c) => c.name).sort(),
    []
  );

  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value !== text.toLowerCase()) {
      const match = allCountries.find((c) => c.toLowerCase() === value.toLowerCase());
      setText(match ?? value);
    }
  }, [value, allCountries, text]);

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

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return allCountries.slice(0, 50);
    return allCountries.filter((c) => c.toLowerCase().includes(q)).slice(0, 50);
  }, [text, allCountries]);

  const select = (name: string) => {
    setText(name);
    onChange(name.toLowerCase());
    setOpen(false);
    setActiveIdx(-1);
  };

  const clear = () => {
    setText("");
    onChange("");
    setOpen(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); select(suggestions[activeIdx]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder ?? "Search country…"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActiveIdx(-1);
            reposition();
            setOpen(true);
          }}
          onKeyDown={handleKey}
          onFocus={() => { reposition(); setOpen(true); }}
          onBlur={() => {
            const match = allCountries.find((c) => c.toLowerCase() === text.trim().toLowerCase());
            if (!match) {
              if (!text.trim()) onChange("");
              else setText(value ? allCountries.find((c) => c.toLowerCase() === value) ?? "" : "");
            }
          }}
          className={inputCls}
        />
        {text && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
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
              {suggestions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">No matches</div>
              ) : (
                suggestions.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); select(name); }}
                    className={`flex w-full items-center px-3 py-2 text-left text-xs transition-colors ${
                      i === activeIdx ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {name}
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
