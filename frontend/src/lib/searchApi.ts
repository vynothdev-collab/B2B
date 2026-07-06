import { apiClient } from "@/lib/api";
import type { CompanyFilters, PersonFilters, SearchResponse } from "@/types/search";
import { EMPLOYEE_HEADCOUNT_RANGES } from "@/types/search";

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

function computeEmployeeCountMin(filters: PersonFilters): number | undefined {
  if (filters.employeeHeadcountMode === "custom") {
    return cleanNum(filters.employeeCountMin);
  }
  if (!filters.employeeHeadcountRanges.length) return undefined;
  const selected = EMPLOYEE_HEADCOUNT_RANGES.filter(r => filters.employeeHeadcountRanges.includes(r.value));
  if (!selected.length) return undefined;
  return Math.min(...selected.map(r => r.min));
}

function computeEmployeeCountMax(filters: PersonFilters): number | undefined {
  if (filters.employeeHeadcountMode === "custom") {
    return cleanNum(filters.employeeCountMax);
  }
  if (!filters.employeeHeadcountRanges.length) return undefined;
  const selected = EMPLOYEE_HEADCOUNT_RANGES.filter(r => filters.employeeHeadcountRanges.includes(r.value));
  if (!selected.length) return undefined;
  if (selected.some(r => r.max === null)) return undefined; // 10000+ = no upper bound
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
    departments: listOrUndef(filters.departments),
    seniority: listOrUndef(filters.seniority),
    companies: listOrUndef(filters.companies),

    person_locations: listOrUndef(filters.personLocations),
    hq_locations: listOrUndef(filters.companyHQLocations),

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

    funding_min: cleanFloat(filters.fundingMin),
    funding_max: cleanFloat(filters.fundingMax),
    headcount_growth_min: cleanFloat(filters.headcountGrowthMin),
    headcount_growth_max: cleanFloat(filters.headcountGrowthMax),

    headcount_by_department: cleanStr(filters.headcountByDepartment),
    headcount_by_department_min: cleanNum(filters.headcountByDepartmentMin),
    headcount_by_department_max: cleanNum(filters.headcountByDepartmentMax),

    headcount_by_location_country: cleanStr(filters.headcountByLocationCountry),
    headcount_by_location_min: cleanNum(filters.headcountByLocationMin),
    headcount_by_location_max: cleanNum(filters.headcountByLocationMax),

    founded_min: cleanNum(filters.foundedMin),
    founded_max: cleanNum(filters.foundedMax),

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
    locations: listOrUndef(filters.locations),

    type: listOrUndef(filters.type),

    employee_count_min: cleanNum(filters.employeeCountMin),
    employee_count_max: cleanNum(filters.employeeCountMax),

    industries: listOrUndef(filters.industries),
    technologies: listOrUndef(filters.technologies),
    revenue_buckets: listOrUndef(filters.revenueBuckets),

    funding_min: cleanFloat(filters.fundingMin),
    funding_max: cleanFloat(filters.fundingMax),
    funding_stages: listOrUndef(filters.fundingStages),

    headcount_growth_timeframe: filters.headcountGrowthTimeframe,
    headcount_growth_min: cleanFloat(filters.headcountGrowthMin),
    headcount_growth_max: cleanFloat(filters.headcountGrowthMax),

    headcount_by_location_country: cleanStr(filters.headcountByLocationCountry),
    headcount_by_location_min: cleanNum(filters.headcountByLocationMin),
    headcount_by_location_max: cleanNum(filters.headcountByLocationMax),

    headcount_by_department: cleanStr(filters.headcountByDepartment),
    headcount_by_department_min: cleanNum(filters.headcountByDepartmentMin),
    headcount_by_department_max: cleanNum(filters.headcountByDepartmentMax),

    founded_min: cleanNum(filters.foundedMin),
    founded_max: cleanNum(filters.foundedMax),

    company_status: listOrUndef(filters.companyStatus),
    company_how_they_sell: listOrUndef(filters.companyHowTheySell),
    company_more_flags: listOrUndef(filters.companyMoreFlags),
    company_revenue_model: listOrUndef(filters.companyRevenueModel),

    job_posting_keywords: listOrUndef(filters.jobPostingKeywords),
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
  limit = 20,
): Promise<SearchResponse> {
  const { data } = await apiClient.post<SearchResponse>("/search/agentic", {
    prompt,
    entity,
    limit,
  });
  return data;
}
