"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

export default function SlidePanel({ isOpen, onClose, title, subtitle, children, width = "lg" }: SlidePanelProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const widthClass = { md: "max-w-md", lg: "max-w-2xl", xl: "max-w-3xl" }[width];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white border-l border-slate-200 shadow-xl transition-transform duration-250 ease-out ${widthClass} ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
