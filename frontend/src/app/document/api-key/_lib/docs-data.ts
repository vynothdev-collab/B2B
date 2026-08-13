export interface FieldDoc {
  name: string;
  type: string;
  description: string;
}

export interface FilterGroup {
  section: string;
  note?: string;
  fields: FieldDoc[];
}

// ── Response field references ────────────────────────────────────────────────

export const PERSON_FIELDS: FieldDoc[] = [
  { name: "id", type: "string", description: "Unique record identifier. Used for unlock calls." },
  { name: "full_name", type: "string", description: "Person's full name." },
  { name: "first_name", type: "string", description: "First name." },
  { name: "last_name", type: "string", description: "Last name." },
  { name: "headline", type: "string", description: "Professional headline / tagline." },
  { name: "picture_url", type: "string", description: "Profile picture URL." },
  { name: "linkedin_url", type: "string", description: "LinkedIn profile URL." },
  { name: "linkedin_canonical_shorthand_name", type: "string", description: "LinkedIn vanity handle." },
  { name: "location_country", type: "string", description: "Country of residence." },
  { name: "location_city", type: "string", description: "City of residence." },
  { name: "location_state", type: "string", description: "State / region of residence." },
  { name: "mobile_phone", type: "string | null", description: "Locked by default — call the mobile unlock endpoint." },
  { name: "connections_count", type: "number", description: "LinkedIn connections count." },
  { name: "followers_count", type: "number", description: "LinkedIn followers count." },
  { name: "has_email", type: "boolean", description: "Whether a work email exists for this person (does not reveal it)." },
  { name: "work_email", type: "string | null", description: "Locked by default — call the work-email unlock endpoint." },
  { name: "personal_email", type: "string | null", description: "Locked by default — call the personal-email unlock endpoint." },
  { name: "inferred_skills", type: "string[]", description: "Skills inferred from profile data." },
  { name: "total_experience_duration_months", type: "number", description: "Total career experience in months." },
  { name: "projected_base_salary_median", type: "number", description: "Estimated median base salary." },
  { name: "projected_base_salary_currency", type: "string", description: "Currency of the salary estimate." },
  { name: "active_experience_title", type: "string", description: "Current job title." },
  { name: "active_experience_department", type: "string", description: "Current department." },
  { name: "active_experience_management_level", type: "string", description: "Current seniority / management level." },
  { name: "active_experience_start_date", type: "string", description: "Start date of current role (ISO date)." },
  { name: "active_experience_company_id", type: "string", description: "Current employer's internal company id." },
  { name: "active_experience_company_name", type: "string", description: "Current employer name." },
  { name: "active_experience_company_logo_url", type: "string", description: "Current employer logo URL." },
  { name: "active_experience_company_website", type: "string", description: "Current employer website." },
  { name: "active_experience_company_linkedin_url", type: "string", description: "Current employer LinkedIn URL." },
  { name: "active_experience_company_industry", type: "string", description: "Current employer industry." },
  { name: "active_experience_company_employees_count", type: "number", description: "Current employer headcount." },
  { name: "active_experience_company_size", type: "string", description: "Current employer size range." },
  { name: "active_experience_company_type", type: "string", description: "Current employer type (public, private, etc.)." },
  { name: "active_experience_company_status", type: "string", description: "Current employer status." },
  { name: "active_experience_company_founded", type: "number", description: "Current employer founding year." },
  { name: "active_experience_company_founded_year", type: "number", description: "Alias of active_experience_company_founded." },
  { name: "active_experience_company_hq_country", type: "string", description: "Current employer HQ country." },
  { name: "active_experience_company_hq_city", type: "string", description: "Current employer HQ city." },
  { name: "active_experience_company_hq_region", type: "string", description: "Current employer HQ state/region." },
  { name: "active_experience_company_hq_location", type: "string", description: "Current employer HQ full address." },
  { name: "active_experience_company_categories_and_keywords", type: "string", description: "Current employer category/keyword tags." },
  { name: "active_experience_company_annual_revenue", type: "number", description: "Current employer estimated annual revenue." },
  { name: "awards_certifications", type: "string[]", description: "Awards and certifications." },
];

export const COMPANY_FIELDS: FieldDoc[] = [
  { name: "id", type: "string", description: "Unique record identifier." },
  { name: "company_name", type: "string", description: "Company name." },
  { name: "company_legal_name", type: "string", description: "Registered legal name." },
  { name: "website", type: "string", description: "Company website." },
  { name: "logo_url", type: "string", description: "Company logo URL." },
  { name: "canonical_linkedin_url", type: "string", description: "LinkedIn company page URL." },
  { name: "industry", type: "string", description: "Primary industry." },
  { name: "type", type: "string", description: "Company type (public, private, non-profit, etc.)." },
  { name: "is_public", type: "boolean", description: "Whether the company is publicly traded." },
  { name: "company_status", type: "string", description: "Operating status." },
  { name: "founded", type: "number", description: "Year founded." },
  { name: "employees_count", type: "number", description: "Employee headcount." },
  { name: "size_range", type: "string", description: "Employee size range bucket." },
  { name: "hq_country", type: "string", description: "Headquarters country." },
  { name: "hq_region", type: "string", description: "Headquarters state/region." },
  { name: "hq_city", type: "string", description: "Headquarters city." },
  { name: "hq_state", type: "string", description: "Headquarters state." },
  { name: "hq_location", type: "string", description: "Headquarters full address." },
  { name: "categories_and_keywords", type: "string", description: "Category / keyword tags." },
  { name: "awards_certifications", type: "string[]", description: "Awards and certifications." },
  { name: "employees_count_change", type: "object", description: "Headcount growth over time." },
  { name: "total_website_visits_monthly", type: "number", description: "Estimated monthly website visits." },
  { name: "total_website_visits_change", type: "object", description: "Website traffic change over time." },
  { name: "revenue_annual_range", type: "string", description: "Estimated annual revenue range." },
  { name: "last_funding_round", type: "object", description: "Most recent funding round details." },
  { name: "company_employee_reviews_aggregate_score", type: "number", description: "Aggregate employee review score." },
  { name: "active_job_postings", type: "array", description: "Currently open job postings (ids)." },
  { name: "technologies_used", type: "array", description: "Detected technology stack." },
];

// ── Request filter references ────────────────────────────────────────────────

export const PERSON_FILTER_GROUPS: FilterGroup[] = [
  {
    section: "People",
    fields: [
      { name: "name", type: "string[]", description: "Match by full name." },
      { name: "linkedin_url", type: "string[]", description: "Match by exact LinkedIn profile URL." },
    ],
  },
  {
    section: "Job Title",
    fields: [
      { name: "job_title", type: "string[]", description: "Job titles to match." },
      { name: "job_title_match_type", type: '"contains" | "exact"', description: 'How job_title values are matched. Default "contains".' },
      { name: "departments", type: "string[]", description: "Department names (sub-filter of Job Title)." },
      { name: "seniority", type: "string[]", description: "Seniority levels (sub-filter of Job Title)." },
    ],
  },
  {
    section: "Company",
    fields: [
      { name: "companies", type: "string[]", description: "Restrict to people currently at these companies." },
    ],
  },
  {
    section: "Location — Person",
    fields: [
      { name: "person_location_countries", type: "string[]", description: "Person's country of residence." },
      { name: "person_location_states", type: "string[]", description: "Person's state/region of residence." },
      { name: "person_location_cities", type: "string[]", description: "Person's city of residence." },
    ],
  },
  {
    section: "Location — Company HQ",
    fields: [
      { name: "hq_countries", type: "string[]", description: "Employer HQ country." },
      { name: "hq_states", type: "string[]", description: "Employer HQ state/region." },
      { name: "hq_cities", type: "string[]", description: "Employer HQ city." },
    ],
  },
  {
    section: "Contact Details",
    fields: [
      { name: "require_work_email", type: "boolean", description: "Only return people who have a work email on file. Does not reveal it — call the work-email unlock endpoint for that." },
    ],
  },
  {
    section: "Type & Business Model",
    fields: [
      { name: "company_status", type: "string[]", description: "Employer operating status." },
      { name: "company_type", type: "string[]", description: "Employer type (public, private, etc.)." },
    ],
  },
  {
    section: "Keywords",
    fields: [
      { name: "keywords_include", type: "string[]", description: "Keywords to require." },
      { name: "keywords_match_mode", type: '"any" | "all"', description: 'Whether any or all keywords_include must match. Default "any".' },
      { name: "keywords_scope", type: "string[]", description: "Which fields the keyword match applies to." },
      { name: "keywords_exclude", type: "string[]", description: "Keywords to exclude." },
    ],
  },
  {
    section: "Employee Headcount",
    fields: [
      { name: "employee_count_min", type: "number", description: "Minimum employer headcount." },
      { name: "employee_count_max", type: "number", description: "Maximum employer headcount." },
    ],
  },
  {
    section: "Industry",
    fields: [{ name: "industries", type: "string[]", description: "Employer industries." }],
  },
  {
    section: "Technologies",
    fields: [{ name: "technologies", type: "string[]", description: "Technologies detected at the employer." }],
  },
  {
    section: "Revenue",
    fields: [
      { name: "revenue_buckets", type: "string[]", description: "Preset employer annual revenue buckets." },
      { name: "revenue_min", type: "number", description: "Minimum employer annual revenue (custom range)." },
      { name: "revenue_max", type: "number", description: "Maximum employer annual revenue (custom range)." },
    ],
  },
  {
    section: "Funding",
    fields: [
      { name: "funding_min", type: "number", description: "Minimum total employer funding raised." },
      { name: "funding_max", type: "number", description: "Maximum total employer funding raised." },
    ],
  },
  {
    section: "Headcount Growth",
    fields: [
      { name: "headcount_growth_min", type: "number", description: "Minimum employer headcount growth %." },
      { name: "headcount_growth_max", type: "number", description: "Maximum employer headcount growth %." },
    ],
  },
  {
    section: "Founded Year",
    fields: [
      { name: "founded_min", type: "number", description: "Employer founded on/after this year." },
      { name: "founded_max", type: "number", description: "Employer founded on/before this year." },
    ],
  },
  {
    section: "Time in Current Role",
    note: "The web app's \"Job Change\" filter also writes to time_in_role_max_months — if you need that behavior, set this field directly.",
    fields: [
      { name: "time_in_role_min_months", type: "number", description: "Minimum months in current role." },
      { name: "time_in_role_max_months", type: "number", description: "Maximum months in current role." },
    ],
  },
  {
    section: "Time in Current Company",
    fields: [
      { name: "time_in_company_min_months", type: "number", description: "Minimum months at current employer." },
      { name: "time_in_company_max_months", type: "number", description: "Maximum months at current employer." },
    ],
  },
  {
    section: "Total Years of Experience",
    fields: [
      { name: "experience_years_min", type: "number", description: "Minimum total years of professional experience." },
      { name: "experience_years_max", type: "number", description: "Maximum total years of professional experience." },
    ],
  },
  {
    section: "Job Posting",
    fields: [{ name: "job_posting_keywords", type: "string[]", description: "Match employers with open job postings containing these keywords." }],
  },
  {
    section: "Certifications & Compliance",
    fields: [
      { name: "certifications", type: "string[]", description: "Required certifications." },
      { name: "other_compliance", type: "string[]", description: "Other compliance attributes." },
    ],
  },
  {
    section: "Exclusions",
    fields: [
      { name: "exclude_person_ids", type: "string[]", description: "Person record ids to exclude from results." },
      { name: "exclude_company_ids", type: "string[]", description: "Exclude people currently at these company ids." },
      { name: "exclude_company_names", type: "string[]", description: "Exclude people currently at these company names." },
    ],
  },
  {
    section: "Pagination",
    fields: [
      { name: "scroll_token", type: "string | null", description: "Cursor from a previous response's meta.scroll_token. Omit for the first page." },
      { name: "page_size", type: "number", description: "Results per page, 1–1000. Default 10." },
    ],
  },
];

export const COMPANY_FILTER_GROUPS: FilterGroup[] = [
  {
    section: "Company",
    fields: [{ name: "companies", type: "string[]", description: "Company names to match." }],
  },
  {
    section: "Location",
    fields: [
      { name: "location_countries", type: "string[]", description: "HQ country." },
      { name: "location_states", type: "string[]", description: "HQ state/region." },
      { name: "location_cities", type: "string[]", description: "HQ city." },
    ],
  },
  {
    section: "Type & Business Model",
    fields: [
      { name: "company_status", type: "string[]", description: "Operating status." },
      { name: "type", type: "string[]", description: "Company type (public, private, non-profit, etc.)." },
      { name: "company_how_they_sell", type: "string[]", description: "Go-to-market / sales motion." },
      { name: "company_more_flags", type: "string[]", description: "Additional business-model flags." },
      { name: "company_revenue_model", type: "string[]", description: "Revenue model (subscription, transactional, etc.)." },
    ],
  },
  {
    section: "Keywords",
    fields: [
      { name: "keywords_include", type: "string[]", description: "Keywords to require." },
      { name: "keywords_match_mode", type: '"any" | "all"', description: 'Whether any or all keywords_include must match. Default "any".' },
      { name: "keywords_scope", type: "string[]", description: "Which fields the keyword match applies to." },
      { name: "keywords_exclude", type: "string[]", description: "Keywords to exclude." },
    ],
  },
  {
    section: "Employee Headcount",
    fields: [
      { name: "employee_count_min", type: "number", description: "Minimum headcount." },
      { name: "employee_count_max", type: "number", description: "Maximum headcount." },
    ],
  },
  {
    section: "Industry",
    fields: [{ name: "industries", type: "string[]", description: "Industries." }],
  },
  {
    section: "Technologies",
    fields: [{ name: "technologies", type: "string[]", description: "Detected technology stack." }],
  },
  {
    section: "Revenue",
    fields: [
      { name: "revenue_buckets", type: "string[]", description: "Preset annual revenue buckets." },
      { name: "revenue_min", type: "number", description: "Minimum annual revenue (custom range)." },
      { name: "revenue_max", type: "number", description: "Maximum annual revenue (custom range)." },
    ],
  },
  {
    section: "Funding",
    fields: [
      { name: "funding_min", type: "number", description: "Minimum total funding raised." },
      { name: "funding_max", type: "number", description: "Maximum total funding raised." },
      { name: "funding_stages", type: "string[]", description: "Funding stages (Seed, Series A, etc.)." },
    ],
  },
  {
    section: "Headcount Growth",
    fields: [
      { name: "headcount_growth_timeframe", type: '"3_month" | "6_month" | "12_month" | "24_month"', description: 'Growth measurement window. Default "12_month".' },
      { name: "headcount_growth_min", type: "number", description: "Minimum headcount growth %." },
      { name: "headcount_growth_max", type: "number", description: "Maximum headcount growth %." },
    ],
  },
  {
    section: "Headcount by Department",
    fields: [
      { name: "headcount_by_department", type: "string", description: "Department to measure headcount for." },
      { name: "headcount_by_department_min", type: "number", description: "Minimum headcount in that department." },
      { name: "headcount_by_department_max", type: "number", description: "Maximum headcount in that department." },
    ],
  },
  {
    section: "Headcount by Location",
    fields: [
      { name: "headcount_by_location_country", type: "string", description: "Country to measure headcount for." },
      { name: "headcount_by_location_min", type: "number", description: "Minimum headcount in that country." },
      { name: "headcount_by_location_max", type: "number", description: "Maximum headcount in that country." },
    ],
  },
  {
    section: "Founded Year",
    fields: [
      { name: "founded_min", type: "number", description: "Founded on/after this year." },
      { name: "founded_max", type: "number", description: "Founded on/before this year." },
    ],
  },
  {
    section: "Job Posting",
    fields: [{ name: "job_posting_keywords", type: "string[]", description: "Match companies with open job postings containing these keywords." }],
  },
  {
    section: "Website Traffic",
    fields: [
      { name: "website_visits_min", type: "number", description: "Minimum monthly website visits." },
      { name: "website_visits_max", type: "number", description: "Maximum monthly website visits." },
      { name: "visit_change_timeframe", type: '"monthly" | "quarterly" | "yearly"', description: "Traffic-change measurement window." },
      { name: "visit_change_min", type: "number", description: "Minimum traffic change %." },
      { name: "visit_change_max", type: "number", description: "Maximum traffic change %." },
      { name: "traffic_country", type: "string", description: "Country to measure traffic share for." },
      { name: "traffic_country_min", type: "number", description: "Minimum traffic share % from that country." },
      { name: "traffic_country_max", type: "number", description: "Maximum traffic share % from that country." },
    ],
  },
  {
    section: "Company News",
    fields: [
      { name: "company_news_keywords", type: "string[]", description: "Match companies with recent news containing these keywords." },
      { name: "company_news_categories", type: "string[]", description: "News categories to match." },
      { name: "company_news_timeframe", type: "string", description: "How far back to look for news." },
    ],
  },
  {
    section: "Email Provider",
    fields: [{ name: "email_providers", type: "string[]", description: "Match companies using these email providers." }],
  },
  {
    section: "Awards & Certifications",
    fields: [
      { name: "awards", type: "string[]", description: "Required awards." },
      { name: "certifications", type: "string[]", description: "Required certifications." },
      { name: "other_compliance", type: "string[]", description: "Other compliance attributes." },
    ],
  },
  {
    section: "Pagination",
    fields: [
      { name: "scroll_token", type: "string | null", description: "Cursor from a previous response's meta.scroll_token. Omit for the first page." },
      { name: "page_size", type: "number", description: "Results per page, 1–1000. Default 10." },
    ],
  },
];

export const CREDIT_COSTS: { action: string; credits: number }[] = [
  { action: "Person / Company search (per request)", credits: 10 },
  { action: "Work email unlock (person)", credits: 1 },
  { action: "Personal email unlock (person)", credits: 1 },
  { action: "Mobile number unlock (person)", credits: 10 },
];

// ── Sample requests / responses ──────────────────────────────────────────────

export const SAMPLE_PERSON_SEARCH_REQUEST = `{
  "job_title": ["VP Sales", "Head of Sales"],
  "job_title_match_type": "contains",
  "person_location_countries": ["United States"],
  "industries": ["Computer Software"],
  "employee_count_min": 200,
  "employee_count_max": 2000,
  "require_work_email": true,
  "page_size": 10
}`;

export const SAMPLE_PERSON_SEARCH_RESPONSE = `{
  "data": [
    {
      "id": "1029384756",
      "full_name": "Jordan Lee",
      "first_name": "Jordan",
      "last_name": "Lee",
      "headline": "VP of Sales at Acme Corp",
      "picture_url": "https://media.leadsbuddy.ai/avatars/jordan-lee.jpg",
      "linkedin_url": "https://linkedin.com/in/jordanlee",
      "linkedin_canonical_shorthand_name": "jordanlee",
      "location_country": "United States",
      "location_city": "Austin",
      "location_state": "Texas",
      "mobile_phone": null,
      "connections_count": 2450,
      "followers_count": 3100,
      "has_email": true,
      "work_email": null,
      "personal_email": null,
      "inferred_skills": ["Enterprise Sales", "SaaS", "Negotiation"],
      "total_experience_duration_months": 168,
      "projected_base_salary_median": 185000,
      "projected_base_salary_currency": "USD",
      "active_experience_title": "VP of Sales",
      "active_experience_department": "Sales",
      "active_experience_management_level": "VP",
      "active_experience_start_date": "2022-03-01",
      "active_experience_company_id": "5647382910",
      "active_experience_company_name": "Acme Corp",
      "active_experience_company_logo_url": "https://media.leadsbuddy.ai/logos/acme-corp.png",
      "active_experience_company_website": "https://acme.com",
      "active_experience_company_linkedin_url": "https://linkedin.com/company/acme-corp",
      "active_experience_company_industry": "Computer Software",
      "active_experience_company_employees_count": 850,
      "active_experience_company_size": "501-1000",
      "active_experience_company_type": "Private",
      "active_experience_company_status": "Operating",
      "active_experience_company_founded": 2011,
      "active_experience_company_founded_year": 2011,
      "active_experience_company_hq_country": "United States",
      "active_experience_company_hq_city": "San Francisco",
      "active_experience_company_hq_region": "California",
      "active_experience_company_hq_location": "San Francisco, California, United States",
      "active_experience_company_categories_and_keywords": "B2B SaaS, CRM, Sales Software",
      "active_experience_company_annual_revenue": 120000000,
      "awards_certifications": ["Salesforce Certified Sales Professional"]
    }
  ],
  "meta": {
    "total": 4231,
    "total_pages": 424,
    "scroll_token": "eyJvZmZzZXQiOjEwfQ=="
  }
}`;

export const SAMPLE_COMPANY_SEARCH_REQUEST = `{
  "industries": ["Computer Software"],
  "location_countries": ["United States"],
  "employee_count_min": 200,
  "employee_count_max": 2000,
  "revenue_buckets": ["$50M-$100M", "$100M-$250M"],
  "technologies": ["Salesforce"],
  "page_size": 10
}`;

export const SAMPLE_COMPANY_SEARCH_RESPONSE = `{
  "data": [
    {
      "id": "5647382910",
      "company_name": "Acme Corp",
      "company_legal_name": "Acme Corporation Inc.",
      "website": "https://acme.com",
      "logo_url": "https://media.leadsbuddy.ai/logos/acme-corp.png",
      "canonical_linkedin_url": "https://linkedin.com/company/acme-corp",
      "industry": "Computer Software",
      "type": "Private",
      "is_public": false,
      "company_status": "Operating",
      "founded": 2011,
      "employees_count": 850,
      "size_range": "501-1000",
      "hq_country": "United States",
      "hq_region": "California",
      "hq_city": "San Francisco",
      "hq_state": "California",
      "hq_location": "San Francisco, California, United States",
      "categories_and_keywords": "B2B SaaS, CRM, Sales Software",
      "awards_certifications": ["SOC 2 Type II"],
      "employees_count_change": { "monthly": 1.2, "quarterly": 3.8, "yearly": 14.5 },
      "total_website_visits_monthly": 452000,
      "total_website_visits_change": { "monthly": 2.1 },
      "revenue_annual_range": "$100M-$250M",
      "last_funding_round": { "stage": "Series C", "amount": 60000000, "date": "2023-06-01" },
      "company_employee_reviews_aggregate_score": 4.3,
      "active_job_postings": [{ "id": "job_00123" }, { "id": "job_00124" }],
      "technologies_used": [{ "technology": "Salesforce" }, { "technology": "AWS" }]
    }
  ],
  "meta": {
    "total": 812,
    "total_pages": 82,
    "scroll_token": "eyJvZmZzZXQiOjEwfQ=="
  }
}`;

export interface UnlockEndpointDoc {
  method: "GET";
  path: string;
  title: string;
  credits: number;
  description: string;
  sampleResponse: string;
}

export const UNLOCK_ENDPOINTS: UnlockEndpointDoc[] = [
  {
    method: "GET",
    path: "/persons/{id}/unlock/work-email",
    title: "Unlock work email",
    credits: 1,
    description: "Reveals the person's verified work email.",
    sampleResponse: `{
  "record_id": "1029384756",
  "email": "jordan.lee@acme.com",
  "has_email": true,
  "already_unlocked": false,
  "credits_charged": 1
}`,
  },
  {
    method: "GET",
    path: "/persons/{id}/unlock/personal-email",
    title: "Unlock personal email",
    credits: 1,
    description: "Reveals the person's personal (non-work) email, if on file.",
    sampleResponse: `{
  "record_id": "1029384756",
  "email": "jordan.lee89@gmail.com",
  "has_email": true,
  "already_unlocked": false,
  "credits_charged": 1
}`,
  },
  {
    method: "GET",
    path: "/persons/{id}/unlock/mobile",
    title: "Unlock mobile number",
    credits: 10,
    description: "Reveals the person's mobile phone number.",
    sampleResponse: `{
  "record_id": "1029384756",
  "phone": "+1-512-555-0134",
  "has_phone": true,
  "already_unlocked": false,
  "credits_charged": 10
}`,
  },
];

export const SAMPLE_ALREADY_UNLOCKED_RESPONSE = `{
  "record_id": "1029384756",
  "email": "jordan.lee@acme.com",
  "has_email": true,
  "already_unlocked": true,
  "credits_charged": 0
}`;

export const SAMPLE_INSUFFICIENT_CREDITS_RESPONSE = `{
  "detail": {
    "success": false,
    "error": "INSUFFICIENT_CREDITS",
    "message": "You do not have enough credits to perform this action.",
    "requiredCredits": 10,
    "availableCredits": 4
  }
}`;
