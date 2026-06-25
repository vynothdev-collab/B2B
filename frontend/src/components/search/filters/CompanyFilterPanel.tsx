"use client";
import { useState } from "react";
import {
  Sparkles, Building2, MapPin, Tag, Type,
  Users, BarChart3, TrendingUp, Cpu, DollarSign, Banknote, Calendar, Activity,
} from "lucide-react";
import FilterSection from "../FilterSection";
import MultiChipSelect from "../MultiChipSelect";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import BulkCompanyInput from "./BulkCompanyInput";
import LocationAutocomplete from "./LocationAutocomplete";
import CountrySelect from "./CountrySelect";
import RangeDropdown from "./RangeDropdown";
import StaticPlaceholder from "./StaticPlaceholder";
import type { CompanyFilters } from "@/types/search";
import {
  COMPANY_TYPE_OPTIONS,
  REVENUE_OPTIONS,
  FUNDING_STAGE_OPTIONS,
  KEYWORDS_STATIC,
  BUYING_INTENT_STATIC,
  FUNDING_PRESETS,
  FOUNDED_YEAR_PRESETS,
  HEADCOUNT_RANGE_PRESETS,
  DEPARTMENT_OPTIONS,
  GROWTH_PRESETS,
  GROWTH_TIMEFRAME_OPTIONS,
} from "@/types/search";

function fmtUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const labelCls = "block text-xs text-gray-500 mb-1";


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
      <FilterSection title="AI Lookalikes" icon={<Sparkles className="h-4 w-4" />} info="Find similar companies" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-purple-200 bg-purple-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <p className="text-[11px] text-purple-700">Find similar companies — coming soon.</p>
        </div>
      </FilterSection>

      <FilterSection title="Company" icon={<Building2 className="h-4 w-4" />} isOpen={open === "company"} onToggle={() => toggle("company")}>
        <BulkCompanyInput
          label="Company (bulk add supported)"
          values={filters.companies}
          onChange={(v) => onChange({ companies: v })}
        />
      </FilterSection>

      <FilterSection title="Location" icon={<MapPin className="h-4 w-4" />} isOpen={open === "location"} onToggle={() => toggle("location")}>
        <LocationAutocomplete
          placeholder="City, state or country…"
          values={filters.locations}
          onChange={(v) => onChange({ locations: v })}
        />
      </FilterSection>

      <FilterSection title="Type & Business Model" icon={<Tag className="h-4 w-4" />} isOpen={open === "type"} onToggle={() => toggle("type")}>
        <MultiChipSelect
          label="Company Type"
          placeholder="Select type"
          options={COMPANY_TYPE_OPTIONS}
          values={filters.type}
          onChange={(v) => onChange({ type: v })}
        />
      </FilterSection>

      <FilterSection title="Keywords" icon={<Type className="h-4 w-4" />} isOpen={open === "keywords"} onToggle={() => toggle("keywords")}>
        <StaticPlaceholder
          description="Static suggestions — keyword search not yet wired up."
          options={KEYWORDS_STATIC.map((k) => ({ label: k }))}
        />
      </FilterSection>

      <FilterSection title="Employee Headcount" icon={<Users className="h-4 w-4" />} isOpen={open === "headcount"} onToggle={() => toggle("headcount")}>
        <RangeDropdown
          label="Employee headcount"
          placeholder="Any size"
          minValue={filters.employeeCountMin}
          maxValue={filters.employeeCountMax}
          onMinChange={(v) => onChange({ employeeCountMin: v })}
          onMaxChange={(v) => onChange({ employeeCountMax: v })}
          presets={HEADCOUNT_RANGE_PRESETS}
        />
      </FilterSection>

      <FilterSection title="Industry" icon={<BarChart3 className="h-4 w-4" />} isOpen={open === "industry"} onToggle={() => toggle("industry")}>
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

      <FilterSection title="Buying Intent" icon={<TrendingUp className="h-4 w-4" />} isOpen={open === "intent"} onToggle={() => toggle("intent")}>
        <StaticPlaceholder
          description="Buying intent signals are not exposed by PDL."
          options={BUYING_INTENT_STATIC.map((k) => ({ label: k }))}
        />
      </FilterSection>

      <FilterSection title="Technologies" icon={<Cpu className="h-4 w-4" />} isOpen={open === "technologies"} onToggle={() => toggle("technologies")}>
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

      <FilterSection title="Revenue" icon={<DollarSign className="h-4 w-4" />} isOpen={open === "revenue"} onToggle={() => toggle("revenue")}>
        <MultiChipSelect
          label="Revenue range"
          placeholder="Select revenue"
          options={REVENUE_OPTIONS}
          values={filters.revenueBuckets}
          onChange={(v) => onChange({ revenueBuckets: v })}
        />
      </FilterSection>

      <FilterSection title="Funding" icon={<Banknote className="h-4 w-4" />} isOpen={open === "funding"} onToggle={() => toggle("funding")}>
        <RangeDropdown
          label="Total funding raised (USD)"
          placeholder="Any amount"
          minValue={filters.fundingMin}
          maxValue={filters.fundingMax}
          onMinChange={(v) => onChange({ fundingMin: v })}
          onMaxChange={(v) => onChange({ fundingMax: v })}
          presets={FUNDING_PRESETS}
          format={fmtUsd}
        />
        <MultiChipSelect
          label="Latest funding stage"
          placeholder="Select stage(s)"
          options={FUNDING_STAGE_OPTIONS}
          values={filters.fundingStages}
          onChange={(v) => onChange({ fundingStages: v })}
        />
      </FilterSection>

      <FilterSection title="Headcount Growth" icon={<Activity className="h-4 w-4" />} info="Filter by employee growth rate" isOpen={open === "headcountGrowth"} onToggle={() => toggle("headcountGrowth")}>
        <div>
          <span className={labelCls}>Timeframe</span>
          <div className="flex flex-wrap gap-1.5">
            {GROWTH_TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ headcountGrowthTimeframe: opt.value as CompanyFilters["headcountGrowthTimeframe"] })}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                  filters.headcountGrowthTimeframe === opt.value
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <RangeDropdown
          label="Growth rate"
          placeholder="Any growth"
          minValue={filters.headcountGrowthMin}
          maxValue={filters.headcountGrowthMax}
          onMinChange={(v) => onChange({ headcountGrowthMin: v })}
          onMaxChange={(v) => onChange({ headcountGrowthMax: v })}
          presets={GROWTH_PRESETS}
          unitSuffix="%"
        />
      </FilterSection>

      <FilterSection title="Headcount by Department" icon={<Activity className="h-4 w-4" />} info="Filter by headcount in a department" isOpen={open === "headcountByDept"} onToggle={() => toggle("headcountByDept")}>
        <MultiChipSelect
          label="Department"
          placeholder="Select department"
          options={DEPARTMENT_OPTIONS}
          values={filters.headcountByDepartment ? [filters.headcountByDepartment] : []}
          onChange={(v) => onChange({ headcountByDepartment: v[v.length - 1] ?? "" })}
        />
        <RangeDropdown
          label="Employees in department"
          placeholder="Any size"
          minValue={filters.headcountByDepartmentMin}
          maxValue={filters.headcountByDepartmentMax}
          onMinChange={(v) => onChange({ headcountByDepartmentMin: v })}
          onMaxChange={(v) => onChange({ headcountByDepartmentMax: v })}
          presets={HEADCOUNT_RANGE_PRESETS}
        />
      </FilterSection>

      <FilterSection title="Headcount by Location" icon={<MapPin className="h-4 w-4" />} info="Filter by headcount in a country" isOpen={open === "headcountByLocation"} onToggle={() => toggle("headcountByLocation")}>
        <CountrySelect
          label="Country"
          placeholder="Search country…"
          value={filters.headcountByLocationCountry}
          onChange={(v) => onChange({ headcountByLocationCountry: v })}
        />
        <RangeDropdown
          label="Employees in country"
          placeholder="Any size"
          minValue={filters.headcountByLocationMin}
          maxValue={filters.headcountByLocationMax}
          onMinChange={(v) => onChange({ headcountByLocationMin: v })}
          onMaxChange={(v) => onChange({ headcountByLocationMax: v })}
          presets={HEADCOUNT_RANGE_PRESETS}
        />
      </FilterSection>

      <FilterSection title="Founded Year" icon={<Calendar className="h-4 w-4" />} isOpen={open === "founded"} onToggle={() => toggle("founded")}>
        <RangeDropdown
          label="Year range"
          placeholder="Any year"
          minValue={filters.foundedMin}
          maxValue={filters.foundedMax}
          onMinChange={(v) => onChange({ foundedMin: v })}
          onMaxChange={(v) => onChange({ foundedMax: v })}
          presets={FOUNDED_YEAR_PRESETS}
        />
      </FilterSection>
    </>
  );
}
