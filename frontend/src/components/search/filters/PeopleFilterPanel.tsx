"use client";
import { useState } from "react";
import {
  Sparkles, User, Briefcase, Building2, MapPin, Phone, Tag,
  Type, TrendingUp, Cpu, DollarSign, Banknote, Activity, Calendar,
} from "lucide-react";
import FilterSection from "../FilterSection";
import CountrySelect from "./CountrySelect";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import MultiChipSelect from "../MultiChipSelect";
import BulkCompanyInput from "./BulkCompanyInput";
import TabbedLocationFilter from "./TabbedLocationFilter";
import ContactDetailsFilter from "./ContactDetailsFilter";
import RangeDropdown from "./RangeDropdown";
import StaticPlaceholder from "./StaticPlaceholder";
import type { PersonFilters } from "@/types/search";
import {
  SENIORITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  REVENUE_OPTIONS,
  KEYWORDS_STATIC,
  BUYING_INTENT_STATIC,
  FUNDING_PRESETS,
  GROWTH_PRESETS,
  FOUNDED_YEAR_PRESETS,
  HEADCOUNT_RANGE_PRESETS,
} from "@/types/search";

function fmtUsd(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none sm:border-2 sm:px-3 sm:py-2 sm:text-xs";
const labelCls = "mb-1 block text-[11px] text-gray-500 sm:text-xs";

const SECTIONS = [
  "lookalikes", "people", "title", "company", "location",
  "contact", "type", "keywords", "intent", "technologies",
  "revenue", "funding", "headcountGrowth", "headcountByDept", "headcountByLocation", "founded",
] as const;
type Section = typeof SECTIONS[number];

export default function PeopleFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section | "">( "people");
  const toggle = (s: Section) => setOpen((p) => (p === s ? "" : s));

  return (
    <>
      <FilterSection title="AI Lookalikes" icon={<Sparkles className="h-4 w-4" />} info="Find similar profiles" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-200 bg-red-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-red-500" />
          <p className="text-[11px] text-red-700">Find similar profiles — coming soon.</p>
        </div>
      </FilterSection>

      <FilterSection title="People" icon={<User className="h-4 w-4" />} isOpen={open === "people"} onToggle={() => toggle("people")}>
        <div>
          <span className={labelCls}>Name</span>
          <input
            type="text"
            placeholder="Search by full name"
            value={filters.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={inputCls}
          />
        </div>
      </FilterSection>

      <FilterSection title="Job Title" icon={<Briefcase className="h-4 w-4" />} isOpen={open === "title"} onToggle={() => toggle("title")}>
        <MultiChipAutocomplete
          label="Job title"
          placeholder="e.g. Software Engineer"
          field="title"
          values={filters.jobTitle}
          onChange={(v) => onChange({ jobTitle: v })}
        />
        <MultiChipSelect
          label="Departments"
          placeholder="Select department(s)"
          options={DEPARTMENT_OPTIONS}
          values={filters.departments}
          onChange={(v) => onChange({ departments: v })}
        />
        <MultiChipSelect
          label="Seniority"
          placeholder="Select seniority"
          options={SENIORITY_OPTIONS}
          values={filters.seniority}
          onChange={(v) => onChange({ seniority: v })}
        />
      </FilterSection>

      <FilterSection title="Company" icon={<Building2 className="h-4 w-4" />} isOpen={open === "company"} onToggle={() => toggle("company")}>
        <BulkCompanyInput
          label="Company name"
          values={filters.companies}
          onChange={(v) => onChange({ companies: v })}
        />
      </FilterSection>

      <FilterSection title="Location" icon={<MapPin className="h-4 w-4" />} isOpen={open === "location"} onToggle={() => toggle("location")}>
        <TabbedLocationFilter
          personValues={filters.personLocations}
          hqValues={filters.companyHQLocations}
          onPersonChange={(v) => onChange({ personLocations: v })}
          onHqChange={(v) => onChange({ companyHQLocations: v })}
        />
      </FilterSection>

      <FilterSection title="Contact Details" icon={<Phone className="h-4 w-4" />} isOpen={open === "contact"} onToggle={() => toggle("contact")}>
        <ContactDetailsFilter
          requireWorkEmail={filters.requireWorkEmail}
          requireMobile={filters.requireMobile}
          contactLogic={filters.contactLogic}
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection title="Type & Business Model" icon={<Tag className="h-4 w-4" />} isOpen={open === "type"} onToggle={() => toggle("type")}>
        <MultiChipSelect
          label="Company Type"
          placeholder="Select type"
          options={COMPANY_TYPE_OPTIONS}
          values={filters.companyType}
          onChange={(v) => onChange({ companyType: v })}
        />
      </FilterSection>

      <FilterSection title="Keywords" icon={<Type className="h-4 w-4" />} isOpen={open === "keywords"} onToggle={() => toggle("keywords")}>
        <StaticPlaceholder
          description="Static suggestions — keyword search not yet wired up."
          options={KEYWORDS_STATIC.map((k) => ({ label: k }))}
        />
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
          placeholder="e.g. React, AWS, Python…"
          field="skill"
          values={filters.technologies}
          onChange={(v) => onChange({ technologies: v })}
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Matches people whose skills include the selected technologies.
        </p>
      </FilterSection>

      <FilterSection title="Revenue" icon={<DollarSign className="h-4 w-4" />} isOpen={open === "revenue"} onToggle={() => toggle("revenue")}>
        <MultiChipSelect
          label="Company revenue"
          placeholder="Select revenue range"
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
      </FilterSection>

      <FilterSection title="Headcount Growth" icon={<Activity className="h-4 w-4" />} info="Filters companies by 12-month growth" isOpen={open === "headcountGrowth"} onToggle={() => toggle("headcountGrowth")}>
        <RangeDropdown
          label="12-month employee growth"
          placeholder="Any growth"
          minValue={filters.headcountGrowthMin}
          maxValue={filters.headcountGrowthMax}
          onMinChange={(v) => onChange({ headcountGrowthMin: v })}
          onMaxChange={(v) => onChange({ headcountGrowthMax: v })}
          presets={GROWTH_PRESETS}
          unitSuffix="%"
        />
      </FilterSection>

      <FilterSection title="Headcount by Department" icon={<Activity className="h-4 w-4" />} info="Filters by company headcount in a role" isOpen={open === "headcountByDept"} onToggle={() => toggle("headcountByDept")}>
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

      <FilterSection title="Headcount by Location" icon={<MapPin className="h-4 w-4" />} info="Filters by company headcount in a country" isOpen={open === "headcountByLocation"} onToggle={() => toggle("headcountByLocation")}>
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
