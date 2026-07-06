"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import type { DepartmentOption } from "@/types/search";

interface Props {
  label?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: DepartmentOption[];
}

const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";
const CHIP_CLS = "bg-red-100 text-red-700";
const DROPDOWN_MAX_H = 280;

function allLeafValues(opt: DepartmentOption): string[] {
  if (!opt.children?.length) return [opt.value];
  return opt.children.flatMap(allLeafValues);
}

function flatLabel(opts: DepartmentOption[], val: string): string {
  for (const o of opts) {
    if (o.value === val) return o.label;
    if (o.children) {
      const found = flatLabel(o.children, val);
      if (found !== val) return found;
    }
  }
  return val;
}

export default function HierarchicalMultiSelect({ label, placeholder, values, onChange, options }: Props) {
  const [inputText, setInputText] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: DROPDOWN_MAX_H });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLabel = (val: string) => flatLabel(options, val);

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

  const toggleExpand = (val: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  const toggleValue = (val: string) =>
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val]);

  const toggleParent = (opt: DepartmentOption) => {
    const leaves = allLeafValues(opt);
    const allSelected = leaves.every((v) => values.includes(v));
    if (allSelected) {
      onChange(values.filter((v) => !leaves.includes(v)));
    } else {
      const next = [...values];
      leaves.forEach((v) => { if (!next.includes(v)) next.push(v); });
      onChange(next);
    }
  };

  const removeValue = (val: string) => onChange(values.filter((v) => v !== val));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputText && values.length > 0) removeValue(values[values.length - 1]);
    else if (e.key === "Escape") setOpen(false);
  };

  const q = inputText.toLowerCase();

  const matchesSearch = (opt: DepartmentOption): boolean => {
    if (opt.label.toLowerCase().includes(q)) return true;
    return opt.children?.some(matchesSearch) ?? false;
  };

  const filteredOptions = q ? options.filter(matchesSearch) : options;

  const renderOption = (opt: DepartmentOption, depth = 0) => {
    const hasChildren = !!opt.children?.length;
    const isExpanded = expanded.has(opt.value) || !!q;

    if (hasChildren) {
      const leaves = allLeafValues(opt);
      const selectedCount = leaves.filter((v) => values.includes(v)).length;
      const allSelected = selectedCount === leaves.length;
      const someSelected = selectedCount > 0 && !allSelected;

      const visibleChildren = q ? opt.children!.filter(matchesSearch) : opt.children!;

      return (
        <div key={opt.value}>
          <div
            className={`flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[11px] transition-colors cursor-pointer sm:px-3 sm:py-2 sm:text-xs ${
              allSelected ? "bg-red-50 text-red-700" : someSelected ? "bg-red-50/50 text-gray-800" : "text-gray-700 hover:bg-gray-50"
            }`}
            style={{ paddingLeft: `${(depth + 1) * 10}px` }}
          >
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); if (!q) toggleExpand(opt.value); }}
              className="shrink-0 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); toggleParent(opt); }}
              className="flex flex-1 items-center gap-1.5 text-left"
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                  allSelected ? "border-red-500 bg-red-500" : someSelected ? "border-red-400 bg-red-100" : "border-gray-300 bg-white"
                }`}
              >
                {allSelected && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {someSelected && <span className="block h-1.5 w-1.5 rounded-sm bg-red-500" />}
              </span>
              <span className="font-medium">{opt.label}</span>
            </button>
          </div>
          {isExpanded && visibleChildren.map((child) => renderOption(child, depth + 1))}
        </div>
      );
    }

    const selected = values.includes(opt.value);
    return (
      <button
        key={opt.value}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); toggleValue(opt.value); }}
        className={`flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[11px] transition-colors sm:px-3 sm:py-2 sm:text-xs ${
          selected ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${(depth + 1) * 10 + 14}px` }}
      >
        <span
          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
            selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <span>{opt.label}</span>
      </button>
    );
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((val) => (
            <span
              key={val}
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-[11px] ${CHIP_CLS}`}
            >
              {getLabel(val)}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); removeValue(val); }}
                className="hover:opacity-70"
              >
                <X className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full cursor-text rounded-lg border border-gray-200 bg-white px-2 py-1 transition-colors focus-within:border-red-500 sm:border-2"
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
          className="w-full bg-transparent text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none sm:text-xs"
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
                filteredOptions.map((o) => renderOption(o))
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
