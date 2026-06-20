"use client";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterSection({ title, children, isOpen, onToggle }: Props) {
  return (
    <div className="mx-3 my-1.5 rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 transition-colors bg-gray-100"
      >
        {title}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-in-out group-hover:text-gray-500 ${
            isOpen ? "rotate-180 text-gray-400" : "rotate-0 text-gray-300"
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-2 space-y-2.5 bg-white border-t border-gray-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
