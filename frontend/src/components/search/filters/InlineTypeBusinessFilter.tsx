"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { PersonFilters } from "@/types/search";
import { COMPANY_STATUS_OPTIONS, INDUSTRY_OPTIONS } from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

interface CheckOption {
  value: string;
  label: string;
}

function CheckList({
  options,
  values,
  onToggle,
  activeIdx,
}: {
  options: CheckOption[];
  values: string[];
  onToggle: (v: string) => void;
  activeIdx: number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((opt, i) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onToggle(opt.value); }}
            className={`flex w-full items-center gap-2 px-2.5 py-1 text-left text-[12px] transition-colors ${
              i === activeIdx ? "bg-red-50 text-red-700" : selected ? "text-red-700 hover:bg-gray-50" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
              }`}
            >
              {selected && (
                <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span className={`flex-1 truncate ${selected ? "font-medium" : ""}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function tog(values: string[], v: string): string[] {
  return values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
}

const DROPDOWN_MAX_H = 260;

function IndustryMultiSelect({
  values,
  onToggle,
  onChange,
}: {
  values: string[];
  onToggle: (v: string) => void;
  onChange: (next: string[]) => void;
}) {
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

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return INDUSTRY_OPTIONS;
    return INDUSTRY_OPTIONS.filter((o) => o.label.toLowerCase().includes(q));
  }, [text]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && activeIdx >= 0 && filtered[activeIdx]) {
        onToggle(filtered[activeIdx].value);
        setText("");
        setActiveIdx(-1);
      }
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Backspace" && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      {values.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {values.map((v) => {
            const label = INDUSTRY_OPTIONS.find((o) => o.value === v)?.label ?? v;
            return (
              <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[#D9E8DB] px-1.5 py-0.5 text-[11px] font-medium text-[#2d5a3d]">
                {label}
                <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:opacity-70">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search industry…"
          value={text}
          onChange={(e) => { setText(e.target.value); setActiveIdx(-1); }}
          onFocus={() => { reposition(); setOpen(true); }}
          onKeyDown={handleKey}
          className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none"
        />
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxH }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: pos.maxH }}>
              {filtered.length ? (
                <CheckList options={filtered} values={values} onToggle={onToggle} activeIdx={activeIdx} />
              ) : (
                <div className="px-3 py-2 text-[12px] text-gray-400">No matches</div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default function InlineTypeBusinessFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Company Status */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Company Status</p>
        <div className="flex flex-col">
          {COMPANY_STATUS_OPTIONS.map((opt) => {
            const selected = filters.companyStatus.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ companyStatus: tog(filters.companyStatus, opt.value) })}
                className={`flex w-full min-h-0 items-center gap-2 rounded px-1 py-[3px] text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
              >
                <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
                  {selected && (
                    <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className={`flex-1 text-[12px] leading-none ${selected ? "font-medium" : ""}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Type / Industry */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Company Type</p>
        <IndustryMultiSelect
          values={filters.companyType}
          onToggle={(v) => onChange({ companyType: tog(filters.companyType, v) })}
          onChange={(next) => onChange({ companyType: next })}
        />
      </div>
    </div>
  );
}
