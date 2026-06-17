export type TabType = "people" | "company";

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface PersonFilters {
  // Name & LinkedIn
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  // Profile details
  headline: string;
  summary: string;
  twitterHandle: string;
  languages: string;
  skills: string;
  certifications: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  linkedinConnectionsMin: string;
  // Title & seniority
  jobTitle: string;
  seniority: string[];
  function: string;
  yearsExperienceMin: string;
  yearsExperienceMax: string;
  // Current company
  companyName: string;
  companyLinkedinUrl: string;
  companyDomain: string;
  industry: string;
  companySize: string;
  // Past roles & companies
  pastCompanies: string;
  pastTitles: string;
  pastSeniority: string[];
  pastFunction: string;
  // Person location
  country: string;
  state: string;
  city: string;
  // Company HQ location
  hqCountry: string;
  hqState: string;
  hqCity: string;
}

export interface CompanyFilters {
  // Name & domain
  companyName: string;
  websiteDomain: string;
  // Industry & type
  industry: string;
  type: string;
  stockExchange: string;
  // HQ location
  hqCountry: string;
  hqState: string;
  hqCity: string;
  // Headcount, revenue & growth
  employeeCountMin: string;
  employeeCountMax: string;
  annualRevenue: string;
  employeeGrowthMin: string;
  // Founded, funding & IPO
  yearFoundedMin: string;
  yearFoundedMax: string;
  lastFundingRound: string;
  totalFundingMin: string;
  mostRecentFundingAfter: string;
  // Role mix & hiring growth
  roleCompositionRole: string;
  roleCompositionMin: string;
}

export const DEFAULT_PERSON_FILTERS: PersonFilters = {
  firstName: "", lastName: "", linkedinUrl: "",
  headline: "", summary: "", twitterHandle: "", languages: "",
  skills: "", certifications: "", degree: "", school: "",
  fieldOfStudy: "", linkedinConnectionsMin: "",
  jobTitle: "", seniority: [], function: "",
  yearsExperienceMin: "", yearsExperienceMax: "",
  companyName: "", companyLinkedinUrl: "", companyDomain: "",
  industry: "", companySize: "",
  pastCompanies: "", pastTitles: "", pastSeniority: [], pastFunction: "",
  country: "", state: "", city: "",
  hqCountry: "", hqState: "", hqCity: "",
};

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  companyName: "", websiteDomain: "",
  industry: "", type: "", stockExchange: "",
  hqCountry: "", hqState: "", hqCity: "",
  employeeCountMin: "", employeeCountMax: "",
  annualRevenue: "", employeeGrowthMin: "",
  yearFoundedMin: "", yearFoundedMax: "",
  lastFundingRound: "", totalFundingMin: "", mostRecentFundingAfter: "",
  roleCompositionRole: "", roleCompositionMin: "",
};

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PersonResult {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  job_title_role?: string;
  job_title_sub_role?: string;
  job_title_levels?: string[];
  job_company_name?: string;
  job_company_id?: string;
  job_company_size?: string;
  job_company_industry?: string;
  work_email?: string;
  phone_numbers?: string[];
  location_country?: string;
  location_region?: string;
  location_locality?: string;
  linkedin_url?: string;
  linkedin_connections?: number;
}

export interface CompanyResult {
  id: string;
  name?: string;
  display_name?: string;
  website?: string;
  industry?: string;
  employee_count?: number;
  size?: string;
  location?: {
    country?: string;
    region?: string;
    locality?: string;
  };
  linkedin_url?: string;
  type?: string;
}

export interface SearchMeta {
  total: number;
  /** Cursor for the next page. Absent when there are no more results. */
  scroll_token?: string;
}

export interface SearchResponse {
  data: PersonResult[] | CompanyResult[];
  meta: SearchMeta;
}

// ─── Enum options ─────────────────────────────────────────────────────────────

export const SENIORITY_OPTIONS = [
  { value: "cxo", label: "C-Suite (CXO)" },
  { value: "vp", label: "Vice President" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "entry", label: "Entry" },
  { value: "owner", label: "Owner" },
  { value: "partner", label: "Partner" },
  { value: "training", label: "Training" },
  { value: "unpaid", label: "Unpaid" },
];

export const FUNCTION_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "product", label: "Product" },
  { value: "finance", label: "Finance" },
  { value: "human_resources", label: "Human Resources" },
  { value: "operations", label: "Operations" },
  { value: "legal", label: "Legal" },
  { value: "research", label: "Research" },
  { value: "analyst", label: "Analyst" },
  { value: "creative", label: "Creative" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "support", label: "Support" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "partnerships", label: "Partnerships" },
  { value: "professional_service", label: "Professional Service" },
  { value: "public_service", label: "Public Service" },
  { value: "sales_engineering", label: "Sales Engineering" },
  { value: "advisory", label: "Advisory" },
  { value: "fulfillment", label: "Fulfillment" },
  { value: "hospitality", label: "Hospitality" },
  { value: "trade", label: "Trade" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "501-1000", label: "501–1,000" },
  { value: "1001-5000", label: "1,001–5,000" },
  { value: "5001-10000", label: "5,001–10,000" },
  { value: "10001+", label: "10,001+" },
];

export const COMPANY_TYPE_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "government", label: "Government" },
  { value: "educational", label: "Educational" },
  { value: "public_subsidiary", label: "Public Subsidiary" },
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

export const FUNDING_ROUND_OPTIONS = [
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "angel", label: "Angel" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "series_c", label: "Series C" },
  { value: "series_d", label: "Series D" },
  { value: "series_e", label: "Series E" },
  { value: "series_unknown", label: "Series (Unknown)" },
  { value: "convertible_note", label: "Convertible Note" },
  { value: "corporate_round", label: "Corporate Round" },
  { value: "debt_financing", label: "Debt Financing" },
  { value: "equity_crowdfunding", label: "Equity Crowdfunding" },
  { value: "grant", label: "Grant" },
  { value: "private_equity", label: "Private Equity" },
  { value: "post_ipo_equity", label: "Post-IPO Equity" },
  { value: "post_ipo_debt", label: "Post-IPO Debt" },
  { value: "undisclosed", label: "Undisclosed" },
];

export const INDUSTRY_OPTIONS = [
  "accounting", "airlines/aviation", "automotive", "banking", "biotechnology",
  "broadcast media", "capital markets", "chemicals", "civil engineering",
  "commercial real estate", "computer & network security", "computer games",
  "computer hardware", "computer networking", "computer software", "construction",
  "consumer electronics", "consumer goods", "defense & space", "e-learning",
  "education management", "electrical/electronic manufacturing", "entertainment",
  "environmental services", "financial services", "food & beverages",
  "government administration", "health, wellness and fitness", "higher education",
  "hospital & health care", "hospitality", "human resources",
  "information technology and services", "insurance", "internet",
  "investment banking", "investment management", "law practice", "legal services",
  "logistics and supply chain", "management consulting", "marketing and advertising",
  "media production", "medical devices", "medical practice", "mining & metals",
  "non-profit organization management", "oil & energy", "pharmaceuticals",
  "public relations and communications", "real estate", "research", "retail",
  "semiconductors", "staffing and recruiting", "telecommunications",
  "transportation/trucking/railroad", "venture capital & private equity", "wholesale",
];
