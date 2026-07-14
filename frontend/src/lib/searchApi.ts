import { apiClient } from "@/lib/api";
import type { CompanyFilters, PersonFilters, SearchResponse } from "@/types/search";
import { EMPLOYEE_HEADCOUNT_RANGES, FUNDING_PRESETS, GROWTH_PRESETS, HEADCOUNT_RANGE_OPTIONS, FOUNDED_YEAR_PRESETS } from "@/types/search";

function cleanStr(v: string): string | undefined {
  return v.trim() || undefined;
}
function cleanNum(v: string): number | undefined {
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}
function cleanFloat(v: string): number | undefined {
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}
function toTotalMonths(years: string, months: string): number | undefined {
  const y = parseInt(years, 10);
  const m = parseInt(months, 10);
  const total = (isNaN(y) ? 0 : y * 12) + (isNaN(m) ? 0 : m);
  return total > 0 ? total : undefined;
}

function listOrUndef<T>(arr: T[]): T[] | undefined {
  return arr.length ? arr : undefined;
}

interface HeadcountFilters {
  employeeHeadcountMode: "predefined" | "custom";
  employeeHeadcountRanges: string[];
  employeeCountMin: string;
  employeeCountMax: string;
}

interface FundingFilters {
  fundingMode: "predefined" | "custom";
  fundingPresets: string[];
  fundingMin: string;
  fundingMax: string;
}

function computeFundingMin(f: FundingFilters): number | undefined {
  if (f.fundingMode === "custom") return cleanFloat(f.fundingMin);
  if (!f.fundingPresets.length) return undefined;
  const selected = FUNDING_PRESETS.filter(p => f.fundingPresets.includes(p.value));
  if (!selected.length) return undefined;
  const mins = selected.map(p => p.min ?? 0);
  return Math.min(...mins);
}

function computeFundingMax(f: FundingFilters): number | undefined {
  if (f.fundingMode === "custom") return cleanFloat(f.fundingMax);
  if (!f.fundingPresets.length) return undefined;
  const selected = FUNDING_PRESETS.filter(p => f.fundingPresets.includes(p.value));
  if (!selected.length) return undefined;
  if (selected.some(p => p.max === undefined)) return undefined;
  return Math.max(...selected.map(p => p.max as number));
}

type PresetOption = { value: string; min?: number; max?: number };

function presetMin(selectedValues: string[], options: PresetOption[]): number | undefined {
  if (!selectedValues.length) return undefined;
  const sel = options.filter(o => selectedValues.includes(o.value));
  if (!sel.length) return undefined;
  return Math.min(...sel.map(o => o.min ?? 0));
}

function presetMax(selectedValues: string[], options: PresetOption[]): number | undefined {
  if (!selectedValues.length) return undefined;
  const sel = options.filter(o => selectedValues.includes(o.value));
  if (!sel.length) return undefined;
  if (sel.some(o => o.max === undefined)) return undefined;
  return Math.max(...sel.map(o => o.max as number));
}

function computeEmployeeCountMin(filters: HeadcountFilters): number | undefined {
  if (filters.employeeHeadcountMode === "custom") {
    return cleanNum(filters.employeeCountMin);
  }
  if (!filters.employeeHeadcountRanges.length) return undefined;
  const selected = EMPLOYEE_HEADCOUNT_RANGES.filter(r => filters.employeeHeadcountRanges.includes(r.value));
  if (!selected.length) return undefined;
  return Math.min(...selected.map(r => r.min));
}

function computeEmployeeCountMax(filters: HeadcountFilters): number | undefined {
  if (filters.employeeHeadcountMode === "custom") {
    return cleanNum(filters.employeeCountMax);
  }
  if (!filters.employeeHeadcountRanges.length) return undefined;
  const selected = EMPLOYEE_HEADCOUNT_RANGES.filter(r => filters.employeeHeadcountRanges.includes(r.value));
  if (!selected.length) return undefined;
  if (selected.some(r => r.max === null)) return undefined;
  return Math.max(...selected.map(r => r.max as number));
}

export interface PersonExclusions {
  excludePersonIds?: string[];
  excludeCompanyIds?: string[];
}

export async function searchPersons(
  filters: PersonFilters,
  scrollToken?: string,
  exclusions?: PersonExclusions,
): Promise<SearchResponse> {
  const body = {
    name: cleanStr(filters.name),
    job_title: listOrUndef(filters.jobTitle),
    job_title_match_type: filters.jobTitleMatchType,
    departments: listOrUndef(filters.departments),
    seniority: listOrUndef(filters.seniority),
    companies: listOrUndef(filters.companies),

    person_location_countries: listOrUndef(filters.personLocationCountries),
    person_location_states: listOrUndef(filters.personLocationStates),
    person_location_cities: listOrUndef(filters.personLocationCities),
    hq_countries: listOrUndef(filters.companyHQCountries),
    hq_states: listOrUndef(filters.companyHQStates),
    hq_cities: listOrUndef(filters.companyHQCities),

    require_work_email: filters.requireWorkEmail || undefined,

    company_status: listOrUndef(filters.companyStatus),
    company_type: listOrUndef(filters.companyType),
    industries: listOrUndef(filters.industries),
    company_how_they_sell: listOrUndef(filters.companyHowTheySell),
    company_more_flags: listOrUndef(filters.companyMoreFlags),
    company_revenue_model: listOrUndef(filters.companyRevenueModel),
    employee_count_min: computeEmployeeCountMin(filters),
    employee_count_max: computeEmployeeCountMax(filters),
    company_news_keywords: listOrUndef(filters.companyNewsKeywords),
    company_news_categories: listOrUndef(filters.companyNewsCategories),
    company_news_timeframe: filters.companyNewsTimeframe || undefined,
    technologies: listOrUndef(filters.technologies),
    revenue_buckets: listOrUndef(filters.revenueBuckets),
    revenue_min: filters.revenueMode === "custom" ? cleanFloat(filters.revenueMin) : undefined,
    revenue_max: filters.revenueMode === "custom" ? cleanFloat(filters.revenueMax) : undefined,

    funding_min: computeFundingMin(filters),
    funding_max: computeFundingMax(filters),
    headcount_growth_min: filters.headcountGrowthMode === "custom" ? cleanFloat(filters.headcountGrowthMin) : presetMin(filters.headcountGrowthPresets, GROWTH_PRESETS),
    headcount_growth_max: filters.headcountGrowthMode === "custom" ? cleanFloat(filters.headcountGrowthMax) : presetMax(filters.headcountGrowthPresets, GROWTH_PRESETS),

    headcount_by_department: cleanStr(filters.headcountByDepartment),
    headcount_by_department_min: filters.headcountByDepartmentMode === "custom" ? cleanNum(filters.headcountByDepartmentMin) : presetMin(filters.headcountByDepartmentPresets, HEADCOUNT_RANGE_OPTIONS),
    headcount_by_department_max: filters.headcountByDepartmentMode === "custom" ? cleanNum(filters.headcountByDepartmentMax) : presetMax(filters.headcountByDepartmentPresets, HEADCOUNT_RANGE_OPTIONS),

    headcount_by_location_country: cleanStr(filters.headcountByLocationCountry),
    headcount_by_location_min: filters.headcountByLocationMode === "custom" ? cleanNum(filters.headcountByLocationMin) : presetMin(filters.headcountByLocationPresets, HEADCOUNT_RANGE_OPTIONS),
    headcount_by_location_max: filters.headcountByLocationMode === "custom" ? cleanNum(filters.headcountByLocationMax) : presetMax(filters.headcountByLocationPresets, HEADCOUNT_RANGE_OPTIONS),

    founded_min: filters.foundedMode === "custom" ? cleanNum(filters.foundedMin) : presetMin(filters.foundedPresets, FOUNDED_YEAR_PRESETS),
    founded_max: filters.foundedMode === "custom" ? cleanNum(filters.foundedMax) : presetMax(filters.foundedPresets, FOUNDED_YEAR_PRESETS),

    website_visits_min: cleanNum(filters.websiteVisitsMin),
    website_visits_max: cleanNum(filters.websiteVisitsMax),
    visit_change_timeframe: filters.visitChangeTimeframe,
    visit_change_min: cleanFloat(filters.visitChangeMin),
    visit_change_max: cleanFloat(filters.visitChangeMax),
    traffic_country: cleanStr(filters.trafficCountry),
    traffic_country_min: cleanFloat(filters.trafficCountryMin),
    traffic_country_max: cleanFloat(filters.trafficCountryMax),

    email_providers: listOrUndef(filters.emailProviders),

    time_in_role_min_months: toTotalMonths(filters.timeInRoleMinYears, filters.timeInRoleMinMonths),
    time_in_role_max_months: toTotalMonths(filters.timeInRoleMaxYears, filters.timeInRoleMaxMonths),
    time_in_company_min_months: toTotalMonths(filters.timeInCompanyMinYears, filters.timeInCompanyMinMonths),
    time_in_company_max_months: toTotalMonths(filters.timeInCompanyMaxYears, filters.timeInCompanyMaxMonths),
    experience_years_min: cleanFloat(filters.experienceYearsMin),
    experience_years_max: cleanFloat(filters.experienceYearsMax),
    // job change = started current role within last N months → overrides time_in_role_max if set
    ...(filters.jobChangeTimeframe
      ? { time_in_role_max_months: cleanNum(filters.jobChangeTimeframe) }
      : {}),
    job_posting_keywords: listOrUndef(filters.jobPostingKeywords),

    keywords_include: listOrUndef(filters.keywordsInclude),
    keywords_match_mode: filters.keywordsMatchMode,
    keywords_scope: listOrUndef(filters.keywordsScope),
    keywords_exclude: listOrUndef(filters.keywordsExclude),

    exclude_person_ids: listOrUndef(exclusions?.excludePersonIds ?? []),
    exclude_company_ids: listOrUndef(exclusions?.excludeCompanyIds ?? []),
    exclude_company_names: listOrUndef(filters.exclusionCompanyNames),

    awards: listOrUndef(filters.awards),
    certifications: listOrUndef(filters.certifications),
    other_compliance: listOrUndef(filters.otherCompliance),

    scroll_token: scrollToken,
  };

  const { data } = await apiClient.post<SearchResponse>("/search/persons", body);
  return data;
}

export async function searchCompanies(
  filters: CompanyFilters,
  scrollToken?: string
): Promise<SearchResponse> {
  const body = {
    companies: listOrUndef(filters.companies),
    location_countries: listOrUndef(filters.locationCountries),
    location_states: listOrUndef(filters.locationStates),
    location_cities: listOrUndef(filters.locationCities),

    type: listOrUndef(filters.type),

    employee_count_min: computeEmployeeCountMin(filters),
    employee_count_max: computeEmployeeCountMax(filters),

    industries: listOrUndef(filters.industries),
    technologies: listOrUndef(filters.technologies),
    revenue_buckets: listOrUndef(filters.revenueBuckets),
    revenue_min: filters.revenueMode === "custom" ? cleanFloat(filters.revenueMin) : undefined,
    revenue_max: filters.revenueMode === "custom" ? cleanFloat(filters.revenueMax) : undefined,

    funding_min: computeFundingMin(filters),
    funding_max: computeFundingMax(filters),
    funding_stages: listOrUndef(filters.fundingStages),

    headcount_growth_timeframe: filters.headcountGrowthTimeframe,
    headcount_growth_min: filters.headcountGrowthMode === "custom" ? cleanFloat(filters.headcountGrowthMin) : presetMin(filters.headcountGrowthPresets, GROWTH_PRESETS),
    headcount_growth_max: filters.headcountGrowthMode === "custom" ? cleanFloat(filters.headcountGrowthMax) : presetMax(filters.headcountGrowthPresets, GROWTH_PRESETS),

    headcount_by_location_country: cleanStr(filters.headcountByLocationCountry),
    headcount_by_location_min: filters.headcountByLocationMode === "custom" ? cleanNum(filters.headcountByLocationMin) : presetMin(filters.headcountByLocationPresets, HEADCOUNT_RANGE_OPTIONS),
    headcount_by_location_max: filters.headcountByLocationMode === "custom" ? cleanNum(filters.headcountByLocationMax) : presetMax(filters.headcountByLocationPresets, HEADCOUNT_RANGE_OPTIONS),

    headcount_by_department: cleanStr(filters.headcountByDepartment),
    headcount_by_department_min: filters.headcountByDepartmentMode === "custom" ? cleanNum(filters.headcountByDepartmentMin) : presetMin(filters.headcountByDepartmentPresets, HEADCOUNT_RANGE_OPTIONS),
    headcount_by_department_max: filters.headcountByDepartmentMode === "custom" ? cleanNum(filters.headcountByDepartmentMax) : presetMax(filters.headcountByDepartmentPresets, HEADCOUNT_RANGE_OPTIONS),

    founded_min: filters.foundedMode === "custom" ? cleanNum(filters.foundedMin) : presetMin(filters.foundedPresets, FOUNDED_YEAR_PRESETS),
    founded_max: filters.foundedMode === "custom" ? cleanNum(filters.foundedMax) : presetMax(filters.foundedPresets, FOUNDED_YEAR_PRESETS),

    company_status: listOrUndef(filters.companyStatus),
    company_how_they_sell: listOrUndef(filters.companyHowTheySell),
    company_more_flags: listOrUndef(filters.companyMoreFlags),
    company_revenue_model: listOrUndef(filters.companyRevenueModel),

    job_posting_keywords: listOrUndef(filters.jobPostingKeywords),

    keywords_include: listOrUndef(filters.keywordsInclude),
    keywords_match_mode: filters.keywordsMatchMode,
    keywords_scope: listOrUndef(filters.keywordsScope),
    keywords_exclude: listOrUndef(filters.keywordsExclude),

    email_providers: listOrUndef(filters.emailProviders),
    awards: listOrUndef(filters.awards),
    certifications: listOrUndef(filters.certifications),
    other_compliance: listOrUndef(filters.otherCompliance),

    website_visits_min: cleanNum(filters.websiteVisitsMin),
    website_visits_max: cleanNum(filters.websiteVisitsMax),
    visit_change_timeframe: filters.visitChangeTimeframe || undefined,
    visit_change_min: cleanFloat(filters.visitChangeMin),
    visit_change_max: cleanFloat(filters.visitChangeMax),
    traffic_country: cleanStr(filters.trafficCountry),
    traffic_country_min: cleanFloat(filters.trafficCountryMin),
    traffic_country_max: cleanFloat(filters.trafficCountryMax),

    company_news_keywords: listOrUndef(filters.companyNewsKeywords),
    company_news_categories: listOrUndef(filters.companyNewsCategories),
    company_news_timeframe: filters.companyNewsTimeframe || undefined,

    scroll_token: scrollToken,
  };

  const { data } = await apiClient.post<SearchResponse>("/search/companies", body);
  return data;
}

export async function agenticSearch(
  prompt: string,
  entity: "employee" | "company",
  scrollToken?: string,
): Promise<SearchResponse> {
  const { data } = await apiClient.post<SearchResponse>("/search/agentic", {
    prompt,
    entity,
    scroll_token: scrollToken,
  });
  return data;
}

export interface EmailRevealResult {
  record_id: string;
  email: string | null;
  has_email: boolean;
}

export async function revealPersonEmail(recordId: string): Promise<EmailRevealResult> {
  const { data } = await apiClient.get<EmailRevealResult>(
    `/search/persons/${encodeURIComponent(recordId)}/email`,
  );
  return data;
}
