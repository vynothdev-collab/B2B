"use client";
import { useRef, useState } from "react";
import { X, Upload } from "lucide-react";

interface Props {
  label?: string;
  placeholder?: string;
  values: string[];
  onChange: (v: string[]) => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none sm:border-2 sm:px-3 sm:py-2 sm:text-xs";
const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";

export default function BulkCompanyInput({ label, placeholder, values, onChange }: Props) {
  const [text, setText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setText("");
      return;
    }
    onChange([...values, v]);
    setText("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
      return;
    }
    if (e.key === "Backspace" && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const applyBulk = () => {
    const items = bulkText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set(values.map((v) => v.toLowerCase()));
    const merged = [...values];
    for (const item of items) {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
    onChange(merged);
    setBulkText("");
    setBulkOpen(false);
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 sm:px-2 sm:text-[11px]"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="hover:opacity-70"
              >
                <X className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder ?? "Type company and press Enter…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { if (text.trim()) add(text); }}
          className={inputCls + " flex-1"}
        />
        <button
          type="button"
          onClick={() => setBulkOpen((o) => !o)}
          title="Bulk add"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-[10px] font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:px-2.5 sm:text-[11px]"
        >
          <Upload className="h-3 w-3" />
          Bulk
        </button>
      </div>

      {bulkOpen && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste companies — one per line or comma-separated"
            className="block min-h-[76px] w-full resize-y rounded-md bg-gray-50 px-2 py-1.5 text-[11px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 sm:min-h-[90px] sm:text-xs"
          />
          <div className="mt-2 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => { setBulkOpen(false); setBulkText(""); }}
              className="rounded-md border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyBulk}
              className="rounded-md bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-500"
            >
              Add all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
