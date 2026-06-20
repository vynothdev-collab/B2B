"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  label?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: { value: string; label: string }[];
}

const labelCls = "block text-xs text-gray-500 mb-1";

const CHIP_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getChipColor(val: string): string {
  let hash = 0;
  for (let i = 0; i < val.length; i++) hash = (hash * 31 + val.charCodeAt(i)) >>> 0;
  return CHIP_COLORS[hash % CHIP_COLORS.length];
}

const DROPDOWN_MAX_H = 220;

export default function MultiChipSelect({ label, placeholder, values, onChange, options }: Props) {
  const [inputText, setInputText] = useState("");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLabel = (val: string) => options.find((o) => o.value === val)?.label ?? val;

  const filteredOptions = options.filter((o) => {
    const q = inputText.toLowerCase();
    return o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q);
  });

  const calcPos = () => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const avail = Math.max(80, window.innerHeight - r.bottom - 8);
    setPos({ top: r.bottom + 4, left: r.left, width: r.width, maxH: Math.min(DROPDOWN_MAX_H, avail) });
  };

  const openDropdown = () => { calcPos(); setOpen(true); };

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

  const toggleValue = (val: string) =>
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val]);

  const removeValue = (val: string) => onChange(values.filter((v) => v !== val));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputText && values.length > 0) removeValue(values[values.length - 1]);
    else if (e.key === "Escape") setOpen(false);
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
              {getLabel(val)}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); removeValue(val); }}
                className="hover:opacity-70"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full rounded-lg bg-gray-100 px-3 py-2 focus-within:ring-2 focus-within:ring-purple-400/50 transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={openDropdown}
          onKeyDown={handleKey}
          className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
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
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">No options found</div>
              ) : (
                filteredOptions.map((o) => {
                  const selected = values.includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); toggleValue(o.value); }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                        selected ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {selected && (
                        <svg className="ml-2 h-3.5 w-3.5 shrink-0 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
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
