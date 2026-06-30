"use client";
import { useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface Option { value: string; label: string }

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}

const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";

export default function SearchableSelect({ label, placeholder, value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const selected = options.find(o => o.value === value);
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    }
    setOpen(true);
    setSearch("");
  };

  return (
    <div>
      <span className={labelCls}>{label}</span>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 sm:px-3 sm:py-2 sm:text-xs"
      >
        <span className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {value && (
            <X
              className="h-3 w-3 text-gray-400 hover:text-gray-600"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
            />
          )}
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 200) }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5">
                <Search className="h-3 w-3 text-gray-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none sm:text-xs"
                />
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-gray-400">No results</p>
              ) : filtered.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full px-2.5 py-1.5 text-left text-[11px] transition-colors hover:bg-red-50 sm:px-3 sm:py-2 sm:text-xs ${value === o.value ? "bg-red-50 text-red-700 font-semibold" : "text-gray-700"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
