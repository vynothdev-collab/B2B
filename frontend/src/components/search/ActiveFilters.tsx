"use client";
import { X } from "lucide-react";
import type { CompanyFilters, PersonFilters } from "@/types/search";
import {
  SENIORITY_OPTIONS, COMPANY_SIZE_OPTIONS, COMPANY_TYPE_OPTIONS,
  DEGREE_OPTIONS, REVENUE_OPTIONS, FUNDING_ROUND_OPTIONS,
} from "@/types/search";

interface Chip {
  label: string;
  onRemove: () => void;
}

function labelFor(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function buildPersonChips(
  f: PersonFilters,
  onChange: (patch: Partial<PersonFilters>) => void
): Chip[] {
  const chips: Chip[] = [];

  const str = (key: keyof PersonFilters, display?: string) => {
    const v = f[key] as string;
    if (!v) return;
    chips.push({ label: display ?? v, onRemove: () => onChange({ [key]: "" } as Partial<PersonFilters>) });
  };

  const arr = <K extends keyof PersonFilters>(
    key: K,
    values: string[],
    getLabel?: (v: string) => string
  ) => {
    values.forEach((v) =>
      chips.push({
        label: getLabel ? getLabel(v) : v,
        onRemove: () => onChange({ [key]: values.filter((x) => x !== v) } as Partial<PersonFilters>),
      })
    );
  };

  str("name");
  arr("linkedinUrls", f.linkedinUrls);
  arr("languages", f.languages);
  arr("skills", f.skills);
  str("certifications");
  arr("degree", f.degree, (v) => labelFor(DEGREE_OPTIONS, v));
  str("school");
  str("fieldOfStudy");
  arr("jobTitle", f.jobTitle);
  arr("seniority", f.seniority, (v) => labelFor(SENIORITY_OPTIONS, v));
  arr("department", f.department);
  if (f.yearsExperienceMin || f.yearsExperienceMax) {
    const label = f.yearsExperienceMin && f.yearsExperienceMax
      ? `${f.yearsExperienceMin}–${f.yearsExperienceMax} yrs exp`
      : f.yearsExperienceMin ? `≥${f.yearsExperienceMin} yrs exp` : `≤${f.yearsExperienceMax} yrs exp`;
    chips.push({ label, onRemove: () => onChange({ yearsExperienceMin: "", yearsExperienceMax: "" }) });
  }
  arr("companyName", f.companyName);
  arr("companyLinkedinUrls", f.companyLinkedinUrls);
  str("companyDomain");
  arr("industry", f.industry);
  arr("companySize", f.companySize, (v) => labelFor(COMPANY_SIZE_OPTIONS, v));
  arr("companyType", f.companyType, (v) => labelFor(COMPANY_TYPE_OPTIONS, v));
  arr("companyRevenue", f.companyRevenue, (v) => labelFor(REVENUE_OPTIONS, v));
  arr("country", f.country);
  arr("state", f.state);
  str("city");
  arr("hqCountry", f.hqCountry);
  arr("hqState", f.hqState);
  str("hqCity");

  return chips;
}

function buildCompanyChips(
  f: CompanyFilters,
  onChange: (patch: Partial<CompanyFilters>) => void
): Chip[] {
  const chips: Chip[] = [];

  const str = (key: keyof CompanyFilters, display?: string) => {
    const v = f[key] as string;
    if (!v) return;
    chips.push({ label: display ?? v, onRemove: () => onChange({ [key]: "" } as Partial<CompanyFilters>) });
  };

  const arr = <K extends keyof CompanyFilters>(
    key: K,
    values: string[],
    getLabel?: (v: string) => string
  ) => {
    values.forEach((v) =>
      chips.push({
        label: getLabel ? getLabel(v) : v,
        onRemove: () => onChange({ [key]: values.filter((x) => x !== v) } as Partial<CompanyFilters>),
      })
    );
  };

  str("companyName");
  str("websiteDomain");
  arr("industry", f.industry);
  arr("type", f.type, (v) => labelFor(COMPANY_TYPE_OPTIONS, v));
  str("stockExchange");
  arr("hqCountry", f.hqCountry);
  arr("hqState", f.hqState);
  str("hqCity");
  str("hqMetro");
  arr("employeeCountRanges", f.employeeCountRanges, (v) => labelFor(COMPANY_SIZE_OPTIONS, v));
  if (f.employeeCountMin || f.employeeCountMax) {
    const label = f.employeeCountMin && f.employeeCountMax
      ? `${f.employeeCountMin}–${f.employeeCountMax} employees`
      : f.employeeCountMin ? `≥${f.employeeCountMin} employees` : `≤${f.employeeCountMax} employees`;
    chips.push({ label, onRemove: () => onChange({ employeeCountMin: "", employeeCountMax: "" }) });
  }
  arr("annualRevenue", f.annualRevenue, (v) => labelFor(REVENUE_OPTIONS, v));
  if (f.employeeGrowthMin) chips.push({ label: `≥${f.employeeGrowthMin}% growth`, onRemove: () => onChange({ employeeGrowthMin: "" }) });
  if (f.yearFoundedMin || f.yearFoundedMax) {
    const label = f.yearFoundedMin && f.yearFoundedMax
      ? `Founded ${f.yearFoundedMin}–${f.yearFoundedMax}`
      : f.yearFoundedMin ? `Founded ≥${f.yearFoundedMin}` : `Founded ≤${f.yearFoundedMax}`;
    chips.push({ label, onRemove: () => onChange({ yearFoundedMin: "", yearFoundedMax: "" }) });
  }
  arr("lastFundingRound", f.lastFundingRound, (v) => labelFor(FUNDING_ROUND_OPTIONS, v));
  if (f.totalFundingMin) chips.push({ label: `≥$${f.totalFundingMin} funding`, onRemove: () => onChange({ totalFundingMin: "" }) });
  if (f.mostRecentFundingAfter) chips.push({ label: `Funded after ${f.mostRecentFundingAfter}`, onRemove: () => onChange({ mostRecentFundingAfter: "" }) });
  f.roleCompositionRules.forEach((rule, i) => {
    if (!rule.role) return;
    if (rule.minCount) chips.push({
      label: `${rule.role} ≥${rule.minCount} employees`,
      onRemove: () => onChange({ roleCompositionRules: f.roleCompositionRules.map((r, j) => j === i ? { ...r, minCount: "" } : r) }),
    });
    if (rule.minGrowth) chips.push({
      label: `${rule.role} ≥${rule.minGrowth}% growth`,
      onRemove: () => onChange({ roleCompositionRules: f.roleCompositionRules.map((r, j) => j === i ? { ...r, minGrowth: "" } : r) }),
    });
  });

  return chips;
}

const CHIP_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function chipColor(index: number) {
  return CHIP_COLORS[index % CHIP_COLORS.length];
}

interface Props {
  tab: "people" | "company";
  personFilters: PersonFilters;
  companyFilters: CompanyFilters;
  onPersonChange: (patch: Partial<PersonFilters>) => void;
  onCompanyChange: (patch: Partial<CompanyFilters>) => void;
}

export default function ActiveFilters({ tab, personFilters, companyFilters, onPersonChange, onCompanyChange }: Props) {
  const chips = tab === "people"
    ? buildPersonChips(personFilters, onPersonChange)
    : buildCompanyChips(companyFilters, onCompanyChange);

  if (chips.length === 0) return null;

  return (
    <div className="flex shrink-0 items-center gap-1.5 border-b border-gray-100 px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {chips.map((chip, i) => (
        <span
          key={`${chip.label}-${i}`}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${chipColor(i)}`}
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            aria-label={`Remove ${chip.label}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
