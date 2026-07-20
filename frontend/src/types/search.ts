export type TabType = "people" | "company";


export interface PersonFilters {
  name: string[];
  jobTitle: string[];
  jobTitleMatchType: "contains" | "exact";
  departments: string[];
  seniority: string[];
  companies: string[];
  personLocationCountries: string[];
  personLocationStates: string[];
  personLocationCities: string[];
  companyHQCountries: string[];
  companyHQStates: string[];
  companyHQCities: string[];
  requireWorkEmail: boolean;
  companyStatus: string[];
  companyType: string[];
  companyHowTheySell: string[];
  companyMoreFlags: string[];
  companyRevenueModel: string[];
  employeeHeadcountMode: "predefined" | "custom";
  employeeHeadcountRanges: string[];
  employeeCountMin: string;
  employeeCountMax: string;
  companyNewsKeywords: string[];
  companyNewsCategories: string[];
  companyNewsTimeframe: string;
  technologies: string[];
  revenueMode: "predefined" | "custom";
  revenueBuckets: string[];
  revenueMin: string;
  revenueMax: string;
  fundingMode: "predefined" | "custom";
  fundingPresets: string[];
  fundingMin: string;
  fundingMax: string;
  headcountGrowthMode: "predefined" | "custom";
  headcountGrowthPresets: string[];
  headcountGrowthMin: string;
  headcountGrowthMax: string;
  headcountByDepartment: string;
  headcountByDepartmentMode: "predefined" | "custom";
  headcountByDepartmentPresets: string[];
  headcountByDepartmentMin: string;
  headcountByDepartmentMax: string;
  headcountByLocationCountry: string;
  headcountByLocationMode: "predefined" | "custom";
  headcountByLocationPresets: string[];
  headcountByLocationMin: string;
  headcountByLocationMax: string;
  foundedMode: "predefined" | "custom";
  foundedPresets: string[];
  websiteVisitsMin: string;
  websiteVisitsMax: string;
  visitChangeTimeframe: "monthly" | "quarterly" | "yearly";
  visitChangeMin: string;
  visitChangeMax: string;
  trafficCountry: string;
  trafficCountryMin: string;
  trafficCountryMax: string;
  emailProviders: string[];
  industries: string[];
  timeInRoleMinYears: string;
  timeInRoleMinMonths: string;
  timeInRoleMaxYears: string;
  timeInRoleMaxMonths: string;
  timeInCompanyMinYears: string;
  timeInCompanyMinMonths: string;
  timeInCompanyMaxYears: string;
  timeInCompanyMaxMonths: string;
  experienceYearsMin: string;
  experienceYearsMax: string;
  jobChangeTimeframe: string;
  jobPostingKeywords: string[];
  keywordsInclude: string[];
  keywordsMatchMode: "any" | "all";
  keywordsScope: string[];
  keywordsExclude: string[];
  hideAllSavedPeople: boolean;
  hideSavedPeopleListIds: string[];
  hideAllSavedCompanies: boolean;
  hideSavedCompanyListIds: string[];
  exclusionCompanyNames: string[];
  awards: string[];
  certifications: string[];
  otherCompliance: string[];
  foundedMin: string;
  foundedMax: string;
}

export const DEFAULT_PERSON_FILTERS: PersonFilters = {
  name: [],
  jobTitle: [],
  jobTitleMatchType: "contains",
  departments: [],
  seniority: [],
  companies: [],
  personLocationCountries: [],
  personLocationStates: [],
  personLocationCities: [],
  companyHQCountries: [],
  companyHQStates: [],
  companyHQCities: [],
  requireWorkEmail: false,
  companyStatus: [],
  companyType: [],
  companyHowTheySell: [],
  companyMoreFlags: [],
  companyRevenueModel: [],
  employeeHeadcountMode: "predefined",
  employeeHeadcountRanges: [],
  employeeCountMin: "",
  employeeCountMax: "",
  companyNewsKeywords: [],
  companyNewsCategories: [],
  companyNewsTimeframe: "",
  technologies: [],
  revenueMode: "predefined",
  revenueBuckets: [],
  revenueMin: "",
  revenueMax: "",
  fundingMode: "predefined",
  fundingPresets: [],
  fundingMin: "",
  fundingMax: "",
  headcountGrowthMode: "predefined",
  headcountGrowthPresets: [],
  headcountGrowthMin: "",
  headcountGrowthMax: "",
  headcountByDepartment: "",
  headcountByDepartmentMode: "predefined",
  headcountByDepartmentPresets: [],
  headcountByDepartmentMin: "",
  headcountByDepartmentMax: "",
  headcountByLocationCountry: "",
  headcountByLocationMode: "predefined",
  headcountByLocationPresets: [],
  headcountByLocationMin: "",
  headcountByLocationMax: "",
  foundedMode: "predefined",
  foundedPresets: [],
  websiteVisitsMin: "",
  websiteVisitsMax: "",
  visitChangeTimeframe: "monthly",
  visitChangeMin: "",
  visitChangeMax: "",
  trafficCountry: "",
  trafficCountryMin: "",
  trafficCountryMax: "",
  emailProviders: [],
  industries: [],
  timeInRoleMinYears: "",
  timeInRoleMinMonths: "",
  timeInRoleMaxYears: "",
  timeInRoleMaxMonths: "",
  timeInCompanyMinYears: "",
  timeInCompanyMinMonths: "",
  timeInCompanyMaxYears: "",
  timeInCompanyMaxMonths: "",
  experienceYearsMin: "",
  experienceYearsMax: "",
  jobChangeTimeframe: "",
  jobPostingKeywords: [],
  keywordsInclude: [],
  keywordsMatchMode: "any",
  keywordsScope: [],
  keywordsExclude: [],
  hideAllSavedPeople: false,
  hideSavedPeopleListIds: [],
  hideAllSavedCompanies: false,
  hideSavedCompanyListIds: [],
  exclusionCompanyNames: [],
  awards: [],
  certifications: [],
  otherCompliance: [],
  foundedMin: "",
  foundedMax: "",
};


export interface CompanyFilters {
  companies: string[];
  locationCountries: string[];
  locationStates: string[];
  locationCities: string[];
  type: string[];
  employeeHeadcountMode: "predefined" | "custom";
  employeeHeadcountRanges: string[];
  employeeCountMin: string;
  employeeCountMax: string;
  industries: string[];
  technologies: string[];
  revenueMode: "predefined" | "custom";
  revenueBuckets: string[];
  revenueMin: string;
  revenueMax: string;
  fundingMode: "predefined" | "custom";
  fundingPresets: string[];
  fundingMin: string;
  fundingMax: string;
  fundingStages: string[];
  headcountGrowthTimeframe: "3_month" | "6_month" | "12_month" | "24_month";
  headcountGrowthMode: "predefined" | "custom";
  headcountGrowthPresets: string[];
  headcountGrowthMin: string;
  headcountGrowthMax: string;
  headcountByLocationCountry: string;
  headcountByLocationMode: "predefined" | "custom";
  headcountByLocationPresets: string[];
  headcountByLocationMin: string;
  headcountByLocationMax: string;
  headcountByDepartment: string;
  headcountByDepartmentMode: "predefined" | "custom";
  headcountByDepartmentPresets: string[];
  headcountByDepartmentMin: string;
  headcountByDepartmentMax: string;
  foundedMode: "predefined" | "custom";
  foundedPresets: string[];
  foundedMin: string;
  foundedMax: string;
  companyStatus: string[];
  companyHowTheySell: string[];
  companyMoreFlags: string[];
  companyRevenueModel: string[];
  jobPostingKeywords: string[];
  keywordsInclude: string[];
  keywordsMatchMode: "any" | "all";
  keywordsScope: string[];
  keywordsExclude: string[];
  emailProviders: string[];
  awards: string[];
  certifications: string[];
  otherCompliance: string[];
  websiteVisitsMin: string;
  websiteVisitsMax: string;
  visitChangeTimeframe: "monthly" | "quarterly" | "yearly";
  visitChangeMin: string;
  visitChangeMax: string;
  trafficCountry: string;
  trafficCountryMin: string;
  trafficCountryMax: string;
  companyNewsKeywords: string[];
  companyNewsCategories: string[];
  companyNewsTimeframe: string;
}

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  companies: [],
  locationCountries: [],
  locationStates: [],
  locationCities: [],
  type: [],
  employeeHeadcountMode: "predefined",
  employeeHeadcountRanges: [],
  employeeCountMin: "",
  employeeCountMax: "",
  industries: [],
  technologies: [],
  revenueMode: "predefined",
  revenueBuckets: [],
  revenueMin: "",
  revenueMax: "",
  fundingMode: "predefined",
  fundingPresets: [],
  fundingMin: "",
  fundingMax: "",
  fundingStages: [],
  headcountGrowthTimeframe: "12_month",
  headcountGrowthMode: "predefined",
  headcountGrowthPresets: [],
  headcountGrowthMin: "",
  headcountGrowthMax: "",
  headcountByLocationCountry: "",
  headcountByLocationMode: "predefined",
  headcountByLocationPresets: [],
  headcountByLocationMin: "",
  headcountByLocationMax: "",
  headcountByDepartment: "",
  headcountByDepartmentMode: "predefined",
  headcountByDepartmentPresets: [],
  headcountByDepartmentMin: "",
  headcountByDepartmentMax: "",
  foundedMode: "predefined",
  foundedPresets: [],
  foundedMin: "",
  foundedMax: "",
  companyStatus: [],
  companyHowTheySell: [],
  companyMoreFlags: [],
  companyRevenueModel: [],
  jobPostingKeywords: [],
  keywordsInclude: [],
  keywordsMatchMode: "any",
  keywordsScope: [],
  keywordsExclude: [],
  emailProviders: [],
  awards: [],
  certifications: [],
  otherCompliance: [],
  websiteVisitsMin: "",
  websiteVisitsMax: "",
  visitChangeTimeframe: "monthly",
  visitChangeMin: "",
  visitChangeMax: "",
  trafficCountry: "",
  trafficCountryMin: "",
  trafficCountryMax: "",
  companyNewsKeywords: [],
  companyNewsCategories: [],
  companyNewsTimeframe: "",
};

export const GROWTH_TIMEFRAME_OPTIONS = [
  { value: "3_month", label: "3 months" },
  { value: "6_month", label: "6 months" },
  { value: "12_month", label: "12 months" },
  { value: "24_month", label: "24 months" },
];


// Raw Coresignal employee record — passed through unchanged from the backend.
// Only the fields the UI reads are typed; the record carries many more.
export interface PersonResult {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  picture_url?: string;
  headline?: string;
  inferred_skills?: string[];
  active_experience_start_date?: string;
  linkedin_url?: string;
  linkedin_canonical_shorthand_name?: string;
  connections_count?: number;
  followers_count?: number;
  total_experience_duration_months?: number;
  projected_base_salary_median?: number;
  projected_base_salary_currency?: string;
  mobile_phone?: string;
  awards_certifications?: string | string[];
  // Active experience / job fields
  active_experience_title?: string;
  active_experience_department?: string;
  active_experience_management_level?: string;
  active_experience_company_id?: string | number;
  active_experience_company_name?: string;
  active_experience_company_website?: string;
  active_experience_company_industry?: string;
  active_experience_company_linkedin_url?: string;
  active_experience_company_hq_country?: string;
  active_experience_company_hq_city?: string;
  active_experience_company_hq_region?: string;
  active_experience_company_hq_location?: string;
  active_experience_company_employees_count?: number;
  active_experience_company_size?: string;
  active_experience_company_type?: string;
  active_experience_company_status?: string;
  active_experience_company_founded?: number;
  active_experience_company_founded_year?: number;
  active_experience_company_categories_and_keywords?: string | string[];
  active_experience_company_annual_revenue?: string | number;
  // Person location
  location_country?: string;
  location_state?: string;
  location_city?: string;
  has_email?: boolean;
  [key: string]: unknown;
}

// Raw Coresignal company record.
export interface CompanyResult {
  id: string;
  company_name?: string;
  company_legal_name?: string;
  website?: string;
  industry?: string;
  employees_count?: number;
  size_range?: string;
  hq_country?: string;
  hq_region?: string | string[];
  hq_city?: string;
  hq_state?: string;
  hq_location?: string;
  canonical_linkedin_url?: string;
  type?: string;
  is_public?: boolean;
  company_status?: string;
  founded?: number;
  categories_and_keywords?: string | string[];
  awards_certifications?: string | string[];
  total_website_visits_monthly?: number;
  total_website_visits_change?: { change_yearly_percentage?: number; change_monthly_percentage?: number };
  employees_count_change?: { change_yearly_percentage?: number; change_quarterly_percentage?: number };
  company_employee_reviews_aggregate_score?: number;
  last_funding_round?: { type?: string; amount_raised?: number };
  revenue_annual_range?: Record<string, { annual_revenue_range_from?: number; annual_revenue_range_to?: number }>;
  active_job_postings?: unknown[];
  technologies_used?: Array<{ technology?: string } | string>;
  [key: string]: unknown;
}

export interface SearchMeta {
  total: number;
  total_pages?: number;
  scroll_token?: string;
}

export interface SearchResponse {
  data: PersonResult[] | CompanyResult[];
  meta: SearchMeta;
}


export const EMPLOYEE_HEADCOUNT_RANGES = [
  { value: "1-10",       label: "1-10",       min: 1,     max: 10,    count: "35M" },
  { value: "11-20",      label: "11-20",      min: 11,    max: 20,    count: "15M" },
  { value: "21-50",      label: "21-50",      min: 21,    max: 50,    count: "24M" },
  { value: "51-100",     label: "51-100",     min: 51,    max: 100,   count: "20M" },
  { value: "101-200",    label: "101-200",    min: 101,   max: 200,   count: "21M" },
  { value: "201-500",    label: "201-500",    min: 201,   max: 500,   count: "29M" },
  { value: "501-1000",   label: "501-1000",   min: 501,   max: 1000,  count: "22M" },
  { value: "1001-2000",  label: "1001-2000",  min: 1001,  max: 2000,  count: "22M" },
  { value: "2001-5000",  label: "2001-5000",  min: 2001,  max: 5000,  count: "28M" },
  { value: "5001-10000", label: "5001-10000", min: 5001,  max: 10000, count: "20M" },
  { value: "10000+",     label: "10000+",     min: 10001, max: null,  count: "64M" },
] as const;

export const SENIORITY_OPTIONS = [
  { value: "cxo", label: "C-Level" },
  { value: "director", label: "Director" },
  { value: "founder", label: "Founder" },
  { value: "head", label: "Head" },
  { value: "intern", label: "Intern" },
  { value: "manager", label: "Manager" },
  { value: "owner", label: "Owner" },
  { value: "partner", label: "Partner" },
  { value: "vp", label: "President/Vice President" },
  { value: "senior", label: "Senior" },
  { value: "specialist", label: "Specialist" },
];

export interface DepartmentOption {
  value: string;
  label: string;
  children?: DepartmentOption[];
}

export const DEPARTMENT_OPTIONS_HIERARCHICAL: DepartmentOption[] = [
  { value: "administrative", label: "Administrative" },
  { value: "consulting", label: "Consulting" },
  { value: "customer_service", label: "Customer Service" },
  { value: "design", label: "Design" },
  { value: "education", label: "Education" },
  { value: "engineering", label: "Engineering and Technical" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "general_management", label: "General Management" },
  { value: "human_resources", label: "Human Resources" },
  { value: "legal", label: "Legal" },
  { value: "marketing", label: "Marketing" },
  { value: "medical", label: "Medical" },
  { value: "operations", label: "Operations" },
  { value: "product", label: "Product" },
  { value: "project_management", label: "Project Management" },
  { value: "real_estate", label: "Real Estate" },
  { value: "research", label: "Research" },
  { value: "sales", label: "Sales" },
  { value: "trades", label: "Trades" },
  { value: "other", label: "Other" },
];

function flattenDepts(opts: DepartmentOption[]): { value: string; label: string }[] {
  return opts.flatMap((o) => [{ value: o.value, label: o.label }, ...(o.children ? flattenDepts(o.children) : [])]);
}

export const DEPARTMENT_OPTIONS = flattenDepts(DEPARTMENT_OPTIONS_HIERARCHICAL);

export const COMPANY_STATUS_OPTIONS = [
  { value: "Self-Employed", label: "Self-Employed" },
  { value: "Privately Held", label: "Privately Held" },
  { value: "Self-Owned", label: "Self-Owned"},
  { value: "Nonprofit", label: "Non-Profit"},
  { value: "Public Company", label: "Public Company"},
  { value: "Partnership", label: "Partnership"},
  { value: "Government Agency", label: "Government Agency"},
  { value: "Educational", label: "Educational"},
];


export const COMPANY_HOW_THEY_SELL_OPTIONS = [
  { value: "b2b", label: "B2B", count: "58M" },
  { value: "b2c", label: "B2C", count: "25M" },
  { value: "b2b2c", label: "B2B2C", count: "1M" },
  { value: "d2c", label: "D2C", count: "20K" },
  { value: "franchise", label: "Franchise", count: "257K" },
  { value: "government", label: "Government", count: "7M" },
];

export const COMPANY_MORE_FLAGS_OPTIONS = [
  { value: "is_retail", label: "Is retail", count: "12M" },
  { value: "is_marketplace", label: "Is marketplace", count: "1M" },
  { value: "is_mainly_ai", label: "Is mainly AI", count: "1M" },
  { value: "is_mainly_crypto", label: "Is mainly crypto", count: "160K" },
  { value: "multi_product", label: "Multi-product", count: "48M" },
];

export const COMPANY_REVENUE_MODEL_OPTIONS = [
  { value: "free_tier", label: "Has free tier / trial", count: "825K" },
  { value: "self_serve", label: "Self-serve", count: "4M" },
  { value: "sales_led", label: "Sales-led", count: "66M" },
  { value: "usage_based", label: "Usage-based pricing", count: "885K" },
  { value: "subscription", label: "Subscription", count: "2M" },
  { value: "enterprise_plan", label: "Enterprise plan", count: "355K" },
  { value: "public_pricing", label: "Public pricing page", count: "10M" },
];

export const REVENUE_OPTIONS = [
  { value: "$0-$1M", label: "$0 – $1M" },
  { value: "$1M-$10M", label: "$1M – $10M" },
  { value: "$10M-$25M", label: "$10M – $25M" },
  { value: "$25M-$50M", label: "$25M – $50M" },
  { value: "$50M-$100M", label: "$50M – $100M" },
  { value: "$100M-$250M", label: "$100M – $250M" },
  { value: "$250M-$500M", label: "$250M – $500M" },
  { value: "$500M-$1B", label: "$500M – $1B" },
  { value: "$1B-$10B", label: "$1B – $10B" },
  { value: "$10B+", label: "$10B+" },
];


export const HEADCOUNT_RANGE_OPTIONS = [
  { value: "1_10",       label: "1 – 10",         min: 1,     max: 10 },
  { value: "11_50",      label: "11 – 50",         min: 11,    max: 50 },
  { value: "51_200",     label: "51 – 200",        min: 51,    max: 200 },
  { value: "201_500",    label: "201 – 500",       min: 201,   max: 500 },
  { value: "501_1000",   label: "501 – 1,000",     min: 501,   max: 1000 },
  { value: "1001_5000",  label: "1,001 – 5,000",   min: 1001,  max: 5000 },
  { value: "5001_10000", label: "5,001 – 10,000",  min: 5001,  max: 10000 },
  { value: "10001_plus", label: "10,001+",         min: 10001 },
];

export const FUNDING_PRESETS = [
  { value: "under_1m",  label: "Under $1M",      max: 1_000_000 },
  { value: "1m_10m",    label: "$1M – $10M",      min: 1_000_000,   max: 10_000_000 },
  { value: "10m_50m",   label: "$10M – $50M",     min: 10_000_000,  max: 50_000_000 },
  { value: "50m_100m",  label: "$50M – $100M",    min: 50_000_000,  max: 100_000_000 },
  { value: "100m_500m", label: "$100M – $500M",   min: 100_000_000, max: 500_000_000 },
  { value: "500m_1b",   label: "$500M – $1B",     min: 500_000_000, max: 1_000_000_000 },
  { value: "1b_plus",   label: "$1B+",            min: 1_000_000_000 },
];

export const GROWTH_PRESETS = [
  { value: "decline",   label: "Decline (<0%)",  max: 0 },
  { value: "0_25",      label: "0 – 25%",        min: 0,   max: 25 },
  { value: "25_50",     label: "25 – 50%",       min: 25,  max: 50 },
  { value: "50_100",    label: "50 – 100%",      min: 50,  max: 100 },
  { value: "100_200",   label: "100 – 200%",     min: 100, max: 200 },
  { value: "200_plus",  label: "200%+",          min: 200 },
];

export const FOUNDED_YEAR_PRESETS = [
  { value: "2020_2026", label: "2020 – 2026", min: 2020, max: 2026 },
  { value: "2015_2019", label: "2015 – 2019", min: 2015, max: 2019 },
  { value: "2010_2014", label: "2010 – 2014", min: 2010, max: 2014 },
  { value: "2000_2009", label: "2000 – 2009", min: 2000, max: 2009 },
  { value: "1990_1999", label: "1990 – 1999", min: 1990, max: 1999 },
  { value: "before_1990", label: "Before 1990", max: 1989 },
];


export const FUNDING_STAGE_OPTIONS = [
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "angel", label: "Angel" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "series_c", label: "Series C" },
  { value: "series_d", label: "Series D" },
  { value: "series_e", label: "Series E" },
  { value: "series_f", label: "Series F" },
  { value: "series_g", label: "Series G" },
  { value: "series_h", label: "Series H" },
  { value: "series_unknown", label: "Series (Unknown)" },
  { value: "convertible_note", label: "Convertible Note" },
  { value: "corporate_round", label: "Corporate Round" },
  { value: "debt_financing", label: "Debt Financing" },
  { value: "equity_crowdfunding", label: "Equity Crowdfunding" },
  { value: "grant", label: "Grant" },
  { value: "private_equity", label: "Private Equity" },
  { value: "post_ipo_equity", label: "Post-IPO Equity" },
  { value: "post_ipo_debt", label: "Post-IPO Debt" },
  { value: "secondary_market", label: "Secondary Market" },
  { value: "undisclosed", label: "Undisclosed" },
];

export const INDUSTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "Abrasives and Nonmetallic Minerals Manufacturing", label: "Abrasives and Nonmetallic Minerals Manufacturing" },
  { value: "Accessible Architecture and Design", label: "Accessible Architecture and Design" },
  { value: "Accessible Hardware Manufacturing", label: "Accessible Hardware Manufacturing" },
  { value: "Accommodation and Food Services", label: "Accommodation and Food Services" },
  { value: "Accounting", label: "Accounting" },
  { value: "Administration of Justice", label: "Administration of Justice" },
  { value: "Administrative and Support Services", label: "Administrative and Support Services" },
  { value: "Advertising Services", label: "Advertising Services" },
  { value: "Agricultural Chemical Manufacturing", label: "Agricultural Chemical Manufacturing" },
  { value: "Agriculture, Construction, Mining Machinery Manufacturing", label: "Agriculture, Construction, Mining Machinery Manufacturing" },
  { value: "Air, Water, and Waste Program Management", label: "Air, Water, and Waste Program Management" },
  { value: "Airlines and Aviation", label: "Airlines and Aviation" },
  { value: "Alternative Dispute Resolution", label: "Alternative Dispute Resolution" },
  { value: "Alternative Fuel Vehicle Manufacturing", label: "Alternative Fuel Vehicle Manufacturing" },
  { value: "Alternative Medicine", label: "Alternative Medicine" },
  { value: "Ambulance Services", label: "Ambulance Services" },
  { value: "Amusement Parks and Arcades", label: "Amusement Parks and Arcades" },
  { value: "Animal Feed Manufacturing", label: "Animal Feed Manufacturing" },
  { value: "Animation", label: "Animation" },
  { value: "Animation and Post-production", label: "Animation and Post-production" },
  { value: "Apparel & Fashion", label: "Apparel & Fashion" },
  { value: "Apparel Manufacturing", label: "Apparel Manufacturing" },
  { value: "Appliances, Electrical, and Electronics Manufacturing", label: "Appliances, Electrical, and Electronics Manufacturing" },
  { value: "Architectural and Structural Metal Manufacturing", label: "Architectural and Structural Metal Manufacturing" },
  { value: "Architecture and Planning", label: "Architecture and Planning" },
  { value: "Armed Forces", label: "Armed Forces" },
  { value: "Artificial Rubber and Synthetic Fiber Manufacturing", label: "Artificial Rubber and Synthetic Fiber Manufacturing" },
  { value: "Artists and Writers", label: "Artists and Writers" },
  { value: "Arts & Crafts", label: "Arts & Crafts" },
  { value: "Audio and Video Equipment Manufacturing", label: "Audio and Video Equipment Manufacturing" },
  { value: "Automation Machinery Manufacturing", label: "Automation Machinery Manufacturing" },
  { value: "Automotive", label: "Automotive" },
  { value: "Aviation & Aerospace", label: "Aviation & Aerospace" },
  { value: "Aviation and Aerospace Component Manufacturing", label: "Aviation and Aerospace Component Manufacturing" },
  { value: "Baked Goods Manufacturing", label: "Baked Goods Manufacturing" },
  { value: "Banking", label: "Banking" },
  { value: "Bars, Taverns, and Nightclubs", label: "Bars, Taverns, and Nightclubs" },
  { value: "Bed-and-Breakfasts, Hostels, Homestays", label: "Bed-and-Breakfasts, Hostels, Homestays" },
  { value: "Beverage Manufacturing", label: "Beverage Manufacturing" },
  { value: "Biomass Electric Power Generation", label: "Biomass Electric Power Generation" },
  { value: "Biotechnology", label: "Biotechnology" },
  { value: "Biotechnology Research", label: "Biotechnology Research" },
  { value: "Blockchain Services", label: "Blockchain Services" },
  { value: "Blogs", label: "Blogs" },
  { value: "Boilers, Tanks, and Shipping Container Manufacturing", label: "Boilers, Tanks, and Shipping Container Manufacturing" },
  { value: "Book and Periodical Publishing", label: "Book and Periodical Publishing" },
  { value: "Book Publishing", label: "Book Publishing" },
  { value: "Breweries", label: "Breweries" },
  { value: "Broadcast Media Production and Distribution", label: "Broadcast Media Production and Distribution" },
  { value: "Building Construction", label: "Building Construction" },
  { value: "Building Equipment Contractors", label: "Building Equipment Contractors" },
  { value: "Building Finishing Contractors", label: "Building Finishing Contractors" },
  { value: "Building Materials", label: "Building Materials" },
  { value: "Building Structure and Exterior Contractors", label: "Building Structure and Exterior Contractors" },
  { value: "Business Consulting and Services", label: "Business Consulting and Services" },
  { value: "Business Content", label: "Business Content" },
  { value: "Business Intelligence Platforms", label: "Business Intelligence Platforms" },
  { value: "Business Supplies & Equipment", label: "Business Supplies & Equipment" },
  { value: "Cable and Satellite Programming", label: "Cable and Satellite Programming" },
  { value: "Capital Markets", label: "Capital Markets" },
  { value: "Caterers", label: "Caterers" },
  { value: "Chemical Manufacturing", label: "Chemical Manufacturing" },
  { value: "Chemical Raw Materials Manufacturing", label: "Chemical Raw Materials Manufacturing" },
  { value: "Child Day Care Services", label: "Child Day Care Services" },
  { value: "Chiropractors", label: "Chiropractors" },
  { value: "Circuses and Magic Shows", label: "Circuses and Magic Shows" },
  { value: "Civic and Social Organizations", label: "Civic and Social Organizations" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Claims Adjusting, Actuarial Services", label: "Claims Adjusting, Actuarial Services" },
  { value: "Clay and Refractory Products Manufacturing", label: "Clay and Refractory Products Manufacturing" },
  { value: "Climate Data and Analytics", label: "Climate Data and Analytics" },
  { value: "Climate Technology Product Manufacturing", label: "Climate Technology Product Manufacturing" },
  { value: "Coal Mining", label: "Coal Mining" },
  { value: "Collection Agencies", label: "Collection Agencies" },
  { value: "Commercial and Industrial Equipment Rental", label: "Commercial and Industrial Equipment Rental" },
  { value: "Commercial and Industrial Machinery Maintenance", label: "Commercial and Industrial Machinery Maintenance" },
  { value: "Commercial and Service Industry Machinery Manufacturing", label: "Commercial and Service Industry Machinery Manufacturing" },
  { value: "Commercial Real Estate", label: "Commercial Real Estate" },
  { value: "Communications Equipment Manufacturing", label: "Communications Equipment Manufacturing" },
  { value: "Community Development and Urban Planning", label: "Community Development and Urban Planning" },
  { value: "Community Services", label: "Community Services" },
  { value: "Computer and Network Security", label: "Computer and Network Security" },
  { value: "Computer Games", label: "Computer Games" },
  { value: "Computer Hardware", label: "Computer Hardware" },
  { value: "Computer Hardware Manufacturing", label: "Computer Hardware Manufacturing" },
  { value: "Computer Networking", label: "Computer Networking" },
  { value: "Computer Networking Products", label: "Computer Networking Products" },
  { value: "Computers and Electronics Manufacturing", label: "Computers and Electronics Manufacturing" },
  { value: "Conservation Programs", label: "Conservation Programs" },
  { value: "Construction", label: "Construction" },
  { value: "Construction Hardware Manufacturing", label: "Construction Hardware Manufacturing" },
  { value: "Consumer Electronics", label: "Consumer Electronics" },
  { value: "Consumer Goods", label: "Consumer Goods" },
  { value: "Consumer Goods Rental", label: "Consumer Goods Rental" },
  { value: "Consumer Services", label: "Consumer Services" },
  { value: "Correctional Institutions", label: "Correctional Institutions" },
  { value: "Cosmetics", label: "Cosmetics" },
  { value: "Cosmetology and Barber Schools", label: "Cosmetology and Barber Schools" },
  { value: "Courts of Law", label: "Courts of Law" },
  { value: "Credit Intermediation", label: "Credit Intermediation" },
  { value: "Cutlery and Handtool Manufacturing", label: "Cutlery and Handtool Manufacturing" },
  { value: "Dairy", label: "Dairy" },
  { value: "Dairy Product Manufacturing", label: "Dairy Product Manufacturing" },
  { value: "Dance Companies", label: "Dance Companies" },
  { value: "Data Infrastructure and Analytics", label: "Data Infrastructure and Analytics" },
  { value: "Data Security Software Products", label: "Data Security Software Products" },
  { value: "Death Care Services", label: "Death Care Services" },
  { value: "Defense & Space", label: "Defense & Space" },
  { value: "Defense and Space Manufacturing", label: "Defense and Space Manufacturing" },
  { value: "Dentists", label: "Dentists" },
  { value: "Design", label: "Design" },
  { value: "Design Services", label: "Design Services" },
  { value: "Desktop Computing Software Products", label: "Desktop Computing Software Products" },
  { value: "Digital Accessibility Services", label: "Digital Accessibility Services" },
  { value: "Distilleries", label: "Distilleries" },
  { value: "E-learning", label: "E-learning" },
  { value: "E-Learning Providers", label: "E-Learning Providers" },
  { value: "Economic Programs", label: "Economic Programs" },
  { value: "Education", label: "Education" },
  { value: "Education Administration Programs", label: "Education Administration Programs" },
  { value: "Education Management", label: "Education Management" },
  { value: "Electric Lighting Equipment Manufacturing", label: "Electric Lighting Equipment Manufacturing" },
  { value: "Electric Power Generation", label: "Electric Power Generation" },
  { value: "Electric Power Transmission, Control, and Distribution", label: "Electric Power Transmission, Control, and Distribution" },
  { value: "Electrical Equipment Manufacturing", label: "Electrical Equipment Manufacturing" },
  { value: "Electronic and Precision Equipment Maintenance", label: "Electronic and Precision Equipment Maintenance" },
  { value: "Embedded Software Products", label: "Embedded Software Products" },
  { value: "Emergency and Relief Services", label: "Emergency and Relief Services" },
  { value: "Energy Technology", label: "Energy Technology" },
  { value: "Engineering Services", label: "Engineering Services" },
  { value: "Engines and Power Transmission Equipment Manufacturing", label: "Engines and Power Transmission Equipment Manufacturing" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Entertainment Providers", label: "Entertainment Providers" },
  { value: "Environmental Quality Programs", label: "Environmental Quality Programs" },
  { value: "Environmental Services", label: "Environmental Services" },
  { value: "Equipment Rental Services", label: "Equipment Rental Services" },
  { value: "Events Services", label: "Events Services" },
  { value: "Executive Offices", label: "Executive Offices" },
  { value: "Executive Search Services", label: "Executive Search Services" },
  { value: "Fabricated Metal Products", label: "Fabricated Metal Products" },
  { value: "Facilities Services", label: "Facilities Services" },
  { value: "Family Planning Centers", label: "Family Planning Centers" },
  { value: "Farming", label: "Farming" },
  { value: "Farming, Ranching, Forestry", label: "Farming, Ranching, Forestry" },
  { value: "Fashion Accessories Manufacturing", label: "Fashion Accessories Manufacturing" },
  { value: "Financial Services", label: "Financial Services" },
  { value: "Fine Art", label: "Fine Art" },
  { value: "Fine Arts Schools", label: "Fine Arts Schools" },
  { value: "Fire Protection", label: "Fire Protection" },
  { value: "Fisheries", label: "Fisheries" },
  { value: "Flight Training", label: "Flight Training" },
  { value: "Food & Beverages", label: "Food & Beverages" },
  { value: "Food and Beverage Manufacturing", label: "Food and Beverage Manufacturing" },
  { value: "Food and Beverage Retail", label: "Food and Beverage Retail" },
  { value: "Food and Beverage Services", label: "Food and Beverage Services" },
  { value: "Food Production", label: "Food Production" },
  { value: "Footwear and Leather Goods Repair", label: "Footwear and Leather Goods Repair" },
  { value: "Footwear Manufacturing", label: "Footwear Manufacturing" },
  { value: "Forestry and Logging", label: "Forestry and Logging" },
  { value: "Fossil Fuel Electric Power Generation", label: "Fossil Fuel Electric Power Generation" },
  { value: "Freight and Package Transportation", label: "Freight and Package Transportation" },
  { value: "Fruit and Vegetable Preserves Manufacturing", label: "Fruit and Vegetable Preserves Manufacturing" },
  { value: "Fuel Cell Manufacturing", label: "Fuel Cell Manufacturing" },
  { value: "Fundraising", label: "Fundraising" },
  { value: "Funds and Trusts", label: "Funds and Trusts" },
  { value: "Funeral Services", label: "Funeral Services" },
  { value: "Furniture", label: "Furniture" },
  { value: "Furniture and Home Furnishings Manufacturing", label: "Furniture and Home Furnishings Manufacturing" },
  { value: "Gambling Facilities and Casinos", label: "Gambling Facilities and Casinos" },
  { value: "Geothermal Electric Power Generation", label: "Geothermal Electric Power Generation" },
  { value: "Glass Product Manufacturing", label: "Glass Product Manufacturing" },
  { value: "Glass, Ceramics and Concrete Manufacturing", label: "Glass, Ceramics and Concrete Manufacturing" },
  { value: "Golf Courses and Country Clubs", label: "Golf Courses and Country Clubs" },
  { value: "Government Administration", label: "Government Administration" },
  { value: "Government Relations", label: "Government Relations" },
  { value: "Government Relations Services", label: "Government Relations Services" },
  { value: "Graphic Design", label: "Graphic Design" },
  { value: "Ground Passenger Transportation", label: "Ground Passenger Transportation" },
  { value: "Health and Human Services", label: "Health and Human Services" },
  { value: "Health, Wellness & Fitness", label: "Health, Wellness & Fitness" },
  { value: "Higher Education", label: "Higher Education" },
  { value: "Highway, Street, and Bridge Construction", label: "Highway, Street, and Bridge Construction" },
  { value: "Historical Sites", label: "Historical Sites" },
  { value: "Holding Companies", label: "Holding Companies" },
  { value: "Home Health Care Services", label: "Home Health Care Services" },
  { value: "Horticulture", label: "Horticulture" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Hospitals", label: "Hospitals" },
  { value: "Hospitals and Health Care", label: "Hospitals and Health Care" },
  { value: "Hotels and Motels", label: "Hotels and Motels" },
  { value: "Household and Institutional Furniture Manufacturing", label: "Household and Institutional Furniture Manufacturing" },
  { value: "Household Appliance Manufacturing", label: "Household Appliance Manufacturing" },
  { value: "Household Services", label: "Household Services" },
  { value: "Housing and Community Development", label: "Housing and Community Development" },
  { value: "Housing Programs", label: "Housing Programs" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Human Resources Services", label: "Human Resources Services" },
  { value: "HVAC and Refrigeration Equipment Manufacturing", label: "HVAC and Refrigeration Equipment Manufacturing" },
  { value: "Hydroelectric Power Generation", label: "Hydroelectric Power Generation" },
  { value: "Import & Export", label: "Import & Export" },
  { value: "Individual and Family Services", label: "Individual and Family Services" },
  { value: "Industrial Automation", label: "Industrial Automation" },
  { value: "Industrial Machinery Manufacturing", label: "Industrial Machinery Manufacturing" },
  { value: "Industry Associations", label: "Industry Associations" },
  { value: "Information Services", label: "Information Services" },
  { value: "Information Technology & Services", label: "Information Technology & Services" },
  { value: "Insurance", label: "Insurance" },
  { value: "Insurance Agencies and Brokerages", label: "Insurance Agencies and Brokerages" },
  { value: "Insurance and Employee Benefit Funds", label: "Insurance and Employee Benefit Funds" },
  { value: "Insurance Carriers", label: "Insurance Carriers" },
  { value: "Interior Design", label: "Interior Design" },
  { value: "International Affairs", label: "International Affairs" },
  { value: "International Trade and Development", label: "International Trade and Development" },
  { value: "Internet Marketplace Platforms", label: "Internet Marketplace Platforms" },
  { value: "Internet News", label: "Internet News" },
  { value: "Internet Publishing", label: "Internet Publishing" },
  { value: "Interurban and Rural Bus Services", label: "Interurban and Rural Bus Services" },
  { value: "Investment Advice", label: "Investment Advice" },
  { value: "Investment Banking", label: "Investment Banking" },
  { value: "Investment Management", label: "Investment Management" },
  { value: "IT Services and IT Consulting", label: "IT Services and IT Consulting" },
  { value: "IT System Custom Software Development", label: "IT System Custom Software Development" },
  { value: "IT System Data Services", label: "IT System Data Services" },
  { value: "IT System Design Services", label: "IT System Design Services" },
  { value: "IT System Installation and Disposal", label: "IT System Installation and Disposal" },
  { value: "IT System Operations and Maintenance", label: "IT System Operations and Maintenance" },
  { value: "IT System Testing and Evaluation", label: "IT System Testing and Evaluation" },
  { value: "IT System Training and Support", label: "IT System Training and Support" },
  { value: "Janitorial Services", label: "Janitorial Services" },
  { value: "Landscaping Services", label: "Landscaping Services" },
  { value: "Language Schools", label: "Language Schools" },
  { value: "Laundry and Drycleaning Services", label: "Laundry and Drycleaning Services" },
  { value: "Law Enforcement", label: "Law Enforcement" },
  { value: "Law Practice", label: "Law Practice" },
  { value: "Leasing Non-residential Real Estate", label: "Leasing Non-residential Real Estate" },
  { value: "Leasing Residential Real Estate", label: "Leasing Residential Real Estate" },
  { value: "Leather Product Manufacturing", label: "Leather Product Manufacturing" },
  { value: "Legal Services", label: "Legal Services" },
  { value: "Legislative Offices", label: "Legislative Offices" },
  { value: "Leisure, Travel & Tourism", label: "Leisure, Travel & Tourism" },
  { value: "Libraries", label: "Libraries" },
  { value: "Lime and Gypsum Products Manufacturing", label: "Lime and Gypsum Products Manufacturing" },
  { value: "Loan Brokers", label: "Loan Brokers" },
  { value: "Luxury Goods & Jewelry", label: "Luxury Goods & Jewelry" },
  { value: "Machinery Manufacturing", label: "Machinery Manufacturing" },
  { value: "Magnetic and Optical Media Manufacturing", label: "Magnetic and Optical Media Manufacturing" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Maritime", label: "Maritime" },
  { value: "Maritime Transportation", label: "Maritime Transportation" },
  { value: "Market Research", label: "Market Research" },
  { value: "Marketing Services", label: "Marketing Services" },
  { value: "Mattress and Blinds Manufacturing", label: "Mattress and Blinds Manufacturing" },
  { value: "Measuring and Control Instrument Manufacturing", label: "Measuring and Control Instrument Manufacturing" },
  { value: "Meat Products Manufacturing", label: "Meat Products Manufacturing" },
  { value: "Mechanical Or Industrial Engineering", label: "Mechanical Or Industrial Engineering" },
  { value: "Media and Telecommunications", label: "Media and Telecommunications" },
  { value: "Media Production", label: "Media Production" },
  { value: "Medical and Diagnostic Laboratories", label: "Medical and Diagnostic Laboratories" },
  { value: "Medical Device", label: "Medical Device" },
  { value: "Medical Equipment Manufacturing", label: "Medical Equipment Manufacturing" },
  { value: "Medical Practices", label: "Medical Practices" },
  { value: "Mental Health Care", label: "Mental Health Care" },
  { value: "Metal Ore Mining", label: "Metal Ore Mining" },
  { value: "Metal Treatments", label: "Metal Treatments" },
  { value: "Metal Valve, Ball, and Roller Manufacturing", label: "Metal Valve, Ball, and Roller Manufacturing" },
  { value: "Metalworking Machinery Manufacturing", label: "Metalworking Machinery Manufacturing" },
  { value: "Military and International Affairs", label: "Military and International Affairs" },
  { value: "Mining", label: "Mining" },
  { value: "Mobile Computing Software Products", label: "Mobile Computing Software Products" },
  { value: "Mobile Food Services", label: "Mobile Food Services" },
  { value: "Mobile Gaming Apps", label: "Mobile Gaming Apps" },
  { value: "Motor Vehicle Manufacturing", label: "Motor Vehicle Manufacturing" },
  { value: "Motor Vehicle Parts Manufacturing", label: "Motor Vehicle Parts Manufacturing" },
  { value: "Movies and Sound Recording", label: "Movies and Sound Recording" },
  { value: "Movies, Videos, and Sound", label: "Movies, Videos, and Sound" },
  { value: "Museums", label: "Museums" },
  { value: "Museums, Historical Sites, and Zoos", label: "Museums, Historical Sites, and Zoos" },
  { value: "Music", label: "Music" },
  { value: "Musicians", label: "Musicians" },
  { value: "Nanotechnology Research", label: "Nanotechnology Research" },
  { value: "Natural Gas Distribution", label: "Natural Gas Distribution" },
  { value: "Natural Gas Extraction", label: "Natural Gas Extraction" },
  { value: "Newspaper Publishing", label: "Newspaper Publishing" },
  { value: "Non-profit Organization Management", label: "Non-profit Organization Management" },
  { value: "Non-profit Organizations", label: "Non-profit Organizations" },
  { value: "Nonmetallic Mineral Mining", label: "Nonmetallic Mineral Mining" },
  { value: "Nonresidential Building Construction", label: "Nonresidential Building Construction" },
  { value: "Nuclear Electric Power Generation", label: "Nuclear Electric Power Generation" },
  { value: "Nursing Homes and Residential Care Facilities", label: "Nursing Homes and Residential Care Facilities" },
  { value: "Office Administration", label: "Office Administration" },
  { value: "Office Furniture and Fixtures Manufacturing", label: "Office Furniture and Fixtures Manufacturing" },
  { value: "Oil and Coal Product Manufacturing", label: "Oil and Coal Product Manufacturing" },
  { value: "Oil and Gas", label: "Oil and Gas" },
  { value: "Oil Extraction", label: "Oil Extraction" },
  { value: "Oil, Gas, and Mining", label: "Oil, Gas, and Mining" },
  { value: "Online and Mail Order Retail", label: "Online and Mail Order Retail" },
  { value: "Online Audio and Video Media", label: "Online Audio and Video Media" },
  { value: "Online Media", label: "Online Media" },
  { value: "Operations Consulting", label: "Operations Consulting" },
  { value: "Optometrists", label: "Optometrists" },
  { value: "Outpatient Care Centers", label: "Outpatient Care Centers" },
  { value: "Outsourcing and Offshoring Consulting", label: "Outsourcing and Offshoring Consulting" },
  { value: "Outsourcing/Offshoring", label: "Outsourcing/Offshoring" },
  { value: "Packaging & Containers", label: "Packaging & Containers" },
  { value: "Packaging and Containers Manufacturing", label: "Packaging and Containers Manufacturing" },
  { value: "Paint, Coating, and Adhesive Manufacturing", label: "Paint, Coating, and Adhesive Manufacturing" },
  { value: "Paper & Forest Products", label: "Paper & Forest Products" },
  { value: "Paper and Forest Product Manufacturing", label: "Paper and Forest Product Manufacturing" },
  { value: "Parts Distribution", label: "Parts Distribution" },
  { value: "Pension Funds", label: "Pension Funds" },
  { value: "Performing Arts", label: "Performing Arts" },
  { value: "Performing Arts and Spectator Sports", label: "Performing Arts and Spectator Sports" },
  { value: "Periodical Publishing", label: "Periodical Publishing" },
  { value: "Personal and Laundry Services", label: "Personal and Laundry Services" },
  { value: "Personal Care Product Manufacturing", label: "Personal Care Product Manufacturing" },
  { value: "Personal Care Services", label: "Personal Care Services" },
  { value: "Pet Services", label: "Pet Services" },
  { value: "Pharmaceutical Manufacturing", label: "Pharmaceutical Manufacturing" },
  { value: "Philanthropic Fundraising Services", label: "Philanthropic Fundraising Services" },
  { value: "Philanthropy", label: "Philanthropy" },
  { value: "Photography", label: "Photography" },
  { value: "Physical, Occupational and Speech Therapists", label: "Physical, Occupational and Speech Therapists" },
  { value: "Physicians", label: "Physicians" },
  { value: "Pipeline Transportation", label: "Pipeline Transportation" },
  { value: "Plastics and Rubber Product Manufacturing", label: "Plastics and Rubber Product Manufacturing" },
  { value: "Plastics Manufacturing", label: "Plastics Manufacturing" },
  { value: "Political Organizations", label: "Political Organizations" },
  { value: "Postal Services", label: "Postal Services" },
  { value: "Primary and Secondary Education", label: "Primary and Secondary Education" },
  { value: "Primary Metal Manufacturing", label: "Primary Metal Manufacturing" },
  { value: "Printing Services", label: "Printing Services" },
  { value: "Professional Organizations", label: "Professional Organizations" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Professional Training and Coaching", label: "Professional Training and Coaching" },
  { value: "Program Development", label: "Program Development" },
  { value: "Public Assistance Programs", label: "Public Assistance Programs" },
  { value: "Public Health", label: "Public Health" },
  { value: "Public Policy", label: "Public Policy" },
  { value: "Public Policy Offices", label: "Public Policy Offices" },
  { value: "Public Relations and Communications Services", label: "Public Relations and Communications Services" },
  { value: "Public Safety", label: "Public Safety" },
  { value: "Public Works", label: "Public Works" },
  { value: "Racetracks", label: "Racetracks" },
  { value: "Radio and Television Broadcasting", label: "Radio and Television Broadcasting" },
  { value: "Rail Transportation", label: "Rail Transportation" },
  { value: "Railroad Equipment Manufacturing", label: "Railroad Equipment Manufacturing" },
  { value: "Ranching", label: "Ranching" },
  { value: "Ranching and Fisheries", label: "Ranching and Fisheries" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Real Estate Agents and Brokers", label: "Real Estate Agents and Brokers" },
  { value: "Real Estate and Equipment Rental Services", label: "Real Estate and Equipment Rental Services" },
  { value: "Recreational Facilities", label: "Recreational Facilities" },
  { value: "Regenerative Design", label: "Regenerative Design" },
  { value: "Religious Institutions", label: "Religious Institutions" },
  { value: "Renewable Energy Equipment Manufacturing", label: "Renewable Energy Equipment Manufacturing" },
  { value: "Renewable Energy Power Generation", label: "Renewable Energy Power Generation" },
  { value: "Renewable Energy Semiconductor Manufacturing", label: "Renewable Energy Semiconductor Manufacturing" },
  { value: "Renewables & Environment", label: "Renewables & Environment" },
  { value: "Repair and Maintenance", label: "Repair and Maintenance" },
  { value: "Research", label: "Research" },
  { value: "Research Services", label: "Research Services" },
  { value: "Residential Building Construction", label: "Residential Building Construction" },
  { value: "Restaurants", label: "Restaurants" },
  { value: "Retail", label: "Retail" },
  { value: "Retail Apparel and Fashion", label: "Retail Apparel and Fashion" },
  { value: "Retail Appliances, Electrical, and Electronic Equipment", label: "Retail Appliances, Electrical, and Electronic Equipment" },
  { value: "Retail Art Dealers", label: "Retail Art Dealers" },
  { value: "Retail Art Supplies", label: "Retail Art Supplies" },
  { value: "Retail Books and Printed News", label: "Retail Books and Printed News" },
  { value: "Retail Building Materials and Garden Equipment", label: "Retail Building Materials and Garden Equipment" },
  { value: "Retail Florists", label: "Retail Florists" },
  { value: "Retail Furniture and Home Furnishings", label: "Retail Furniture and Home Furnishings" },
  { value: "Retail Gasoline", label: "Retail Gasoline" },
  { value: "Retail Groceries", label: "Retail Groceries" },
  { value: "Retail Health and Personal Care Products", label: "Retail Health and Personal Care Products" },
  { value: "Retail Luxury Goods and Jewelry", label: "Retail Luxury Goods and Jewelry" },
  { value: "Retail Motor Vehicles", label: "Retail Motor Vehicles" },
  { value: "Retail Musical Instruments", label: "Retail Musical Instruments" },
  { value: "Retail Office Equipment", label: "Retail Office Equipment" },
  { value: "Retail Office Supplies and Gifts", label: "Retail Office Supplies and Gifts" },
  { value: "Retail Pharmacies", label: "Retail Pharmacies" },
  { value: "Retail Recyclable Materials & Used Merchandise", label: "Retail Recyclable Materials & Used Merchandise" },
  { value: "Reupholstery and Furniture Repair", label: "Reupholstery and Furniture Repair" },
  { value: "Robot Manufacturing", label: "Robot Manufacturing" },
  { value: "Robotics Engineering", label: "Robotics Engineering" },
  { value: "Rubber Products Manufacturing", label: "Rubber Products Manufacturing" },
  { value: "Satellite Telecommunications", label: "Satellite Telecommunications" },
  { value: "Savings Institutions", label: "Savings Institutions" },
  { value: "School and Employee Bus Services", label: "School and Employee Bus Services" },
  { value: "Seafood Product Manufacturing", label: "Seafood Product Manufacturing" },
  { value: "Secretarial Schools", label: "Secretarial Schools" },
  { value: "Securities and Commodity Exchanges", label: "Securities and Commodity Exchanges" },
  { value: "Security and Investigations", label: "Security and Investigations" },
  { value: "Security Guards and Patrol Services", label: "Security Guards and Patrol Services" },
  { value: "Security Systems Services", label: "Security Systems Services" },
  { value: "Semiconductor Manufacturing", label: "Semiconductor Manufacturing" },
  { value: "Semiconductors", label: "Semiconductors" },
  { value: "Services for Renewable Energy", label: "Services for Renewable Energy" },
  { value: "Services for the Elderly and Disabled", label: "Services for the Elderly and Disabled" },
  { value: "Sheet Music Publishing", label: "Sheet Music Publishing" },
  { value: "Shipbuilding", label: "Shipbuilding" },
  { value: "Shuttles and Special Needs Transportation Services", label: "Shuttles and Special Needs Transportation Services" },
  { value: "Sightseeing Transportation", label: "Sightseeing Transportation" },
  { value: "Skiing Facilities", label: "Skiing Facilities" },
  { value: "Smart Meter Manufacturing", label: "Smart Meter Manufacturing" },
  { value: "Soap and Cleaning Product Manufacturing", label: "Soap and Cleaning Product Manufacturing" },
  { value: "Social Networking Platforms", label: "Social Networking Platforms" },
  { value: "Software Development", label: "Software Development" },
  { value: "Solar Electric Power Generation", label: "Solar Electric Power Generation" },
  { value: "Sound Recording", label: "Sound Recording" },
  { value: "Space Research and Technology", label: "Space Research and Technology" },
  { value: "Specialty Trade Contractors", label: "Specialty Trade Contractors" },
  { value: "Spectator Sports", label: "Spectator Sports" },
  { value: "Sporting Goods", label: "Sporting Goods" },
  { value: "Sporting Goods Manufacturing", label: "Sporting Goods Manufacturing" },
  { value: "Sports and Recreation Instruction", label: "Sports and Recreation Instruction" },
  { value: "Sports Teams and Clubs", label: "Sports Teams and Clubs" },
  { value: "Spring and Wire Product Manufacturing", label: "Spring and Wire Product Manufacturing" },
  { value: "Staffing and Recruiting", label: "Staffing and Recruiting" },
  { value: "Steam and Air-Conditioning Supply", label: "Steam and Air-Conditioning Supply" },
  { value: "Strategic Management Services", label: "Strategic Management Services" },
  { value: "Subdivision of Land", label: "Subdivision of Land" },
  { value: "Sugar and Confectionery Product Manufacturing", label: "Sugar and Confectionery Product Manufacturing" },
  { value: "Surveying and Mapping Services", label: "Surveying and Mapping Services" },
  { value: "Taxi and Limousine Services", label: "Taxi and Limousine Services" },
  { value: "Technical and Vocational Training", label: "Technical and Vocational Training" },
  { value: "Technology, Information and Internet", label: "Technology, Information and Internet" },
  { value: "Technology, Information and Media", label: "Technology, Information and Media" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Telecommunications Carriers", label: "Telecommunications Carriers" },
  { value: "Telephone Call Centers", label: "Telephone Call Centers" },
  { value: "Temporary Help Services", label: "Temporary Help Services" },
  { value: "Textile Manufacturing", label: "Textile Manufacturing" },
  { value: "Theater Companies", label: "Theater Companies" },
  { value: "Think Tanks", label: "Think Tanks" },
  { value: "Tobacco", label: "Tobacco" },
  { value: "Tobacco Manufacturing", label: "Tobacco Manufacturing" },
  { value: "Translation and Localization", label: "Translation and Localization" },
  { value: "Transportation Equipment Manufacturing", label: "Transportation Equipment Manufacturing" },
  { value: "Transportation Programs", label: "Transportation Programs" },
  { value: "Transportation, Logistics, Supply Chain and Storage", label: "Transportation, Logistics, Supply Chain and Storage" },
  { value: "Transportation/Trucking/Railroad", label: "Transportation/Trucking/Railroad" },
  { value: "Travel Arrangements", label: "Travel Arrangements" },
  { value: "Truck Transportation", label: "Truck Transportation" },
  { value: "Trusts and Estates", label: "Trusts and Estates" },
  { value: "Turned Products and Fastener Manufacturing", label: "Turned Products and Fastener Manufacturing" },
  { value: "Urban Transit Services", label: "Urban Transit Services" },
  { value: "Utilities", label: "Utilities" },
  { value: "Utilities Administration", label: "Utilities Administration" },
  { value: "Utility System Construction", label: "Utility System Construction" },
  { value: "Vehicle Repair and Maintenance", label: "Vehicle Repair and Maintenance" },
  { value: "Venture Capital and Private Equity Principals", label: "Venture Capital and Private Equity Principals" },
  { value: "Veterinary", label: "Veterinary" },
  { value: "Veterinary Services", label: "Veterinary Services" },
  { value: "Vocational Rehabilitation Services", label: "Vocational Rehabilitation Services" },
  { value: "Warehousing", label: "Warehousing" },
  { value: "Warehousing and Storage", label: "Warehousing and Storage" },
  { value: "Waste Collection", label: "Waste Collection" },
  { value: "Waste Treatment and Disposal", label: "Waste Treatment and Disposal" },
  { value: "Water Supply and Irrigation Systems", label: "Water Supply and Irrigation Systems" },
  { value: "Water, Waste, Steam, and Air Conditioning Services", label: "Water, Waste, Steam, and Air Conditioning Services" },
  { value: "Wellness and Fitness Services", label: "Wellness and Fitness Services" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Wholesale Alcoholic Beverages", label: "Wholesale Alcoholic Beverages" },
  { value: "Wholesale Apparel and Sewing Supplies", label: "Wholesale Apparel and Sewing Supplies" },
  { value: "Wholesale Appliances, Electrical, and Electronics", label: "Wholesale Appliances, Electrical, and Electronics" },
  { value: "Wholesale Building Materials", label: "Wholesale Building Materials" },
  { value: "Wholesale Chemical and Allied Products", label: "Wholesale Chemical and Allied Products" },
  { value: "Wholesale Computer Equipment", label: "Wholesale Computer Equipment" },
  { value: "Wholesale Drugs and Sundries", label: "Wholesale Drugs and Sundries" },
  { value: "Wholesale Food and Beverage", label: "Wholesale Food and Beverage" },
  { value: "Wholesale Footwear", label: "Wholesale Footwear" },
  { value: "Wholesale Furniture and Home Furnishings", label: "Wholesale Furniture and Home Furnishings" },
  { value: "Wholesale Hardware, Plumbing, Heating Equipment", label: "Wholesale Hardware, Plumbing, Heating Equipment" },
  { value: "Wholesale Import and Export", label: "Wholesale Import and Export" },
  { value: "Wholesale Luxury Goods and Jewelry", label: "Wholesale Luxury Goods and Jewelry" },
  { value: "Wholesale Machinery", label: "Wholesale Machinery" },
  { value: "Wholesale Metals and Minerals", label: "Wholesale Metals and Minerals" },
  { value: "Wholesale Motor Vehicles and Parts", label: "Wholesale Motor Vehicles and Parts" },
  { value: "Wholesale Paper Products", label: "Wholesale Paper Products" },
  { value: "Wholesale Petroleum and Petroleum Products", label: "Wholesale Petroleum and Petroleum Products" },
  { value: "Wholesale Photography Equipment and Supplies", label: "Wholesale Photography Equipment and Supplies" },
  { value: "Wholesale Raw Farm Products", label: "Wholesale Raw Farm Products" },
  { value: "Wholesale Recyclable Materials", label: "Wholesale Recyclable Materials" },
  { value: "Wind Electric Power Generation", label: "Wind Electric Power Generation" },
  { value: "Wine & Spirits", label: "Wine & Spirits" },
  { value: "Wineries", label: "Wineries" },
  { value: "Wireless Services", label: "Wireless Services" },
  { value: "Women's Handbag Manufacturing", label: "Women's Handbag Manufacturing" },
  { value: "Wood Product Manufacturing", label: "Wood Product Manufacturing" },
  { value: "Writing and Editing", label: "Writing and Editing" },
  { value: "Zoos and Botanical Gardens", label: "Zoos and Botanical Gardens" },
];


export const COMPANY_NEWS_CATEGORIES = [
  { value: "funding_investment",     label: "Funding & Investment" },
  { value: "mergers_acquisitions",   label: "Mergers & Acquisitions" },
  { value: "product_launch",         label: "Product Launch" },
  { value: "partnership",            label: "Partnership" },
  { value: "expansion",              label: "Expansion" },
  { value: "layoffs_restructuring",  label: "Layoffs & Restructuring" },
  { value: "ipo",                    label: "IPO" },
  { value: "leadership_change",      label: "Leadership Change" },
  { value: "legal_regulatory",       label: "Legal & Regulatory" },
  { value: "awards_recognition",     label: "Awards & Recognition" },
];

export const COMPANY_NEWS_TIMEFRAMES = [
  { value: "60d",  label: "Last 60 days" },
  { value: "90d",  label: "Last 90 days" },
  { value: "6m",   label: "Last 6 months" },
  { value: "12m",  label: "Last 12 months" },
];

export const EMAIL_PROVIDER_OPTIONS = [
  { value: "microsoft",  label: "Microsoft" },
  { value: "google",     label: "Google" },
  { value: "proofpoint", label: "Proofpoint" },
  { value: "mimecast",   label: "Mimecast" },
  { value: "other",      label: "Other" },
];

export const CERTIFICATION_OPTIONS = [
  { value: "soc2",      label: "SOC 2" },
  { value: "gdpr",      label: "GDPR" },
  { value: "ccpa",      label: "CCPA" },
  { value: "iso_27001", label: "ISO 27001" },
  { value: "hipaa",     label: "HIPAA" },
  { value: "pci_dss",   label: "PCI-DSS" },
];

export const JOB_CHANGE_TIMEFRAMES = [
  { value: "1",  label: "Last 1 month" },
  { value: "3",  label: "Last 3 months" },
  { value: "6",  label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
  { value: "24", label: "Last 24 months" },
];

export const WEBSITE_TRAFFIC_TIMEFRAMES = [
  { value: "monthly",   label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly",    label: "Yearly" },
];

export const BUYING_INTENT_STATIC = [
  "CRM",
  "Marketing Automation",
  "Sales Engagement",
  "Data Enrichment",
  "Cloud Migration",
  "Cybersecurity",
  "Analytics & BI",
];

export const TECHNOLOGIES_STATIC = [
  "Salesforce",
  "HubSpot",
  "AWS",
  "Google Cloud",
  "Azure",
  "Snowflake",
  "Segment",
  "React",
  "Node.js",
  "Stripe",
];


export const INDUSTRY_OPTIONS_HIERARCHICAL: DepartmentOption[] = INDUSTRY_OPTIONS;

