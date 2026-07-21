from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


PAGE_SIZE = 10


class PersonSearchRequest(BaseModel):
    name: Optional[list[str]] = None
    job_title: Optional[list[str]] = None
    job_title_match_type: Literal["contains", "exact"] = "contains"
    departments: Optional[list[str]] = None
    seniority: Optional[list[str]] = None
    companies: Optional[list[str]] = None

    person_location_countries: Optional[list[str]] = None
    person_location_states: Optional[list[str]] = None
    person_location_cities: Optional[list[str]] = None
    hq_countries: Optional[list[str]] = None
    hq_states: Optional[list[str]] = None
    hq_cities: Optional[list[str]] = None

    require_work_email: bool = False

    company_type: Optional[list[str]] = None
    company_status: Optional[list[str]] = None
    industries: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    revenue_buckets: Optional[list[str]] = None
    revenue_min: Optional[float] = None
    revenue_max: Optional[float] = None

    funding_min: Optional[float] = None
    funding_max: Optional[float] = None
    headcount_growth_min: Optional[float] = None
    headcount_growth_max: Optional[float] = None

    founded_min: Optional[int] = None
    founded_max: Optional[int] = None

    employee_count_min: Optional[int] = None
    employee_count_max: Optional[int] = None

    # Keyword search — matched against company description fields
    keywords_include: Optional[list[str]] = None
    keywords_match_mode: Literal["any", "all"] = "any"
    keywords_scope: Optional[list[str]] = None   # None / empty = search everywhere
    keywords_exclude: Optional[list[str]] = None

    # Company news filters — requires separate news API integration (not yet wired to CoreSignal)
    company_news_keywords: Optional[list[str]] = None
    company_news_categories: Optional[list[str]] = None
    company_news_timeframe: Optional[str] = None

    certifications: Optional[list[str]] = None
    other_compliance: Optional[list[str]] = None

    # Duplicate control
    exclude_person_ids: Optional[list[str]] = None
    exclude_company_ids: Optional[list[str]] = None
    exclude_company_names: Optional[list[str]] = None

    # Time-based experience filters
    # time_in_role / time_in_company: total months min/max in current role or company
    time_in_role_min_months: Optional[int] = None
    time_in_role_max_months: Optional[int] = None
    time_in_company_min_months: Optional[int] = None
    time_in_company_max_months: Optional[int] = None

    # Total years of experience → maps to total_experience_in_months
    experience_years_min: Optional[float] = None
    experience_years_max: Optional[float] = None

    # Job posting keywords — company-level prefetch filter
    job_posting_keywords: Optional[list[str]] = None

    scroll_token: Optional[str] = None
    page_size: int = Field(default=10, ge=1, le=1000)


class CompanySearchRequest(BaseModel):
    companies: Optional[list[str]] = None
    location_countries: Optional[list[str]] = None
    location_states: Optional[list[str]] = None
    location_cities: Optional[list[str]] = None

    type: Optional[list[str]] = None

    employee_count_min: Optional[int] = None
    employee_count_max: Optional[int] = None

    industries: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    revenue_buckets: Optional[list[str]] = None
    revenue_min: Optional[float] = None
    revenue_max: Optional[float] = None

    funding_min: Optional[float] = None
    funding_max: Optional[float] = None
    funding_stages: Optional[list[str]] = None

    headcount_growth_timeframe: Literal["3_month", "6_month", "12_month", "24_month"] = "12_month"
    headcount_growth_min: Optional[float] = None
    headcount_growth_max: Optional[float] = None

    headcount_by_location_country: Optional[str] = None
    headcount_by_location_min: Optional[int] = None
    headcount_by_location_max: Optional[int] = None

    headcount_by_department: Optional[str] = None
    headcount_by_department_min: Optional[int] = None
    headcount_by_department_max: Optional[int] = None

    founded_min: Optional[int] = None
    founded_max: Optional[int] = None

    # Website traffic
    website_visits_min: Optional[int] = None
    website_visits_max: Optional[int] = None
    visit_change_timeframe: Literal["monthly", "quarterly", "yearly"] = "monthly"
    visit_change_min: Optional[float] = None
    visit_change_max: Optional[float] = None
    traffic_country: Optional[str] = None
    traffic_country_min: Optional[float] = None
    traffic_country_max: Optional[float] = None

    # Email provider — matched via technologies_used nested field
    email_providers: Optional[list[str]] = None

    # Awards & certifications — matched via short_description text search
    awards: Optional[list[str]] = None
    certifications: Optional[list[str]] = None
    other_compliance: Optional[list[str]] = None

    # Job posting keyword search
    job_posting_keywords: Optional[list[str]] = None

    # Keyword search — matched against company description fields
    keywords_include: Optional[list[str]] = None
    keywords_match_mode: Literal["any", "all"] = "any"
    keywords_scope: Optional[list[str]] = None
    keywords_exclude: Optional[list[str]] = None

    company_status: Optional[list[str]] = None
    company_how_they_sell: Optional[list[str]] = None
    company_more_flags: Optional[list[str]] = None
    company_revenue_model: Optional[list[str]] = None
    company_news_keywords: Optional[list[str]] = None
    company_news_categories: Optional[list[str]] = None
    company_news_timeframe: Optional[str] = None

    scroll_token: Optional[str] = None
    page_size: int = Field(default=10, ge=1, le=1000)


class SearchMeta(BaseModel):
    total: int
    total_pages: Optional[int] = None
    scroll_token: Optional[str] = None
    es_query: Optional[dict] = None  # Returned by agentic search so frontend can cache it


class SearchResponse(BaseModel):
    data: list[Any]
    meta: SearchMeta


class AgenticSearchRequest(BaseModel):
    prompt: str
    entity: Literal["employee", "company"] = "employee"
    scroll_token: Optional[str] = None
    page_size: int = Field(default=10, ge=1, le=1000)
    es_query: Optional[dict] = None  # Cached ES-DSL query for page 2+ (skips agentic re-call)


class EmailRevealResponse(BaseModel):
    record_id: str
    email: Optional[str] = None
    has_email: bool


class TitleAutocompleteResponse(BaseModel):
    suggestions: list[str]
