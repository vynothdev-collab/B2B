export type TabType = "people" | "company";


export interface PersonFilters {
  name: string;
  linkedinUrls: string[];
  languages: string[];
  skills: string[];
  certifications: string;
  degree: string[];
  school: string;
  fieldOfStudy: string;
  jobTitle: string[];
  seniority: string[];
  department: string[];
  yearsExperienceMin: string;
  yearsExperienceMax: string;
  companyName: string[];
  companyLinkedinUrls: string[];
  companyDomain: string;
  industry: string[];
  companySize: string[];
  companyType: string[];
  companyRevenue: string[];
  country: string[];
  state: string[];
  city: string;
  hqCountry: string[];
  hqState: string[];
  hqCity: string;
}

export interface CompanyFilters {
  companyName: string;
  websiteDomain: string;
  industry: string[];
  type: string[];
  stockExchange: string;
  hqCountry: string[];
  hqState: string[];
  hqCity: string;
  hqMetro: string;
  employeeCountRanges: string[];
  employeeCountMin: string;
  employeeCountMax: string;
  annualRevenue: string[];
  employeeGrowthMin: string;
  yearFoundedMin: string;
  yearFoundedMax: string;
  lastFundingRound: string[];
  totalFundingMin: string;
  mostRecentFundingAfter: string;
  roleCompositionRules: RoleCompositionRule[];
}

export interface RoleCompositionRule {
  role: string;
  minCount: string;
  minGrowth: string;
}

export const DEFAULT_PERSON_FILTERS: PersonFilters = {
  name: "", linkedinUrls: [],
  languages: [], skills: [], certifications: "",
  degree: [], school: "", fieldOfStudy: "",
  jobTitle: [], seniority: [], department: [],
  yearsExperienceMin: "", yearsExperienceMax: "",
  companyName: [], companyLinkedinUrls: [], companyDomain: "",
  industry: [], companySize: [], companyType: [], companyRevenue: [],
  country: [], state: [], city: "",
  hqCountry: [], hqState: [], hqCity: "",
};

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  companyName: "", websiteDomain: "",
  industry: [], type: [], stockExchange: "",
  hqCountry: [], hqState: [], hqCity: "", hqMetro: "",
  employeeCountRanges: [], employeeCountMin: "", employeeCountMax: "",
  annualRevenue: [], employeeGrowthMin: "",
  yearFoundedMin: "", yearFoundedMax: "",
  lastFundingRound: [], totalFundingMin: "", mostRecentFundingAfter: "",
  roleCompositionRules: [],
};


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


export const DEGREE_OPTIONS = [
  { value: "associates", label: "Associates" },
  { value: "associate of arts", label: "Associate of Arts" },
  { value: "bachelors", label: "Bachelor's (Any)" },
  { value: "bachelor of aerospace engineering", label: "Bachelor of Aerospace Engineering" },
  { value: "bachelor of applied science", label: "Bachelor of Applied Science" },
  { value: "bachelor of architecture", label: "Bachelor of Architecture" },
  { value: "bachelor of arts", label: "Bachelor of Arts" },
  { value: "bachelor of arts in business administration", label: "Bachelor of Arts in Business Administration" },
  { value: "bachelor of arts in communication", label: "Bachelor of Arts in Communication" },
  { value: "bachelor of arts in education", label: "Bachelor of Arts in Education" },
  { value: "bachelor of biosystems engineering", label: "Bachelor of Biosystems Engineering" },
  { value: "bachelor of business administration", label: "Bachelor of Business Administration" },
  { value: "bachelor of chemical engineering", label: "Bachelor of Chemical Engineering" },
  { value: "bachelor of civil engineering", label: "Bachelor of Civil Engineering" },
  { value: "bachelor of commerce", label: "Bachelor of Commerce" },
  { value: "bachelor of design", label: "Bachelor of Design" },
  { value: "bachelor of education", label: "Bachelor of Education" },
  { value: "bachelor of electrical engineering", label: "Bachelor of Electrical Engineering" },
  { value: "bachelor of engineering", label: "Bachelor of Engineering" },
  { value: "bachelor of fine arts", label: "Bachelor of Fine Arts" },
  { value: "bachelor of general studies", label: "Bachelor of General Studies" },
  { value: "bachelor of industrial & systems engineering", label: "Bachelor of Industrial & Systems Engineering" },
  { value: "bachelor of industrial design", label: "Bachelor of Industrial Design" },
  { value: "bachelor of interdisciplinary studies", label: "Bachelor of Interdisciplinary Studies" },
  { value: "bachelor of interior architecture", label: "Bachelor of Interior Architecture" },
  { value: "bachelor of law", label: "Bachelor of Law" },
  { value: "bachelor of liberal arts", label: "Bachelor of Liberal Arts" },
  { value: "bachelor of liberal arts and sciences", label: "Bachelor of Liberal Arts and Sciences" },
  { value: "bachelor of materials engineering", label: "Bachelor of Materials Engineering" },
  { value: "bachelor of mathematics", label: "Bachelor of Mathematics" },
  { value: "bachelor of mechanical engineering", label: "Bachelor of Mechanical Engineering" },
  { value: "bachelor of medicine", label: "Bachelor of Medicine" },
  { value: "bachelor of music", label: "Bachelor of Music" },
  { value: "bachelor of music education", label: "Bachelor of Music Education" },
  { value: "bachelor of pharmacy", label: "Bachelor of Pharmacy" },
  { value: "bachelor of polymer and fiber engineering", label: "Bachelor of Polymer and Fiber Engineering" },
  { value: "bachelor of professional health science", label: "Bachelor of Professional Health Science" },
  { value: "bachelor of science", label: "Bachelor of Science" },
  { value: "bachelor of science in aerospace engineering", label: "Bachelor of Science in Aerospace Engineering" },
  { value: "bachelor of science in biomedical engineering", label: "Bachelor of Science in Biomedical Engineering" },
  { value: "bachelor of science in business administration", label: "Bachelor of Science in Business Administration" },
  { value: "bachelor of science in chemical engineering", label: "Bachelor of Science in Chemical Engineering" },
  { value: "bachelor of science in chemistry", label: "Bachelor of Science in Chemistry" },
  { value: "bachelor of science in civil engineering", label: "Bachelor of Science in Civil Engineering" },
  { value: "bachelor of science in commerce business administration", label: "Bachelor of Science in Commerce Business Administration" },
  { value: "bachelor of science in computer science", label: "Bachelor of Science in Computer Science" },
  { value: "bachelor of science in education", label: "Bachelor of Science in Education" },
  { value: "bachelor of science in electrical engineering", label: "Bachelor of Science in Electrical Engineering" },
  { value: "bachelor of science in engineering", label: "Bachelor of Science in Engineering" },
  { value: "bachelor of science in engineering technology", label: "Bachelor of Science in Engineering Technology" },
  { value: "bachelor of science in geology", label: "Bachelor of Science in Geology" },
  { value: "bachelor of science in human environmental sciences", label: "Bachelor of Science in Human Environmental Sciences" },
  { value: "bachelor of science in materials engineering", label: "Bachelor of Science in Materials Engineering" },
  { value: "bachelor of science in mechanical engineering", label: "Bachelor of Science in Mechanical Engineering" },
  { value: "bachelor of science in metallurgical engineering", label: "Bachelor of Science in Metallurgical Engineering" },
  { value: "bachelor of science in microbiology", label: "Bachelor of Science in Microbiology" },
  { value: "bachelor of science in nursing", label: "Bachelor of Science in Nursing" },
  { value: "bachelor of science in social work", label: "Bachelor of Science in Social Work" },
  { value: "bachelor of social work", label: "Bachelor of Social Work" },
  { value: "bachelor of software engineering", label: "Bachelor of Software Engineering" },
  { value: "bachelor of technology", label: "Bachelor of Technology" },
  { value: "bachelor of textile engineering", label: "Bachelor of Textile Engineering" },
  { value: "bachelor of textile management and technology", label: "Bachelor of Textile Management and Technology" },
  { value: "bachelor of veterinary science", label: "Bachelor of Veterinary Science" },
  { value: "bachelor of wireless engineering", label: "Bachelor of Wireless Engineering" },
  { value: "masters", label: "Master's (Any)" },
  { value: "master of accountancy", label: "Master of Accountancy" },
  { value: "master of accounting", label: "Master of Accounting" },
  { value: "master of aerospace engineering", label: "Master of Aerospace Engineering" },
  { value: "master of agriculture", label: "Master of Agriculture" },
  { value: "master of applied mathematics", label: "Master of Applied Mathematics" },
  { value: "master of aquaculture", label: "Master of Aquaculture" },
  { value: "master of arts", label: "Master of Arts" },
  { value: "master of arts in education", label: "Master of Arts in Education" },
  { value: "master of arts in teaching", label: "Master of Arts in Teaching" },
  { value: "master of building construction", label: "Master of Building Construction" },
  { value: "master of business administration", label: "Master of Business Administration (MBA)" },
  { value: "master of chemical engineering", label: "Master of Chemical Engineering" },
  { value: "master of civil engineering", label: "Master of Civil Engineering" },
  { value: "master of commerce", label: "Master of Commerce" },
  { value: "master of communication disorders", label: "Master of Communication Disorders" },
  { value: "master of community planning", label: "Master of Community Planning" },
  { value: "master of dental surgery", label: "Master of Dental Surgery" },
  { value: "master of design", label: "Master of Design" },
  { value: "master of divinity", label: "Master of Divinity" },
  { value: "master of education", label: "Master of Education" },
  { value: "master of electrical engineering", label: "Master of Electrical Engineering" },
  { value: "master of engineering", label: "Master of Engineering" },
  { value: "master of fine arts", label: "Master of Fine Arts" },
  { value: "master of health science", label: "Master of Health Science" },
  { value: "master of hispanic studies", label: "Master of Hispanic Studies" },
  { value: "master of industrial design", label: "Master of Industrial Design" },
  { value: "master of integrated design and construction", label: "Master of Integrated Design and Construction" },
  { value: "master of international studies", label: "Master of International Studies" },
  { value: "master of landscape architecture", label: "Master of Landscape Architecture" },
  { value: "master of laws", label: "Master of Laws" },
  { value: "master of liberal arts", label: "Master of Liberal Arts" },
  { value: "master of library & information studies", label: "Master of Library & Information Studies" },
  { value: "master of library science", label: "Master of Library Science" },
  { value: "master of materials engineering", label: "Master of Materials Engineering" },
  { value: "master of mechanical engineering", label: "Master of Mechanical Engineering" },
  { value: "master of music", label: "Master of Music" },
  { value: "master of natural resources", label: "Master of Natural Resources" },
  { value: "master of nurse anesthesia", label: "Master of Nurse Anesthesia" },
  { value: "master of political science", label: "Master of Political Science" },
  { value: "master of probability and statistics", label: "Master of Probability and Statistics" },
  { value: "master of professional studies", label: "Master of Professional Studies" },
  { value: "master of public administration", label: "Master of Public Administration" },
  { value: "master of public health", label: "Master of Public Health" },
  { value: "master of real estate development", label: "Master of Real Estate Development" },
  { value: "master of rehabilitation counseling", label: "Master of Rehabilitation Counseling" },
  { value: "master of science", label: "Master of Science" },
  { value: "master of science in aerospace engineering", label: "Master of Science in Aerospace Engineering" },
  { value: "master of science in basic medical sciences", label: "Master of Science in Basic Medical Sciences" },
  { value: "master of science in biomedical engineering", label: "Master of Science in Biomedical Engineering" },
  { value: "master of science in chemical engineering", label: "Master of Science in Chemical Engineering" },
  { value: "master of science in chemistry", label: "Master of Science in Chemistry" },
  { value: "master of science in civil engineering", label: "Master of Science in Civil Engineering" },
  { value: "master of science in computer science", label: "Master of Science in Computer Science" },
  { value: "master of science in criminal justice", label: "Master of Science in Criminal Justice" },
  { value: "master of science in education", label: "Master of Science in Education" },
  { value: "master of science in electrical engineering", label: "Master of Science in Electrical Engineering" },
  { value: "master of science in engineering science & mechanics", label: "Master of Science in Engineering Science & Mechanics" },
  { value: "master of science in forensic science", label: "Master of Science in Forensic Science" },
  { value: "master of science in health administration", label: "Master of Science in Health Administration" },
  { value: "master of science in health informatics", label: "Master of Science in Health Informatics" },
  { value: "master of science in human environmental sciences", label: "Master of Science in Human Environmental Sciences" },
  { value: "master of science in industrial engineering", label: "Master of Science in Industrial Engineering" },
  { value: "master of science in information systems", label: "Master of Science in Information Systems" },
  { value: "master of science in instructional leadership administration", label: "Master of Science in Instructional Leadership Administration" },
  { value: "master of science in justice and public safety", label: "Master of Science in Justice and Public Safety" },
  { value: "master of science in marine science", label: "Master of Science in Marine Science" },
  { value: "master of science in materials engineering", label: "Master of Science in Materials Engineering" },
  { value: "master of science in mechanical engineering", label: "Master of Science in Mechanical Engineering" },
  { value: "master of science in metallurgical engineering", label: "Master of Science in Metallurgical Engineering" },
  { value: "master of science in nursing", label: "Master of Science in Nursing" },
  { value: "master of science in occupational therapy", label: "Master of Science in Occupational Therapy" },
  { value: "master of science in operations research", label: "Master of Science in Operations Research" },
  { value: "master of science in physician assistant studies", label: "Master of Science in Physician Assistant Studies" },
  { value: "master of science in public health", label: "Master of Science in Public Health" },
  { value: "master of science in software engineering", label: "Master of Science in Software Engineering" },
  { value: "master of social work", label: "Master of Social Work" },
  { value: "master of software engineering", label: "Master of Software Engineering" },
  { value: "master of tax accounting", label: "Master of Tax Accounting" },
  { value: "master of taxation", label: "Master of Taxation" },
  { value: "master of technical & professional communication", label: "Master of Technical & Professional Communication" },
  { value: "master of technology", label: "Master of Technology" },
  { value: "master of urban and regional planning", label: "Master of Urban and Regional Planning" },
  { value: "magister juris", label: "Magister Juris" },
  { value: "magisters", label: "Magisters" },
  { value: "doctorates", label: "Doctorate (Any)" },
  { value: "doctor of audiology", label: "Doctor of Audiology" },
  { value: "doctor of business administration", label: "Doctor of Business Administration" },
  { value: "doctor of chiropractic", label: "Doctor of Chiropractic" },
  { value: "doctor of dental surgery", label: "Doctor of Dental Surgery (DDS)" },
  { value: "doctor of education", label: "Doctor of Education (EdD)" },
  { value: "doctor of jurisprudence", label: "Doctor of Jurisprudence (JD)" },
  { value: "doctor of medical dentistry", label: "Doctor of Medical Dentistry (DMD)" },
  { value: "doctor of medicine", label: "Doctor of Medicine (MD)" },
  { value: "doctor of ministry", label: "Doctor of Ministry" },
  { value: "doctor of musical arts", label: "Doctor of Musical Arts" },
  { value: "doctor of nursing practice", label: "Doctor of Nursing Practice (DNP)" },
  { value: "doctor of optometry", label: "Doctor of Optometry (OD)" },
  { value: "doctor of osteophathy", label: "Doctor of Osteopathic Medicine (DO)" },
  { value: "doctor of pharmacy", label: "Doctor of Pharmacy (PharmD)" },
  { value: "doctor of philosophy", label: "Doctor of Philosophy (PhD)" },
  { value: "doctor of physical therapy", label: "Doctor of Physical Therapy (DPT)" },
  { value: "doctor of psychology", label: "Doctor of Psychology (PsyD)" },
  { value: "doctor of public health", label: "Doctor of Public Health (DrPH)" },
  { value: "doctor of science", label: "Doctor of Science" },
  { value: "doctor of veterinary medicine", label: "Doctor of Veterinary Medicine (DVM)" },
];

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

export const ROLE_METRIC_OPTIONS = [
  { value: "count", label: "Employee count" },
  { value: "growth", label: "12-month growth %" },
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
  { value: "mental health care", label: "Mental Health Care" },
  { value: "alternative medicine", label: "Alternative Medicine" },
  { value: "veterinary", label: "Veterinary" },
  { value: "higher education", label: "Higher Education" },
  { value: "education management", label: "Education Management" },
  { value: "primary/secondary education", label: "Primary / Secondary Education" },
  { value: "e-learning", label: "E-Learning" },
  { value: "research", label: "Research" },
  { value: "management consulting", label: "Management Consulting" },
  { value: "staffing and recruiting", label: "Staffing & Recruiting" },
  { value: "human resources", label: "Human Resources" },
  { value: "legal services", label: "Legal Services" },
  { value: "law practice", label: "Law Practice" },
  { value: "marketing and advertising", label: "Marketing & Advertising" },
  { value: "public relations and communications", label: "Public Relations & Communications" },
  { value: "outsourcing/offshoring", label: "Outsourcing / Offshoring" },
  { value: "entertainment", label: "Entertainment" },
  { value: "media production", label: "Media Production" },
  { value: "broadcast media", label: "Broadcast Media" },
  { value: "publishing", label: "Publishing" },
  { value: "newspapers", label: "Newspapers" },
  { value: "online media", label: "Online Media" },
  { value: "motion pictures and film", label: "Motion Pictures & Film" },
  { value: "music", label: "Music" },
  { value: "photography", label: "Photography" },
  { value: "real estate", label: "Real Estate" },
  { value: "commercial real estate", label: "Commercial Real Estate" },
  { value: "construction", label: "Construction" },
  { value: "civil engineering", label: "Civil Engineering" },
  { value: "architecture & planning", label: "Architecture & Planning" },
  { value: "retail", label: "Retail" },
  { value: "consumer goods", label: "Consumer Goods" },
  { value: "consumer electronics", label: "Consumer Electronics" },
  { value: "food & beverages", label: "Food & Beverages" },
  { value: "food production", label: "Food Production" },
  { value: "luxury goods & jewelry", label: "Luxury Goods & Jewelry" },
  { value: "apparel & fashion", label: "Apparel & Fashion" },
  { value: "cosmetics", label: "Cosmetics" },
  { value: "sporting goods", label: "Sporting Goods" },
  { value: "supermarkets", label: "Supermarkets" },
  { value: "wholesale", label: "Wholesale" },
  { value: "automotive", label: "Automotive" },
  { value: "chemicals", label: "Chemicals" },
  { value: "electrical/electronic manufacturing", label: "Electrical / Electronic Manufacturing" },
  { value: "machinery", label: "Machinery" },
  { value: "mechanical or industrial engineering", label: "Mechanical or Industrial Engineering" },
  { value: "plastics", label: "Plastics" },
  { value: "packaging and containers", label: "Packaging & Containers" },
  { value: "paper & forest products", label: "Paper & Forest Products" },
  { value: "textiles", label: "Textiles" },
  { value: "glass, ceramics & concrete", label: "Glass, Ceramics & Concrete" },
  { value: "oil & energy", label: "Oil & Energy" },
  { value: "mining & metals", label: "Mining & Metals" },
  { value: "utilities", label: "Utilities" },
  { value: "renewables & environment", label: "Renewables & Environment" },
  { value: "environmental services", label: "Environmental Services" },
  { value: "logistics and supply chain", label: "Logistics & Supply Chain" },
  { value: "transportation/trucking/railroad", label: "Transportation / Trucking / Railroad" },
  { value: "airlines/aviation", label: "Airlines / Aviation" },
  { value: "maritime", label: "Maritime" },
  { value: "warehousing", label: "Warehousing" },
  { value: "government administration", label: "Government Administration" },
  { value: "non-profit organization management", label: "Non-Profit Organization Management" },
  { value: "civic & social organization", label: "Civic & Social Organization" },
  { value: "political organization", label: "Political Organization" },
  { value: "military", label: "Military" },
  { value: "defense & space", label: "Defense & Space" },
  { value: "hospitality", label: "Hospitality" },
  { value: "restaurants", label: "Restaurants" },
  { value: "leisure, travel & tourism", label: "Leisure, Travel & Tourism" },
  { value: "sports", label: "Sports" },
  { value: "gambling & casinos", label: "Gambling & Casinos" },
  { value: "farming", label: "Farming" },
  { value: "agriculture", label: "Agriculture" },
  { value: "import and export", label: "Import & Export" },
  { value: "arts and crafts", label: "Arts & Crafts" },
  { value: "individual & family services", label: "Individual & Family Services" },
];
