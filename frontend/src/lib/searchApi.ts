import { apiClient } from "@/lib/api";
import type { CompanyFilters, PersonFilters, SearchResponse } from "@/types/search";

export interface PersonRevealData {
  work_email?: string;
  recommended_personal_email?: string;
  mobile_phone?: string;
  phone_numbers?: string[];
}

export async function revealPerson(pdlId: string): Promise<PersonRevealData> {
  const { data } = await apiClient.post<PersonRevealData>("/search/reveal/person", { pdl_id: pdlId });
  return data;
}

export interface AutocompleteSuggestion {
  name: string;
  count: number;
  meta?: Record<string, unknown>;
}

export async function fetchAutocomplete(
  field: string,
  text: string,
  size = 10
): Promise<AutocompleteSuggestion[]> {
  if (!text.trim()) return [];
  const { data } = await apiClient.get<AutocompleteSuggestion[]>("/search/autocomplete", {
    params: { field, text, size },
  });
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

export async function searchPersons(
  filters: PersonFilters,
  scrollToken?: string
): Promise<SearchResponse> {
  const body = {
    name: cleanStr(filters.name),
    linkedin_url: cleanStr(filters.linkedinUrl),
    headline: cleanStr(filters.headline),
    summary: cleanStr(filters.summary),
    twitter_handle: cleanStr(filters.twitterHandle),
    github_url: cleanStr(filters.githubUrl),
    languages: filters.languages.length ? filters.languages : undefined,
    skills: filters.skills.length ? filters.skills : undefined,
    interests: filters.interests.length ? filters.interests : undefined,
    certifications: cleanStr(filters.certifications),
    degree: filters.degree.length ? filters.degree : undefined,
    school: cleanStr(filters.school),
    field_of_study: cleanStr(filters.fieldOfStudy),
    linkedin_connections_min: cleanNum(filters.linkedinConnectionsMin),
    job_title: filters.jobTitle.length ? filters.jobTitle : undefined,
    seniority: filters.seniority.length ? filters.seniority : undefined,
    department: filters.department.length ? filters.department : undefined,
    years_experience_min: cleanNum(filters.yearsExperienceMin),
    years_experience_max: cleanNum(filters.yearsExperienceMax),
    company_name: filters.companyName.length ? filters.companyName : undefined,
    company_linkedin_url: cleanStr(filters.companyLinkedinUrl),
    company_domain: cleanStr(filters.companyDomain),
    industry: filters.industry.length ? filters.industry : undefined,
    company_size: filters.companySize.length ? filters.companySize : undefined,
    company_type: filters.companyType.length ? filters.companyType : undefined,
    company_revenue: filters.companyRevenue.length ? filters.companyRevenue : undefined,
    past_companies: filters.pastCompanies.length ? filters.pastCompanies : undefined,
    past_titles: filters.pastTitles.length ? filters.pastTitles : undefined,
    past_seniority: filters.pastSeniority.length ? filters.pastSeniority : undefined,
    past_department: filters.pastDepartment.length ? filters.pastDepartment : undefined,
    country: filters.country.length ? filters.country : undefined,
    state: filters.state.length ? filters.state : undefined,
    city: cleanStr(filters.city),
    hq_country: filters.hqCountry.length ? filters.hqCountry : undefined,
    hq_state: filters.hqState.length ? filters.hqState : undefined,
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
    industry: filters.industry.length ? filters.industry : undefined,
    type: filters.type.length ? filters.type : undefined,
    stock_exchange: cleanStr(filters.stockExchange),
    hq_country: filters.hqCountry.length ? filters.hqCountry : undefined,
    hq_state: filters.hqState.length ? filters.hqState : undefined,
    hq_city: cleanStr(filters.hqCity),
    hq_metro: cleanStr(filters.hqMetro),
    employee_count_ranges: filters.employeeCountRanges.length ? filters.employeeCountRanges : undefined,
    employee_count_min: cleanNum(filters.employeeCountMin),
    employee_count_max: cleanNum(filters.employeeCountMax),
    annual_revenue: filters.annualRevenue.length ? filters.annualRevenue : undefined,
    employee_growth_min: cleanFloat(filters.employeeGrowthMin),
    year_founded_min: cleanNum(filters.yearFoundedMin),
    year_founded_max: cleanNum(filters.yearFoundedMax),
    last_funding_round: filters.lastFundingRound.length ? filters.lastFundingRound : undefined,
    total_funding_min: cleanFloat(filters.totalFundingMin),
    most_recent_funding_after: cleanStr(filters.mostRecentFundingAfter),
    role_composition_rules: filters.roleCompositionRules
      .filter((r) => r.role && (r.minCount || r.minGrowth))
      .map((r) => ({
        role: r.role,
        min_count: r.minCount ? parseInt(r.minCount, 10) : undefined,
        min_growth: r.minGrowth ? parseFloat(r.minGrowth) / 100 : undefined,
      })),
    scroll_token: scrollToken,
  };

  const { data } = await apiClient.post<SearchResponse>("/search/companies", body);
  return data;
}
