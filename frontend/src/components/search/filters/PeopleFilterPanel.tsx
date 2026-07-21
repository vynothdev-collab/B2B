"use client";
import { useState } from "react";
import {
  Sparkles, User, Users, Briefcase, Building2, MapPin, Phone, Tag,
  Type, TrendingUp, Cpu, DollarSign, Banknote, Activity, Calendar, ChevronDown, Award,
  Clock, Briefcase as BriefcaseJob, BarChart2,
} from "lucide-react";
import FilterSection, { FilterPreviewChips } from "../FilterSection";
import type { ChipItem } from "../FilterSection";
import MultiChipAutocomplete from "../MultiChipAutocomplete";
import JobTitleAutocomplete from "./JobTitleAutocomplete";
import BulkCompanyInput from "./BulkCompanyInput";
import InlineDepartmentSelect from "./InlineDepartmentSelect";
import InlineTypeBusinessFilter from "./InlineTypeBusinessFilter";
import EmployeeHeadcountFilter from "./EmployeeHeadcountFilter";
import AwardsCertsFilter from "./AwardsCertsFilter";
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
  COMPANY_STATUS_OPTIONS,
} from "@/types/search";


interface Props {
  filters: PersonFilters;
  onChange: (patch: Partial<PersonFilters>) => void;
}

const SECTIONS = [
  "lookalikes", "people", "title", "company", "location",
  "contact", "type", "keywords", "employeeHeadcount", "industry", "intent", "technologies",
  "revenue", "funding", "headcountGrowth", "founded",
  "timeInRole", "timeInCompany", "totalExperience", "jobChange", "jobPosting",
  "duplicateControl", "awardsCerts",
] as const;
type Section = typeof SECTIONS[number];

function chips(items: string[], onRemove: (v: string) => void): ChipItem[] {
  return items.map((v) => ({ label: v, onRemove: () => onRemove(v) }));
}

function fmtRange(min: string, max: string, suffix = ""): string {
  if (min && max) return `${min}–${max}${suffix}`;
  if (min) return `≥${min}${suffix}`;
  if (max) return `≤${max}${suffix}`;
  return "";
}

function fmtDuration(minY: string, minM: string, maxY: string, maxM: string): string {
  const lo = [minY && `${minY}y`, minM && `${minM}mo`].filter(Boolean).join(" ");
  const hi = [maxY && `${maxY}y`, maxM && `${maxM}mo`].filter(Boolean).join(" ");
  if (lo && hi) return `${lo} – ${hi}`;
  if (lo) return `≥ ${lo}`;
  if (hi) return `≤ ${hi}`;
  return "";
}

export default function PeopleFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section | "">("people");
  const toggle = (s: Section) => setOpen((p) => (p === s ? "" : s));
  const [titleSub, setTitleSub] = useState<"departments" | "seniority" | "">("");
  const toggleTitleSub = (s: "departments" | "seniority") => setTitleSub((p) => (p === s ? "" : s));

  // ── section counts ──────────────────────────────────────────────────────────
  const nameCount = filters.name.length;
  const titleCount = filters.jobTitle.length + filters.departments.length + filters.seniority.length;
  const companyCount = filters.companies.length;
  const locationCount =
    filters.personLocationCountries.length + filters.personLocationStates.length +
    filters.personLocationCities.length + filters.companyHQCountries.length +
    filters.companyHQStates.length + filters.companyHQCities.length;
  const contactCount = filters.requireWorkEmail ? 1 : 0;
  const typeCount = filters.companyStatus.length + filters.companyType.length;
  const keywordCount = filters.keywordsInclude.length + filters.keywordsExclude.length;
  const headcountCount =
    filters.employeeHeadcountRanges.length + (filters.employeeCountMin || filters.employeeCountMax ? 1 : 0);
  const industryCount = filters.industries.length;
  const techCount = filters.technologies.length;
  const revenueCount =
    filters.revenueBuckets.length + (filters.revenueMin || filters.revenueMax ? 1 : 0);
  const fundingCount =
    filters.fundingPresets.length + (filters.fundingMin || filters.fundingMax ? 1 : 0);
  const growthCount =
    filters.headcountGrowthPresets.length + (filters.headcountGrowthMin || filters.headcountGrowthMax ? 1 : 0);
  const foundedCount =
    filters.foundedPresets.length + (filters.foundedMin || filters.foundedMax ? 1 : 0);
  const timeRoleCount =
    filters.timeInRoleMinYears || filters.timeInRoleMinMonths ||
    filters.timeInRoleMaxYears || filters.timeInRoleMaxMonths ? 1 : 0;
  const timeCompanyCount =
    filters.timeInCompanyMinYears || filters.timeInCompanyMinMonths ||
    filters.timeInCompanyMaxYears || filters.timeInCompanyMaxMonths ? 1 : 0;
  const expCount = filters.experienceYearsMin || filters.experienceYearsMax ? 1 : 0;
  const jobChangeCount = filters.jobChangeTimeframe ? 1 : 0;
  const jobPostingCount = filters.jobPostingKeywords.length;
  const certsCount = filters.certifications.length + filters.otherCompliance.length;

  // ── preview chip lists ──────────────────────────────────────────────────────
  const namePreview = chips(filters.name, (v) => onChange({ name: filters.name.filter((x) => x !== v) }));
  const titlePreview: ChipItem[] = [
    ...filters.jobTitle.map((v) => ({ label: v, onRemove: () => onChange({ jobTitle: filters.jobTitle.filter((x) => x !== v) }) })),
    ...filters.departments.map((v) => ({ label: DEPARTMENT_OPTIONS.find((o) => o.value === v)?.label ?? v, onRemove: () => onChange({ departments: filters.departments.filter((x) => x !== v) }) })),
    ...filters.seniority.map((v) => ({ label: SENIORITY_OPTIONS.find((o) => o.value === v)?.label ?? v, onRemove: () => onChange({ seniority: filters.seniority.filter((x) => x !== v) }) })),
  ];
  const companyPreview = chips(filters.companies, (v) => onChange({ companies: filters.companies.filter((x) => x !== v) }));
  const locationPreview: ChipItem[] = [
    ...chips(filters.personLocationCountries, (v) => onChange({ personLocationCountries: filters.personLocationCountries.filter((x) => x !== v) })),
    ...chips(filters.personLocationStates, (v) => onChange({ personLocationStates: filters.personLocationStates.filter((x) => x !== v) })),
    ...chips(filters.personLocationCities, (v) => onChange({ personLocationCities: filters.personLocationCities.filter((x) => x !== v) })),
    ...chips(filters.companyHQCountries, (v) => onChange({ companyHQCountries: filters.companyHQCountries.filter((x) => x !== v) })),
    ...chips(filters.companyHQStates, (v) => onChange({ companyHQStates: filters.companyHQStates.filter((x) => x !== v) })),
    ...chips(filters.companyHQCities, (v) => onChange({ companyHQCities: filters.companyHQCities.filter((x) => x !== v) })),
  ];
  const typePreview: ChipItem[] = [
    ...filters.companyStatus.map((v) => ({ label: COMPANY_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v, onRemove: () => onChange({ companyStatus: filters.companyStatus.filter((x) => x !== v) }) })),
    ...filters.companyType.map((v) => ({ label: v, onRemove: () => onChange({ companyType: filters.companyType.filter((x) => x !== v) }) })),
  ];
  const industryPreview = chips(filters.industries, (v) => onChange({ industries: filters.industries.filter((x) => x !== v) }));
  const techPreview = chips(filters.technologies, (v) => onChange({ technologies: filters.technologies.filter((x) => x !== v) }));
  const keywordPreview: ChipItem[] = [
    ...filters.keywordsInclude.map((v) => ({ label: v, onRemove: () => onChange({ keywordsInclude: filters.keywordsInclude.filter((x) => x !== v) }) })),
    ...filters.keywordsExclude.map((v) => ({ label: `−${v}`, onRemove: () => onChange({ keywordsExclude: filters.keywordsExclude.filter((x) => x !== v) }) })),
  ];
  const contactPreview: ChipItem[] = filters.requireWorkEmail
    ? [{ label: "Work email", onRemove: () => onChange({ requireWorkEmail: false }) }]
    : [];
  const headcountPreview: ChipItem[] = [
    ...chips(filters.employeeHeadcountRanges, (v) => onChange({ employeeHeadcountRanges: filters.employeeHeadcountRanges.filter((x) => x !== v) })),
    ...(fmtRange(filters.employeeCountMin, filters.employeeCountMax) ? [{ label: fmtRange(filters.employeeCountMin, filters.employeeCountMax), onRemove: () => onChange({ employeeCountMin: "", employeeCountMax: "" }) }] : []),
  ];
  const revenuePreview: ChipItem[] = [
    ...chips(filters.revenueBuckets, (v) => onChange({ revenueBuckets: filters.revenueBuckets.filter((x) => x !== v) })),
    ...(fmtRange(filters.revenueMin, filters.revenueMax) ? [{ label: fmtRange(filters.revenueMin, filters.revenueMax), onRemove: () => onChange({ revenueMin: "", revenueMax: "" }) }] : []),
  ];
  const fundingPreview: ChipItem[] = [
    ...chips(filters.fundingPresets, (v) => onChange({ fundingPresets: filters.fundingPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.fundingMin, filters.fundingMax) ? [{ label: fmtRange(filters.fundingMin, filters.fundingMax), onRemove: () => onChange({ fundingMin: "", fundingMax: "" }) }] : []),
  ];
  const growthPreview: ChipItem[] = [
    ...chips(filters.headcountGrowthPresets, (v) => onChange({ headcountGrowthPresets: filters.headcountGrowthPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.headcountGrowthMin, filters.headcountGrowthMax, "%") ? [{ label: fmtRange(filters.headcountGrowthMin, filters.headcountGrowthMax, "%"), onRemove: () => onChange({ headcountGrowthMin: "", headcountGrowthMax: "" }) }] : []),
  ];
  const foundedPreview: ChipItem[] = [
    ...chips(filters.foundedPresets, (v) => onChange({ foundedPresets: filters.foundedPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.foundedMin, filters.foundedMax) ? [{ label: fmtRange(filters.foundedMin, filters.foundedMax), onRemove: () => onChange({ foundedMin: "", foundedMax: "" }) }] : []),
  ];
  const timeRoleLabel = fmtDuration(filters.timeInRoleMinYears, filters.timeInRoleMinMonths, filters.timeInRoleMaxYears, filters.timeInRoleMaxMonths);
  const timeRolePreview: ChipItem[] = timeRoleLabel ? [{ label: timeRoleLabel, onRemove: () => onChange({ timeInRoleMinYears: "", timeInRoleMinMonths: "", timeInRoleMaxYears: "", timeInRoleMaxMonths: "" }) }] : [];
  const timeCompanyLabel = fmtDuration(filters.timeInCompanyMinYears, filters.timeInCompanyMinMonths, filters.timeInCompanyMaxYears, filters.timeInCompanyMaxMonths);
  const timeCompanyPreview: ChipItem[] = timeCompanyLabel ? [{ label: timeCompanyLabel, onRemove: () => onChange({ timeInCompanyMinYears: "", timeInCompanyMinMonths: "", timeInCompanyMaxYears: "", timeInCompanyMaxMonths: "" }) }] : [];
  const expLabel = fmtRange(filters.experienceYearsMin, filters.experienceYearsMax, " yrs");
  const expPreview: ChipItem[] = expLabel ? [{ label: expLabel, onRemove: () => onChange({ experienceYearsMin: "", experienceYearsMax: "" }) }] : [];
  const jobChangePreview: ChipItem[] = filters.jobChangeTimeframe
    ? [{ label: `Changed in ${filters.jobChangeTimeframe}mo`, onRemove: () => onChange({ jobChangeTimeframe: "" }) }]
    : [];
  const jobPostingPreview = chips(filters.jobPostingKeywords, (v) => onChange({ jobPostingKeywords: filters.jobPostingKeywords.filter((x) => x !== v) }));
  const certsPreview: ChipItem[] = [
    ...chips(filters.certifications, (v) => onChange({ certifications: filters.certifications.filter((x) => x !== v) })),
    ...chips(filters.otherCompliance, (v) => onChange({ otherCompliance: filters.otherCompliance.filter((x) => x !== v) })),
  ];

  return (
    <>
      <FilterSection title="AI Lookalikes" icon={<Sparkles className="h-4 w-4" />} info="Find similar profiles" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-200 bg-red-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-red-500" />
          <p className="text-[12px] text-red-700">Find similar profiles — coming soon.</p>
        </div>
      </FilterSection>

      <FilterSection
        title="People"
        icon={<User className="h-4 w-4" />}
        isOpen={open === "people"}
        onToggle={() => toggle("people")}
        count={nameCount}
        onClear={() => onChange({ name: [] })}
        preview={<FilterPreviewChips items={namePreview} />}
      >
        <BulkCompanyInput
          label="Name"
          placeholder="Type a name and press Enter…"
          values={filters.name}
          onChange={(v) => onChange({ name: v })}
        />
      </FilterSection>

      <FilterSection
        title="Job Title"
        icon={<Briefcase className="h-4 w-4" />}
        isOpen={open === "title"}
        onToggle={() => toggle("title")}
        count={titleCount}
        onClear={() => onChange({ jobTitle: [], departments: [], seniority: [] })}
        preview={<FilterPreviewChips items={titlePreview} />}
      >
        <JobTitleAutocomplete
          label="Job title"
          placeholder={filters.jobTitleMatchType === "exact" ? "e.g. Chief Executive Officer" : "e.g. Software Engineer"}
          values={filters.jobTitle}
          onChange={(v) => onChange({ jobTitle: v })}
        />
        <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5">
          {(["contains", "exact"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ jobTitleMatchType: mode })}
              className={`flex-1 rounded-md py-1 text-[12px] font-medium capitalize transition-colors ${filters.jobTitleMatchType === mode
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

      <FilterSection
        title="Company"
        icon={<Building2 className="h-4 w-4" />}
        isOpen={open === "company"}
        onToggle={() => toggle("company")}
        count={companyCount}
        onClear={() => onChange({ companies: [] })}
        preview={<FilterPreviewChips items={companyPreview} />}
      >
        <BulkCompanyInput
          label="Company name"
          values={filters.companies}
          onChange={(v) => onChange({ companies: v })}
        />
      </FilterSection>

      <FilterSection
        title="Location"
        icon={<MapPin className="h-4 w-4" />}
        isOpen={open === "location"}
        onToggle={() => toggle("location")}
        count={locationCount}
        onClear={() => onChange({ personLocationCountries: [], personLocationStates: [], personLocationCities: [], companyHQCountries: [], companyHQStates: [], companyHQCities: [] })}
        preview={<FilterPreviewChips items={locationPreview} />}
      >
        <TabbedLocationFilter
          personCountries={filters.personLocationCountries}
          personStates={filters.personLocationStates}
          personCities={filters.personLocationCities}
          hqCountries={filters.companyHQCountries}
          hqStates={filters.companyHQStates}
          hqCities={filters.companyHQCities}
          onPersonCountriesChange={(v) => onChange({ personLocationCountries: v })}
          onPersonStatesChange={(v) => onChange({ personLocationStates: v })}
          onPersonCitiesChange={(v) => onChange({ personLocationCities: v })}
          onHqCountriesChange={(v) => onChange({ companyHQCountries: v })}
          onHqStatesChange={(v) => onChange({ companyHQStates: v })}
          onHqCitiesChange={(v) => onChange({ companyHQCities: v })}
        />
      </FilterSection>

      <FilterSection
        title="Contact Details"
        icon={<Phone className="h-4 w-4" />}
        isOpen={open === "contact"}
        onToggle={() => toggle("contact")}
        count={contactCount}
        onClear={() => onChange({ requireWorkEmail: false })}
        preview={<FilterPreviewChips items={contactPreview} />}
      >
        <ContactDetailsFilter
          requireWorkEmail={filters.requireWorkEmail}
          onChange={onChange}
        />
      </FilterSection>

      <FilterSection
        title="Type & Business Model"
        icon={<Tag className="h-4 w-4" />}
        isOpen={open === "type"}
        onToggle={() => toggle("type")}
        count={typeCount}
        onClear={() => onChange({ companyStatus: [], companyType: [] })}
        preview={<FilterPreviewChips items={typePreview} />}
      >
        <InlineTypeBusinessFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Keywords"
        icon={<Type className="h-4 w-4" />}
        isOpen={open === "keywords"}
        onToggle={() => toggle("keywords")}
        count={keywordCount}
        onClear={() => onChange({ keywordsInclude: [], keywordsExclude: [], keywordsScope: [] })}
        preview={<FilterPreviewChips items={keywordPreview} />}
      >
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

      <FilterSection
        title="Employee Headcount"
        icon={<Users className="h-4 w-4" />}
        isOpen={open === "employeeHeadcount"}
        onToggle={() => toggle("employeeHeadcount")}
        count={headcountCount}
        onClear={() => onChange({ employeeHeadcountRanges: [], employeeCountMin: "", employeeCountMax: "", employeeHeadcountMode: "predefined" })}
        preview={<FilterPreviewChips items={headcountPreview} />}
      >
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

      <FilterSection
        title="Industry"
        icon={<Tag className="h-4 w-4" />}
        isOpen={open === "industry"}
        onToggle={() => toggle("industry")}
        count={industryCount}
        onClear={() => onChange({ industries: [] })}
        preview={<FilterPreviewChips items={industryPreview} />}
      >
        <IndustryFilter values={filters.industries} onChange={(v) => onChange({ industries: v })} />
      </FilterSection>

      <FilterSection title="Buying Intent" icon={<TrendingUp className="h-4 w-4" />} isOpen={open === "intent"} onToggle={() => toggle("intent")}>
        <StaticPlaceholder
          description="Buying intent signals are not currently available."
          options={BUYING_INTENT_STATIC.map((k) => ({ label: k }))}
        />
      </FilterSection>

      <FilterSection
        title="Technologies"
        icon={<Cpu className="h-4 w-4" />}
        isOpen={open === "technologies"}
        onToggle={() => toggle("technologies")}
        count={techCount}
        onClear={() => onChange({ technologies: [] })}
        preview={<FilterPreviewChips items={techPreview} />}
      >
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

      <FilterSection
        title="Revenue"
        icon={<DollarSign className="h-4 w-4" />}
        isOpen={open === "revenue"}
        onToggle={() => toggle("revenue")}
        count={revenueCount}
        onClear={() => onChange({ revenueBuckets: [], revenueMin: "", revenueMax: "", revenueMode: "predefined" })}
        preview={<FilterPreviewChips items={revenuePreview} />}
      >
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

      <FilterSection
        title="Funding"
        icon={<Banknote className="h-4 w-4" />}
        isOpen={open === "funding"}
        onToggle={() => toggle("funding")}
        count={fundingCount}
        onClear={() => onChange({ fundingPresets: [], fundingMin: "", fundingMax: "", fundingMode: "predefined" })}
        preview={<FilterPreviewChips items={fundingPreview} />}
      >
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

      <FilterSection
        title="Headcount Growth"
        icon={<Activity className="h-4 w-4" />}
        info="Filters companies by 12-month growth"
        isOpen={open === "headcountGrowth"}
        onToggle={() => toggle("headcountGrowth")}
        count={growthCount}
        onClear={() => onChange({ headcountGrowthPresets: [], headcountGrowthMin: "", headcountGrowthMax: "", headcountGrowthMode: "predefined" })}
        preview={<FilterPreviewChips items={growthPreview} />}
      >
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

      <FilterSection
        title="Founded Year"
        icon={<Calendar className="h-4 w-4" />}
        isOpen={open === "founded"}
        onToggle={() => toggle("founded")}
        count={foundedCount}
        onClear={() => onChange({ foundedPresets: [], foundedMin: "", foundedMax: "", foundedMode: "predefined" })}
        preview={<FilterPreviewChips items={foundedPreview} />}
      >
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

      <FilterSection
        title="Time in Current Role"
        icon={<Clock className="h-4 w-4" />}
        isOpen={open === "timeInRole"}
        onToggle={() => toggle("timeInRole")}
        count={timeRoleCount}
        onClear={() => onChange({ timeInRoleMinYears: "", timeInRoleMinMonths: "", timeInRoleMaxYears: "", timeInRoleMaxMonths: "" })}
        preview={<FilterPreviewChips items={timeRolePreview} />}
      >
        <TimeInRoleFilter mode="role" filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Time in Current Company"
        icon={<Clock className="h-4 w-4" />}
        isOpen={open === "timeInCompany"}
        onToggle={() => toggle("timeInCompany")}
        count={timeCompanyCount}
        onClear={() => onChange({ timeInCompanyMinYears: "", timeInCompanyMinMonths: "", timeInCompanyMaxYears: "", timeInCompanyMaxMonths: "" })}
        preview={<FilterPreviewChips items={timeCompanyPreview} />}
      >
        <TimeInRoleFilter mode="company" filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Total Years of Experience"
        icon={<BarChart2 className="h-4 w-4" />}
        isOpen={open === "totalExperience"}
        onToggle={() => toggle("totalExperience")}
        count={expCount}
        onClear={() => onChange({ experienceYearsMin: "", experienceYearsMax: "" })}
        preview={<FilterPreviewChips items={expPreview} />}
      >
        <TotalExperienceFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Job Change"
        icon={<BriefcaseJob className="h-4 w-4" />}
        isOpen={open === "jobChange"}
        onToggle={() => toggle("jobChange")}
        count={jobChangeCount}
        onClear={() => onChange({ jobChangeTimeframe: "" })}
        preview={<FilterPreviewChips items={jobChangePreview} />}
      >
        <JobChangeFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Job Posting"
        icon={<BriefcaseJob className="h-4 w-4" />}
        isOpen={open === "jobPosting"}
        onToggle={() => toggle("jobPosting")}
        count={jobPostingCount}
        onClear={() => onChange({ jobPostingKeywords: [] })}
        preview={<FilterPreviewChips items={jobPostingPreview} />}
      >
        <JobPostingFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Certifications"
        icon={<Award className="h-4 w-4" />}
        isOpen={open === "awardsCerts"}
        onToggle={() => toggle("awardsCerts")}
        count={certsCount}
        onClear={() => onChange({ certifications: [], otherCompliance: [] })}
        preview={<FilterPreviewChips items={certsPreview} />}
      >
        <AwardsCertsFilter filters={filters} onChange={onChange} />
      </FilterSection>

    </>
  );
}
