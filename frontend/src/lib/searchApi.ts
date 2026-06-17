import { apiClient } from "@/lib/api";
import type { CompanyFilters, PersonFilters, SearchResponse } from "@/types/search";

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
function cleanList(v: string): string[] | undefined {
  const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

export async function searchPersons(
  filters: PersonFilters,
  scrollToken?: string
): Promise<SearchResponse> {
  const body = {
    first_name: cleanStr(filters.firstName),
    last_name: cleanStr(filters.lastName),
    linkedin_url: cleanStr(filters.linkedinUrl),
    headline: cleanStr(filters.headline),
    summary: cleanStr(filters.summary),
    twitter_handle: cleanStr(filters.twitterHandle),
    languages: cleanList(filters.languages),
    skills: cleanList(filters.skills),
    certifications: cleanStr(filters.certifications),
    degree: cleanStr(filters.degree),
    school: cleanStr(filters.school),
    field_of_study: cleanStr(filters.fieldOfStudy),
    linkedin_connections_min: cleanNum(filters.linkedinConnectionsMin),
    job_title: cleanStr(filters.jobTitle),
    seniority: filters.seniority.length ? filters.seniority : undefined,
    function: cleanStr(filters.function),
    years_experience_min: cleanNum(filters.yearsExperienceMin),
    years_experience_max: cleanNum(filters.yearsExperienceMax),
    company_name: cleanStr(filters.companyName),
    company_linkedin_url: cleanStr(filters.companyLinkedinUrl),
    company_domain: cleanStr(filters.companyDomain),
    industry: cleanStr(filters.industry),
    company_size: cleanStr(filters.companySize),
    past_companies: cleanStr(filters.pastCompanies),
    past_titles: cleanStr(filters.pastTitles),
    past_seniority: filters.pastSeniority.length ? filters.pastSeniority : undefined,
    past_function: cleanStr(filters.pastFunction),
    country: cleanStr(filters.country),
    state: cleanStr(filters.state),
    city: cleanStr(filters.city),
    hq_country: cleanStr(filters.hqCountry),
    hq_state: cleanStr(filters.hqState),
    hq_city: cleanStr(filters.hqCity),
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
    company_name: cleanStr(filters.companyName),
    website_domain: cleanStr(filters.websiteDomain),
    industry: cleanStr(filters.industry),
    type: cleanStr(filters.type),
    stock_exchange: cleanStr(filters.stockExchange),
    hq_country: cleanStr(filters.hqCountry),
    hq_state: cleanStr(filters.hqState),
    hq_city: cleanStr(filters.hqCity),
    employee_count_min: cleanNum(filters.employeeCountMin),
    employee_count_max: cleanNum(filters.employeeCountMax),
    annual_revenue: cleanStr(filters.annualRevenue),
    employee_growth_min: cleanFloat(filters.employeeGrowthMin),
    year_founded_min: cleanNum(filters.yearFoundedMin),
    year_founded_max: cleanNum(filters.yearFoundedMax),
    last_funding_round: cleanStr(filters.lastFundingRound),
    total_funding_min: cleanFloat(filters.totalFundingMin),
    most_recent_funding_after: cleanStr(filters.mostRecentFundingAfter),
    role_composition_role: cleanStr(filters.roleCompositionRole),
    role_composition_min: cleanNum(filters.roleCompositionMin),
    scroll_token: scrollToken,
  };

  const { data } = await apiClient.post<SearchResponse>("/search/companies", body);
  return data;
}
