export type PageType = 'company_website' | 'linkedin_person' | 'linkedin_company' | 'unsupported';

export interface TabInfo {
  url: string;
  pageType: PageType;
  linkedinUrl?: string;
  domain?: string;
  companyName?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'individual' | 'enterprise_admin' | 'enterprise_user';
  enterprise_id?: string | null;
  allocated_credits: number;
  used_credits: number;
  remaining_credits: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface AuthResponse extends AuthTokens {
  token_type: string;
  user: User;
}

export interface PersonResult {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  picture_url?: string;
  headline?: string;
  linkedin_url?: string;
  active_experience_title?: string;
  active_experience_department?: string;
  active_experience_management_level?: string;
  active_experience_start_date?: string;
  active_experience_company_name?: string;
  active_experience_company_logo_url?: string;
  active_experience_company_website?: string;
  active_experience_company_industry?: string;
  active_experience_company_linkedin_url?: string;
  active_experience_company_hq_country?: string;
  active_experience_company_hq_city?: string;
  active_experience_company_employees_count?: number;
  active_experience_company_size?: string;
  location_country?: string;
  location_state?: string;
  location_city?: string;
  has_email?: boolean;
  mobile_phone?: string | null;
  work_email?: string | null;
  personal_email?: string | null;
  email?: string | null;
  unlocked?: {
    work_email: boolean;
    personal_email: boolean;
    mobile: boolean;
  };
  inferred_skills?: string[];
  summary?: string;
  total_experience_duration_months?: number;
}

export interface CompanyResult {
  id: string;
  company_name?: string;
  company_legal_name?: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  employees_count?: number;
  size_range?: string;
  hq_country?: string;
  hq_region?: string;
  hq_city?: string;
  hq_state?: string;
  hq_location?: string;
  canonical_linkedin_url?: string;
  type?: string;
  founded?: number;
  is_public?: boolean;
  company_status?: string;
  revenue_annual_range?: string;
  description?: string;
  specialties?: string | string[];
  technologies_used?: Array<{ technology?: string } | string>;
  categories_and_keywords?: string | string[];
  awards_certifications?: string | string[];
  phone?: string;
  email?: string;
}

export interface SearchMeta {
  total: number;
  total_pages: number | null;
  scroll_token: string | null;
}

export interface SearchResponse<T> {
  data: T[];
  meta: SearchMeta;
}

export interface UnlockEmailResult {
  record_id: string;
  email: string | null;
  has_email: boolean;
  already_unlocked: boolean;
  credits_charged: number;
}

export interface UnlockPhoneResult {
  record_id: string;
  phone: string | null;
  has_phone: boolean;
  already_unlocked: boolean;
  credits_charged: number;
}

export interface ExtensionMessage<T = unknown> {
  type: string;
  payload?: T;
}

// Lists
export interface LeadsList {
  id: string;
  name: string;
  list_type?: string;
  description?: string;
  record_count?: number;   // actual API field name
  is_default?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ListItem {
  id: string;
  record_id: string;
  item_type: 'person' | 'company';   // actual API field name
  data: PersonResult | CompanyResult; // hydrated flat data field
  added_at: string;                   // actual API field name
}

export interface ListItemsPage {
  items: ListItem[];
  total: number;
  page: number;
  page_size: number;
  // total_pages is NOT returned — compute as Math.ceil(total / page_size)
}
