from typing import Any

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.search import (
    PAGE_SIZE,
    CompanySearchRequest,
    PersonSearchRequest,
    SearchMeta,
    SearchResponse,
)


# ─── Query Builders ───────────────────────────────────────────────────────────

def _add_multi_term(clauses: list, field: str, values: list[str]) -> None:
    """Adds a bool/should term block for multi-value enum fields."""
    if not values:
        return
    if len(values) == 1:
        clauses.append({"term": {field: values[0].lower()}})
    else:
        clauses.append({
            "bool": {
                "should": [{"term": {field: v.lower()}} for v in values],
                "minimum_should_match": 1,
            }
        })


def build_person_query(f: PersonSearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []

    # Name & LinkedIn
    if f.first_name:
        must.append({"match": {"first_name": f.first_name.lower()}})
    if f.last_name:
        must.append({"match": {"last_name": f.last_name.lower()}})
    if f.linkedin_url:
        filters.append({"term": {"linkedin_url": f.linkedin_url.lower().rstrip("/")}})

    # Profile details
    if f.headline:
        must.append({"match": {"headline": f.headline}})
    if f.summary:
        must.append({"match": {"summary": f.summary}})
    if f.twitter_handle:
        filters.append({"term": {"twitter_username": f.twitter_handle.lstrip("@").lower()}})
    if f.languages:
        for lang in f.languages:
            filters.append({"term": {"languages.name": lang.lower()}})
    if f.skills:
        for skill in f.skills:
            filters.append({"term": {"skills": skill.lower()}})
    if f.certifications:
        must.append({"match": {"certifications.name": f.certifications}})
    if f.degree:
        filters.append({"term": {"education.degrees": f.degree.lower()}})
    if f.school:
        must.append({"match": {"education.school.name": f.school}})
    if f.field_of_study:
        filters.append({"term": {"education.majors": f.field_of_study.lower()}})
    if f.linkedin_connections_min is not None:
        filters.append({"range": {"linkedin_connections": {"gte": f.linkedin_connections_min}}})

    # Title & seniority
    if f.job_title:
        must.append({"match": {"job_title": f.job_title}})
    if f.seniority:
        _add_multi_term(filters, "job_title_levels", f.seniority)
    if f.function:
        filters.append({"term": {"job_title_role": f.function.lower()}})
    exp_range: dict[str, int] = {}
    if f.years_experience_min is not None:
        exp_range["gte"] = f.years_experience_min
    if f.years_experience_max is not None:
        exp_range["lte"] = f.years_experience_max
    if exp_range:
        filters.append({"range": {"inferred_years_experience": exp_range}})

    # Current company
    if f.company_name:
        must.append({"match": {"job_company_name": f.company_name}})
    if f.company_linkedin_url:
        filters.append({"term": {"job_company_linkedin_url": f.company_linkedin_url.lower().rstrip("/")}})
    if f.company_domain:
        domain = f.company_domain.lower().replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
        filters.append({"term": {"job_company_website": domain}})
    if f.industry:
        filters.append({"term": {"job_company_industry": f.industry.lower()}})
    if f.company_size:
        filters.append({"term": {"job_company_size": f.company_size}})

    # Past roles & companies
    if f.past_companies:
        must.append({"match": {"experience.company.name": f.past_companies}})
    if f.past_titles:
        must.append({"match": {"experience.title.name": f.past_titles}})
    if f.past_seniority:
        _add_multi_term(filters, "experience.title.levels", f.past_seniority)
    if f.past_function:
        filters.append({"term": {"experience.title.role": f.past_function.lower()}})

    # Person location
    if f.country:
        filters.append({"term": {"location_country": f.country.lower()}})
    if f.state:
        filters.append({"term": {"location_region": f.state.lower()}})
    if f.city:
        filters.append({"term": {"location_locality": f.city.lower()}})

    # Company HQ location
    if f.hq_country:
        filters.append({"term": {"job_company_location_country": f.hq_country.lower()}})
    if f.hq_state:
        filters.append({"term": {"job_company_location_region": f.hq_state.lower()}})
    if f.hq_city:
        filters.append({"term": {"job_company_location_locality": f.hq_city.lower()}})

    if not must and not filters:
        return {"match_all": {}}

    bool_q: dict[str, Any] = {}
    if must:
        bool_q["must"] = must
    if filters:
        bool_q["filter"] = filters
    return {"bool": bool_q}


def build_company_query(f: CompanySearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []

    # Name & domain
    if f.company_name:
        must.append({"match": {"name": f.company_name.lower()}})
    if f.website_domain:
        domain = f.website_domain.lower().replace("https://", "").replace("http://", "").replace("www.", "").rstrip("/")
        filters.append({"term": {"website": domain}})

    # Industry & type
    if f.industry:
        filters.append({"term": {"industry": f.industry.lower()}})
    if f.type:
        filters.append({"term": {"type": f.type.lower()}})
    if f.stock_exchange:
        filters.append({"term": {"mic_exchange": f.stock_exchange.upper()}})

    # HQ location
    if f.hq_country:
        filters.append({"term": {"location.country": f.hq_country.lower()}})
    if f.hq_state:
        filters.append({"term": {"location.region": f.hq_state.lower()}})
    if f.hq_city:
        filters.append({"term": {"location.locality": f.hq_city.lower()}})

    # Headcount
    emp_range: dict[str, int] = {}
    if f.employee_count_min is not None:
        emp_range["gte"] = f.employee_count_min
    if f.employee_count_max is not None:
        emp_range["lte"] = f.employee_count_max
    if emp_range:
        filters.append({"range": {"employee_count": emp_range}})

    # Revenue & growth
    if f.annual_revenue:
        filters.append({"term": {"inferred_revenue": f.annual_revenue}})
    if f.employee_growth_min is not None:
        filters.append({"range": {"employee_growth_rate.12_month": {"gte": f.employee_growth_min / 100}}})

    # Founded
    founded_range: dict[str, int] = {}
    if f.year_founded_min is not None:
        founded_range["gte"] = f.year_founded_min
    if f.year_founded_max is not None:
        founded_range["lte"] = f.year_founded_max
    if founded_range:
        filters.append({"range": {"founded": founded_range}})

    # Funding
    if f.last_funding_round:
        filters.append({"term": {"latest_funding_stage": f.last_funding_round.lower()}})
    if f.total_funding_min is not None:
        filters.append({"range": {"total_funding_raised": {"gte": f.total_funding_min}}})
    if f.most_recent_funding_after:
        filters.append({"range": {"last_funding_date": {"gte": f.most_recent_funding_after}}})

    # Role composition (Premium Insights)
    if f.role_composition_role and f.role_composition_min is not None:
        filters.append({
            "range": {
                f"employee_count_by_role.{f.role_composition_role.lower()}": {
                    "gte": f.role_composition_min
                }
            }
        })

    if not must and not filters:
        return {"match_all": {}}

    bool_q: dict[str, Any] = {}
    if must:
        bool_q["must"] = must
    if filters:
        bool_q["filter"] = filters
    return {"bool": bool_q}


# ─── PDL API Calls ────────────────────────────────────────────────────────────

def _make_meta(body: dict) -> SearchMeta:
    return SearchMeta(
        total=body.get("total", 0),
        scroll_token=body.get("scroll_token") or None,
    )


async def search_persons(req: PersonSearchRequest) -> SearchResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    query = build_person_query(req)

    payload: dict[str, Any] = {
        "query": query,
        "size": PAGE_SIZE,
        "dataset": "all",
        "pretty": False,
        "titlecase": True,
    }
    if req.scroll_token:
        payload["scroll_token"] = req.scroll_token

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{settings.PDL_BASE_URL}/person/search",
            headers={"X-Api-Key": settings.PDL_API_KEY, "Content-Type": "application/json"},
            json=payload,
        )

    if resp.status_code == 404:
        return SearchResponse(data=[], meta=SearchMeta(total=0))

    if resp.status_code != 200:
        body = resp.json()
        raise HTTPException(
            status_code=resp.status_code,
            detail=body.get("error", {}).get("message", "PDL API error"),
        )

    body = resp.json()
    return SearchResponse(data=body.get("data", []), meta=_make_meta(body))


async def search_companies(req: CompanySearchRequest) -> SearchResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    query = build_company_query(req)

    payload: dict[str, Any] = {
        "query": query,
        "size": PAGE_SIZE,
        "dataset": "all",
        "pretty": False,
        "titlecase": True,
    }
    if req.scroll_token:
        payload["scroll_token"] = req.scroll_token

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{settings.PDL_BASE_URL}/company/search",
            headers={"X-Api-Key": settings.PDL_API_KEY, "Content-Type": "application/json"},
            json=payload,
        )

    if resp.status_code == 404:
        return SearchResponse(data=[], meta=SearchMeta(total=0))

    if resp.status_code != 200:
        body = resp.json()
        raise HTTPException(
            status_code=resp.status_code,
            detail=body.get("error", {}).get("message", "PDL API error"),
        )

    body = resp.json()
    return SearchResponse(data=body.get("data", []), meta=_make_meta(body))
