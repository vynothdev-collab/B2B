import { apiClient } from "@/lib/api";
import type { CompanyFilters, PersonFilters, SearchResponse } from "@/types/search";

export interface PersonRevealData {
  work_email?: string;
  recommended_personal_email?: string;
  mobile_phone?: string;
  phone_numbers?: string[];
}

export async function revealPerson(recordId: string): Promise<PersonRevealData> {
  const { data } = await apiClient.post<PersonRevealData>("/search/reveal/person", { record_id: recordId });
  return data;
}

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
function listOrUndef<T>(arr: T[]): T[] | undefined {
  return arr.length ? arr : undefined;
}

export async function searchPersons(
  filters: PersonFilters,
  scrollToken?: string
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

    company_type: listOrUndef(filters.companyType),
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

    scroll_token: scrollToken,
  };

  const { data } = await apiClient.post<SearchResponse>("/search/companies", body);
  return data;
}
