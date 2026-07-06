from typing import Any, Literal, Optional
from pydantic import BaseModel


PAGE_SIZE = 10


class PersonSearchRequest(BaseModel):
    name: Optional[str] = None
    job_title: Optional[list[str]] = None
    departments: Optional[list[str]] = None
    seniority: Optional[list[str]] = None
    companies: Optional[list[str]] = None

    person_locations: Optional[list[str]] = None
    hq_locations: Optional[list[str]] = None

    require_work_email: bool = False

    company_type: Optional[list[str]] = None
    company_status: Optional[list[str]] = None
    company_how_they_sell: Optional[list[str]] = None
    company_more_flags: Optional[list[str]] = None
    company_revenue_model: Optional[list[str]] = None
    industries: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    revenue_buckets: Optional[list[str]] = None

    funding_min: Optional[float] = None
    funding_max: Optional[float] = None
    headcount_growth_min: Optional[float] = None
    headcount_growth_max: Optional[float] = None

    headcount_by_department: Optional[str] = None
    headcount_by_department_min: Optional[int] = None
    headcount_by_department_max: Optional[int] = None

    headcount_by_location_country: Optional[str] = None
    headcount_by_location_min: Optional[int] = None
    headcount_by_location_max: Optional[int] = None

    founded_min: Optional[int] = None
    founded_max: Optional[int] = None

    employee_count_min: Optional[int] = None
    employee_count_max: Optional[int] = None

    # Website traffic filters — map to CoreSignal monthly_visits / monthly_visits_change / traffic_by_country
    website_visits_min: Optional[int] = None
    website_visits_max: Optional[int] = None
    visit_change_timeframe: Literal["monthly", "quarterly", "yearly"] = "monthly"
    visit_change_min: Optional[float] = None
    visit_change_max: Optional[float] = None
    traffic_country: Optional[str] = None
    traffic_country_min: Optional[float] = None
    traffic_country_max: Optional[float] = None

    # Company news filters — requires separate news API integration (not yet wired to CoreSignal)
    company_news_keywords: Optional[list[str]] = None
    company_news_categories: Optional[list[str]] = None
    company_news_timeframe: Optional[str] = None

    # Email provider — matched via technologies_used nested field
    email_providers: Optional[list[str]] = None

    # Awards & certifications — matched via short_description text search
    awards: Optional[list[str]] = None
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


class CompanySearchRequest(BaseModel):
    companies: Optional[list[str]] = None
    locations: Optional[list[str]] = None

    type: Optional[list[str]] = None

    employee_count_min: Optional[int] = None
    employee_count_max: Optional[int] = None

    industries: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    revenue_buckets: Optional[list[str]] = None

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

    company_status: Optional[list[str]] = None
    company_how_they_sell: Optional[list[str]] = None
    company_more_flags: Optional[list[str]] = None
    company_revenue_model: Optional[list[str]] = None
    company_news_keywords: Optional[list[str]] = None
    company_news_categories: Optional[list[str]] = None
    company_news_timeframe: Optional[str] = None

    scroll_token: Optional[str] = None


class SearchMeta(BaseModel):
    total: int
    scroll_token: Optional[str] = None


class SearchResponse(BaseModel):
    data: list[Any]
    meta: SearchMeta
