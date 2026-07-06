"use client";
import { useEffect, useRef, useState } from "react";
import { getLists } from "@/lib/listsApi";
import type { ListRecord } from "@/lib/listsApi";
import type { PersonFilters } from "@/types/search";

const labelCls = "mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-400";
const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none sm:border-2 sm:px-3 sm:py-2 sm:text-xs";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

function Checkbox({
  checked,
  label,
  onChange,
  disabled,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex w-full items-center gap-2.5 rounded px-1 py-1.5 text-left transition-colors ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"} ${checked ? "text-red-700" : "text-gray-700"}`}
    >
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checked ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      <span className={`flex-1 text-[12px] ${checked ? "font-medium" : ""}`}>{label}</span>
    </button>
  );
}

function ListSelect({
  lists,
  selectedIds,
  onChange,
}: {
  lists: ListRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="mt-1 ml-6 flex flex-col gap-0.5">
      {lists.map((lst) => {
        const sel = selectedIds.includes(lst.id);
        return (
          <button
            key={lst.id}
            type="button"
            onClick={() => onChange(sel ? selectedIds.filter((x) => x !== lst.id) : [...selectedIds, lst.id])}
            className={`flex items-center gap-2 rounded px-1 py-1 text-left hover:bg-gray-50 ${sel ? "text-red-700" : "text-gray-600"}`}
          >
            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${sel ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
              {sel && <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </span>
            <span className="text-[11px]">{lst.name}</span>
            <span className="ml-auto text-[10px] text-gray-400">{lst.record_count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function DuplicateControlFilter({ filters, onChange }: Props) {
  const [peopleLists, setPeopleLists] = useState<ListRecord[]>([]);
  const [companyLists, setCompanyLists] = useState<ListRecord[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLists().then((lists) => {
      setPeopleLists(lists.filter((l) => l.list_type === "people"));
      setCompanyLists(lists.filter((l) => l.list_type === "companies"));
    }).catch(() => {});
  }, []);

  const addExclusion = () => {
    const v = draft.trim();
    if (v && !filters.exclusionCompanyNames.includes(v)) {
      onChange({ exclusionCompanyNames: [...filters.exclusionCompanyNames, v] });
    }
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Companies saved */}
      <div>
        <p className={labelCls}>Companies saved in LeadsBuddy</p>
        <Checkbox
          checked={filters.hideAllSavedCompanies}
          label="Hide all companies linked to any saved people"
          onChange={(v) => onChange({ hideAllSavedCompanies: v })}
        />
        {filters.hideAllSavedCompanies && companyLists.length > 0 && (
          <ListSelect
            lists={companyLists}
            selectedIds={filters.hideSavedCompanyListIds}
            onChange={(ids) => onChange({ hideSavedCompanyListIds: ids })}
          />
        )}
      </div>

      {/* Saved people */}
      <div>
        <p className={labelCls}>Saved in LeadsBuddy</p>
        <Checkbox
          checked={filters.hideAllSavedPeople}
          label="Hide all people already saved in a list"
          onChange={(v) => onChange({ hideAllSavedPeople: v })}
        />
        {filters.hideAllSavedPeople && peopleLists.length > 0 && (
          <ListSelect
            lists={peopleLists}
            selectedIds={filters.hideSavedPeopleListIds}
            onChange={(ids) => onChange({ hideSavedPeopleListIds: ids })}
          />
        )}
      </div>

      {/* Exported — no tracking yet */}
      <div>
        <p className={labelCls}>Exported from LeadsBuddy</p>
        <Checkbox checked={false} label="Hide people already exported" onChange={() => {}} disabled />
        <p className="mt-0.5 px-1 text-[10px] text-gray-400">Export history tracking — coming soon.</p>
      </div>

      {/* Exclusion list */}
      <div>
        <p className={labelCls}>Exclusion Lists</p>
        {filters.exclusionCompanyNames.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {filters.exclusionCompanyNames.map((v) => (
              <span key={v} className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700">
                {v}
                <button
                  type="button"
                  onClick={() => onChange({ exclusionCompanyNames: filters.exclusionCompanyNames.filter((x) => x !== v) })}
                  className="text-red-400 hover:text-red-600 leading-none"
                >×</button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder="Paste company name to exclude…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExclusion(); } }}
          onBlur={addExclusion}
          className={inputCls}
        />
        <p className="mt-0.5 px-0.5 text-[10px] text-gray-400">Press Enter to add. Excludes people at matching companies.</p>
      </div>
    </div>
  );
}
