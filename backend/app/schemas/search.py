from typing import Any, Optional
from pydantic import BaseModel


class RoleCompositionRule(BaseModel):
    role: str
    min_count: Optional[float] = None
    min_growth: Optional[float] = None

PAGE_SIZE = 10


class PersonSearchRequest(BaseModel):
    # Name & LinkedIn
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    linkedin_url: Optional[str] = None
    # Profile details
    headline: Optional[str] = None
    summary: Optional[str] = None
    twitter_handle: Optional[str] = None
    github_url: Optional[str] = None
    languages: Optional[list[str]] = None
    skills: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    certifications: Optional[str] = None
    degree: Optional[str] = None
    school: Optional[str] = None
    field_of_study: Optional[str] = None
    linkedin_connections_min: Optional[int] = None
    name: Optional[str] = None
    keywords: Optional[str] = None
    # Title & seniority
    job_title: Optional[list[str]] = None
    seniority: Optional[list[str]] = None
    function: Optional[list[str]] = None
    years_experience_min: Optional[int] = None
    years_experience_max: Optional[int] = None
    # Current company
    company_name: Optional[list[str]] = None
    company_linkedin_url: Optional[str] = None
    company_domain: Optional[str] = None
    industry: Optional[list[str]] = None
    company_size: Optional[list[str]] = None
    company_type: Optional[list[str]] = None
    company_revenue: Optional[list[str]] = None
    # Past roles & companies
    past_companies: Optional[list[str]] = None
    past_titles: Optional[list[str]] = None
    past_seniority: Optional[list[str]] = None
    past_function: Optional[list[str]] = None
    # Person location
    country: Optional[list[str]] = None
    state: Optional[list[str]] = None
    city: Optional[str] = None
    # Company HQ location
    hq_country: Optional[list[str]] = None
    hq_state: Optional[list[str]] = None
    hq_city: Optional[str] = None
    # Cursor-based pagination (replaces `from`)
    scroll_token: Optional[str] = None


class CompanySearchRequest(BaseModel):
    # Name & domain
    company_name: Optional[str] = None
    website_domain: Optional[str] = None
    # Industry & type
    industry: Optional[list[str]] = None
    type: Optional[list[str]] = None
    stock_exchange: Optional[str] = None
    # HQ location
    hq_country: Optional[list[str]] = None
    hq_state: Optional[list[str]] = None
    hq_city: Optional[str] = None
    hq_metro: Optional[str] = None
    # Headcount, revenue & growth
    employee_count_ranges: Optional[list[str]] = None
    employee_count_min: Optional[int] = None
    employee_count_max: Optional[int] = None
    annual_revenue: Optional[list[str]] = None
    employee_growth_min: Optional[float] = None
    # Founded, funding & IPO
    year_founded_min: Optional[int] = None
    year_founded_max: Optional[int] = None
    last_funding_round: Optional[list[str]] = None
    total_funding_min: Optional[float] = None
    most_recent_funding_after: Optional[str] = None
    keywords: Optional[str] = None
    # Role mix & hiring growth
    role_composition_rules: Optional[list[RoleCompositionRule]] = None
    # Cursor-based pagination (replaces `from`)
    scroll_token: Optional[str] = None


class PersonRevealRequest(BaseModel):
    pdl_id: str

class PersonRevealResponse(BaseModel):
    work_email: Optional[str] = None
    recommended_personal_email: Optional[str] = None
    mobile_phone: Optional[str] = None
    phone_numbers: Optional[list[str]] = None


class SearchMeta(BaseModel):
    total: int
    # Returned by PDL — pass back to frontend to fetch the next page.
    # Absent when there are no more results.
    scroll_token: Optional[str] = None


class SearchResponse(BaseModel):
    data: list[Any]
    meta: SearchMeta
