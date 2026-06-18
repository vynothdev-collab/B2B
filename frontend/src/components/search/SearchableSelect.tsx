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

const labelCls = "block text-xs text-gray-500 mb-1";

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
        className="w-full flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors hover:bg-gray-200"
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
                  className="flex-1 min-w-0 bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
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
                  className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-purple-50 ${value === o.value ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700"}`}
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
