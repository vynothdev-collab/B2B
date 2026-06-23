export type TabType = "people" | "company";


export interface PersonFilters {
  name: string;
  jobTitle: string[];
  departments: string[];
  seniority: string[];
  companies: string[];
  personLocations: string[];
  companyHQLocations: string[];
  requireWorkEmail: boolean;
  requireMobile: boolean;
  contactLogic: "and" | "or";
  companyType: string[];
  technologies: string[];
  revenueBuckets: string[];
  fundingMin: string;
  fundingMax: string;
  headcountGrowthMin: string;
  headcountGrowthMax: string;
  headcountByDepartment: string;
  headcountByDepartmentMin: string;
  headcountByDepartmentMax: string;
  headcountByLocationCountry: string;
  headcountByLocationMin: string;
  headcountByLocationMax: string;
  foundedMin: string;
  foundedMax: string;
}

export const DEFAULT_PERSON_FILTERS: PersonFilters = {
  name: "",
  jobTitle: [],
  departments: [],
  seniority: [],
  companies: [],
  personLocations: [],
  companyHQLocations: [],
  requireWorkEmail: false,
  requireMobile: false,
  contactLogic: "and",
  companyType: [],
  technologies: [],
  revenueBuckets: [],
  fundingMin: "",
  fundingMax: "",
  headcountGrowthMin: "",
  headcountGrowthMax: "",
  headcountByDepartment: "",
  headcountByDepartmentMin: "",
  headcountByDepartmentMax: "",
  headcountByLocationCountry: "",
  headcountByLocationMin: "",
  headcountByLocationMax: "",
  foundedMin: "",
  foundedMax: "",
};


export interface CompanyFilters {
  companies: string[];
  locations: string[];
  type: string[];
  employeeCountMin: string;
  employeeCountMax: string;
  industries: string[];
  technologies: string[];
  revenueBuckets: string[];
  fundingMin: string;
  fundingMax: string;
  fundingStages: string[];
  headcountGrowthTimeframe: "3_month" | "6_month" | "12_month" | "24_month";
  headcountGrowthMin: string;
  headcountGrowthMax: string;
  headcountByLocationCountry: string;
  headcountByLocationMin: string;
  headcountByLocationMax: string;
  headcountByDepartment: string;
  headcountByDepartmentMin: string;
  headcountByDepartmentMax: string;
  foundedMin: string;
  foundedMax: string;
}

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  companies: [],
  locations: [],
  type: [],
  employeeCountMin: "",
  employeeCountMax: "",
  industries: [],
  technologies: [],
  revenueBuckets: [],
  fundingMin: "",
  fundingMax: "",
  fundingStages: [],
  headcountGrowthTimeframe: "12_month",
  headcountGrowthMin: "",
  headcountGrowthMax: "",
  headcountByLocationCountry: "",
  headcountByLocationMin: "",
  headcountByLocationMax: "",
  headcountByDepartment: "",
  headcountByDepartmentMin: "",
  headcountByDepartmentMax: "",
  foundedMin: "",
  foundedMax: "",
};

export const GROWTH_TIMEFRAME_OPTIONS = [
  { value: "3_month", label: "3 months" },
  { value: "6_month", label: "6 months" },
  { value: "12_month", label: "12 months" },
  { value: "24_month", label: "24 months" },
];


export interface PersonResult {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  linkedin_username?: string;
  linkedin_connections?: number;
  industry?: string;
  job_title?: string;
  job_title_role?: string;
  job_title_sub_role?: string;
  job_title_class?: string;
  job_title_levels?: string[];
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
  location_country?: string;
  location_region?: string | boolean;
  location_locality?: string | boolean;
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
  scroll_token?: string;
}

export interface SearchResponse {
  data: PersonResult[] | CompanyResult[];
  meta: SearchMeta;
}


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

export const DEPARTMENT_OPTIONS = [
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

export const COMPANY_TYPE_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
  { value: "public_subsidiary", label: "Public Subsidiary" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "government", label: "Government" },
  { value: "educational", label: "Educational" },
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

export const EMPLOYEE_COUNT_PRESETS = [
  { label: "1 – 10", min: 1, max: 10 },
  { label: "11 – 50", min: 11, max: 50 },
  { label: "51 – 200", min: 51, max: 200 },
  { label: "201 – 500", min: 201, max: 500 },
  { label: "501 – 1,000", min: 501, max: 1000 },
  { label: "1,001 – 5,000", min: 1001, max: 5000 },
  { label: "5,001 – 10,000", min: 5001, max: 10000 },
  { label: "10,001+", min: 10001 },
];

export const FUNDING_PRESETS = [
  { label: "Under $1M", max: 1_000_000 },
  { label: "$1M – $10M", min: 1_000_000, max: 10_000_000 },
  { label: "$10M – $50M", min: 10_000_000, max: 50_000_000 },
  { label: "$50M – $100M", min: 50_000_000, max: 100_000_000 },
  { label: "$100M – $500M", min: 100_000_000, max: 500_000_000 },
  { label: "$500M – $1B", min: 500_000_000, max: 1_000_000_000 },
  { label: "$1B+", min: 1_000_000_000 },
];

export const GROWTH_PRESETS = [
  { label: "Decline (<0%)", max: 0 },
  { label: "0 – 25%", min: 0, max: 25 },
  { label: "25 – 50%", min: 25, max: 50 },
  { label: "50 – 100%", min: 50, max: 100 },
  { label: "100 – 200%", min: 100, max: 200 },
  { label: "200%+", min: 200 },
];

export const FOUNDED_YEAR_PRESETS = [
  { label: "2020 – 2026", min: 2020, max: 2026 },
  { label: "2015 – 2019", min: 2015, max: 2019 },
  { label: "2010 – 2014", min: 2010, max: 2014 },
  { label: "2000 – 2009", min: 2000, max: 2009 },
  { label: "1990 – 1999", min: 1990, max: 1999 },
  { label: "Before 1990", max: 1989 },
];

export const HEADCOUNT_RANGE_PRESETS = EMPLOYEE_COUNT_PRESETS;

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
  { value: "computer software", label: "Computer Software" },
  { value: "information technology and services", label: "Information Technology & Services" },
  { value: "internet", label: "Internet" },
  { value: "computer hardware", label: "Computer Hardware" },
  { value: "computer networking", label: "Computer Networking" },
  { value: "computer & network security", label: "Computer & Network Security" },
  { value: "computer games", label: "Computer Games" },
  { value: "semiconductors", label: "Semiconductors" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "wireless", label: "Wireless" },
  { value: "nanotechnology", label: "Nanotechnology" },
  { value: "financial services", label: "Financial Services" },
  { value: "banking", label: "Banking" },
  { value: "investment banking", label: "Investment Banking" },
  { value: "investment management", label: "Investment Management" },
  { value: "venture capital & private equity", label: "Venture Capital & Private Equity" },
  { value: "capital markets", label: "Capital Markets" },
  { value: "insurance", label: "Insurance" },
  { value: "accounting", label: "Accounting" },
  { value: "hospital & health care", label: "Hospital & Health Care" },
  { value: "pharmaceuticals", label: "Pharmaceuticals" },
  { value: "medical devices", label: "Medical Devices" },
  { value: "medical practice", label: "Medical Practice" },
  { value: "biotechnology", label: "Biotechnology" },
  { value: "health, wellness and fitness", label: "Health, Wellness & Fitness" },
  { value: "higher education", label: "Higher Education" },
  { value: "education management", label: "Education Management" },
  { value: "e-learning", label: "E-Learning" },
  { value: "research", label: "Research" },
  { value: "management consulting", label: "Management Consulting" },
  { value: "staffing and recruiting", label: "Staffing & Recruiting" },
  { value: "human resources", label: "Human Resources" },
  { value: "legal services", label: "Legal Services" },
  { value: "marketing and advertising", label: "Marketing & Advertising" },
  { value: "public relations and communications", label: "Public Relations & Communications" },
  { value: "outsourcing/offshoring", label: "Outsourcing / Offshoring" },
  { value: "entertainment", label: "Entertainment" },
  { value: "media production", label: "Media Production" },
  { value: "publishing", label: "Publishing" },
  { value: "online media", label: "Online Media" },
  { value: "real estate", label: "Real Estate" },
  { value: "construction", label: "Construction" },
  { value: "retail", label: "Retail" },
  { value: "consumer goods", label: "Consumer Goods" },
  { value: "food & beverages", label: "Food & Beverages" },
  { value: "apparel & fashion", label: "Apparel & Fashion" },
  { value: "automotive", label: "Automotive" },
  { value: "chemicals", label: "Chemicals" },
  { value: "machinery", label: "Machinery" },
  { value: "oil & energy", label: "Oil & Energy" },
  { value: "logistics and supply chain", label: "Logistics & Supply Chain" },
  { value: "transportation/trucking/railroad", label: "Transportation / Trucking / Railroad" },
  { value: "government administration", label: "Government Administration" },
  { value: "non-profit organization management", label: "Non-Profit Organization Management" },
  { value: "hospitality", label: "Hospitality" },
  { value: "restaurants", label: "Restaurants" },
  { value: "leisure, travel & tourism", label: "Leisure, Travel & Tourism" },
];

export const KEYWORDS_STATIC = [
  "Hiring",
  "Saas",
  "B2B",
  "AI",
  "Cybersecurity",
  "Climate Tech",
  "Fintech",
  "Healthtech",
  "DevTools",
  "Open Source",
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

export const COMPANY_STATUS_STATIC = [
  { value: "active", label: "Active" },
  { value: "acquired", label: "Acquired" },
  { value: "closed", label: "Closed" },
  { value: "ipo", label: "IPO" },
];

export const BUSINESS_MODEL_STATIC = [
  { value: "b2b", label: "B2B" },
  { value: "b2c", label: "B2C" },
  { value: "b2b2c", label: "B2B2C" },
  { value: "marketplace", label: "Marketplace" },
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
];
