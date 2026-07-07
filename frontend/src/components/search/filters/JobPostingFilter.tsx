"use client";
import { useRef, useState } from "react";
import type { PersonFilters } from "@/types/search";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

export default function JobPostingFilter({ filters, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const commit = () => {
    const v = draft.trim();
    if (v && !filters.jobPostingKeywords.includes(v))
      onChange({ jobPostingKeywords: [...filters.jobPostingKeywords, v] });
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2">
      {filters.jobPostingKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.jobPostingKeywords.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700">
              {v}
              <button
                type="button"
                onClick={() => onChange({ jobPostingKeywords: filters.jobPostingKeywords.filter((x) => x !== v) })}
                className="text-red-400 hover:text-red-600 leading-none"
              >×</button>
            </span>
          ))}
        </div>
      )}
      <input
        ref={ref}
        type="text"
        placeholder='e.g. "Software Engineer", "Marketing"'
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
        onBlur={commit}
        className={inputCls}
      />
      <p className="px-0.5 text-[10px] text-gray-400">
        Filters people at companies actively hiring for matching roles. Press Enter to add.
      </p>
    </div>
  );
}
