"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function FilterSection({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="h-3 w-3 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
        )}
      </button>
      {open && <div className="px-4 pb-3 space-y-3">{children}</div>}
    </div>
  );
}
