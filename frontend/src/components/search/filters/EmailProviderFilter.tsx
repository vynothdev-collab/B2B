"use client";
import { EMAIL_PROVIDER_OPTIONS } from "@/types/search";
import type { PersonFilters } from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function EmailProviderFilter({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1 px-0.5 text-[10px] text-gray-400">SMTP provider</p>
      {EMAIL_PROVIDER_OPTIONS.map((opt) => {
        const selected = filters.emailProviders.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange({
                emailProviders: selected
                  ? filters.emailProviders.filter((v) => v !== opt.value)
                  : [...filters.emailProviders, opt.value],
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
  );
}
