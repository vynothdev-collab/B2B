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
  { name: "summary", type: "string", description: "Profile summary / bio, same as shown on the person's business card." },
  { name: "work_history", type: "array", description: "Full employment history — company, title, dates, location, description per role." },
  { name: "education", type: "array", description: "Schools attended — institution, degree, field, years." },
  { name: "certifications", type: "array", description: "Professional certifications — title, issuer, date." },
  { name: "languages", type: "array", description: "Spoken languages and proficiency." },
  { name: "total_experience", type: "string", description: "Total career experience, computed from work_history (e.g. \"8 years\")." },
  { name: "patents", type: "array", description: "Filed patents — title, status, date, inventors." },
  { name: "projects", type: "array", description: "Notable projects — name, description, dates, members." },
  { name: "publications", type: "array", description: "Publications — title, publisher, date, authors." },
  { name: "volunteering", type: "array", description: "Volunteering positions — organization, role, cause, dates." },
  { name: "organizations", type: "array", description: "Organization memberships — name, position, dates." },
  { name: "courses", type: "array", description: "Completed courses — title, organizer." },
  { name: "awards", type: "array", description: "Awards received — title, issuer, date, description." },
  { name: "recommendations", type: "array", description: "Recommendations received — text, recommender name." },
  { name: "test_scores", type: "array", description: "Standardized test scores — title, score, date." },
  { name: "websites", type: "string[]", description: "Personal websites listed on the profile." },
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
  { name: "description", type: "string", description: "Company description, same as shown on the company's business card." },
  { name: "specialties", type: "string[]", description: "Specialties listed on the company profile." },
];

// ── Nested object shapes ──────────────────────────────────────────────────────
// Sub-fields of the array/object-typed response fields above (each array item
// shares this shape; keys are omitted when not present on a given record).

export const PERSON_NESTED_FIELDS: FilterGroup[] = [
  {
    section: "work_history[]",
    fields: [
      { name: "company_name", type: "string", description: "Employer name." },
      { name: "company_logo_url", type: "string", description: "Employer logo URL." },
      { name: "company_website", type: "string", description: "Employer website." },
      { name: "company_linkedin_url", type: "string", description: "Employer LinkedIn URL." },
      { name: "title", type: "string", description: "Job title held in this role." },
      { name: "start_date", type: "string", description: "Role start date (ISO date)." },
      { name: "end_date", type: "string | null", description: "Role end date, or null if current." },
      { name: "is_current", type: "boolean", description: "Whether this is the person's current role." },
      { name: "duration", type: "string", description: "Human-readable duration (e.g. \"2 yrs 3 mos\")." },
      { name: "location", type: "string", description: "Role location." },
      { name: "description", type: "string", description: "Role description / responsibilities." },
    ],
  },
  {
    section: "education[]",
    fields: [
      { name: "school", type: "string", description: "Institution name." },
      { name: "school_logo_url", type: "string", description: "Institution logo URL." },
      { name: "degree", type: "string", description: "Degree or program description." },
      { name: "field", type: "string", description: "Field of study." },
      { name: "start_year", type: "string", description: "Year started." },
      { name: "end_year", type: "string", description: "Year completed." },
      { name: "activities", type: "string", description: "Activities and societies." },
    ],
  },
  {
    section: "certifications[]",
    fields: [
      { name: "title", type: "string", description: "Certification name." },
      { name: "issuer", type: "string", description: "Issuing organization." },
      { name: "date", type: "string", description: "Date earned." },
      { name: "url", type: "string", description: "Certificate URL." },
    ],
  },
  {
    section: "languages[]",
    fields: [
      { name: "language", type: "string", description: "Language name." },
      { name: "proficiency", type: "string", description: "Proficiency level." },
    ],
  },
  {
    section: "patents[]",
    fields: [
      { name: "title", type: "string", description: "Patent title." },
      { name: "status", type: "string", description: "Filing status (e.g. \"Granted\", \"Pending\")." },
      { name: "date", type: "string", description: "Filing or grant date." },
      { name: "url", type: "string", description: "Link to the patent." },
      { name: "description", type: "string", description: "Patent description." },
      { name: "patent_number", type: "string", description: "Patent or application number." },
      { name: "inventors", type: "string[]", description: "Names of listed inventors." },
    ],
  },
  {
    section: "projects[]",
    fields: [
      { name: "name", type: "string", description: "Project name." },
      { name: "url", type: "string | null", description: "Project URL, if any." },
      { name: "description", type: "string", description: "Project description." },
      { name: "start_date", type: "string", description: "Project start date." },
      { name: "end_date", type: "string | null", description: "Project end date, or null if ongoing." },
      { name: "members", type: "string[]", description: "Names of team members." },
    ],
  },
  {
    section: "publications[]",
    fields: [
      { name: "title", type: "string", description: "Publication title." },
      { name: "publisher", type: "string", description: "Publisher name." },
      { name: "date", type: "string", description: "Publication date." },
      { name: "url", type: "string", description: "Link to the publication." },
      { name: "description", type: "string", description: "Publication description." },
      { name: "authors", type: "string[]", description: "Names of listed authors." },
    ],
  },
  {
    section: "volunteering[]",
    fields: [
      { name: "organization", type: "string", description: "Organization name." },
      { name: "role", type: "string", description: "Volunteer role." },
      { name: "cause", type: "string", description: "Cause supported." },
      { name: "start_date", type: "string", description: "Start date." },
      { name: "end_date", type: "string | null", description: "End date, or null if ongoing." },
      { name: "duration", type: "string", description: "Human-readable duration." },
      { name: "description", type: "string", description: "Role description." },
    ],
  },
  {
    section: "organizations[]",
    fields: [
      { name: "name", type: "string", description: "Organization name." },
      { name: "position", type: "string", description: "Position held." },
      { name: "description", type: "string", description: "Membership description." },
      { name: "start_date", type: "string", description: "Start date." },
      { name: "end_date", type: "string | null", description: "End date, or null if ongoing." },
    ],
  },
  {
    section: "courses[]",
    fields: [
      { name: "title", type: "string", description: "Course title." },
      { name: "organizer", type: "string", description: "Course provider / organizer." },
    ],
  },
  {
    section: "awards[]",
    fields: [
      { name: "title", type: "string", description: "Award title." },
      { name: "issuer", type: "string", description: "Issuing organization." },
      { name: "date", type: "string", description: "Date received." },
      { name: "description", type: "string", description: "Award description." },
    ],
  },
  {
    section: "recommendations[]",
    fields: [
      { name: "text", type: "string", description: "Recommendation text." },
      { name: "from_name", type: "string", description: "Name of the person who gave the recommendation." },
      { name: "from_url", type: "string", description: "Profile URL of the recommender." },
    ],
  },
  {
    section: "test_scores[]",
    fields: [
      { name: "title", type: "string", description: "Test name (e.g. \"GMAT\")." },
      { name: "score", type: "string", description: "Score achieved." },
      { name: "date", type: "string", description: "Date taken." },
      { name: "description", type: "string", description: "Additional notes about the score." },
    ],
  },
];

export const COMPANY_NESTED_FIELDS: FilterGroup[] = [
  {
    section: "employees_count_change / total_website_visits_change",
    note: "Same shape for both fields — one describes headcount change, the other website traffic change.",
    fields: [
      { name: "current", type: "number", description: "Current value." },
      { name: "change_monthly", type: "number", description: "Absolute change over the last month." },
      { name: "change_monthly_percentage", type: "number | null", description: "Percentage change over the last month." },
      { name: "change_quarterly", type: "number", description: "Absolute change over the last quarter." },
      { name: "change_quarterly_percentage", type: "number | null", description: "Percentage change over the last quarter." },
      { name: "change_yearly", type: "number", description: "Absolute change over the last year." },
      { name: "change_yearly_percentage", type: "number | null", description: "Percentage change over the last year." },
    ],
  },
  {
    section: "last_funding_round",
    fields: [
      { name: "type", type: "string", description: "Funding round type (e.g. \"Series C\")." },
      { name: "amount_raised", type: "number", description: "Amount raised in this round." },
      { name: "date", type: "string", description: "Date the round closed." },
    ],
  },
  {
    section: "active_job_postings[]",
    fields: [
      { name: "id", type: "string", description: "Job posting identifier." },
    ],
  },
  {
    section: "technologies_used[]",
    fields: [
      { name: "technology", type: "string", description: "Technology name." },
    ],
  },
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
  { action: "AI search (per request)", credits: 10 },
  { action: "Work email unlock (person)", credits: 1 },
  { action: "Personal email unlock (person)", credits: 1 },
  { action: "Mobile number unlock (person)", credits: 10 },
  { action: "Push to a connected CRM/outreach integration (per record)", credits: 1 },
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
      "awards_certifications": ["Salesforce Certified Sales Professional"],
      "summary": "Sales leader with 14+ years scaling B2B SaaS revenue teams.",
      "work_history": [
        {
          "company_name": "Acme Corp",
          "title": "VP of Sales",
          "start_date": "2022-03-01",
          "end_date": null,
          "is_current": true,
          "location": "Austin, Texas",
          "description": "Leading a 40-person sales organization."
        }
      ],
      "education": [
        { "school": "University of Texas at Austin", "degree": "BBA", "field": "Business", "start_year": "2006", "end_year": "2010" }
      ],
      "certifications": [
        { "title": "Salesforce Certified Sales Professional", "issuer": "Salesforce", "date": "2021-05-01" }
      ],
      "languages": [{ "language": "English", "proficiency": "Native" }],
      "total_experience": "14 years",
      "patents": [
        {
          "title": "Method for automated lead scoring in CRM systems",
          "status": "Granted",
          "date": "2019-08-12",
          "url": "https://patents.google.com/patent/US10123456B2",
          "description": "A system for ranking sales leads using engagement signals.",
          "patent_number": "US10123456B2",
          "inventors": ["Jordan Lee", "Priya Nair"]
        }
      ],
      "projects": [
        {
          "name": "Revenue Intelligence Rollout",
          "url": null,
          "description": "Led cross-functional rollout of a revenue intelligence platform across 3 regions.",
          "start_date": "2023-01-01",
          "end_date": "2023-09-01",
          "members": ["Jordan Lee", "Sam Rivera"]
        }
      ],
      "publications": [
        {
          "title": "Scaling B2B Sales Teams in a Downturn",
          "publisher": "Harvard Business Review",
          "date": "2023-11-02",
          "url": "https://hbr.org/2023/11/scaling-b2b-sales-teams",
          "description": "How Acme Corp restructured its sales org to grow through a slowdown.",
          "authors": ["Jordan Lee"]
        }
      ],
      "volunteering": [
        {
          "organization": "Junior Achievement",
          "role": "Mentor",
          "cause": "Education",
          "start_date": "2018-01-01",
          "end_date": null,
          "duration": "6 years",
          "description": "Mentoring high school students on entrepreneurship fundamentals."
        }
      ],
      "organizations": [
        {
          "name": "Austin Sales Leaders Guild",
          "position": "Board Member",
          "description": "Community of VP+ sales leaders in the Austin tech scene.",
          "start_date": "2021-06-01",
          "end_date": null
        }
      ],
      "courses": [
        { "title": "Strategic Account Management", "organizer": "LinkedIn Learning" }
      ],
      "awards": [
        {
          "title": "Sales Leader of the Year",
          "issuer": "Acme Corp",
          "date": "2024-01-15",
          "description": "Awarded for exceeding annual revenue targets by 32%."
        }
      ],
      "recommendations": [
        {
          "text": "Jordan built our sales org from the ground up and consistently exceeded targets.",
          "from_name": "Alex Chen",
          "from_url": "https://linkedin.com/in/alexchen"
        }
      ],
      "test_scores": [
        { "title": "GMAT", "score": "710", "date": "2010-05-01", "description": null }
      ],
      "websites": ["https://jordanlee.com"]
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
      "last_funding_round": { "type": "Series C", "amount_raised": 60000000, "date": "2023-06-01" },
      "company_employee_reviews_aggregate_score": 4.3,
      "active_job_postings": [{ "id": "job_00123" }, { "id": "job_00124" }],
      "technologies_used": [{ "technology": "Salesforce" }, { "technology": "AWS" }],
      "description": "Acme Corp builds sales engagement software for B2B revenue teams.",
      "specialties": ["CRM", "Sales Engagement", "Revenue Intelligence"]
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

export const SAMPLE_RECORD_NOT_FOUND_RESPONSE = `{
  "detail": "Record not found. Run a new search to refresh."
}`;

export const SAMPLE_AI_SEARCH_PERSON_REQUEST = `{
  "prompt": "VP of Sales at SaaS companies with 200+ employees in the US",
  "entity": "employee",
  "page_size": 10
}`;

export const SAMPLE_AI_SEARCH_PAGE2_REQUEST = `{
  "prompt": "VP of Sales at SaaS companies with 200+ employees in the US",
  "entity": "employee",
  "page_size": 10,
  "scroll_token": "eyJvZmZzZXQiOjEwfQ==",
  "es_query": { "bool": { "must": [{ "match_phrase": { "active_experience_title": "VP of Sales" } }] } }
}`;

export const SAMPLE_AI_SEARCH_EMPTY_RESPONSE = `{
  "data": [],
  "meta": {
    "total": 0,
    "total_pages": 0,
    "scroll_token": null,
    "es_query": null
  }
}`;

export const SAMPLE_AI_SEARCH_COMPANY_REQUEST = `{
  "prompt": "Fast-growing fintech companies in Europe with 50-500 employees",
  "entity": "company",
  "page_size": 10
}`;

export const SAMPLE_AI_SEARCH_RESPONSE = `{
  "data": [
    {
      "id": "1029384756",
      "full_name": "Jordan Lee",
      "headline": "VP of Sales at Acme Corp",
      "location_country": "United States",
      "active_experience_title": "VP of Sales",
      "active_experience_company_name": "Acme Corp",
      "active_experience_company_employees_count": 850,
      "has_email": true,
      "work_email": null,
      "personal_email": null,
      "mobile_phone": null
    }
  ],
  "meta": {
    "total": 187,
    "total_pages": 19,
    "scroll_token": "eyJvZmZzZXQiOjEwfQ==",
    "es_query": { "bool": { "must": [{ "match_phrase": { "active_experience_title": "VP of Sales" } }] } }
  }
}`;

export const SAMPLE_AUTOCOMPLETE_REQUEST = `GET /autocomplete?field=job_title&text=vp+sa&size=10`;

export const SAMPLE_AUTOCOMPLETE_RESPONSE = `{
  "suggestions": [
    "vp sales",
    "vp sales and marketing",
    "vp sales operations",
    "vp sales enablement",
    "vp sales engineering"
  ]
}`;

export const SAMPLE_AUTOCOMPLETE_INDUSTRY_REQUEST = `GET /autocomplete?field=industry&text=software&size=5`;

export const SAMPLE_AUTOCOMPLETE_INDUSTRY_RESPONSE = `{
  "suggestions": [
    "Data Security Software Products",
    "Desktop Computing Software Products",
    "Embedded Software Products",
    "IT System Custom Software Development",
    "Mobile Computing Software Products"
  ]
}`;

export const SAMPLE_AUTOCOMPLETE_SENIORITY_REQUEST = `GET /autocomplete?field=seniority&text=v`;

export const SAMPLE_AUTOCOMPLETE_SENIORITY_RESPONSE = `{
  "suggestions": ["vp"]
}`;

export const SAMPLE_AUTOCOMPLETE_VALIDATION_ERROR = `{
  "detail": [
    {
      "type": "literal_error",
      "loc": ["query", "field"],
      "msg": "Input should be 'job_title', 'technology', 'seniority', 'department', 'industry', 'company_status', 'company_how_they_sell', 'company_more_flags', 'company_revenue_model', 'revenue_bucket', 'funding_stage', 'email_provider' or 'certification'",
      "input": "location"
    }
  ]
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

export interface SalesforceFieldMapping {
  leadsbuddyField: string;
  salesforceField: string;
  notes: string;
}

export const SALESFORCE_FIELD_MAPPING: SalesforceFieldMapping[] = [
  { leadsbuddyField: "first_name", salesforceField: "FirstName", notes: "Optional on the Lead object." },
  { leadsbuddyField: "last_name", salesforceField: "LastName", notes: "Required by Salesforce — falls back to the person's full name, then \"Unknown\", if missing." },
  { leadsbuddyField: "Unlocked work email", salesforceField: "Email", notes: "Only sent if the record's work email has been unlocked. A push is rejected if no work email is unlocked." },
  { leadsbuddyField: "Unlocked mobile number", salesforceField: "Phone / MobilePhone", notes: "Only sent if the mobile number has been unlocked." },
  { leadsbuddyField: "active_experience_title", salesforceField: "Title", notes: "Current job title, if known." },
  { leadsbuddyField: "active_experience_company_name", salesforceField: "Company", notes: "Required by Salesforce — falls back to \"Unknown Company\" if missing." },
  { leadsbuddyField: "active_experience_company_website", salesforceField: "Website", notes: "Current employer's website, if known." },
  { leadsbuddyField: "location_city / location_state / location_country", salesforceField: "City / State / Country", notes: "Person's location, if known." },
  { leadsbuddyField: "(fixed value)", salesforceField: "LeadSource", notes: "Always set to \"LeadsBuddy\" so pushed leads are identifiable in Salesforce reports." },
];

export const SAMPLE_SALESFORCE_STATUS_RESPONSE = `{
  "connected": true,
  "salesforce_org_id": "00D5g000000ABCDEFG",
  "salesforce_user_email": "you@yourcompany.com",
  "connected_at": "2026-08-01T09:12:00Z"
}`;

export const SAMPLE_SALESFORCE_PUSH_RESPONSE = `{
  "pushed": 2,
  "failed": 1,
  "results": [
    { "record_id": "abc123", "salesforce_id": "00Q5g000001AbCdEFG", "error": null },
    { "record_id": "def456", "salesforce_id": "00Q5g000001AbCeFGH", "error": null },
    { "record_id": "ghi789", "salesforce_id": null, "error": "Work email must be unlocked before pushing." }
  ]
}`;

export interface HubspotFieldMapping {
  leadsbuddyField: string;
  hubspotField: string;
  notes: string;
}

export const HUBSPOT_FIELD_MAPPING: HubspotFieldMapping[] = [
  { leadsbuddyField: "first_name", hubspotField: "firstname", notes: "Only sent if known." },
  { leadsbuddyField: "last_name", hubspotField: "lastname", notes: "Falls back to the person's full name if the last name isn't known. Omitted entirely if neither is available." },
  { leadsbuddyField: "Unlocked work email", hubspotField: "email", notes: "Only sent if the record's work email has been unlocked. Also used as the match key — pushing the same person again updates their existing HubSpot Contact instead of creating a duplicate." },
  { leadsbuddyField: "Unlocked mobile number", hubspotField: "phone", notes: "Only sent if the mobile number has been unlocked." },
  { leadsbuddyField: "active_experience_title", hubspotField: "jobtitle", notes: "Current job title, if known." },
  { leadsbuddyField: "active_experience_company_name", hubspotField: "company", notes: "Current employer, if known." },
  { leadsbuddyField: "active_experience_company_website", hubspotField: "website", notes: "Current employer's website, if known." },
  { leadsbuddyField: "location_city / location_state / location_country", hubspotField: "city / state / country", notes: "Person's location, if known." },
];

export const SAMPLE_HUBSPOT_STATUS_RESPONSE = `{
  "connected": true,
  "hubspot_hub_id": "12345678",
  "hubspot_hub_domain": "yourcompany.hubspot.com",
  "connected_at": "2026-08-01T09:12:00Z"
}`;

export const SAMPLE_HUBSPOT_PUSH_RESPONSE = `{
  "pushed": 2,
  "failed": 1,
  "results": [
    { "record_id": "abc123", "hubspot_id": "51234567890", "error": null },
    { "record_id": "def456", "hubspot_id": "51234567891", "error": null },
    { "record_id": "ghi789", "hubspot_id": null, "error": "Work email must be unlocked before pushing." }
  ]
}`;

export interface ZohoFieldMapping {
  leadsbuddyField: string;
  zohoField: string;
  notes: string;
}

export const ZOHO_LEAD_FIELD_MAPPING: ZohoFieldMapping[] = [
  { leadsbuddyField: "first_name", zohoField: "First_Name", notes: "Optional on the Lead object." },
  { leadsbuddyField: "last_name", zohoField: "Last_Name", notes: "Required by Zoho — falls back to the person's full name, then \"Unknown\", if missing." },
  { leadsbuddyField: "Unlocked work email", zohoField: "Email", notes: "Only sent if the record's work email has been unlocked." },
  { leadsbuddyField: "Unlocked mobile number", zohoField: "Phone / Mobile", notes: "Only sent if the mobile number has been unlocked." },
  { leadsbuddyField: "active_experience_title", zohoField: "Designation", notes: "Current job title, if known." },
  { leadsbuddyField: "active_experience_company_name", zohoField: "Company", notes: "Required by Zoho — falls back to \"Unknown Company\" if missing." },
  { leadsbuddyField: "active_experience_company_website", zohoField: "Website", notes: "Current employer's website, if known." },
  { leadsbuddyField: "location_city / location_state / location_country", zohoField: "City / State / Country", notes: "Person's location, if known." },
  { leadsbuddyField: "(fixed value)", zohoField: "Lead_Source", notes: "Always set to \"LeadsBuddy\" so pushed leads are identifiable in Zoho reports." },
];

export const ZOHO_ACCOUNT_FIELD_MAPPING: ZohoFieldMapping[] = [
  { leadsbuddyField: "company_name / company_legal_name", zohoField: "Account_Name", notes: "Required by Zoho — falls back to \"Unknown Company\" if missing." },
  { leadsbuddyField: "website", zohoField: "Website", notes: "Company website, if known." },
  { leadsbuddyField: "industry", zohoField: "Industry", notes: "Company industry, if known." },
  { leadsbuddyField: "hq_city / hq_state / hq_country", zohoField: "Billing_City / Billing_State / Billing_Country", notes: "Company headquarters location, if known." },
  { leadsbuddyField: "employees_count", zohoField: "Employees", notes: "Employee count, if known." },
];

export const SAMPLE_ZOHO_STATUS_RESPONSE = `{
  "connected": true,
  "zoho_user_email": "you@yourcompany.com",
  "connected_at": "2026-08-01T09:12:00Z"
}`;

export const SAMPLE_ZOHO_PUSH_RESPONSE = `{
  "pushed": 2,
  "failed": 1,
  "results": [
    { "record_id": "abc123", "zoho_id": "4876876000000123456", "error": null },
    { "record_id": "def456", "zoho_id": "4876876000000123457", "error": null },
    { "record_id": "ghi789", "zoho_id": null, "error": "Zoho error: INVALID_DATA" }
  ]
}`;

export interface InstantlyFieldMapping {
  leadsbuddyField: string;
  instantlyField: string;
  notes: string;
}

export const INSTANTLY_FIELD_MAPPING: InstantlyFieldMapping[] = [
  { leadsbuddyField: "Unlocked work email", instantlyField: "email", notes: "Only sent if the record's work email has been unlocked. A push is rejected if no work email is unlocked." },
  { leadsbuddyField: "first_name", instantlyField: "first_name", notes: "Only sent if known." },
  { leadsbuddyField: "last_name", instantlyField: "last_name", notes: "Falls back to the person's full name if the last name isn't known." },
  { leadsbuddyField: "active_experience_company_name", instantlyField: "company_name", notes: "Current employer, if known." },
  { leadsbuddyField: "Unlocked mobile number", instantlyField: "phone", notes: "Only sent if the mobile number has been unlocked." },
  { leadsbuddyField: "(you choose)", instantlyField: "campaign", notes: "The Instantly campaign the lead is added to — picked from a dropdown each time you push." },
];

export const SAMPLE_INSTANTLY_STATUS_RESPONSE = `{
  "connected": true,
  "connected_at": "2026-08-01T09:12:00Z"
}`;

export const SAMPLE_INSTANTLY_CAMPAIGNS_RESPONSE = `{
  "campaigns": [
    { "id": "9f2b6e2a-1234-4a3d-8b21-abcdef123456", "name": "Q3 Outbound — SaaS founders" },
    { "id": "1a7c9d3e-5678-4b2f-9c34-fedcba654321", "name": "Warm follow-up sequence" }
  ]
}`;

export const SAMPLE_INSTANTLY_PUSH_RESPONSE = `{
  "pushed": 2,
  "failed": 1,
  "results": [
    { "record_id": "abc123", "instantly_lead_id": "l_8f2a1c", "error": null },
    { "record_id": "def456", "instantly_lead_id": "l_9d3b2e", "error": null },
    { "record_id": "ghi789", "instantly_lead_id": null, "error": "Work email must be unlocked before pushing." }
  ]
}`;

export interface SmartreachFieldMapping {
  leadsbuddyField: string;
  smartreachField: string;
  notes: string;
}

export const SMARTREACH_FIELD_MAPPING: SmartreachFieldMapping[] = [
  { leadsbuddyField: "Unlocked work email", smartreachField: "email", notes: "Only sent if the record's work email has been unlocked. A push is rejected if no work email is unlocked." },
  { leadsbuddyField: "first_name", smartreachField: "first_name", notes: "Only sent if known." },
  { leadsbuddyField: "last_name", smartreachField: "last_name", notes: "Falls back to the person's full name if the last name isn't known." },
  { leadsbuddyField: "active_experience_company_name", smartreachField: "company", notes: "Current employer, if known." },
  { leadsbuddyField: "Unlocked mobile number", smartreachField: "phone_number", notes: "Only sent if the mobile number has been unlocked." },
  { leadsbuddyField: "(you choose)", smartreachField: "campaign_id", notes: "The Smartreach campaign the prospect is added to — picked from a dropdown each time you push." },
];

export const SAMPLE_SMARTREACH_STATUS_RESPONSE = `{
  "connected": true,
  "connected_at": "2026-08-01T09:12:00Z"
}`;

export const SAMPLE_SMARTREACH_CAMPAIGNS_RESPONSE = `{
  "campaigns": [
    { "id": "5821", "name": "Q3 Outbound — SaaS founders" },
    { "id": "5834", "name": "Warm follow-up sequence" }
  ]
}`;

export const SAMPLE_SMARTREACH_PUSH_RESPONSE = `{
  "pushed": 2,
  "failed": 1,
  "results": [
    { "record_id": "abc123", "smartreach_prospect_id": "9182734", "error": null },
    { "record_id": "def456", "smartreach_prospect_id": "9182735", "error": null },
    { "record_id": "ghi789", "smartreach_prospect_id": null, "error": "Work email must be unlocked before pushing." }
  ]
}`;

