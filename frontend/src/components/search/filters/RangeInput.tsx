"use client";

interface Props {
  label?: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  prefix?: string;
}

const inputCls =
  "w-full rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-colors";
const labelCls = "block text-xs text-gray-500 mb-1";

export default function RangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  prefix,
}: Props) {
  return (
    <div>
      {label && <span className={labelCls}>{label}</span>}
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-[11px] font-semibold text-gray-400">{prefix}</span>}
        <input
          type="number"
          placeholder={minPlaceholder}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className={inputCls}
        />
        <span className="text-[11px] text-gray-400">—</span>
        {prefix && <span className="text-[11px] font-semibold text-gray-400">{prefix}</span>}
        <input
          type="number"
          placeholder={maxPlaceholder}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
}
