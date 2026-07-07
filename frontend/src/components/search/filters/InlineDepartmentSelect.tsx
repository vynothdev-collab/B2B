"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DepartmentOption } from "@/types/search";

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  options: DepartmentOption[];
}

function allLeafValues(opt: DepartmentOption): string[] {
  if (!opt.children?.length) return [opt.value];
  return opt.children.flatMap(allLeafValues);
}

function matchesSearch(opt: DepartmentOption, q: string): boolean {
  if (opt.label.toLowerCase().includes(q)) return true;
  return opt.children?.some((c) => matchesSearch(c, q)) ?? false;
}

export default function InlineDepartmentSelect({ values, onChange, options }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const q = search.toLowerCase();
  const filtered = q ? options.filter((o) => matchesSearch(o, q)) : options;

  const toggleExpand = (val: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });

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

  const toggleLeaf = (val: string) =>
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val]);

  const renderOption = (opt: DepartmentOption, depth = 0) => {
    const hasChildren = !!opt.children?.length;
    const isExpanded = expanded.has(opt.value) || !!q;

    if (hasChildren) {
      const leaves = allLeafValues(opt);
      const selectedCount = leaves.filter((v) => values.includes(v)).length;
      const allSelected = selectedCount === leaves.length;
      const someSelected = selectedCount > 0 && !allSelected;
      const visibleChildren = q ? opt.children!.filter((c) => matchesSearch(c, q)) : opt.children!;

      return (
        <div key={opt.value}>
          <div
            className="flex min-h-0 items-center gap-1 py-[3px] rounded hover:bg-gray-50"
            style={{ paddingLeft: `${depth * 12 + 4}px` }}
          >
            {/* Checkbox — only this toggles selection */}
            <button
              type="button"
              onClick={() => toggleParent(opt)}
              className="shrink-0 flex h-3.5 w-3.5 items-center justify-center rounded border transition-colors focus:outline-none"
              style={{
                borderColor: allSelected ? "#ef4444" : someSelected ? "#f87171" : "#d1d5db",
                backgroundColor: allSelected ? "#ef4444" : someSelected ? "#fee2e2" : "#ffffff",
              }}
            >
              {allSelected && (
                <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {someSelected && <span className="block h-1.5 w-1.5 rounded-sm bg-red-500" />}
            </button>

            {/* Label + chevron — clicking either expands/collapses */}
            <button
              type="button"
              onClick={() => { if (!q) toggleExpand(opt.value); }}
              className="flex flex-1 items-center justify-between min-w-0 pl-1.5 text-left"
            >
              <span className={`text-[12px] leading-none truncate ${allSelected || someSelected ? "text-red-700 font-medium" : "text-gray-700"}`}>
                {opt.label}
              </span>
              {!q && (
                <span className="shrink-0 pl-1 pr-1 text-gray-400">
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </span>
              )}
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
        onClick={() => toggleLeaf(opt.value)}
        className="flex w-full min-h-0 items-center gap-2 py-[3px] rounded hover:bg-gray-50 text-left"
        style={{ paddingLeft: `${depth * 12 + 4 + 20}px` }}
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
        <span className={`text-[12px] leading-none truncate ${selected ? "text-red-700 font-medium" : "text-gray-600"}`}>
          {opt.label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        placeholder="Search department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none"
      />
      <div className="max-h-64 overflow-y-auto mt-0.5">
        {filtered.length === 0 ? (
          <p className="px-1 py-2 text-[12px] text-gray-400">No departments found</p>
        ) : (
          filtered.map((o) => renderOption(o))
        )}
      </div>
    </div>
  );
}
