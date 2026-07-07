"use client";
import { useState } from "react";
import {
  Sparkles, User, Users, Briefcase, Building2, MapPin, Phone, Tag,
  Type, TrendingUp, Cpu, DollarSign, Banknote, Activity, Calendar, ChevronDown, Globe, Award, Mail, CopyX,
  Clock, Briefcase as BriefcaseJob, BarChart2,
} from "lucide-react";
import FilterSection from "../FilterSection";
import CountrySelect from "./CountrySelect";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import MultiChipSelect from "../MultiChipSelect";
import BulkCompanyInput from "./BulkCompanyInput";
import InlineDepartmentSelect from "./InlineDepartmentSelect";
import InlineTypeBusinessFilter from "./InlineTypeBusinessFilter";
import EmployeeHeadcountFilter from "./EmployeeHeadcountFilter";
import InlineCompanyNewsFilter from "./InlineCompanyNewsFilter";
import WebsiteTrafficFilter from "./WebsiteTrafficFilter";
import AwardsCertsFilter from "./AwardsCertsFilter";
import EmailProviderFilter from "./EmailProviderFilter";
import DuplicateControlFilter from "./DuplicateControlFilter";
import TimeInRoleFilter from "./TimeInRoleFilter";
import TotalExperienceFilter from "./TotalExperienceFilter";
import JobChangeFilter from "./JobChangeFilter";
import JobPostingFilter from "./JobPostingFilter";
import IndustryFilter from "./IndustryFilter";
import TabbedLocationFilter from "./TabbedLocationFilter";
import ContactDetailsFilter from "./ContactDetailsFilter";
import KeywordsFilter from "./KeywordsFilter";
import RevenueFilter from "./RevenueFilter";
import FundingFilter from "./FundingFilter";
import PresetRangeFilter from "./PresetRangeFilter";
import StaticPlaceholder from "./StaticPlaceholder";
import type { PersonFilters } from "@/types/search";
import {
  SENIORITY_OPTIONS,
  DEPARTMENT_OPTIONS,
  DEPARTMENT_OPTIONS_HIERARCHICAL,
  BUYING_INTENT_STATIC,
  GROWTH_PRESETS,
  FOUNDED_YEAR_PRESETS,
  HEADCOUNT_RANGE_OPTIONS,
} from "@/types/search";


interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12px] text-gray-800 placeholder-gray-400 transition-colors focus:border-red-500 focus:outline-none";
const labelCls = "mb-1 block text-[12px] text-gray-500";

const SECTIONS = [
  "lookalikes", "people", "title", "company", "location",
  "contact", "type", "keywords", "employeeHeadcount", "industry", "intent", "technologies",
  "revenue", "funding", "headcountGrowth", "headcountByDept", "headcountByLocation", "founded",
  "timeInRole", "timeInCompany", "totalExperience", "jobChange", "jobPosting",
  "duplicateControl", "emailProvider", "awardsCerts", "websiteTraffic", "companyNews",
] as const;
type Section = typeof SECTIONS[number];

export default function PeopleFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section | "">("people");
  const toggle = (s: Section) => setOpen((p) => (p === s ? "" : s));
  const [titleSub, setTitleSub] = useState<"departments" | "seniority" | "">("");
  const toggleTitleSub = (s: "departments" | "seniority") => setTitleSub((p) => (p === s ? "" : s));

  return (
    <>
      <FilterSection title="AI Lookalikes" icon={<Sparkles className="h-4 w-4" />} info="Find similar profiles" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-200 bg-red-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-red-500" />
          <p className="text-[12px] text-red-700">Find similar profiles — coming soon.</p>
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
          placeholder={filters.jobTitleMatchType === "exact" ? "e.g. Chief Executive Officer" : "e.g. Software Engineer"}
          field="title"
          values={filters.jobTitle}
          onChange={(v) => onChange({ jobTitle: v })}
        />
        <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5">
          {(["contains", "exact"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ jobTitleMatchType: mode })}
              className={`flex-1 rounded-md py-1 text-[12px] font-medium capitalize transition-colors ${
                filters.jobTitleMatchType === mode
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Departments sub-row */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleTitleSub("departments")}
            className="flex w-full items-center justify-between px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Departments</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ${titleSub === "departments" ? "rotate-180" : ""}`} />
          </button>
          <div className={`grid transition-all duration-300 ${titleSub === "departments" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="px-2 pb-2 pt-1 border-t border-gray-100">
                <InlineDepartmentSelect
                  options={DEPARTMENT_OPTIONS_HIERARCHICAL}
                  values={filters.departments}
                  onChange={(v) => onChange({ departments: v })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seniority sub-row */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleTitleSub("seniority")}
            className="flex w-full items-center justify-between px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Seniority</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-300 ${titleSub === "seniority" ? "rotate-180" : ""}`} />
          </button>
          <div className={`grid transition-all duration-300 ${titleSub === "seniority" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="px-2 pb-1.5 pt-1 border-t border-gray-100 flex flex-col">
                {SENIORITY_OPTIONS.map((opt) => {
                  const selected = filters.seniority.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ seniority: selected ? filters.seniority.filter((v) => v !== opt.value) : [...filters.seniority, opt.value] })}
                      className={`flex w-full min-h-0 items-center gap-2 rounded px-1 py-[3px] text-left transition-colors hover:bg-gray-50 ${selected ? "text-red-700" : "text-gray-700"}`}
                    >
                      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${selected ? "border-red-500 bg-red-500" : "border-gray-300 bg-white"}`}>
                        {selected && (
                          <svg className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className={`flex-1 text-[12px] leading-none ${selected ? "font-medium" : ""}`}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
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
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection title="Type & Business Model" icon={<Tag className="h-4 w-4" />} isOpen={open === "type"} onToggle={() => toggle("type")}>
        <InlineTypeBusinessFilter filters={filters} onChange={onChange} />
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

      <FilterSection title="Employee Headcount" icon={<Users className="h-4 w-4" />} isOpen={open === "employeeHeadcount"} onToggle={() => toggle("employeeHeadcount")}>
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

      <FilterSection title="Industry" icon={<Tag className="h-4 w-4" />} isOpen={open === "industry"} onToggle={() => toggle("industry")}>
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
      </FilterSection>

      <FilterSection title="Headcount Growth" icon={<Activity className="h-4 w-4" />} info="Filters companies by 12-month growth" isOpen={open === "headcountGrowth"} onToggle={() => toggle("headcountGrowth")}>
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

      <FilterSection title="Headcount by Department" icon={<Activity className="h-4 w-4" />} info="Filters by company headcount in a role" isOpen={open === "headcountByDept"} onToggle={() => toggle("headcountByDept")}>
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

      <FilterSection title="Headcount by Location" icon={<MapPin className="h-4 w-4" />} info="Filters by company headcount in a country" isOpen={open === "headcountByLocation"} onToggle={() => toggle("headcountByLocation")}>
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

      <FilterSection title="Time in Current Role" icon={<Clock className="h-4 w-4" />} isOpen={open === "timeInRole"} onToggle={() => toggle("timeInRole")}>
        <TimeInRoleFilter mode="role" filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Time in Current Company" icon={<Clock className="h-4 w-4" />} isOpen={open === "timeInCompany"} onToggle={() => toggle("timeInCompany")}>
        <TimeInRoleFilter mode="company" filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Total Years of Experience" icon={<BarChart2 className="h-4 w-4" />} isOpen={open === "totalExperience"} onToggle={() => toggle("totalExperience")}>
        <TotalExperienceFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Job Change" icon={<BriefcaseJob className="h-4 w-4" />} isOpen={open === "jobChange"} onToggle={() => toggle("jobChange")}>
        <JobChangeFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Job Posting" icon={<BriefcaseJob className="h-4 w-4" />} isOpen={open === "jobPosting"} onToggle={() => toggle("jobPosting")}>
        <JobPostingFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Duplicate Control" icon={<CopyX className="h-4 w-4" />} isOpen={open === "duplicateControl"} onToggle={() => toggle("duplicateControl")}>
        <DuplicateControlFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Company Email Provider" icon={<Mail className="h-4 w-4" />} isOpen={open === "emailProvider"} onToggle={() => toggle("emailProvider")}>
        <EmailProviderFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Awards & Certifications" icon={<Award className="h-4 w-4" />} isOpen={open === "awardsCerts"} onToggle={() => toggle("awardsCerts")}>
        <AwardsCertsFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Website Traffic" icon={<Globe className="h-4 w-4" />} isOpen={open === "websiteTraffic"} onToggle={() => toggle("websiteTraffic")}>
        <WebsiteTrafficFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Company News" icon={<Banknote className="h-4 w-4" />} isOpen={open === "companyNews"} onToggle={() => toggle("companyNews")}>
        <InlineCompanyNewsFilter filters={filters} onChange={onChange} />
      </FilterSection>
    </>
  );
}
