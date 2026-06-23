"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export interface RangePreset {
  label: string;
  min?: number;
  max?: number;
}

interface Props {
  label?: string;
  placeholder?: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  presets: RangePreset[];
  format?: (n: number) => string;
  unitSuffix?: string;
}

const labelCls = "block text-xs text-gray-500 mb-1";

function defaultFormat(n: number): string {
  return n.toLocaleString();
}

export default function RangeDropdown({
  label,
  placeholder = "Any",
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  presets,
  format = defaultFormat,
  unitSuffix = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    maxH: number;
    top?: number;
    bottom?: number;
  }>({ left: 0, width: 0, maxH: 220, top: 0 });

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const spaceAbove = r.top - 8;
    const preferred = 220;
    const minDesired = 180;

    if (spaceBelow < minDesired && spaceAbove > spaceBelow) {
      const maxH = Math.min(preferred, Math.max(140, spaceAbove));
      setPos({
        bottom: window.innerHeight - r.top + 4,
        left: r.left,
        width: r.width,
        maxH,
      });
    } else {
      const maxH = Math.min(preferred, Math.max(140, spaceBelow));
      setPos({ top: r.bottom + 4, left: r.left, width: r.width, maxH });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    const close = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open, reposition]);

  const buttonLabel = (() => {
    if (!minValue && !maxValue) return placeholder;
    const minPart = minValue ? `${format(Number(minValue))}${unitSuffix}` : "0";
    const maxPart = maxValue ? `${format(Number(maxValue))}${unitSuffix}` : "∞";
    return `${minPart} – ${maxPart}`;
  })();

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
      >
        <span className={minValue || maxValue ? "" : "text-gray-400"}>{buttonLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxH,
          }}
        >
          <div className="border-b border-gray-100 px-2 py-1.5">
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="Min"
                value={minValue}
                onChange={(e) => onMinChange(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxValue}
                onChange={(e) => onMaxChange(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto py-1" style={{ maxHeight: pos.maxH - 80 }}>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onMinChange(p.min != null ? String(p.min) : "");
                  onMaxChange(p.max != null ? String(p.max) : "");
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onMinChange("");
                onMaxChange("");
                setOpen(false);
              }}
              className="block w-full border-t border-gray-100 px-3 py-1.5 text-left text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
