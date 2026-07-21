import type { FilterChip } from "@/components/search/ActiveFilterChips";
import type { PersonFilters, CompanyFilters } from "@/types/search";
import {
  SENIORITY_OPTIONS, DEPARTMENT_OPTIONS, INDUSTRY_OPTIONS,
  COMPANY_STATUS_OPTIONS, COMPANY_HOW_THEY_SELL_OPTIONS,
  COMPANY_MORE_FLAGS_OPTIONS, COMPANY_REVENUE_MODEL_OPTIONS,
  COMPANY_NEWS_CATEGORIES, COMPANY_NEWS_TIMEFRAMES,
  REVENUE_OPTIONS, FUNDING_STAGE_OPTIONS, CERTIFICATION_OPTIONS, EMAIL_PROVIDER_OPTIONS,
  JOB_CHANGE_TIMEFRAMES,
  FUNDING_PRESETS, GROWTH_PRESETS, FOUNDED_YEAR_PRESETS,
} from "@/types/search";

function presetLabels(values: string[], options: { value: string; label: string }[]): string {
  return values.map(v => options.find(o => o.value === v)?.label ?? v).join(", ");
}

function labelOf(options: { value: string; label: string }[], v: string) {
  return options.find((o) => o.value === v)?.label ?? v;
}

function fmtUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function toMonths(years: string, months: string): number | undefined {
  const y = parseInt(years, 10);
  const m = parseInt(months, 10);
  const total = (isNaN(y) ? 0 : y * 12) + (isNaN(m) ? 0 : m);
  return total > 0 ? total : undefined;
}

function capitalize(s: string) {
  return s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function rangeLabel(min?: string, max?: string, fmt?: (n: number) => string) {
  const f = fmt ?? ((n: number) => String(n));
  if (min && max) return `${f(Number(min))} – ${f(Number(max))}`;
  if (min) return `≥ ${f(Number(min))}`;
  if (max) return `≤ ${f(Number(max))}`;
  return "";
}

export function buildPersonChips(
  filters: PersonFilters,
  onChange: (patch: Partial<PersonFilters>) => void
): FilterChip[] {
  const chips: FilterChip[] = [];

  filters.name.forEach((v) =>
    chips.push({ id: `name-${v}`, label: v, onRemove: () => onChange({ name: filters.name.filter((x) => x !== v) }) })
  );

  filters.jobTitle.forEach((v) =>
    chips.push({ id: `title-${v}`, label: v, onRemove: () => onChange({ jobTitle: filters.jobTitle.filter((x) => x !== v) }) })
  );

  filters.departments.forEach((v) =>
    chips.push({ id: `dept-${v}`, label: labelOf(DEPARTMENT_OPTIONS, v), onRemove: () => onChange({ departments: filters.departments.filter((x) => x !== v) }) })
  );

  filters.seniority.forEach((v) =>
    chips.push({ id: `sen-${v}`, label: labelOf(SENIORITY_OPTIONS, v), onRemove: () => onChange({ seniority: filters.seniority.filter((x) => x !== v) }) })
  );

  filters.companies.forEach((v) =>
    chips.push({ id: `co-${v}`, label: v, onRemove: () => onChange({ companies: filters.companies.filter((x) => x !== v) }) })
  );

  filters.personLocationCountries.forEach((v) =>
    chips.push({ id: `loc-country-${v}`, label: capitalize(v), onRemove: () => onChange({ personLocationCountries: filters.personLocationCountries.filter((x) => x !== v) }) })
  );
  filters.personLocationStates.forEach((v) =>
    chips.push({ id: `loc-state-${v}`, label: capitalize(v), onRemove: () => onChange({ personLocationStates: filters.personLocationStates.filter((x) => x !== v) }) })
  );
  filters.personLocationCities.forEach((v) =>
    chips.push({ id: `loc-city-${v}`, label: capitalize(v), onRemove: () => onChange({ personLocationCities: filters.personLocationCities.filter((x) => x !== v) }) })
  );

  filters.companyHQCountries.forEach((v) =>
    chips.push({ id: `hq-country-${v}`, label: `HQ: ${capitalize(v)}`, onRemove: () => onChange({ companyHQCountries: filters.companyHQCountries.filter((x) => x !== v) }) })
  );
  filters.companyHQStates.forEach((v) =>
    chips.push({ id: `hq-state-${v}`, label: `HQ: ${capitalize(v)}`, onRemove: () => onChange({ companyHQStates: filters.companyHQStates.filter((x) => x !== v) }) })
  );
  filters.companyHQCities.forEach((v) =>
    chips.push({ id: `hq-city-${v}`, label: `HQ: ${capitalize(v)}`, onRemove: () => onChange({ companyHQCities: filters.companyHQCities.filter((x) => x !== v) }) })
  );

  if (filters.requireWorkEmail)
    chips.push({ id: "email", label: "Work Email", onRemove: () => onChange({ requireWorkEmail: false }) });

  filters.companyStatus.forEach((v) =>
    chips.push({ id: `status-${v}`, label: labelOf(COMPANY_STATUS_OPTIONS, v), onRemove: () => onChange({ companyStatus: filters.companyStatus.filter((x) => x !== v) }) })
  );

  filters.companyType.forEach((v) =>
    chips.push({ id: `type-${v}`, label: labelOf(INDUSTRY_OPTIONS, v), onRemove: () => onChange({ companyType: filters.companyType.filter((x) => x !== v) }) })
  );

  filters.technologies.forEach((v) =>
    chips.push({ id: `tech-${v}`, label: v, onRemove: () => onChange({ technologies: filters.technologies.filter((x) => x !== v) }) })
  );

  filters.revenueBuckets.forEach((v) =>
    chips.push({ id: `rev-${v}`, label: labelOf(REVENUE_OPTIONS, v), onRemove: () => onChange({ revenueBuckets: filters.revenueBuckets.filter((x) => x !== v) }) })
  );

  filters.industries.forEach((v) =>
    chips.push({ id: `ind-${v}`, label: v, onRemove: () => onChange({ industries: filters.industries.filter((x) => x !== v) }) })
  );

  // Employee headcount chips
  if (filters.employeeHeadcountMode === "predefined" && filters.employeeHeadcountRanges.length) {
    const label = filters.employeeHeadcountRanges.length === 1
      ? `Headcount: ${filters.employeeHeadcountRanges[0]}`
      : `Headcount: ${filters.employeeHeadcountRanges.length} ranges`;
    chips.push({ id: "emp-headcount", label, onRemove: () => onChange({ employeeHeadcountRanges: [] }) });
  }
  if (filters.employeeHeadcountMode === "custom" && (filters.employeeCountMin || filters.employeeCountMax)) {
    const min = filters.employeeCountMin || "0";
    const max = filters.employeeCountMax || "∞";
    chips.push({ id: "emp-headcount-custom", label: `Headcount: ${min} – ${max}`, onRemove: () => onChange({ employeeCountMin: "", employeeCountMax: "" }) });
  }

  if (filters.fundingMode === "predefined" && filters.fundingPresets.length)
    chips.push({ id: "funding", label: `Funding: ${presetLabels(filters.fundingPresets, FUNDING_PRESETS)}`, onRemove: () => onChange({ fundingPresets: [] }) });
  else if (filters.fundingMode === "custom") {
    const fundRange = rangeLabel(filters.fundingMin, filters.fundingMax, fmtUsd);
    if (fundRange) chips.push({ id: "funding", label: `Funding: ${fundRange}`, onRemove: () => onChange({ fundingMin: "", fundingMax: "" }) });
  }

  if (filters.headcountGrowthMode === "predefined" && filters.headcountGrowthPresets.length)
    chips.push({ id: "growth", label: `Growth: ${presetLabels(filters.headcountGrowthPresets, GROWTH_PRESETS)}`, onRemove: () => onChange({ headcountGrowthPresets: [] }) });
  else if (filters.headcountGrowthMode === "custom") {
    const growthRange = rangeLabel(filters.headcountGrowthMin, filters.headcountGrowthMax, (n) => `${n}%`);
    if (growthRange) chips.push({ id: "growth", label: `Growth: ${growthRange}`, onRemove: () => onChange({ headcountGrowthMin: "", headcountGrowthMax: "" }) });
  }

  if (filters.foundedMode === "predefined" && filters.foundedPresets.length)
    chips.push({ id: "founded", label: `Founded: ${presetLabels(filters.foundedPresets, FOUNDED_YEAR_PRESETS)}`, onRemove: () => onChange({ foundedPresets: [] }) });
  else if (filters.foundedMode === "custom") {
    const foundRange = rangeLabel(filters.foundedMin, filters.foundedMax);
    if (foundRange) chips.push({ id: "founded", label: `Founded: ${foundRange}`, onRemove: () => onChange({ foundedMin: "", foundedMax: "" }) });
  }

  // Time in role chips
  const roleMin = toMonths(filters.timeInRoleMinYears, filters.timeInRoleMinMonths);
  const roleMax = toMonths(filters.timeInRoleMaxYears, filters.timeInRoleMaxMonths);
  if (roleMin || roleMax)
    chips.push({ id: "time-role", label: `Time in Role: ${roleMin ?? 0}–${roleMax ?? "∞"} mo`, onRemove: () => onChange({ timeInRoleMinYears: "", timeInRoleMinMonths: "", timeInRoleMaxYears: "", timeInRoleMaxMonths: "" }) });

  const coMin = toMonths(filters.timeInCompanyMinYears, filters.timeInCompanyMinMonths);
  const coMax = toMonths(filters.timeInCompanyMaxYears, filters.timeInCompanyMaxMonths);
  if (coMin || coMax)
    chips.push({ id: "time-company", label: `Time in Company: ${coMin ?? 0}–${coMax ?? "∞"} mo`, onRemove: () => onChange({ timeInCompanyMinYears: "", timeInCompanyMinMonths: "", timeInCompanyMaxYears: "", timeInCompanyMaxMonths: "" }) });

  const expRange = rangeLabel(filters.experienceYearsMin, filters.experienceYearsMax, (n) => `${n}yr`);
  if (expRange)
    chips.push({ id: "experience", label: `Experience: ${expRange}`, onRemove: () => onChange({ experienceYearsMin: "", experienceYearsMax: "" }) });

  if (filters.jobChangeTimeframe) {
    const label = JOB_CHANGE_TIMEFRAMES.find((o) => o.value === filters.jobChangeTimeframe)?.label ?? `Last ${filters.jobChangeTimeframe}m`;
    chips.push({ id: "job-change", label: `Job Change: ${label}`, onRemove: () => onChange({ jobChangeTimeframe: "" }) });
  }

  filters.jobPostingKeywords.forEach((v) =>
    chips.push({ id: `job-post-${v}`, label: `Hiring: ${v}`, onRemove: () => onChange({ jobPostingKeywords: filters.jobPostingKeywords.filter((x) => x !== v) }) })
  );

  filters.keywordsInclude.forEach((v) =>
    chips.push({ id: `kw-inc-${v}`, label: `Keyword: ${v}`, onRemove: () => onChange({ keywordsInclude: filters.keywordsInclude.filter((x) => x !== v) }) })
  );

  filters.keywordsExclude.forEach((v) =>
    chips.push({ id: `kw-exc-${v}`, label: `Excl. keyword: ${v}`, onRemove: () => onChange({ keywordsExclude: filters.keywordsExclude.filter((x) => x !== v) }) })
  );

  if (filters.hideAllSavedPeople)
    chips.push({ id: "dup-people", label: "Hiding saved people", onRemove: () => onChange({ hideAllSavedPeople: false, hideSavedPeopleListIds: [] }) });

  if (filters.hideAllSavedCompanies)
    chips.push({ id: "dup-companies", label: "Hiding saved companies", onRemove: () => onChange({ hideAllSavedCompanies: false, hideSavedCompanyListIds: [] }) });

  filters.exclusionCompanyNames.forEach((v) =>
    chips.push({ id: `excl-${v}`, label: `Exclude: ${v}`, onRemove: () => onChange({ exclusionCompanyNames: filters.exclusionCompanyNames.filter((x) => x !== v) }) })
  );

  filters.certifications.forEach((v) =>
    chips.push({ id: `cert-${v}`, label: labelOf(CERTIFICATION_OPTIONS, v), onRemove: () => onChange({ certifications: filters.certifications.filter((x) => x !== v) }) })
  );

  filters.otherCompliance.forEach((v) =>
    chips.push({ id: `compliance-${v}`, label: `Compliance: ${v}`, onRemove: () => onChange({ otherCompliance: filters.otherCompliance.filter((x) => x !== v) }) })
  );

  return chips;
}

export function buildCompanyChips(
  filters: CompanyFilters,
  onChange: (patch: Partial<CompanyFilters>) => void
): FilterChip[] {
  const chips: FilterChip[] = [];

  filters.companies.forEach((v) =>
    chips.push({ id: `co-${v}`, label: v, onRemove: () => onChange({ companies: filters.companies.filter((x) => x !== v) }) })
  );

  filters.locationCountries.forEach((v) =>
    chips.push({ id: `loc-country-${v}`, label: capitalize(v), onRemove: () => onChange({ locationCountries: filters.locationCountries.filter((x) => x !== v) }) })
  );
  filters.locationStates.forEach((v) =>
    chips.push({ id: `loc-state-${v}`, label: capitalize(v), onRemove: () => onChange({ locationStates: filters.locationStates.filter((x) => x !== v) }) })
  );
  filters.locationCities.forEach((v) =>
    chips.push({ id: `loc-city-${v}`, label: capitalize(v), onRemove: () => onChange({ locationCities: filters.locationCities.filter((x) => x !== v) }) })
  );

  filters.type.forEach((v) =>
    chips.push({ id: `type-${v}`, label: labelOf(INDUSTRY_OPTIONS, v), onRemove: () => onChange({ type: filters.type.filter((x) => x !== v) }) })
  );

  filters.companyStatus.forEach((v) =>
    chips.push({ id: `co-status-${v}`, label: labelOf(COMPANY_STATUS_OPTIONS, v), onRemove: () => onChange({ companyStatus: filters.companyStatus.filter((x) => x !== v) }) })
  );

  filters.companyHowTheySell.forEach((v) =>
    chips.push({ id: `sell-${v}`, label: labelOf(COMPANY_HOW_THEY_SELL_OPTIONS, v), onRemove: () => onChange({ companyHowTheySell: filters.companyHowTheySell.filter((x) => x !== v) }) })
  );

  filters.companyMoreFlags.forEach((v) =>
    chips.push({ id: `flag-${v}`, label: labelOf(COMPANY_MORE_FLAGS_OPTIONS, v), onRemove: () => onChange({ companyMoreFlags: filters.companyMoreFlags.filter((x) => x !== v) }) })
  );

  filters.companyRevenueModel.forEach((v) =>
    chips.push({ id: `rev-model-${v}`, label: labelOf(COMPANY_REVENUE_MODEL_OPTIONS, v), onRemove: () => onChange({ companyRevenueModel: filters.companyRevenueModel.filter((x) => x !== v) }) })
  );

  filters.jobPostingKeywords.forEach((v) =>
    chips.push({ id: `job-post-${v}`, label: `Hiring: ${v}`, onRemove: () => onChange({ jobPostingKeywords: filters.jobPostingKeywords.filter((x) => x !== v) }) })
  );

  filters.keywordsInclude.forEach((v) =>
    chips.push({ id: `kw-inc-${v}`, label: `Keyword: ${v}`, onRemove: () => onChange({ keywordsInclude: filters.keywordsInclude.filter((x) => x !== v) }) })
  );

  filters.keywordsExclude.forEach((v) =>
    chips.push({ id: `kw-exc-${v}`, label: `Excl. keyword: ${v}`, onRemove: () => onChange({ keywordsExclude: filters.keywordsExclude.filter((x) => x !== v) }) })
  );

  filters.emailProviders.forEach((v) =>
    chips.push({ id: `email-${v}`, label: `Email: ${labelOf(EMAIL_PROVIDER_OPTIONS, v)}`, onRemove: () => onChange({ emailProviders: filters.emailProviders.filter((x) => x !== v) }) })
  );

  filters.awards.forEach((v) =>
    chips.push({ id: `award-${v}`, label: `Award: ${v}`, onRemove: () => onChange({ awards: filters.awards.filter((x) => x !== v) }) })
  );

  filters.certifications.forEach((v) =>
    chips.push({ id: `cert-${v}`, label: labelOf(CERTIFICATION_OPTIONS, v), onRemove: () => onChange({ certifications: filters.certifications.filter((x) => x !== v) }) })
  );

  filters.otherCompliance.forEach((v) =>
    chips.push({ id: `compliance-${v}`, label: `Compliance: ${v}`, onRemove: () => onChange({ otherCompliance: filters.otherCompliance.filter((x) => x !== v) }) })
  );

  const visitsRange = rangeLabel(filters.websiteVisitsMin, filters.websiteVisitsMax);
  if (visitsRange)
    chips.push({ id: "visits", label: `Monthly Visits: ${visitsRange}`, onRemove: () => onChange({ websiteVisitsMin: "", websiteVisitsMax: "" }) });

  const visitChangeRange = rangeLabel(filters.visitChangeMin, filters.visitChangeMax, (n) => `${n}%`);
  if (visitChangeRange)
    chips.push({ id: "visit-change", label: `Visit Change (${filters.visitChangeTimeframe}): ${visitChangeRange}`, onRemove: () => onChange({ visitChangeMin: "", visitChangeMax: "" }) });

  if (filters.trafficCountry) {
    const countryRange = rangeLabel(filters.trafficCountryMin, filters.trafficCountryMax, (n) => `${n}%`);
    chips.push({
      id: "traffic-country",
      label: `Traffic ${capitalize(filters.trafficCountry)}${countryRange ? `: ${countryRange}` : ""}`,
      onRemove: () => onChange({ trafficCountry: "", trafficCountryMin: "", trafficCountryMax: "" }),
    });
  }

  filters.companyNewsKeywords.forEach((v) =>
    chips.push({ id: `news-kw-${v}`, label: `News: "${v}"`, onRemove: () => onChange({ companyNewsKeywords: filters.companyNewsKeywords.filter((x) => x !== v) }) })
  );

  filters.companyNewsCategories.forEach((v) =>
    chips.push({ id: `news-cat-${v}`, label: labelOf(COMPANY_NEWS_CATEGORIES, v), onRemove: () => onChange({ companyNewsCategories: filters.companyNewsCategories.filter((x) => x !== v) }) })
  );

  if (filters.companyNewsTimeframe) {
    const tf = COMPANY_NEWS_TIMEFRAMES.find((o) => o.value === filters.companyNewsTimeframe);
    chips.push({ id: "news-tf", label: `News: ${tf?.label ?? filters.companyNewsTimeframe}`, onRemove: () => onChange({ companyNewsTimeframe: "" }) });
  }

  const empRange = rangeLabel(filters.employeeCountMin, filters.employeeCountMax);
  if (empRange)
    chips.push({ id: "emp", label: `Employees: ${empRange}`, onRemove: () => onChange({ employeeCountMin: "", employeeCountMax: "" }) });

  filters.industries.forEach((v) =>
    chips.push({ id: `ind-${v}`, label: capitalize(v), onRemove: () => onChange({ industries: filters.industries.filter((x) => x !== v) }) })
  );

  filters.technologies.forEach((v) =>
    chips.push({ id: `tech-${v}`, label: v, onRemove: () => onChange({ technologies: filters.technologies.filter((x) => x !== v) }) })
  );

  filters.revenueBuckets.forEach((v) =>
    chips.push({ id: `rev-${v}`, label: labelOf(REVENUE_OPTIONS, v), onRemove: () => onChange({ revenueBuckets: filters.revenueBuckets.filter((x) => x !== v) }) })
  );

  if (filters.fundingMode === "predefined" && filters.fundingPresets.length)
    chips.push({ id: "funding", label: `Funding: ${presetLabels(filters.fundingPresets, FUNDING_PRESETS)}`, onRemove: () => onChange({ fundingPresets: [] }) });
  else if (filters.fundingMode === "custom") {
    const fundRange = rangeLabel(filters.fundingMin, filters.fundingMax, fmtUsd);
    if (fundRange) chips.push({ id: "funding", label: `Funding: ${fundRange}`, onRemove: () => onChange({ fundingMin: "", fundingMax: "" }) });
  }

  filters.fundingStages.forEach((v) =>
    chips.push({ id: `stage-${v}`, label: labelOf(FUNDING_STAGE_OPTIONS, v), onRemove: () => onChange({ fundingStages: filters.fundingStages.filter((x) => x !== v) }) })
  );

  if (filters.headcountGrowthMode === "predefined" && filters.headcountGrowthPresets.length)
    chips.push({ id: "growth", label: `Growth: ${presetLabels(filters.headcountGrowthPresets, GROWTH_PRESETS)}`, onRemove: () => onChange({ headcountGrowthPresets: [] }) });
  else if (filters.headcountGrowthMode === "custom") {
    const growthRange = rangeLabel(filters.headcountGrowthMin, filters.headcountGrowthMax, (n) => `${n}%`);
    if (growthRange) chips.push({ id: "growth", label: `Growth: ${growthRange}`, onRemove: () => onChange({ headcountGrowthMin: "", headcountGrowthMax: "" }) });
  }

  if (filters.foundedMode === "predefined" && filters.foundedPresets.length)
    chips.push({ id: "founded", label: `Founded: ${presetLabels(filters.foundedPresets, FOUNDED_YEAR_PRESETS)}`, onRemove: () => onChange({ foundedPresets: [] }) });
  else if (filters.foundedMode === "custom") {
    const foundRange = rangeLabel(filters.foundedMin, filters.foundedMax);
    if (foundRange) chips.push({ id: "founded", label: `Founded: ${foundRange}`, onRemove: () => onChange({ foundedMin: "", foundedMax: "" }) });
  }

  return chips;
}
