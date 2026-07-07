"use client";
import { Lock } from "lucide-react";

interface Props {
  description?: string;
  options?: { value?: string; label: string }[];
}

const labelCls = "mb-1 block text-[12px] text-gray-500";

export default function StaticPlaceholder({ description, options }: Props) {
  return (
    <div className="space-y-1.5">
      {description && (
        <div className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 sm:px-2.5">
          <Lock className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[10px] leading-snug text-amber-700">
            {description}
          </p>
        </div>
      )}

      {options && options.length > 0 && (
        <div>
          <span className={labelCls}>Examples</span>
          <div className="flex flex-wrap gap-1">
            {options.map((o) => (
              <span
                key={o.label}
                className="inline-flex cursor-not-allowed items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400"
              >
                {o.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
