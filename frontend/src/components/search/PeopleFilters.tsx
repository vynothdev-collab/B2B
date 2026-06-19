"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AutocompleteInput from "./AutocompleteInput";
import MultiChipAutocomplete from "./MultiChipAutocomplete";
import MultiChipSelect from "./MultiChipSelect";
import type { CompanyTimeframe, PersonFilters } from "@/types/search";
import { COMPANY_SIZE_OPTIONS, REVENUE_OPTIONS, SENIORITY_OPTIONS } from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

const inputCls =
  "w-full rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors";

const TIMEFRAME_OPTIONS: { value: CompanyTimeframe; label: string }[] = [
  { value: "both", label: "Current and Past" },
  { value: "current", label: "Current" },
  { value: "past", label: "Past" },
];

function TimeframeSelect({
  value,
  onChange,
}: {
  value: CompanyTimeframe;
  onChange: (v: CompanyTimeframe) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = TIMEFRAME_OPTIONS.find((o) => o.value === value) ?? TIMEFRAME_OPTIONS[1];

  return (
    <div className="relative flex justify-end mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-0.5 text-[11px] font-medium text-purple-600 hover:text-purple-700"
      >
        {selected.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {TIMEFRAME_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center px-3 py-2 text-xs transition-colors ${
                  value === o.value ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="px-4 pt-5 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
      {title}
    </p>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="px-4 pb-2">{children}</div>;
}

export default function PeopleFilters({ filters, onChange }: Props) {
  return (
    <div className="pb-4">
      <SectionHeader title="Profile" />

      <Row>
        <input
          type="text"
          placeholder="Profile name"
          value={filters.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputCls}
        />
      </Row>

      <Row>
        <MultiChipAutocomplete
          placeholder="Profile location"
          field="country"
          values={filters.country}
          onChange={(v) => onChange({ country: v })}
        />
      </Row>

      <Row>
        <MultiChipAutocomplete
          placeholder="Job Title"
          field="title"
          values={filters.jobTitle}
          onChange={(v) => onChange({ jobTitle: v })}
        />
        <TimeframeSelect
          value={filters.jobTitleTimeframe}
          onChange={(v) => onChange({ jobTitleTimeframe: v })}
        />
      </Row>

      <Row>
        <MultiChipAutocomplete
          placeholder="Department"
          field="role"
          values={filters.department}
          onChange={(v) => onChange({ department: v })}
        />
      </Row>

      <Row>
        <MultiChipSelect
          placeholder="Seniority Level"
          options={SENIORITY_OPTIONS}
          values={filters.seniority}
          onChange={(v) => onChange({ seniority: v })}
        />
      </Row>

      <Row>
        <p className="text-[10px] text-gray-400 mb-1.5">Years of experience</p>
        <div className="flex gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={filters.yearsExperienceMin}
            onChange={(e) => onChange({ yearsExperienceMin: e.target.value })}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.yearsExperienceMax}
            onChange={(e) => onChange({ yearsExperienceMax: e.target.value })}
            className={inputCls}
          />
        </div>
      </Row>

      <Row>
        <AutocompleteInput
          placeholder="Education"
          value={filters.school}
          onChange={(v) => onChange({ school: v })}
          field="school"
        />
      </Row>

      <Row>
        <input
          type="text"
          placeholder="Keywords"
          value={filters.keywords}
          onChange={(e) => onChange({ keywords: e.target.value })}
          className={inputCls}
        />
      </Row>

      <SectionHeader title="Company" />

      <Row>
        <MultiChipAutocomplete
          placeholder="Company name"
          field="company"
          values={filters.companySearch}
          onChange={(v) => onChange({ companySearch: v })}
        />
        <TimeframeSelect
          value={filters.companyTimeframe}
          onChange={(v) => onChange({ companyTimeframe: v })}
        />
      </Row>

      <Row>
        <MultiChipAutocomplete
          placeholder="Industry"
          field="industry"
          values={filters.industry}
          onChange={(v) => onChange({ industry: v })}
        />
      </Row>

      <Row>
        <MultiChipSelect
          placeholder="Employee Count"
          options={COMPANY_SIZE_OPTIONS}
          values={filters.companySize}
          onChange={(v) => onChange({ companySize: v })}
        />
      </Row>

      <Row>
        <MultiChipSelect
          placeholder="Revenue"
          options={REVENUE_OPTIONS}
          values={filters.companyRevenue}
          onChange={(v) => onChange({ companyRevenue: v })}
        />
      </Row>
    </div>
  );
}
