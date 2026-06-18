from typing import Any, Optional

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


_DEGREE_MAP: dict[str, list[str]] = {
    "associate": [
        "associate", "associates", "associate of arts",
        "associate of science", "associate of applied science",
    ],
    "bachelors": [
        "bachelors", "bachelor", "bachelor of arts", "bachelor of science",
        "bachelor of engineering", "bachelor of business administration",
        "bachelor of fine arts", "bachelor of applied science",
    ],
    "masters": [
        "masters", "master", "master of arts", "master of science",
        "master of engineering", "master of fine arts",
        "master of public administration", "master of public policy",
    ],
    "mba": ["master of business administration", "mba"],
    "phd": [
        "doctor of philosophy", "doctor of medicine", "doctorate", "doctorates",
        "phd", "doctor of science", "doctor of education",
    ],
    "juris doctor": ["juris doctor", "juris doctorate"],
}


def _normalize_domain(raw: str) -> str:
    return (
        raw.lower()
        .replace("https://", "")
        .replace("http://", "")
        .replace("www.", "")
        .rstrip("/")
    )


def _add_multi_term(
    clauses: list[dict],
    field: str,
    values: list[str],
    lowercase: bool = True,
) -> None:
    """Append a term (single) or terms (multi-OR) clause. Use lowercase=False for
    case-sensitive PDL enum fields like company_size and revenue."""
    if not values:
        return
    processed = [v.lower() for v in values] if lowercase else list(values)
    if len(processed) == 1:
        clauses.append({"term": {field: processed[0]}})
    else:
        clauses.append({"terms": {field: processed}})


def _add_multi_match(clauses: list[dict], field: str, values: list[str]) -> None:
    """Append a match (single) or nested bool/should of matches (multi-OR) clause."""
    if not values:
        return
    if len(values) == 1:
        clauses.append({"match": {field: values[0]}})
    else:
        clauses.append({
            "bool": {
                "should": [{"match": {field: v}} for v in values],
                "minimum_should_match": 1,
            }
        })


def _build_bool_query(must: list[dict], filters: list[dict]) -> dict:
    if not must and not filters:
        return {"match_all": {}}
    bool_q: dict[str, Any] = {}
    if must:
        bool_q["must"] = must
    if filters:
        bool_q["filter"] = filters
    return {"bool": bool_q}


def build_person_query(f: PersonSearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []

    if f.first_name:
        must.append({"match": {"first_name": f.first_name.lower()}})
    if f.last_name:
        must.append({"match": {"last_name": f.last_name.lower()}})
    if f.linkedin_url:
        filters.append({"term": {"linkedin_url": f.linkedin_url.lower().rstrip("/")}})

    if f.headline:
        must.append({"match": {"headline": f.headline}})
    if f.summary:
        must.append({"match": {"summary": f.summary}})
    if f.twitter_handle:
        filters.append({"term": {"twitter_username": f.twitter_handle.lstrip("@").lower()}})
    if f.github_url:
        handle = f.github_url.lower().rstrip("/").split("/")[-1]
        filters.append({"term": {"github_username": handle}})
    for lang in (f.languages or []):
        filters.append({"term": {"languages.name": lang.lower()}})
    for skill in (f.skills or []):
        filters.append({"term": {"skills": skill.lower()}})
    for interest in (f.interests or []):
        filters.append({"term": {"interests": interest.lower()}})
    if f.certifications:
        must.append({"match": {"certifications.name": f.certifications}})
    if f.degree:
        mapped = _DEGREE_MAP.get(f.degree.lower(), [f.degree.lower()])
        _add_multi_term(filters, "education.degrees", mapped)
    if f.school:
        must.append({"match": {"education.school.name": f.school}})
    if f.field_of_study:
        filters.append({"term": {"education.majors": f.field_of_study.lower()}})
    if f.linkedin_connections_min is not None:
        filters.append({"range": {"linkedin_connections": {"gte": f.linkedin_connections_min}}})

    _add_multi_match(must, "job_title", f.job_title or [])
    _add_multi_term(filters, "job_title_levels", f.seniority or [])
    _add_multi_term(filters, "job_title_role", f.function or [])
    exp_range: dict[str, int] = {}
    if f.years_experience_min is not None:
        exp_range["gte"] = f.years_experience_min
    if f.years_experience_max is not None:
        exp_range["lte"] = f.years_experience_max
    if exp_range:
        filters.append({"range": {"inferred_years_experience": exp_range}})

    _add_multi_match(must, "job_company_name", f.company_name or [])
    if f.company_linkedin_url:
        filters.append({"term": {"job_company_linkedin_url": f.company_linkedin_url.lower().rstrip("/")}})
    if f.company_domain:
        filters.append({"term": {"job_company_website": _normalize_domain(f.company_domain)}})
    _add_multi_term(filters, "job_company_industry", f.industry or [])
    _add_multi_term(filters, "job_company_size", f.company_size or [], lowercase=False)
    _add_multi_term(filters, "job_company_type", f.company_type or [])
    _add_multi_term(filters, "job_company_inferred_revenue", f.company_revenue or [], lowercase=False)

    _add_multi_match(must, "experience.company.name", f.past_companies or [])
    _add_multi_match(must, "experience.title.name", f.past_titles or [])
    _add_multi_term(filters, "experience.title.levels", f.past_seniority or [])
    _add_multi_term(filters, "experience.title.role", f.past_function or [])

    _add_multi_term(filters, "location_country", f.country or [])
    _add_multi_term(filters, "location_region", f.state or [])
    if f.city:
        filters.append({"term": {"location_locality": f.city.lower()}})

    _add_multi_term(filters, "job_company_location_country", f.hq_country or [])
    _add_multi_term(filters, "job_company_location_region", f.hq_state or [])
    if f.hq_city:
        filters.append({"term": {"job_company_location_locality": f.hq_city.lower()}})

    return _build_bool_query(must, filters)


def build_company_query(f: CompanySearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []

    if f.company_name:
        must.append({"match": {"name": f.company_name.lower()}})
    if f.website_domain:
        filters.append({"term": {"website": _normalize_domain(f.website_domain)}})

    _add_multi_term(filters, "industry", f.industry or [])
    _add_multi_term(filters, "type", f.type or [])
    if f.stock_exchange:
        filters.append({"term": {"mic_exchange": f.stock_exchange.upper()}})

    _add_multi_term(filters, "location.country", f.hq_country or [])
    _add_multi_term(filters, "location.region", f.hq_state or [])
    if f.hq_city:
        filters.append({"term": {"location.locality": f.hq_city.lower()}})
    if f.hq_metro:
        filters.append({"term": {"location.metro": f.hq_metro.lower()}})

    emp_conditions: list[dict] = []
    if f.employee_count_ranges:
        if len(f.employee_count_ranges) == 1:
            emp_conditions.append({"term": {"size": f.employee_count_ranges[0]}})
        else:
            emp_conditions.append({"terms": {"size": f.employee_count_ranges}})
    emp_range: dict[str, int] = {}
    if f.employee_count_min is not None:
        emp_range["gte"] = f.employee_count_min
    if f.employee_count_max is not None:
        emp_range["lte"] = f.employee_count_max
    if emp_range:
        emp_conditions.append({"range": {"employee_count": emp_range}})
    if len(emp_conditions) == 1:
        filters.append(emp_conditions[0])
    elif len(emp_conditions) > 1:
        filters.append({"bool": {"should": emp_conditions, "minimum_should_match": 1}})

    _add_multi_term(filters, "inferred_revenue", f.annual_revenue or [], lowercase=False)
    if f.employee_growth_min is not None:
        filters.append({"range": {"employee_growth_rate.12_month": {"gte": f.employee_growth_min / 100}}})

    founded_range: dict[str, int] = {}
    if f.year_founded_min is not None:
        founded_range["gte"] = f.year_founded_min
    if f.year_founded_max is not None:
        founded_range["lte"] = f.year_founded_max
    if founded_range:
        filters.append({"range": {"founded": founded_range}})

    _add_multi_term(filters, "latest_funding_stage", f.last_funding_round or [])
    if f.total_funding_min is not None:
        filters.append({"range": {"total_funding_raised": {"gte": f.total_funding_min}}})
    if f.most_recent_funding_after:
        filters.append({"range": {"last_funding_date": {"gte": f.most_recent_funding_after}}})

    for rule in (f.role_composition_rules or []):
        if not rule.role:
            continue
        role = rule.role.lower()
        if rule.min_count is not None:
            filters.append({"range": {f"employee_count_by_role.{role}": {"gte": rule.min_count}}})
        if rule.min_growth is not None:
            filters.append({"range": {f"employee_growth_rate_12_month_by_role.{role}": {"gte": rule.min_growth}}})

    return _build_bool_query(must, filters)


_AUTOCOMPLETE_FIELDS: frozenset[str] = frozenset({
    "all_location", "class", "company", "country", "industry",
    "location_name", "major", "region", "role", "school",
    "skill", "sub_role", "title", "website",
})


async def autocomplete(field: str, text: str, size: int = 10) -> list[dict]:
    if field not in _AUTOCOMPLETE_FIELDS:
        return []
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{settings.PDL_BASE_URL}/autocomplete",
            headers={"X-Api-Key": settings.PDL_API_KEY},
            params={"field": field, "text": text, "size": size, "titlecase": "true"},
        )

    if resp.status_code != 200:
        return []

    return resp.json().get("data", [])


def _pdl_headers() -> dict[str, str]:
    return {"X-Api-Key": settings.PDL_API_KEY, "Content-Type": "application/json"}


def _make_search_payload(query: dict, scroll_token: Optional[str]) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "query": query,
        "size": PAGE_SIZE,
        "pretty": False,
        "titlecase": True,
    }
    if scroll_token:
        payload["scroll_token"] = scroll_token
    return payload


def _make_meta(body: dict) -> SearchMeta:
    return SearchMeta(
        total=body.get("total", 0),
        scroll_token=body.get("scroll_token") or None,
    )


def _extract_pdl_error(body: dict) -> str:
    return body.get("error", {}).get("message", "") or "PDL API error"


async def search_persons(req: PersonSearchRequest) -> SearchResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    payload = _make_search_payload(build_person_query(req), req.scroll_token)
    payload["dataset"] = "all"

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{settings.PDL_BASE_URL}/person/search",
            headers=_pdl_headers(),
            json=payload,
        )

    if resp.status_code == 404:
        return SearchResponse(data=[], meta=SearchMeta(total=0))

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=_extract_pdl_error(resp.json()),
        )

    body = resp.json()
    return SearchResponse(data=body.get("data", []), meta=_make_meta(body))


async def search_companies(req: CompanySearchRequest) -> SearchResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    url = f"{settings.PDL_BASE_URL}/company/search"
    headers = _pdl_headers()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            url,
            headers=headers,
            json=_make_search_payload(build_company_query(req), req.scroll_token),
        )

        if resp.status_code == 404:
            return SearchResponse(data=[], meta=SearchMeta(total=0))

        if resp.status_code != 200:
            pdl_msg = _extract_pdl_error(resp.json())

            if (
                resp.status_code == 400
                and "do not have access to query the field" in pdl_msg
                and req.role_composition_rules
            ):
                fallback_req = req.model_copy(update={"role_composition_rules": []})
                resp2 = await client.post(
                    url,
                    headers=headers,
                    json=_make_search_payload(build_company_query(fallback_req), req.scroll_token),
                )
                if resp2.status_code == 200:
                    body2 = resp2.json()
                    return SearchResponse(data=body2.get("data", []), meta=_make_meta(body2))
                if resp2.status_code == 404:
                    return SearchResponse(data=[], meta=SearchMeta(total=0))

            raise HTTPException(status_code=resp.status_code, detail=pdl_msg)

    body = resp.json()
    return SearchResponse(data=body.get("data", []), meta=_make_meta(body))
