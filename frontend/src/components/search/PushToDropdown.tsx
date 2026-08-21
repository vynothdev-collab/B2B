"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Lock, Upload } from "lucide-react";

export type PushToDropdownGroup = "CRMs" | "Cold outreach software";

export interface PushToDropdownEntry {
  key: string;
  label: string;
  icon: React.ReactNode;
  group: PushToDropdownGroup;
  disabled?: boolean;
  disabledReason?: string;
  onSelect: () => void;
}

interface Props {
  entries: PushToDropdownEntry[];
  disabled?: boolean;
  label?: string;
  className?: string;
  align?: "left" | "right";
}

const GROUP_ORDER: PushToDropdownGroup[] = ["CRMs", "Cold outreach software"];

export default function PushToDropdown({
  entries,
  disabled,
  label = "Push to...",
  className,
  align = "right",
}: Props) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = () => {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const estimatedPanelHeight = 56 + entries.length * 36;
      setOpenUp(window.innerHeight - rect.bottom < estimatedPanelHeight);
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={
          className ??
          "flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs"
        }
      >
        <Upload className="h-3.5 w-3.5" />
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div
          className={`absolute z-40 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-2xl ${
            openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${align === "right" ? "right-0" : "left-0"}`}
        >
          {GROUP_ORDER.map((group) => {
            const groupEntries = entries.filter((e) => e.group === group);
            if (groupEntries.length === 0) return null;
            return (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  {group}
                </p>
                {groupEntries.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    disabled={entry.disabled}
                    title={entry.disabled ? entry.disabledReason : undefined}
                    onClick={() => {
                      setOpen(false);
                      entry.onSelect();
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {entry.icon}
                    </span>
                    <span className="flex-1 truncate">{entry.label}</span>
                    {entry.disabled && (
                      <Lock className="h-3 w-3 shrink-0 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BrandBadge({
  letter,
  bg,
  color,
}: {
  letter: string;
  bg: string;
  color: string;
}) {
  return (
    <span
      className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
      style={{ background: bg, color }}
    >
      {letter}
    </span>
  );
}
