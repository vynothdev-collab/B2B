"use client";
import { useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  label?: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  /** Deprecated — kept so existing callers compile; no longer triggers any API lookup. */
  field?: string;
  /** Deprecated — kept for backward compatibility with existing callers. */
  size?: number;
}

const labelCls = "mb-1 block text-[12px] text-gray-500";

export default function MultiChipAutocomplete({ label, placeholder, values, onChange }: Props) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addValue = (raw: string) => {
    const v = raw.trim();
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setInputText("");
      return;
    }
    onChange([...values, v]);
    setInputText("");
    inputRef.current?.focus();
  };

  const removeValue = (val: string) => onChange(values.filter((v) => v !== val));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (inputText.trim()) {
        e.preventDefault();
        addValue(inputText);
      }
      return;
    }
    if (e.key === "Backspace" && !inputText && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputText.trim()) addValue(inputText);
  };

  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {values.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 rounded-md bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700"
            >
              {val}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); removeValue(val); }}
                className="hover:opacity-70"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className="relative w-full rounded-lg border border-gray-200 bg-white px-2 py-1 transition-colors focus-within:border-red-500 sm:border-2"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKey}
          onBlur={handleBlur}
          className="w-full bg-transparent text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
