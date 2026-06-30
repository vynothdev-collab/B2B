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
  "w-full rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] text-gray-800 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50 sm:px-3 sm:py-2 sm:text-xs";
const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";

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
