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
  name: "",
  jobTitle: [],
  departments: [],
  seniority: [],
  companies: [],
  personLocations: [],
  companyHQLocations: [],
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
  companyStatus: string[];
  companyHowTheySell: string[];
  companyMoreFlags: string[];
  companyRevenueModel: string[];
  jobPostingKeywords: string[];
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
  companyStatus: [],
  companyHowTheySell: [],
  companyMoreFlags: [],
  companyRevenueModel: [],
  jobPostingKeywords: [],
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
  linkedin_url?: string;
  linkedin_canonical_shorthand_name?: string;
  connections_count?: number;
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
  location_country?: string;
  location_state?: string;
  location_city?: string;
  primary_professional_email?: string;
  primary_professional_email_status?: string;
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
  canonical_linkedin_url?: string;
  type?: string;
  is_public?: boolean;
  [key: string]: unknown;
}

export interface SearchMeta {
  total: number;
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
  { value: "owner", label: "Founder/Owner" },
  { value: "cxo", label: "C-Suite" },
  { value: "partner", label: "Partner" },
  { value: "vp", label: "Vice President" },
  { value: "head", label: "Head" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "intern", label: "Intern" },
  { value: "entry", label: "Entry" },
];

export interface DepartmentOption {
  value: string;
  label: string;
  children?: DepartmentOption[];
}

export const DEPARTMENT_OPTIONS_HIERARCHICAL: DepartmentOption[] = [
  {
    value: "product", label: "Product", children: [
      { value: "product_development", label: "Product Development" },
      { value: "product_management", label: "Product Management" },
      { value: "other_product", label: "Other Product" },
    ],
  },
  {
    value: "engineering", label: "Engineering & Technical", children: [
      { value: "ai_ml", label: "Artificial Intelligence / Machine Learning" },
      { value: "bioengineering", label: "Bioengineering" },
      { value: "biometrics", label: "Biometrics" },
      { value: "business_intelligence", label: "Business Intelligence" },
      { value: "chemical_engineering", label: "Chemical Engineering" },
      { value: "data_science", label: "Data Science & Analysis" },
      { value: "devops", label: "DevOps" },
      { value: "digital_transformation", label: "Digital Transformation" },
      { value: "emerging_technology", label: "Emerging Technology / Innovation" },
      { value: "industrial_engineering", label: "Industrial Engineering" },
      { value: "mechanic", label: "Mechanic" },
      { value: "mobile_development", label: "Mobile Development" },
      { value: "project_management", label: "Project Management" },
      { value: "research_development", label: "Research & Development" },
      { value: "scrum_agile", label: "Scrum Master / Agile Coach" },
      { value: "software_development", label: "Software Development" },
      { value: "technician", label: "Technician" },
      { value: "technology_operations", label: "Technology Operations" },
      { value: "test_qa", label: "Test / Quality Assurance" },
    ],
  },
  {
    value: "design", label: "Design", children: [
      { value: "graphic_design", label: "Graphic / Visual / Brand Design" },
      { value: "other_design", label: "Other Design" },
    ],
  },
  {
    value: "education", label: "Education & Coaching", children: [
      { value: "teacher", label: "Teacher" },
      { value: "superintendent", label: "Superintendent" },
      { value: "professor", label: "Professor" },
      { value: "coach_trainer", label: "Coach / Trainer" },
    ],
  },
  {
    value: "finance", label: "Finance", children: [
      { value: "financial_reporting", label: "Financial Reporting" },
      { value: "financial_systems", label: "Financial Systems" },
      { value: "accounting", label: "Accounting" },
      { value: "finance_banking", label: "Finance & Banking" },
      { value: "financial_planning", label: "Financial Planning, Strategy & Analysis" },
      { value: "internal_audit", label: "Internal Audit & Control" },
      { value: "investor_relations", label: "Investor Relations" },
      { value: "mergers_acquisitions", label: "Mergers & Acquisitions" },
      { value: "real_estate_finance", label: "Real Estate Finance" },
      { value: "financial_risk", label: "Financial Risk" },
      { value: "sourcing_procurement", label: "Sourcing / Procurement" },
      { value: "tax", label: "Tax" },
      { value: "treasury", label: "Treasury" },
    ],
  },
  {
    value: "human_resources", label: "Human Resources", children: [
      { value: "compensation_benefits", label: "Compensation & Benefits" },
      { value: "culture_diversity", label: "Culture, Diversity & Inclusion" },
      { value: "health_safety", label: "Health & Safety" },
      { value: "hr_business_partner", label: "HR Business Partner" },
      { value: "learning_development", label: "Learning & Development" },
      { value: "organizational_development", label: "Organizational Development" },
      { value: "recruiting_talent", label: "Recruiting & Talent Acquisition" },
      { value: "talent_management", label: "Talent Management" },
      { value: "workforce_management", label: "Workforce Management" },
      { value: "people_operations", label: "People Operations" },
      { value: "other_hr", label: "Other Human Resources" },
    ],
  },
  {
    value: "information_technology", label: "Information Technology", children: [
      { value: "cloud_engineering", label: "Cloud Engineering" },
      { value: "data_center", label: "Data Center" },
      { value: "data_warehouse", label: "Data Warehouse" },
      { value: "database_admin", label: "Database Administration" },
      { value: "ecommerce_development", label: "eCommerce Development" },
      { value: "help_desk", label: "Help Desk / Desktop Services" },
      { value: "information_security", label: "Information Security" },
      { value: "it_asset_management", label: "IT Asset Management" },
      { value: "it_audit", label: "IT Audit / IT Compliance" },
      { value: "it_recruitment", label: "IT Recruitment" },
      { value: "it_procurement", label: "IT Procurement" },
      { value: "it_strategy", label: "IT Strategy" },
      { value: "it_training", label: "IT Training" },
      { value: "networking", label: "Networking" },
      { value: "technical_lead", label: "Technical Lead" },
      { value: "quality_assurance", label: "Quality Assurance" },
      { value: "retail_store_systems", label: "Retail / Store Systems" },
      { value: "servers", label: "Servers" },
      { value: "disaster_recovery", label: "Disaster Recovery" },
      { value: "telecommunications", label: "Telecommunications" },
    ],
  },
  {
    value: "legal", label: "Legal", children: [
      { value: "compliance", label: "Compliance" },
      { value: "contracts", label: "Contracts" },
      { value: "corporate_secretary", label: "Corporate Secretary" },
      { value: "ediscovery", label: "eDiscovery" },
      { value: "ethics", label: "Ethics" },
      { value: "governance", label: "Governance" },
      { value: "governmental_affairs", label: "Governmental Affairs & Regulatory Law" },
      { value: "intellectual_property", label: "Intellectual Property & Patent" },
      { value: "labor_employment", label: "Labor & Employment" },
      { value: "lawyer_attorney", label: "Lawyer / Attorney" },
      { value: "legal_counsel", label: "Legal Counsel" },
      { value: "legal_operations", label: "Legal Operations" },
      { value: "litigation", label: "Litigation" },
      { value: "privacy", label: "Privacy" },
      { value: "other_legal", label: "Other Legal" },
    ],
  },
  {
    value: "marketing", label: "Marketing", children: [
      { value: "advertising", label: "Advertising" },
      { value: "brand_management", label: "Brand Management" },
      { value: "content_marketing", label: "Content Marketing" },
      { value: "customer_experience", label: "Customer Experience" },
      { value: "customer_marketing", label: "Customer Marketing" },
      { value: "growth_demand_generation", label: "Growth & Demand Generation" },
      { value: "digital_marketing", label: "Digital Marketing" },
      { value: "ecommerce_marketing", label: "eCommerce Marketing" },
      { value: "event_field_marketing", label: "Event & Field Marketing" },
      { value: "lead_generation", label: "Lead Generation" },
      { value: "marketing_operations", label: "Marketing Operations" },
      { value: "product_marketing", label: "Product Marketing" },
      { value: "public_relations", label: "Public Relations" },
      { value: "seo", label: "SEO" },
      { value: "social_media", label: "Social Media Marketing" },
      { value: "technical_marketing", label: "Technical Marketing" },
    ],
  },
  {
    value: "medical_health", label: "Medical & Health", children: [
      { value: "anesthesiology", label: "Anesthesiology" },
      { value: "chiropractics", label: "Chiropractics" },
      { value: "clinical_systems", label: "Clinical Systems" },
      { value: "dentistry", label: "Dentistry" },
      { value: "dermatology", label: "Dermatology" },
      { value: "doctors_physicians", label: "Doctors / Physicians" },
      { value: "epidemiology", label: "Epidemiology" },
      { value: "fire_responder", label: "Fire Responder" },
      { value: "infectious_disease", label: "Infectious Disease" },
      { value: "medical_administration", label: "Medical Administration" },
      { value: "medical_education", label: "Medical Education & Training" },
      { value: "clinical_research", label: "Clinical Research" },
      { value: "neurology", label: "Neurology" },
      { value: "nursing", label: "Nursing" },
      { value: "nutrition_dietetics", label: "Nutrition & Dietetics" },
      { value: "obstetrics_gynecology", label: "Obstetrics / Gynecology" },
      { value: "oncology", label: "Oncology" },
      { value: "ophthalmology", label: "Ophthalmology" },
      { value: "optometry", label: "Optometry" },
      { value: "orthopedics", label: "Orthopedics" },
      { value: "radiology", label: "Radiology" },
      { value: "public_health", label: "Public Health" },
      { value: "psychology", label: "Psychology" },
      { value: "psychiatry", label: "Psychiatry" },
      { value: "physical_therapy", label: "Physical Therapy" },
      { value: "pharmacy", label: "Pharmacy" },
      { value: "pediatrics", label: "Pediatrics" },
      { value: "pathology", label: "Pathology" },
    ],
  },
  {
    value: "consulting", label: "Consulting", children: [
      { value: "consultant", label: "Consultant" },
    ],
  },
  {
    value: "sales", label: "Sales", children: [
      { value: "sales_training", label: "Sales Training" },
      { value: "sales_operations", label: "Sales Operations" },
      { value: "sales_engineering", label: "Sales Engineering" },
      { value: "sales_enablement", label: "Sales Enablement" },
      { value: "revenue_operations", label: "Revenue Operations" },
      { value: "partnerships", label: "Partnerships" },
      { value: "sales_development", label: "Sales Development" },
      { value: "account_executive", label: "Account Executive" },
      { value: "field_sales", label: "Field / Outside Sales" },
      { value: "customer_success", label: "Customer Success" },
      { value: "customer_retention", label: "Customer Retention & Development" },
      { value: "channel_sales", label: "Channel Sales" },
      { value: "account_management", label: "Account Management" },
      { value: "other_sales", label: "Other Sales" },
    ],
  },
  {
    value: "operations", label: "Operations", children: [
      { value: "supply_chain", label: "Supply Chain" },
      { value: "store_operations", label: "Store Operations" },
      { value: "safety", label: "Safety" },
      { value: "real_estate", label: "Real Estate" },
      { value: "quality_management", label: "Quality Management" },
      { value: "physical_security", label: "Physical Security" },
      { value: "office_operations", label: "Office Operations" },
      { value: "logistics", label: "Logistics" },
      { value: "leasing", label: "Leasing" },
      { value: "facilities_management", label: "Facilities Management" },
      { value: "customer_service", label: "Customer Service / Support" },
      { value: "corporate_strategy", label: "Corporate Strategy" },
      { value: "construction", label: "Construction" },
      { value: "call_center", label: "Call Center" },
    ],
  },
];

function flattenDepts(opts: DepartmentOption[]): { value: string; label: string }[] {
  return opts.flatMap((o) => [{ value: o.value, label: o.label }, ...(o.children ? flattenDepts(o.children) : [])]);
}

export const DEPARTMENT_OPTIONS = flattenDepts(DEPARTMENT_OPTIONS_HIERARCHICAL);

export const COMPANY_STATUS_OPTIONS = [
  { value: "private", label: "Private", count: "177M" },
  { value: "public", label: "Public", count: "76M" },
  { value: "nonprofit", label: "Non-profit", count: "17M" },
  { value: "other", label: "Other", count: "35M" },
];

export const COMPANY_TYPE_OPTIONS = [
  { value: "saas", label: "SaaS", count: "6M" },
  { value: "marketplace", label: "Marketplace", count: "687K" },
  { value: "ecommerce", label: "E-commerce", count: "4M" },
  { value: "agency", label: "Agency", count: "6M" },
  { value: "consulting", label: "Consulting", count: "9M" },
  { value: "manufacturing", label: "Manufacturing", count: "16M" },
  { value: "media_publisher", label: "Media/Publisher", count: "2M" },
  { value: "education", label: "Education", count: "8M" },
  { value: "non_profit", label: "Non-Profit", count: "3M" },
  { value: "government", label: "Government", count: "3M" },
  { value: "fintech", label: "FinTech", count: "3M" },
  { value: "healthtech", label: "HealthTech", count: "1M" },
  { value: "ai_ml", label: "AI/ML" },
  { value: "hardware", label: "Hardware" },
  { value: "professional_services", label: "Professional Services" },
  { value: "platform", label: "Platform" },
  { value: "data_analytics", label: "Data/Analytics" },
  { value: "franchise", label: "Franchise" },
  { value: "logistics", label: "Logistics" },
  { value: "real_estate", label: "Real Estate" },
  { value: "legal", label: "Legal" },
  { value: "insurance", label: "Insurance" },
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "construction", label: "Construction", count: "2M" },
  { value: "telecommunications", label: "Telecommunications", count: "770K" },
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
  { value: "IT Services and IT Consulting", label: "IT Services and IT Consulting" },
  { value: "Software Development", label: "Software Development" },
  { value: "Technology, Information and Internet", label: "Technology, Information and Internet" },
  { value: "Computer and Network Security", label: "Computer and Network Security" },
  { value: "Computer Hardware Manufacturing", label: "Computer Hardware Manufacturing" },
  { value: "Computer Networking Products", label: "Computer Networking Products" },
  { value: "Data Infrastructure and Analytics", label: "Data Infrastructure and Analytics" },
  { value: "Information Services", label: "Information Services" },
  { value: "Internet Publishing", label: "Internet Publishing" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Semiconductor Manufacturing", label: "Semiconductor Manufacturing" },
  { value: "Robotics Engineering", label: "Robotics Engineering" },
  { value: "Artificial Intelligence", label: "Artificial Intelligence" },
  { value: "Blockchain Services", label: "Blockchain Services" },
  { value: "Cloud Computing", label: "Cloud Computing" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Business Consulting and Services", label: "Business Consulting and Services" },
  { value: "Management Consulting", label: "Management Consulting" },
  { value: "Strategic Management Services", label: "Strategic Management Services" },
  { value: "Human Resources Services", label: "Human Resources Services" },
  { value: "Staffing and Recruiting", label: "Staffing and Recruiting" },
  { value: "Outsourcing and Offshoring Consulting", label: "Outsourcing and Offshoring Consulting" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Research Services", label: "Research Services" },
  { value: "Advertising Services", label: "Advertising Services" },
  { value: "Marketing Services", label: "Marketing Services" },
  { value: "Public Relations and Communications Services", label: "Public Relations and Communications Services" },
  { value: "Market Research", label: "Market Research" },
  { value: "Design Services", label: "Design Services" },
  { value: "Graphic Design", label: "Graphic Design" },
  { value: "Financial Services", label: "Financial Services" },
  { value: "Banking", label: "Banking" },
  { value: "Investment Banking", label: "Investment Banking" },
  { value: "Investment Management", label: "Investment Management" },
  { value: "Insurance", label: "Insurance" },
  { value: "Accounting", label: "Accounting" },
  { value: "Venture Capital and Private Equity", label: "Venture Capital and Private Equity" },
  { value: "Capital Markets", label: "Capital Markets" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Commercial Real Estate", label: "Commercial Real Estate" },
  { value: "Hospitals and Health Care", label: "Hospitals and Health Care" },
  { value: "Medical Practices", label: "Medical Practices" },
  { value: "Mental Health Care", label: "Mental Health Care" },
  { value: "Pharmaceutical Manufacturing", label: "Pharmaceutical Manufacturing" },
  { value: "Biotechnology Research", label: "Biotechnology Research" },
  { value: "Medical Equipment Manufacturing", label: "Medical Equipment Manufacturing" },
  { value: "Wellness and Fitness Services", label: "Wellness and Fitness Services" },
  { value: "Higher Education", label: "Higher Education" },
  { value: "Primary and Secondary Education", label: "Primary and Secondary Education" },
  { value: "Education Administration Programs", label: "Education Administration Programs" },
  { value: "E-Learning Providers", label: "E-Learning Providers" },
  { value: "Retail", label: "Retail" },
  { value: "General Retail", label: "General Retail" },
  { value: "Retail Apparel and Fashion", label: "Retail Apparel and Fashion" },
  { value: "Retail Luxury Goods and Jewelry", label: "Retail Luxury Goods and Jewelry" },
  { value: "Retail Groceries", label: "Retail Groceries" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Consumer Goods", label: "Consumer Goods" },
  { value: "Food and Beverage Services", label: "Food and Beverage Services" },
  { value: "Food and Beverage Manufacturing", label: "Food and Beverage Manufacturing" },
  { value: "Restaurants", label: "Restaurants" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Travel Arrangements", label: "Travel Arrangements" },
  { value: "Airlines and Aviation", label: "Airlines and Aviation" },
  { value: "Automotive", label: "Automotive" },
  { value: "Motor Vehicle Manufacturing", label: "Motor Vehicle Manufacturing" },
  { value: "Transportation, Logistics and Supply Chain", label: "Transportation, Logistics and Supply Chain" },
  { value: "Truck Transportation", label: "Truck Transportation" },
  { value: "Warehousing and Storage", label: "Warehousing and Storage" },
  { value: "Construction", label: "Construction" },
  { value: "Architecture and Planning", label: "Architecture and Planning" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Industrial Machinery Manufacturing", label: "Industrial Machinery Manufacturing" },
  { value: "Automation Machinery Manufacturing", label: "Automation Machinery Manufacturing" },
  { value: "Electrical Equipment Manufacturing", label: "Electrical Equipment Manufacturing" },
  { value: "Chemical Manufacturing", label: "Chemical Manufacturing" },
  { value: "Textile Manufacturing", label: "Textile Manufacturing" },
  { value: "Packaging and Containers Manufacturing", label: "Packaging and Containers Manufacturing" },
  { value: "Oil and Gas", label: "Oil and Gas" },
  { value: "Renewable Energy", label: "Renewable Energy" },
  { value: "Utilities", label: "Utilities" },
  { value: "Environmental Services", label: "Environmental Services" },
  { value: "Mining", label: "Mining" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Farming", label: "Farming" },
  { value: "Legal Services", label: "Legal Services" },
  { value: "Law Practice", label: "Law Practice" },
  { value: "Government Administration", label: "Government Administration" },
  { value: "Public Policy", label: "Public Policy" },
  { value: "Non-profit Organizations", label: "Non-profit Organizations" },
  { value: "Civic and Social Organizations", label: "Civic and Social Organizations" },
  { value: "Media Production", label: "Media Production" },
  { value: "Entertainment Providers", label: "Entertainment Providers" },
  { value: "Broadcast Media Production", label: "Broadcast Media Production" },
  { value: "Newspaper Publishing", label: "Newspaper Publishing" },
  { value: "Book Publishing", label: "Book Publishing" },
  { value: "Online Media", label: "Online Media" },
  { value: "Gaming", label: "Gaming" },
  { value: "Sports", label: "Sports" },
  { value: "Events Services", label: "Events Services" },
  { value: "Security and Investigations", label: "Security and Investigations" },
  { value: "Facilities Services", label: "Facilities Services" },
  { value: "Consumer Services", label: "Consumer Services" },
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
