"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Info, X } from "lucide-react";

export interface ChipItem {
  label: string;
  onRemove: () => void;
}

export function FilterPreviewChips({ items }: { items: ChipItem[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1 px-3 pb-2.5 pt-0.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-md bg-[#D9E8DB] px-1.5 py-0.5 text-[11px] font-medium text-[#2d5a3d]"
        >
          {item.label}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); item.onRemove(); }}
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  info?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  count?: number;
  onClear?: () => void;
  preview?: React.ReactNode;
}

export default function FilterSection({
  title, icon, info, children, isOpen, onToggle, count, onClear, preview,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(isOpen);
  const [previewVisible, setPreviewVisible] = useState(!isOpen);

  useEffect(() => {
    if (isOpen) {
      setPreviewVisible(false);
      if (!prevOpenRef.current && wrapRef.current) {
        const t = window.setTimeout(() => {
          wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 60);
        prevOpenRef.current = true;
        return () => window.clearTimeout(t);
      }
    } else {
      const t = window.setTimeout(() => setPreviewVisible(true), 500);
      return () => window.clearTimeout(t);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  const hasActive = !!count && count > 0;

  return (
    <div
      ref={wrapRef}
      className={
        isOpen
          ? "mx-1.5 my-1 overflow-hidden rounded-xl border-2 border-red-300 bg-white shadow-sm"
          : hasActive
          ? "mx-1.5 my-1 overflow-hidden rounded-xl border-2 border-red-200 bg-white"
          : "mx-1.5 my-1 overflow-hidden rounded-xl border-2 border-gray-100 transition-colors hover:border-gray-200"
      }
    >
      {/* Header row — single flex row, badge before chevron, chevron at far right */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        title={info}
        className={`flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium transition-colors [&_svg]:h-3.5 [&_svg]:w-3.5 ${
          isOpen
            ? "bg-red-50/60 text-red-700"
            : hasActive
            ? "text-red-700 hover:bg-red-100/40"
            : "text-gray-800 hover:bg-gray-50/60"
        }`}
      >
        <span className="shrink-0 text-red-500">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-left">{title}</span>
        {info && (
          <span title={info}>
            <Info className="h-3 w-3 shrink-0 text-gray-300" />
          </span>
        )}
        {/* Count badge — left of chevron */}
        {hasActive && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear?.(); }}
            title="Clear filters"
            className="flex shrink-0 items-center gap-1 rounded-full bg-red-100 py-0.5 pl-2 pr-1.5 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-200"
          >
            {count}
            <X className="h-2.5 w-2.5" />
          </button>
        )}
        {/* Chevron — always at far right edge */}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-500 ${
            isOpen ? "rotate-180 text-red-500" : hasActive ? "text-red-400" : "text-gray-400"
          }`}
        />
      </div>

      {/* Preview chips — visible only after close animation completes */}
      {!isOpen && previewVisible && hasActive && preview}

      {/* Expandable content */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1.5 px-3 pb-3 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
