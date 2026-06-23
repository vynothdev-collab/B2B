"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, ChevronDown } from "lucide-react";
import FilterSection from "../FilterSection";
import MultiChipSelect from "../MultiChipSelect";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import BulkCompanyInput from "./BulkCompanyInput";
import CountrySelect from "./CountrySelect";
import LocationAutocomplete from "./LocationAutocomplete";
import RangeInput from "./RangeInput";
import StaticPlaceholder from "./StaticPlaceholder";
import type { CompanyFilters } from "@/types/search";
import {
  COMPANY_TYPE_OPTIONS,
  REVENUE_OPTIONS,
  EMPLOYEE_COUNT_PRESETS,
  FUNDING_STAGE_OPTIONS,
  GROWTH_TIMEFRAME_OPTIONS,
  DEPARTMENT_OPTIONS,
  KEYWORDS_STATIC,
  BUYING_INTENT_STATIC,
} from "@/types/search";

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const labelCls = "block text-xs text-gray-500 mb-1";

function EmployeeHeadcountDropdown({
  minValue, maxValue, onChange,
}: { minValue: string; maxValue: string; onChange: (patch: { employeeCountMin?: string; employeeCountMax?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxH: 280 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const avail = Math.max(120, window.innerHeight - r.bottom - 8);
    setPos({ top: r.bottom + 4, left: r.left, width: r.width, maxH: Math.min(280, avail) });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    const close = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open, reposition]);

  const label =
    !minValue && !maxValue
      ? "Any size"
      : `${minValue || "0"} – ${maxValue || "∞"}`;

  return (
    <div>
      <span className={labelCls}>Employee headcount</span>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
      >
        <span className={minValue || maxValue ? "" : "text-gray-400"}>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxH }}
        >
          <div className="border-b border-gray-100 p-2">
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minValue}
                onChange={(e) => onChange({ employeeCountMin: e.target.value })}
                className="rounded-md bg-gray-50 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxValue}
                onChange={(e) => onChange({ employeeCountMax: e.target.value })}
                className="rounded-md bg-gray-50 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
            </div>
          </div>
          <div className="overflow-y-auto py-1" style={{ maxHeight: pos.maxH - 60 }}>
            {EMPLOYEE_COUNT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ employeeCountMin: String(p.min), employeeCountMax: p.max ? String(p.max) : "" });
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange({ employeeCountMin: "", employeeCountMax: "" });
                setOpen(false);
              }}
              className="block w-full border-t border-gray-100 px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const SECTIONS = [
  "lookalikes", "company", "location", "type", "keywords",
  "headcount", "industry", "intent", "technologies",
  "revenue", "funding", "headcountGrowth", "headcountByDept", "headcountByLocation", "founded",
] as const;
type Section = typeof SECTIONS[number];

export default function CompanyFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("company");
  const toggle = (s: Section) => setOpen((p) => (p === s ? ("" as Section) : s));

  return (
    <>
      <FilterSection title="AI Lookalikes" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-purple-200 bg-purple-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <p className="text-[11px] text-purple-700">Find similar companies — coming soon.</p>
        </div>
      </FilterSection>

      <FilterSection title="Company" isOpen={open === "company"} onToggle={() => toggle("company")}>
        <BulkCompanyInput
          label="Company (bulk add supported)"
          values={filters.companies}
          onChange={(v) => onChange({ companies: v })}
        />
      </FilterSection>

      <FilterSection title="Location" isOpen={open === "location"} onToggle={() => toggle("location")}>
        <LocationAutocomplete
          placeholder="Enter location"
          values={filters.locations}
          onChange={(v) => onChange({ locations: v })}
        />
      </FilterSection>

      <FilterSection title="Type & Business Model" isOpen={open === "type"} onToggle={() => toggle("type")}>
        <MultiChipSelect
          label="Company Type"
          placeholder="Select type"
          options={COMPANY_TYPE_OPTIONS}
          values={filters.type}
          onChange={(v) => onChange({ type: v })}
        />
      </FilterSection>

      <FilterSection title="Keywords" isOpen={open === "keywords"} onToggle={() => toggle("keywords")}>
        <StaticPlaceholder
          description="Static suggestions — keyword search not yet wired up."
          options={KEYWORDS_STATIC.map((k) => ({ label: k }))}
        />
      </FilterSection>

      <FilterSection title="Employee Headcount" isOpen={open === "headcount"} onToggle={() => toggle("headcount")}>
        <EmployeeHeadcountDropdown
          minValue={filters.employeeCountMin}
          maxValue={filters.employeeCountMax}
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection title="Industry" isOpen={open === "industry"} onToggle={() => toggle("industry")}>
        <MultiChipAutocomplete
          label="Industry"
          placeholder="Search industry…"
          field="industry"
          values={filters.industries}
          onChange={(v) => onChange({ industries: v })}
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Type to search PDL canonical industries.
        </p>
      </FilterSection>

      <FilterSection title="Buying Intent" isOpen={open === "intent"} onToggle={() => toggle("intent")}>
        <StaticPlaceholder
          description="Buying intent signals are not exposed by PDL."
          options={BUYING_INTENT_STATIC.map((k) => ({ label: k }))}
        />
      </FilterSection>

      <FilterSection title="Technologies" isOpen={open === "technologies"} onToggle={() => toggle("technologies")}>
        <MultiChipAutocomplete
          label="Skills / Technologies"
          placeholder="e.g. React, AWS, Salesforce…"
          field="skill"
          values={filters.technologies}
          onChange={(v) => onChange({ technologies: v })}
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Matches companies whose tags include the selected technologies.
        </p>
      </FilterSection>

      <FilterSection title="Revenue" isOpen={open === "revenue"} onToggle={() => toggle("revenue")}>
        <MultiChipSelect
          label="Revenue range"
          placeholder="Select revenue"
          options={REVENUE_OPTIONS}
          values={filters.revenueBuckets}
          onChange={(v) => onChange({ revenueBuckets: v })}
        />
      </FilterSection>

      <FilterSection title="Funding" isOpen={open === "funding"} onToggle={() => toggle("funding")}>
        <RangeInput
          label="Total funding raised (USD)"
          minValue={filters.fundingMin}
          maxValue={filters.fundingMax}
          onMinChange={(v) => onChange({ fundingMin: v })}
          onMaxChange={(v) => onChange({ fundingMax: v })}
          minPlaceholder="0"
          maxPlaceholder="No max"
          prefix="$"
        />
        <MultiChipSelect
          label="Latest funding stage"
          placeholder="Select stage(s)"
          options={FUNDING_STAGE_OPTIONS}
          values={filters.fundingStages}
          onChange={(v) => onChange({ fundingStages: v })}
        />
      </FilterSection>

      <FilterSection title="Headcount Growth" isOpen={open === "headcountGrowth"} onToggle={() => toggle("headcountGrowth")}>
        <div>
          <span className={labelCls}>Timeframe</span>
          <select
            value={filters.headcountGrowthTimeframe}
            onChange={(e) => onChange({ headcountGrowthTimeframe: e.target.value as CompanyFilters["headcountGrowthTimeframe"] })}
            className="w-full rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          >
            {GROWTH_TIMEFRAME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <RangeInput
          label="Growth range"
          minValue={filters.headcountGrowthMin}
          maxValue={filters.headcountGrowthMax}
          onMinChange={(v) => onChange({ headcountGrowthMin: v })}
          onMaxChange={(v) => onChange({ headcountGrowthMax: v })}
          minPlaceholder="Min %"
          maxPlaceholder="Max %"
          prefix="%"
        />
      </FilterSection>

      <FilterSection title="Headcount by Department" isOpen={open === "headcountByDept"} onToggle={() => toggle("headcountByDept")}>
        <MultiChipSelect
          label="Department"
          placeholder="Select department"
          options={DEPARTMENT_OPTIONS}
          values={filters.headcountByDepartment ? [filters.headcountByDepartment] : []}
          onChange={(v) => onChange({ headcountByDepartment: v[v.length - 1] ?? "" })}
        />
        <RangeInput
          label="Employees in department"
          minValue={filters.headcountByDepartmentMin}
          maxValue={filters.headcountByDepartmentMax}
          onMinChange={(v) => onChange({ headcountByDepartmentMin: v })}
          onMaxChange={(v) => onChange({ headcountByDepartmentMax: v })}
          minPlaceholder="Min"
          maxPlaceholder="Max"
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Filters companies by employee count in the chosen role/department.
        </p>
      </FilterSection>

      <FilterSection title="Headcount by Location" isOpen={open === "headcountByLocation"} onToggle={() => toggle("headcountByLocation")}>
        <CountrySelect
          label="Country"
          placeholder="Search country…"
          value={filters.headcountByLocationCountry}
          onChange={(v) => onChange({ headcountByLocationCountry: v })}
        />
        <RangeInput
          label="Employees in country"
          minValue={filters.headcountByLocationMin}
          maxValue={filters.headcountByLocationMax}
          onMinChange={(v) => onChange({ headcountByLocationMin: v })}
          onMaxChange={(v) => onChange({ headcountByLocationMax: v })}
          minPlaceholder="Min"
          maxPlaceholder="Max"
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Filters by the company&apos;s headcount in the specified country.
        </p>
      </FilterSection>

      <FilterSection title="Founded Year" isOpen={open === "founded"} onToggle={() => toggle("founded")}>
        <RangeInput
          label="Year range"
          minValue={filters.foundedMin}
          maxValue={filters.foundedMax}
          onMinChange={(v) => onChange({ foundedMin: v })}
          onMaxChange={(v) => onChange({ foundedMax: v })}
          minPlaceholder="From"
          maxPlaceholder="To"
        />
      </FilterSection>
    </>
  );
}
