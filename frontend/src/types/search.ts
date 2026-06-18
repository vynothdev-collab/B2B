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
  githubUrl: string;
  languages: string;
  skills: string;
  interests: string;
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
  companyType: string;
  companyRevenue: string;
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
  hqMetro: string;
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
  // Role mix & hiring growth — multiple rules
  roleCompositionRules: RoleCompositionRule[];
}

export interface RoleCompositionRule {
  role: string;
  metric: "count" | "growth";
  min: string;
}

export const DEFAULT_PERSON_FILTERS: PersonFilters = {
  firstName: "", lastName: "", linkedinUrl: "",
  headline: "", summary: "", twitterHandle: "", githubUrl: "",
  languages: "", skills: "", interests: "", certifications: "",
  degree: "", school: "", fieldOfStudy: "", linkedinConnectionsMin: "",
  jobTitle: "", seniority: [], function: "",
  yearsExperienceMin: "", yearsExperienceMax: "",
  companyName: "", companyLinkedinUrl: "", companyDomain: "",
  industry: "", companySize: "", companyType: "", companyRevenue: "",
  pastCompanies: "", pastTitles: "", pastSeniority: [], pastFunction: "",
  country: "", state: "", city: "",
  hqCountry: "", hqState: "", hqCity: "",
};

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  companyName: "", websiteDomain: "",
  industry: "", type: "", stockExchange: "",
  hqCountry: "", hqState: "", hqCity: "", hqMetro: "",
  employeeCountMin: "", employeeCountMax: "",
  annualRevenue: "", employeeGrowthMin: "",
  yearFoundedMin: "", yearFoundedMax: "",
  lastFundingRound: "", totalFundingMin: "", mostRecentFundingAfter: "",
  roleCompositionRules: [],
};

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PersonResult {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  linkedin_username?: string;
  linkedin_connections?: number;
  industry?: string;
  // Job / title
  job_title?: string;
  job_title_role?: string;
  job_title_sub_role?: string;
  job_title_class?: string;
  job_title_levels?: string[];
  // Company
  job_company_id?: string;
  job_company_name?: string;
  job_company_website?: string;
  job_company_size?: string;
  job_company_founded?: number;
  job_company_industry?: string;
  job_company_linkedin_url?: string;
  job_company_location_country?: string;
  job_company_location_region?: string;
  job_company_location_locality?: string;
  // Location — PDL masks sensitive sub-fields as `true` when not revealed
  location_country?: string;
  location_region?: string | boolean;
  location_locality?: string | boolean;
  // Contact — masked as `true` until credits are spent to reveal
  work_email?: string | boolean;
  mobile_phone?: string | boolean;
  phone_numbers?: string[] | boolean;
  emails?: string[] | boolean;
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
  { value: "advisory", label: "Advisory" },
  { value: "analyst", label: "Analyst" },
  { value: "creative", label: "Creative" },
  { value: "education", label: "Education" },
  { value: "engineering", label: "Engineering" },
  { value: "finance", label: "Finance" },
  { value: "fulfillment", label: "Fulfillment" },
  { value: "health", label: "Health" },
  { value: "hospitality", label: "Hospitality" },
  { value: "human_resources", label: "Human Resources" },
  { value: "legal", label: "Legal" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "partnerships", label: "Partnerships" },
  { value: "product", label: "Product" },
  { value: "professional_service", label: "Professional Service" },
  { value: "public_service", label: "Public Service" },
  { value: "research", label: "Research" },
  { value: "sales", label: "Sales" },
  { value: "sales_engineering", label: "Sales Engineering" },
  { value: "support", label: "Support" },
  { value: "trade", label: "Trade" },
  { value: "unemployed", label: "Unemployed" },
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
  { value: "series_f", label: "Series F" },
  { value: "series_g", label: "Series G" },
  { value: "series_h", label: "Series H" },
  { value: "series_i", label: "Series I" },
  { value: "series_j", label: "Series J" },
  { value: "series_unknown", label: "Series (Unknown)" },
  { value: "convertible_note", label: "Convertible Note" },
  { value: "corporate_round", label: "Corporate Round" },
  { value: "debt_financing", label: "Debt Financing" },
  { value: "equity_crowdfunding", label: "Equity Crowdfunding" },
  { value: "product_crowdfunding", label: "Product Crowdfunding" },
  { value: "grant", label: "Grant" },
  { value: "initial_coin_offering", label: "Initial Coin Offering" },
  { value: "private_equity", label: "Private Equity" },
  { value: "post_ipo_equity", label: "Post-IPO Equity" },
  { value: "post_ipo_debt", label: "Post-IPO Debt" },
  { value: "post_ipo_secondary", label: "Post-IPO Secondary" },
  { value: "secondary_market", label: "Secondary Market" },
  { value: "funding_round", label: "Funding Round" },
  { value: "non_equity_assistance", label: "Non-equity Assistance" },
  { value: "undisclosed", label: "Undisclosed" },
];

export const COUNTRY_OPTIONS = [
  { value: "united states", label: "United States" },
  { value: "united kingdom", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
  { value: "india", label: "India" },
  { value: "germany", label: "Germany" },
  { value: "france", label: "France" },
  { value: "netherlands", label: "Netherlands" },
  { value: "sweden", label: "Sweden" },
  { value: "switzerland", label: "Switzerland" },
  { value: "denmark", label: "Denmark" },
  { value: "norway", label: "Norway" },
  { value: "finland", label: "Finland" },
  { value: "ireland", label: "Ireland" },
  { value: "belgium", label: "Belgium" },
  { value: "austria", label: "Austria" },
  { value: "spain", label: "Spain" },
  { value: "italy", label: "Italy" },
  { value: "portugal", label: "Portugal" },
  { value: "poland", label: "Poland" },
  { value: "czech republic", label: "Czech Republic" },
  { value: "hungary", label: "Hungary" },
  { value: "romania", label: "Romania" },
  { value: "ukraine", label: "Ukraine" },
  { value: "russia", label: "Russia" },
  { value: "turkey", label: "Turkey" },
  { value: "israel", label: "Israel" },
  { value: "united arab emirates", label: "United Arab Emirates" },
  { value: "saudi arabia", label: "Saudi Arabia" },
  { value: "qatar", label: "Qatar" },
  { value: "singapore", label: "Singapore" },
  { value: "hong kong", label: "Hong Kong" },
  { value: "japan", label: "Japan" },
  { value: "china", label: "China" },
  { value: "south korea", label: "South Korea" },
  { value: "taiwan", label: "Taiwan" },
  { value: "indonesia", label: "Indonesia" },
  { value: "malaysia", label: "Malaysia" },
  { value: "thailand", label: "Thailand" },
  { value: "philippines", label: "Philippines" },
  { value: "vietnam", label: "Vietnam" },
  { value: "pakistan", label: "Pakistan" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "new zealand", label: "New Zealand" },
  { value: "brazil", label: "Brazil" },
  { value: "mexico", label: "Mexico" },
  { value: "argentina", label: "Argentina" },
  { value: "colombia", label: "Colombia" },
  { value: "chile", label: "Chile" },
  { value: "south africa", label: "South Africa" },
  { value: "nigeria", label: "Nigeria" },
  { value: "kenya", label: "Kenya" },
  { value: "egypt", label: "Egypt" },
  { value: "greece", label: "Greece" },
];

export const US_STATE_OPTIONS = [
  { value: "alabama", label: "Alabama" },
  { value: "alaska", label: "Alaska" },
  { value: "arizona", label: "Arizona" },
  { value: "arkansas", label: "Arkansas" },
  { value: "california", label: "California" },
  { value: "colorado", label: "Colorado" },
  { value: "connecticut", label: "Connecticut" },
  { value: "delaware", label: "Delaware" },
  { value: "florida", label: "Florida" },
  { value: "georgia", label: "Georgia" },
  { value: "hawaii", label: "Hawaii" },
  { value: "idaho", label: "Idaho" },
  { value: "illinois", label: "Illinois" },
  { value: "indiana", label: "Indiana" },
  { value: "iowa", label: "Iowa" },
  { value: "kansas", label: "Kansas" },
  { value: "kentucky", label: "Kentucky" },
  { value: "louisiana", label: "Louisiana" },
  { value: "maine", label: "Maine" },
  { value: "maryland", label: "Maryland" },
  { value: "massachusetts", label: "Massachusetts" },
  { value: "michigan", label: "Michigan" },
  { value: "minnesota", label: "Minnesota" },
  { value: "mississippi", label: "Mississippi" },
  { value: "missouri", label: "Missouri" },
  { value: "montana", label: "Montana" },
  { value: "nebraska", label: "Nebraska" },
  { value: "nevada", label: "Nevada" },
  { value: "new hampshire", label: "New Hampshire" },
  { value: "new jersey", label: "New Jersey" },
  { value: "new mexico", label: "New Mexico" },
  { value: "new york", label: "New York" },
  { value: "north carolina", label: "North Carolina" },
  { value: "north dakota", label: "North Dakota" },
  { value: "ohio", label: "Ohio" },
  { value: "oklahoma", label: "Oklahoma" },
  { value: "oregon", label: "Oregon" },
  { value: "pennsylvania", label: "Pennsylvania" },
  { value: "rhode island", label: "Rhode Island" },
  { value: "south carolina", label: "South Carolina" },
  { value: "south dakota", label: "South Dakota" },
  { value: "tennessee", label: "Tennessee" },
  { value: "texas", label: "Texas" },
  { value: "utah", label: "Utah" },
  { value: "vermont", label: "Vermont" },
  { value: "virginia", label: "Virginia" },
  { value: "washington", label: "Washington" },
  { value: "west virginia", label: "West Virginia" },
  { value: "wisconsin", label: "Wisconsin" },
  { value: "wyoming", label: "Wyoming" },
  { value: "district of columbia", label: "District of Columbia" },
];

export const ROLE_METRIC_OPTIONS = [
  { value: "count", label: "Employee count" },
  { value: "growth", label: "12-month growth %" },
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
