"use client";
import { EMPLOYEE_HEADCOUNT_RANGES } from "@/types/search";

interface Props {
  mode: "predefined" | "custom";
  ranges: string[];
  countMin: string;
  countMax: string;
  onModeChange: (v: "predefined" | "custom") => void;
  onRangesChange: (v: string[]) => void;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none sm:border-2";

export default function EmployeeHeadcountFilter({
  mode, ranges, countMin, countMax,
  onModeChange, onRangesChange, onMinChange, onMaxChange,
}: Props) {
  const toggleRange = (value: string) => {
    onRangesChange(
      ranges.includes(value) ? ranges.filter((v) => v !== value) : [...ranges, value]
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onModeChange("predefined")}
        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[12px] transition-colors ${
          mode === "predefined" ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          mode === "predefined" ? "border-red-500" : "border-gray-300"
        }`}>
          {mode === "predefined" && <span className="h-2 w-2 rounded-full bg-red-500" />}
        </span>
        <span className={mode === "predefined" ? "text-red-700 font-medium" : "text-gray-700"}>
          Predefined range
        </span>
      </button>

      {mode === "predefined" && (
        <div className="flex flex-col pl-1">
          {EMPLOYEE_HEADCOUNT_RANGES.map((opt) => {
            const selected = ranges.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleRange(opt.value)}
                className={`flex w-full items-center gap-2 rounded px-1 py-[3px] text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
              >
                <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
                  {selected && (
                    <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className={`flex-1 text-[12px] leading-none ${selected ? "font-medium" : ""}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => onModeChange("custom")}
        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[12px] transition-colors ${
          mode === "custom" ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          mode === "custom" ? "border-red-500" : "border-gray-300"
        }`}>
          {mode === "custom" && <span className="h-2 w-2 rounded-full bg-red-500" />}
        </span>
        <span className={mode === "custom" ? "text-red-700 font-medium" : "text-gray-700"}>
          Custom range
        </span>
      </button>

      {mode === "custom" && (
        <div className="flex gap-2 pl-1">
          <input
            type="number"
            placeholder="Min"
            value={countMin}
            onChange={(e) => onMinChange(e.target.value)}
            className={inputCls}
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={countMax}
            onChange={(e) => onMaxChange(e.target.value)}
            className={inputCls}
            min={0}
          />
        </div>
      )}
    </div>
  );
}
