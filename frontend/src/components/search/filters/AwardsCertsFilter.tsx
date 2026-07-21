"use client";
import { useState, useRef } from "react";
import { CERTIFICATION_OPTIONS } from "@/types/search";
import type { PersonFilters } from "@/types/search";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none";
const labelCls = "mb-1 block text-[12px] text-gray-500";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

function TagInput({
  label,
  placeholder,
  values,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onAdd(v);
    setDraft("");
  };

  return (
    <div>
      <span className={labelCls}>{label}</span>
      {values.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-full bg-[#D9E8DB] px-2 py-0.5 text-[11px] text-[#2d5a3d]"
            >
              {v}
              <button
                type="button"
                onClick={() => onRemove(v)}
                className="text-red-400 hover:text-red-600 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
        }}
        onBlur={commit}
        className={inputCls}
      />
      <p className="mt-0.5 px-0.5 text-[10px] text-gray-400">Press Enter to add</p>
    </div>
  );
}

export default function AwardsCertsFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Standard Certifications */}
      <div>
        <span className={labelCls}>Standard Certifications</span>
        <div className="flex flex-col gap-0.5">
          {CERTIFICATION_OPTIONS.map((opt) => {
            const selected = filters.certifications.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onChange({
                    certifications: selected
                      ? filters.certifications.filter((v) => v !== opt.value)
                      : [...filters.certifications, opt.value],
                  })
                }
                className={`flex w-full items-center gap-2.5 rounded px-1 py-1.5 text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}
                >
                  {selected && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className={`flex-1 text-[12px] ${selected ? "font-medium" : ""}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Other Compliance */}
      <TagInput
        label="Other Compliance"
        placeholder='e.g. "FedRAMP", "NIST"'
        values={filters.otherCompliance}
        onAdd={(v) => onChange({ otherCompliance: [...filters.otherCompliance, v] })}
        onRemove={(v) => onChange({ otherCompliance: filters.otherCompliance.filter((x) => x !== v) })}
      />

      <p className="px-0.5 text-[10px] text-gray-400">
        Matches companies that mention these in their description or tags.
      </p>
    </div>
  );
}
