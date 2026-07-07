"use client";
import { useState } from "react";
import {
  Sparkles, Building2, MapPin, Tag, Type,
  Users, BarChart3, TrendingUp, Cpu, DollarSign, Banknote, Calendar, Activity,
  Briefcase, Mail, Award, Globe, Newspaper,
} from "lucide-react";
import FilterSection from "../FilterSection";
import MultiChipSelect from "../MultiChipSelect";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import BulkCompanyInput from "./BulkCompanyInput";
import LocationAutocomplete from "./LocationAutocomplete";
import CountrySelect from "./CountrySelect";
import EmployeeHeadcountFilter from "./EmployeeHeadcountFilter";
import PresetRangeFilter from "./PresetRangeFilter";
import KeywordsFilter from "./KeywordsFilter";
import StaticPlaceholder from "./StaticPlaceholder";
import CompanyTypeBusinessFilter from "./CompanyTypeBusinessFilter";
import CompanyJobPostingFilter from "./CompanyJobPostingFilter";
import CompanyEmailProviderFilter from "./CompanyEmailProviderFilter";
import CompanyAwardsCertsFilter from "./CompanyAwardsCertsFilter";
import CompanyWebsiteTrafficFilter from "./CompanyWebsiteTrafficFilter";
import CompanyNewsFilter from "./CompanyNewsFilter";
import IndustryFilter from "./IndustryFilter";
import RevenueFilter from "./RevenueFilter";
import FundingFilter from "./FundingFilter";
import type { CompanyFilters } from "@/types/search";
import {
  FUNDING_STAGE_OPTIONS,
  BUYING_INTENT_STATIC,
  FOUNDED_YEAR_PRESETS,
  HEADCOUNT_RANGE_OPTIONS,
  DEPARTMENT_OPTIONS,
  GROWTH_PRESETS,
  GROWTH_TIMEFRAME_OPTIONS,
} from "@/types/search";


interface Props {
  filters: CompanyFilters;
  onChange: (patch: Partial<CompanyFilters>) => void;
}

const labelCls = "mb-1 block text-[12px] text-gray-500";


const SECTIONS = [
  "lookalikes", "company", "location", "type", "keywords",
  "headcount", "industry", "intent", "technologies",
  "revenue", "funding", "headcountGrowth", "headcountByDept", "headcountByLocation", "founded",
  "jobPosting", "emailProvider", "awardsCerts", "websiteTraffic", "companyNews",
] as const;
type Section = typeof SECTIONS[number];

export default function CompanyFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("company");
  const toggle = (s: Section) => setOpen((p) => (p === s ? ("" as Section) : s));

  return (
    <>
      <FilterSection title="AI Lookalikes" icon={<Sparkles className="h-4 w-4" />} info="Find similar companies" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-200 bg-red-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-red-500" />
          <p className="text-[12px] text-red-700">Find similar companies — coming soon.</p>
        </div>
      </FilterSection>

      <FilterSection title="Company" icon={<Building2 className="h-4 w-4" />} isOpen={open === "company"} onToggle={() => toggle("company")}>
        <BulkCompanyInput
          label="Company name"
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
        <CompanyTypeBusinessFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Keywords" icon={<Type className="h-4 w-4" />} isOpen={open === "keywords"} onToggle={() => toggle("keywords")}>
        <KeywordsFilter
          include={filters.keywordsInclude}
          matchMode={filters.keywordsMatchMode}
          scope={filters.keywordsScope}
          exclude={filters.keywordsExclude}
          onIncludeChange={(v) => onChange({ keywordsInclude: v })}
          onMatchModeChange={(v) => onChange({ keywordsMatchMode: v })}
          onScopeChange={(v) => onChange({ keywordsScope: v })}
          onExcludeChange={(v) => onChange({ keywordsExclude: v })}
        />
      </FilterSection>

      <FilterSection title="Employee Headcount" icon={<Users className="h-4 w-4" />} isOpen={open === "headcount"} onToggle={() => toggle("headcount")}>
        <EmployeeHeadcountFilter
          mode={filters.employeeHeadcountMode}
          ranges={filters.employeeHeadcountRanges}
          countMin={filters.employeeCountMin}
          countMax={filters.employeeCountMax}
          onModeChange={(v) => onChange({ employeeHeadcountMode: v })}
          onRangesChange={(v) => onChange({ employeeHeadcountRanges: v })}
          onMinChange={(v) => onChange({ employeeCountMin: v })}
          onMaxChange={(v) => onChange({ employeeCountMax: v })}
        />
      </FilterSection>

      <FilterSection title="Industry" icon={<BarChart3 className="h-4 w-4" />} isOpen={open === "industry"} onToggle={() => toggle("industry")}>
        <IndustryFilter values={filters.industries} onChange={(v) => onChange({ industries: v })} />
      </FilterSection>

      <FilterSection title="Buying Intent" icon={<TrendingUp className="h-4 w-4" />} isOpen={open === "intent"} onToggle={() => toggle("intent")}>
        <StaticPlaceholder
          description="Buying intent signals are not currently available."
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
        <RevenueFilter
          mode={filters.revenueMode}
          buckets={filters.revenueBuckets}
          revenueMin={filters.revenueMin}
          revenueMax={filters.revenueMax}
          onModeChange={(v) => onChange({ revenueMode: v })}
          onBucketsChange={(v) => onChange({ revenueBuckets: v })}
          onMinChange={(v) => onChange({ revenueMin: v })}
          onMaxChange={(v) => onChange({ revenueMax: v })}
        />
      </FilterSection>

      <FilterSection title="Funding" icon={<Banknote className="h-4 w-4" />} isOpen={open === "funding"} onToggle={() => toggle("funding")}>
        <FundingFilter
          mode={filters.fundingMode}
          presets={filters.fundingPresets}
          fundingMin={filters.fundingMin}
          fundingMax={filters.fundingMax}
          onModeChange={(v) => onChange({ fundingMode: v })}
          onPresetsChange={(v) => onChange({ fundingPresets: v })}
          onMinChange={(v) => onChange({ fundingMin: v })}
          onMaxChange={(v) => onChange({ fundingMax: v })}
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
                className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                  filters.headcountGrowthTimeframe === opt.value
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-red-400 hover:text-red-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <PresetRangeFilter
          options={GROWTH_PRESETS}
          mode={filters.headcountGrowthMode}
          presets={filters.headcountGrowthPresets}
          customMin={filters.headcountGrowthMin}
          customMax={filters.headcountGrowthMax}
          onModeChange={(v) => onChange({ headcountGrowthMode: v })}
          onPresetsChange={(v) => onChange({ headcountGrowthPresets: v })}
          onMinChange={(v) => onChange({ headcountGrowthMin: v })}
          onMaxChange={(v) => onChange({ headcountGrowthMax: v })}
          minPlaceholder="Min (%)"
          maxPlaceholder="Max (%)"
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
        <PresetRangeFilter
          options={HEADCOUNT_RANGE_OPTIONS}
          mode={filters.headcountByDepartmentMode}
          presets={filters.headcountByDepartmentPresets}
          customMin={filters.headcountByDepartmentMin}
          customMax={filters.headcountByDepartmentMax}
          onModeChange={(v) => onChange({ headcountByDepartmentMode: v })}
          onPresetsChange={(v) => onChange({ headcountByDepartmentPresets: v })}
          onMinChange={(v) => onChange({ headcountByDepartmentMin: v })}
          onMaxChange={(v) => onChange({ headcountByDepartmentMax: v })}
          minPlaceholder="Min employees"
          maxPlaceholder="Max employees"
        />
      </FilterSection>

      <FilterSection title="Headcount by Location" icon={<MapPin className="h-4 w-4" />} info="Filter by headcount in a country" isOpen={open === "headcountByLocation"} onToggle={() => toggle("headcountByLocation")}>
        <CountrySelect
          label="Country"
          placeholder="Search country…"
          value={filters.headcountByLocationCountry}
          onChange={(v) => onChange({ headcountByLocationCountry: v })}
        />
        <PresetRangeFilter
          options={HEADCOUNT_RANGE_OPTIONS}
          mode={filters.headcountByLocationMode}
          presets={filters.headcountByLocationPresets}
          customMin={filters.headcountByLocationMin}
          customMax={filters.headcountByLocationMax}
          onModeChange={(v) => onChange({ headcountByLocationMode: v })}
          onPresetsChange={(v) => onChange({ headcountByLocationPresets: v })}
          onMinChange={(v) => onChange({ headcountByLocationMin: v })}
          onMaxChange={(v) => onChange({ headcountByLocationMax: v })}
          minPlaceholder="Min employees"
          maxPlaceholder="Max employees"
        />
      </FilterSection>

      <FilterSection title="Founded Year" icon={<Calendar className="h-4 w-4" />} isOpen={open === "founded"} onToggle={() => toggle("founded")}>
        <PresetRangeFilter
          options={FOUNDED_YEAR_PRESETS}
          mode={filters.foundedMode}
          presets={filters.foundedPresets}
          customMin={filters.foundedMin}
          customMax={filters.foundedMax}
          onModeChange={(v) => onChange({ foundedMode: v })}
          onPresetsChange={(v) => onChange({ foundedPresets: v })}
          onMinChange={(v) => onChange({ foundedMin: v })}
          onMaxChange={(v) => onChange({ foundedMax: v })}
          minPlaceholder="From year"
          maxPlaceholder="To year"
        />
      </FilterSection>

      <FilterSection title="Job Posting" icon={<Briefcase className="h-4 w-4" />} isOpen={open === "jobPosting"} onToggle={() => toggle("jobPosting")}>
        <CompanyJobPostingFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Company Email Provider" icon={<Mail className="h-4 w-4" />} isOpen={open === "emailProvider"} onToggle={() => toggle("emailProvider")}>
        <CompanyEmailProviderFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Company Awards & Certs" icon={<Award className="h-4 w-4" />} isOpen={open === "awardsCerts"} onToggle={() => toggle("awardsCerts")}>
        <CompanyAwardsCertsFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Website Traffic" icon={<Globe className="h-4 w-4" />} isOpen={open === "websiteTraffic"} onToggle={() => toggle("websiteTraffic")}>
        <CompanyWebsiteTrafficFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Company News" icon={<Newspaper className="h-4 w-4" />} isOpen={open === "companyNews"} onToggle={() => toggle("companyNews")}>
        <CompanyNewsFilter filters={filters} onChange={onChange} />
      </FilterSection>
    </>
  );
}
