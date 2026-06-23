"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import FilterSection from "../FilterSection";
import CountrySelect from "./CountrySelect";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import MultiChipSelect from "../MultiChipSelect";
import BulkCompanyInput from "./BulkCompanyInput";
import TabbedLocationFilter from "./TabbedLocationFilter";
import ContactDetailsFilter from "./ContactDetailsFilter";
import RangeInput from "./RangeInput";
import StaticPlaceholder from "./StaticPlaceholder";
import type { PersonFilters } from "@/types/search";
import {
  SENIORITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  REVENUE_OPTIONS,
  KEYWORDS_STATIC,
  BUYING_INTENT_STATIC,
} from "@/types/search";

interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

const inputCls =
  "w-full rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors";
const labelCls = "block text-xs text-gray-500 mb-1";

const SECTIONS = [
  "lookalikes", "people", "title", "company", "location",
  "contact", "type", "keywords", "intent", "technologies",
  "revenue", "funding", "headcountGrowth", "headcountByDept", "headcountByLocation", "founded",
] as const;
type Section = typeof SECTIONS[number];

export default function PeopleFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("people");
  const toggle = (s: Section) => setOpen((p) => (p === s ? ("" as Section) : s));

  return (
    <>
      <FilterSection title="AI Lookalikes" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-purple-200 bg-purple-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <p className="text-[11px] text-purple-700">Find similar profiles — coming soon.</p>
        </div>
      </FilterSection>

      <FilterSection title="People" isOpen={open === "people"} onToggle={() => toggle("people")}>
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

      <FilterSection title="Job Title" isOpen={open === "title"} onToggle={() => toggle("title")}>
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

      <FilterSection title="Company" isOpen={open === "company"} onToggle={() => toggle("company")}>
        <BulkCompanyInput
          label="Company (bulk add supported)"
          values={filters.companies}
          onChange={(v) => onChange({ companies: v })}
        />
      </FilterSection>

      <FilterSection title="Location" isOpen={open === "location"} onToggle={() => toggle("location")}>
        <TabbedLocationFilter
          personValues={filters.personLocations}
          hqValues={filters.companyHQLocations}
          onPersonChange={(v) => onChange({ personLocations: v })}
          onHqChange={(v) => onChange({ companyHQLocations: v })}
        />
      </FilterSection>

      <FilterSection title="Contact Details" isOpen={open === "contact"} onToggle={() => toggle("contact")}>
        <ContactDetailsFilter
          requireWorkEmail={filters.requireWorkEmail}
          requireMobile={filters.requireMobile}
          contactLogic={filters.contactLogic}
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection title="Type & Business Model" isOpen={open === "type"} onToggle={() => toggle("type")}>
        <MultiChipSelect
          label="Company Type"
          placeholder="Select type"
          options={COMPANY_TYPE_OPTIONS}
          values={filters.companyType}
          onChange={(v) => onChange({ companyType: v })}
        />
      </FilterSection>

      <FilterSection title="Keywords" isOpen={open === "keywords"} onToggle={() => toggle("keywords")}>
        <StaticPlaceholder
          description="Static suggestions — keyword search not yet wired up."
          options={KEYWORDS_STATIC.map((k) => ({ label: k }))}
        />
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
          placeholder="e.g. React, AWS, Python…"
          field="skill"
          values={filters.technologies}
          onChange={(v) => onChange({ technologies: v })}
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Matches people whose skills include the selected technologies.
        </p>
      </FilterSection>

      <FilterSection title="Revenue" isOpen={open === "revenue"} onToggle={() => toggle("revenue")}>
        <MultiChipSelect
          label="Company revenue"
          placeholder="Select revenue range"
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
      </FilterSection>

      <FilterSection title="Headcount Growth" isOpen={open === "headcountGrowth"} onToggle={() => toggle("headcountGrowth")}>
        <RangeInput
          label="12-month employee growth"
          minValue={filters.headcountGrowthMin}
          maxValue={filters.headcountGrowthMax}
          onMinChange={(v) => onChange({ headcountGrowthMin: v })}
          onMaxChange={(v) => onChange({ headcountGrowthMax: v })}
          minPlaceholder="Min %"
          maxPlaceholder="Max %"
          prefix="%"
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          PDL only exposes the 12-month growth rate at the person level.
        </p>
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
          Looks up companies first, then finds people working there.
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
          Looks up companies first, then finds people working there.
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
