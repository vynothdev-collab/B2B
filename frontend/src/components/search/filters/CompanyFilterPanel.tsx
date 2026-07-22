"use client";
import { useState } from "react";
import {
  Sparkles, Building2, MapPin, Tag, Type,
  Users, BarChart3, TrendingUp, Cpu, DollarSign, Banknote, Calendar, Activity,
  Briefcase, Globe, Newspaper,
} from "lucide-react";
import FilterSection, { FilterPreviewChips } from "../FilterSection";
import type { ChipItem } from "../FilterSection";
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
  COMPANY_STATUS_OPTIONS,
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

function chips(items: string[], onRemove: (v: string) => void): ChipItem[] {
  return items.map((v) => ({ label: v, onRemove: () => onRemove(v) }));
}

function fmtRange(min: string, max: string, suffix = ""): string {
  if (min && max) return `${min}–${max}${suffix}`;
  if (min) return `≥${min}${suffix}`;
  if (max) return `≤${max}${suffix}`;
  return "";
}

export function countCompanyFilters(f: CompanyFilters): number {
  return (
    f.companies.length +
    f.locationCountries.length + f.locationStates.length + f.locationCities.length +
    f.companyStatus.length + f.type.length +
    f.keywordsInclude.length + f.keywordsExclude.length +
    f.employeeHeadcountRanges.length + (f.employeeCountMin || f.employeeCountMax ? 1 : 0) +
    f.industries.length +
    f.technologies.length +
    f.revenueBuckets.length + (f.revenueMin || f.revenueMax ? 1 : 0) +
    f.fundingPresets.length + (f.fundingMin || f.fundingMax ? 1 : 0) + f.fundingStages.length +
    f.headcountGrowthPresets.length + (f.headcountGrowthMin || f.headcountGrowthMax ? 1 : 0) +
    (f.headcountByDepartment ? 1 : 0) + f.headcountByDepartmentPresets.length + (f.headcountByDepartmentMin || f.headcountByDepartmentMax ? 1 : 0) +
    (f.headcountByLocationCountry ? 1 : 0) + f.headcountByLocationPresets.length + (f.headcountByLocationMin || f.headcountByLocationMax ? 1 : 0) +
    f.foundedPresets.length + (f.foundedMin || f.foundedMax ? 1 : 0) +
    f.jobPostingKeywords.length +
    (f.websiteVisitsMin || f.websiteVisitsMax || f.visitChangeMin || f.visitChangeMax ? 1 : 0) +
    f.companyNewsKeywords.length + f.companyNewsCategories.length + (f.companyNewsTimeframe ? 1 : 0)
  );
}

export default function CompanyFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState<Section>("company");
  const toggle = (s: Section) => setOpen((p) => (p === s ? ("" as Section) : s));

  // ── section counts ──────────────────────────────────────────────────────────
  const companyCount = filters.companies.length;
  const locationCount =
    filters.locationCountries.length + filters.locationStates.length + filters.locationCities.length;
  const typeCount = filters.companyStatus.length + filters.type.length;
  const keywordCount = filters.keywordsInclude.length + filters.keywordsExclude.length;
  const headcountCount =
    filters.employeeHeadcountRanges.length + (filters.employeeCountMin || filters.employeeCountMax ? 1 : 0);
  const industryCount = filters.industries.length;
  const techCount = filters.technologies.length;
  const revenueCount =
    filters.revenueBuckets.length + (filters.revenueMin || filters.revenueMax ? 1 : 0);
  const fundingCount =
    filters.fundingPresets.length + (filters.fundingMin || filters.fundingMax ? 1 : 0) + filters.fundingStages.length;
  const growthCount =
    filters.headcountGrowthPresets.length + (filters.headcountGrowthMin || filters.headcountGrowthMax ? 1 : 0);
  const deptCount = (filters.headcountByDepartment ? 1 : 0) +
    filters.headcountByDepartmentPresets.length +
    (filters.headcountByDepartmentMin || filters.headcountByDepartmentMax ? 1 : 0);
  const locationByCount = (filters.headcountByLocationCountry ? 1 : 0) +
    filters.headcountByLocationPresets.length +
    (filters.headcountByLocationMin || filters.headcountByLocationMax ? 1 : 0);
  const foundedCount =
    filters.foundedPresets.length + (filters.foundedMin || filters.foundedMax ? 1 : 0);
  const jobPostingCount = filters.jobPostingKeywords.length;
  const trafficCount =
    filters.websiteVisitsMin || filters.websiteVisitsMax ||
    filters.visitChangeMin || filters.visitChangeMax ? 1 : 0;
  const newsCount =
    filters.companyNewsKeywords.length + filters.companyNewsCategories.length +
    (filters.companyNewsTimeframe ? 1 : 0);

  // ── preview chip lists ──────────────────────────────────────────────────────
  const companyPreview = chips(filters.companies, (v) => onChange({ companies: filters.companies.filter((x) => x !== v) }));
  const locationPreview: ChipItem[] = [
    ...chips(filters.locationCountries, (v) => onChange({ locationCountries: filters.locationCountries.filter((x) => x !== v) })),
    ...chips(filters.locationStates, (v) => onChange({ locationStates: filters.locationStates.filter((x) => x !== v) })),
    ...chips(filters.locationCities, (v) => onChange({ locationCities: filters.locationCities.filter((x) => x !== v) })),
  ];
  const typePreview: ChipItem[] = [
    ...filters.companyStatus.map((v) => ({ label: COMPANY_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v, onRemove: () => onChange({ companyStatus: filters.companyStatus.filter((x) => x !== v) }) })),
    ...filters.type.map((v) => ({ label: v, onRemove: () => onChange({ type: filters.type.filter((x) => x !== v) }) })),
  ];
  const industryPreview = chips(filters.industries, (v) => onChange({ industries: filters.industries.filter((x) => x !== v) }));
  const techPreview = chips(filters.technologies, (v) => onChange({ technologies: filters.technologies.filter((x) => x !== v) }));
  const keywordPreview: ChipItem[] = [
    ...filters.keywordsInclude.map((v) => ({ label: v, onRemove: () => onChange({ keywordsInclude: filters.keywordsInclude.filter((x) => x !== v) }) })),
    ...filters.keywordsExclude.map((v) => ({ label: `−${v}`, onRemove: () => onChange({ keywordsExclude: filters.keywordsExclude.filter((x) => x !== v) }) })),
  ];
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
    ...chips(filters.fundingStages, (v) => onChange({ fundingStages: filters.fundingStages.filter((x) => x !== v) })),
  ];
  const growthPreview: ChipItem[] = [
    ...chips(filters.headcountGrowthPresets, (v) => onChange({ headcountGrowthPresets: filters.headcountGrowthPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.headcountGrowthMin, filters.headcountGrowthMax, "%") ? [{ label: fmtRange(filters.headcountGrowthMin, filters.headcountGrowthMax, "%"), onRemove: () => onChange({ headcountGrowthMin: "", headcountGrowthMax: "" }) }] : []),
  ];
  const deptPreview: ChipItem[] = [
    ...(filters.headcountByDepartment ? [{ label: filters.headcountByDepartment, onRemove: () => onChange({ headcountByDepartment: "" }) }] : []),
    ...chips(filters.headcountByDepartmentPresets, (v) => onChange({ headcountByDepartmentPresets: filters.headcountByDepartmentPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.headcountByDepartmentMin, filters.headcountByDepartmentMax) ? [{ label: fmtRange(filters.headcountByDepartmentMin, filters.headcountByDepartmentMax), onRemove: () => onChange({ headcountByDepartmentMin: "", headcountByDepartmentMax: "" }) }] : []),
  ];
  const locationByPreview: ChipItem[] = [
    ...(filters.headcountByLocationCountry ? [{ label: filters.headcountByLocationCountry, onRemove: () => onChange({ headcountByLocationCountry: "" }) }] : []),
    ...chips(filters.headcountByLocationPresets, (v) => onChange({ headcountByLocationPresets: filters.headcountByLocationPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.headcountByLocationMin, filters.headcountByLocationMax) ? [{ label: fmtRange(filters.headcountByLocationMin, filters.headcountByLocationMax), onRemove: () => onChange({ headcountByLocationMin: "", headcountByLocationMax: "" }) }] : []),
  ];
  const foundedPreview: ChipItem[] = [
    ...chips(filters.foundedPresets, (v) => onChange({ foundedPresets: filters.foundedPresets.filter((x) => x !== v) })),
    ...(fmtRange(filters.foundedMin, filters.foundedMax) ? [{ label: fmtRange(filters.foundedMin, filters.foundedMax), onRemove: () => onChange({ foundedMin: "", foundedMax: "" }) }] : []),
  ];
  const jobPostingPreview = chips(filters.jobPostingKeywords, (v) => onChange({ jobPostingKeywords: filters.jobPostingKeywords.filter((x) => x !== v) }));
  const trafficLabel = [
    fmtRange(filters.websiteVisitsMin, filters.websiteVisitsMax, " visits"),
    fmtRange(filters.visitChangeMin, filters.visitChangeMax, "% change"),
  ].filter(Boolean).join(", ");
  const trafficPreview: ChipItem[] = trafficLabel ? [{ label: trafficLabel, onRemove: () => onChange({ websiteVisitsMin: "", websiteVisitsMax: "", visitChangeMin: "", visitChangeMax: "" }) }] : [];
  const newsPreview: ChipItem[] = [
    ...chips(filters.companyNewsKeywords, (v) => onChange({ companyNewsKeywords: filters.companyNewsKeywords.filter((x) => x !== v) })),
    ...chips(filters.companyNewsCategories ?? [], (v) => onChange({ companyNewsCategories: (filters.companyNewsCategories ?? []).filter((x) => x !== v) })),
    ...(filters.companyNewsTimeframe ? [{ label: filters.companyNewsTimeframe, onRemove: () => onChange({ companyNewsTimeframe: "" }) }] : []),
  ];

  return (
    <>
      <FilterSection title="AI Lookalikes" icon={<Sparkles className="h-4 w-4" />} info="Find similar companies" isOpen={open === "lookalikes"} onToggle={() => toggle("lookalikes")}>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-200 bg-red-50 px-2.5 py-2">
          <Sparkles className="h-3.5 w-3.5 text-red-500" />
          <p className="text-[12px] text-red-700">Find similar companies — coming soon.</p>
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
        onClear={() => onChange({ locationCountries: [], locationStates: [], locationCities: [] })}
        preview={<FilterPreviewChips items={locationPreview} />}
      >
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-1">Country</p>
            <LocationAutocomplete kind="country" values={filters.locationCountries} onChange={(v) => onChange({ locationCountries: v })} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-1">State / Region</p>
            <LocationAutocomplete kind="state" values={filters.locationStates} onChange={(v) => onChange({ locationStates: v })} filterCountries={filters.locationCountries} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-1">City</p>
            <LocationAutocomplete kind="city" values={filters.locationCities} onChange={(v) => onChange({ locationCities: v })} filterCountries={filters.locationCountries} filterStates={filters.locationStates} />
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Type & Business Model"
        icon={<Tag className="h-4 w-4" />}
        isOpen={open === "type"}
        onToggle={() => toggle("type")}
        count={typeCount}
        onClear={() => onChange({ companyStatus: [], type: [], companyHowTheySell: [], companyMoreFlags: [], companyRevenueModel: [] })}
        preview={<FilterPreviewChips items={typePreview} />}
      >
        <CompanyTypeBusinessFilter filters={filters} onChange={onChange} />
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
        isOpen={open === "headcount"}
        onToggle={() => toggle("headcount")}
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
        icon={<BarChart3 className="h-4 w-4" />}
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
          placeholder="e.g. React, AWS, Salesforce…"
          field="skill"
          values={filters.technologies}
          onChange={(v) => onChange({ technologies: v })}
        />
        <p className="px-1 pt-1 text-[10px] text-gray-400">
          Matches companies whose tags include the selected technologies.
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
        onClear={() => onChange({ fundingPresets: [], fundingMin: "", fundingMax: "", fundingMode: "predefined", fundingStages: [] })}
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
        <MultiChipSelect
          label="Latest funding stage"
          placeholder="Select stage(s)"
          options={FUNDING_STAGE_OPTIONS}
          values={filters.fundingStages}
          onChange={(v) => onChange({ fundingStages: v })}
        />
      </FilterSection>

      <FilterSection
        title="Headcount Growth"
        icon={<Activity className="h-4 w-4" />}
        info="Filter by employee growth rate"
        isOpen={open === "headcountGrowth"}
        onToggle={() => toggle("headcountGrowth")}
        count={growthCount}
        onClear={() => onChange({ headcountGrowthPresets: [], headcountGrowthMin: "", headcountGrowthMax: "", headcountGrowthMode: "predefined" })}
        preview={<FilterPreviewChips items={growthPreview} />}
      >
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

      <FilterSection
        title="Headcount by Department"
        icon={<Activity className="h-4 w-4" />}
        info="Filter by headcount in a department"
        isOpen={open === "headcountByDept"}
        onToggle={() => toggle("headcountByDept")}
        count={deptCount}
        onClear={() => onChange({ headcountByDepartment: "", headcountByDepartmentPresets: [], headcountByDepartmentMin: "", headcountByDepartmentMax: "", headcountByDepartmentMode: "predefined" })}
        preview={<FilterPreviewChips items={deptPreview} />}
      >
        <MultiChipSelect
          label="Department"
          placeholder="Select department"
          noCheckbox
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

      <FilterSection
        title="Headcount by Location"
        icon={<MapPin className="h-4 w-4" />}
        info="Filter by headcount in a country"
        isOpen={open === "headcountByLocation"}
        onToggle={() => toggle("headcountByLocation")}
        count={locationByCount}
        onClear={() => onChange({ headcountByLocationCountry: "", headcountByLocationPresets: [], headcountByLocationMin: "", headcountByLocationMax: "", headcountByLocationMode: "predefined" })}
        preview={<FilterPreviewChips items={locationByPreview} />}
      >
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
        title="Job Posting"
        icon={<Briefcase className="h-4 w-4" />}
        isOpen={open === "jobPosting"}
        onToggle={() => toggle("jobPosting")}
        count={jobPostingCount}
        onClear={() => onChange({ jobPostingKeywords: [] })}
        preview={<FilterPreviewChips items={jobPostingPreview} />}
      >
        <CompanyJobPostingFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Website Traffic"
        icon={<Globe className="h-4 w-4" />}
        isOpen={open === "websiteTraffic"}
        onToggle={() => toggle("websiteTraffic")}
        count={trafficCount}
        onClear={() => onChange({ websiteVisitsMin: "", websiteVisitsMax: "", visitChangeMin: "", visitChangeMax: "", visitChangeTimeframe: "monthly" })}
        preview={<FilterPreviewChips items={trafficPreview} />}
      >
        <CompanyWebsiteTrafficFilter filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title="Company News"
        icon={<Newspaper className="h-4 w-4" />}
        isOpen={open === "companyNews"}
        onToggle={() => toggle("companyNews")}
        count={newsCount}
        onClear={() => onChange({ companyNewsKeywords: [], companyNewsCategories: [], companyNewsTimeframe: "" })}
        preview={<FilterPreviewChips items={newsPreview} />}
      >
        <CompanyNewsFilter filters={filters} onChange={onChange} />
      </FilterSection>
    </>
  );
}
