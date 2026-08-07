from typing import Any, Literal

from pydantic import BaseModel, Field

PAGE_SIZE = 10


class PersonSearchRequest(BaseModel):
    name: list[str] | None = None
    job_title: list[str] | None = None
    job_title_match_type: Literal["contains", "exact"] = "contains"
    departments: list[str] | None = None
    seniority: list[str] | None = None
    companies: list[str] | None = None

    person_location_countries: list[str] | None = None
    person_location_states: list[str] | None = None
    person_location_cities: list[str] | None = None
    hq_countries: list[str] | None = None
    hq_states: list[str] | None = None
    hq_cities: list[str] | None = None

    require_work_email: bool = False

    company_type: list[str] | None = None
    company_status: list[str] | None = None
    industries: list[str] | None = None
    technologies: list[str] | None = None
    revenue_buckets: list[str] | None = None
    revenue_min: float | None = None
    revenue_max: float | None = None

    funding_min: float | None = None
    funding_max: float | None = None
    headcount_growth_min: float | None = None
    headcount_growth_max: float | None = None

    founded_min: int | None = None
    founded_max: int | None = None

    employee_count_min: int | None = None
    employee_count_max: int | None = None

    keywords_include: list[str] | None = None
    keywords_match_mode: Literal["any", "all"] = "any"
    keywords_scope: list[str] | None = None
    keywords_exclude: list[str] | None = None

    company_news_keywords: list[str] | None = None
    company_news_categories: list[str] | None = None
    company_news_timeframe: str | None = None

    certifications: list[str] | None = None
    other_compliance: list[str] | None = None

    exclude_person_ids: list[str] | None = None
    exclude_company_ids: list[str] | None = None
    exclude_company_names: list[str] | None = None

    time_in_role_min_months: int | None = None
    time_in_role_max_months: int | None = None
    time_in_company_min_months: int | None = None
    time_in_company_max_months: int | None = None

    experience_years_min: float | None = None
    experience_years_max: float | None = None

    job_posting_keywords: list[str] | None = None

    linkedin_url: list[str] | None = None

    scroll_token: str | None = None
    page_size: int = Field(default=10, ge=1, le=1000)


class CompanySearchRequest(BaseModel):
    companies: list[str] | None = None
    location_countries: list[str] | None = None
    location_states: list[str] | None = None
    location_cities: list[str] | None = None

    type: list[str] | None = None

    employee_count_min: int | None = None
    employee_count_max: int | None = None

    industries: list[str] | None = None
    technologies: list[str] | None = None
    revenue_buckets: list[str] | None = None
    revenue_min: float | None = None
    revenue_max: float | None = None

    funding_min: float | None = None
    funding_max: float | None = None
    funding_stages: list[str] | None = None

    headcount_growth_timeframe: Literal[
        "3_month", "6_month", "12_month", "24_month"
    ] = "12_month"
    headcount_growth_min: float | None = None
    headcount_growth_max: float | None = None

    headcount_by_location_country: str | None = None
    headcount_by_location_min: int | None = None
    headcount_by_location_max: int | None = None

    headcount_by_department: str | None = None
    headcount_by_department_min: int | None = None
    headcount_by_department_max: int | None = None

    founded_min: int | None = None
    founded_max: int | None = None

    website_visits_min: int | None = None
    website_visits_max: int | None = None
    visit_change_timeframe: Literal["monthly", "quarterly", "yearly"] = "monthly"
    visit_change_min: float | None = None
    visit_change_max: float | None = None
    traffic_country: str | None = None
    traffic_country_min: float | None = None
    traffic_country_max: float | None = None

    email_providers: list[str] | None = None

    awards: list[str] | None = None
    certifications: list[str] | None = None
    other_compliance: list[str] | None = None

    job_posting_keywords: list[str] | None = None

    keywords_include: list[str] | None = None
    keywords_match_mode: Literal["any", "all"] = "any"
    keywords_scope: list[str] | None = None
    keywords_exclude: list[str] | None = None

    company_status: list[str] | None = None
    company_how_they_sell: list[str] | None = None
    company_more_flags: list[str] | None = None
    company_revenue_model: list[str] | None = None
    company_news_keywords: list[str] | None = None
    company_news_categories: list[str] | None = None
    company_news_timeframe: str | None = None

    scroll_token: str | None = None
    page_size: int = Field(default=10, ge=1, le=1000)


class SearchMeta(BaseModel):
    total: int
    total_pages: int | None = None
    scroll_token: str | None = None
    es_query: dict | None = None


class SearchResponse(BaseModel):
    data: list[Any]
    meta: SearchMeta


class AgenticSearchRequest(BaseModel):
    prompt: str
    entity: Literal["employee", "company"] = "employee"
    scroll_token: str | None = None
    page_size: int = Field(default=10, ge=1, le=1000)
    es_query: dict | None = None


class EmailUnlockResponse(BaseModel):
    record_id: str
    email: str | None = None
    has_email: bool
    already_unlocked: bool = False
    credits_charged: int = 0


class PhoneUnlockResponse(BaseModel):
    record_id: str
    phone: str | None = None
    has_phone: bool
    already_unlocked: bool = False
    credits_charged: int = 0


class TitleAutocompleteResponse(BaseModel):
    suggestions: list[str]
