"use client";
import { useEffect, useRef } from "react";
import { ChevronDown, Info } from "lucide-react";

interface Props {
  title: string;
  icon?: React.ReactNode;
  info?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterSection({ title, icon, info, children, isOpen, onToggle }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current && wrapRef.current) {
      const t = window.setTimeout(() => {
        wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      prevOpenRef.current = true;
      return () => window.clearTimeout(t);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <div
      ref={wrapRef}
      className={
        isOpen
          ? "mx-1.5 my-1 overflow-hidden rounded-xl border-2 border-red-300 bg-white shadow-sm"
          : "mx-1.5 my-1 overflow-hidden rounded-xl border-2 border-gray-100 transition-colors hover:border-gray-200"
      }
    >
      <button
        type="button"
        onClick={onToggle}
        title={info}
        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium transition-colors [&_svg]:h-3.5 [&_svg]:w-3.5 ${
          isOpen
            ? "text-red-700 bg-red-50/60"
            : "text-gray-800 hover:bg-gray-50/60"
        }`}
      >
        <span className={`shrink-0 ${isOpen ? "text-red-600" : "text-red-500"}`}>{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {info && (
          <span title={info}>
            <Info className="h-3 w-3 shrink-0 text-gray-300" />
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-500 ${
            isOpen ? "rotate-180 text-red-500" : "rotate-0 text-gray-400"
          }`}
        />
      </button>

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
