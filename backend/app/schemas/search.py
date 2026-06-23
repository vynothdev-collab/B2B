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
    require_mobile: bool = False
    contact_logic: Literal["and", "or"] = "and"

    company_type: Optional[list[str]] = None
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
    scroll_token: Optional[str] = None


class SearchResponse(BaseModel):
    data: list[Any]
    meta: SearchMeta
