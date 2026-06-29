from typing import Any, NoReturn, Optional

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.search import (
    PAGE_SIZE,
    CompanySearchRequest,
    PersonRevealRequest,
    PersonRevealResponse,
    PersonSearchRequest,
    SearchMeta,
    SearchResponse,
)


def _add_multi_term(
    clauses: list[dict],
    field: str,
    values: Optional[list[str]],
    lowercase: bool = True,
) -> None:
    if not values:
        return
    processed = [v.lower() for v in values] if lowercase else list(values)
    if len(processed) == 1:
        clauses.append({"term": {field: processed[0]}})
    else:
        clauses.append({"terms": {field: processed}})


def _add_location_match(clauses: list[dict], field: str, values: Optional[list[str]]) -> None:
    """Match any of the provided canonical location strings against a PDL *location_name* field.

    Uses match_phrase so that picking "san francisco, california, united states" doesn't also
    match every other location containing the words "san" or "francisco".
    """
    if not values:
        return
    cleaned = [v.lower().strip() for v in values if v and v.strip()]
    if not cleaned:
        return
    if len(cleaned) == 1:
        clauses.append({"match_phrase": {field: cleaned[0]}})
    else:
        clauses.append({
            "bool": {
                "should": [{"match_phrase": {field: v}} for v in cleaned],
                "minimum_should_match": 1,
            }
        })


def _add_multi_match(
    clauses: list[dict],
    field: str,
    values: Optional[list[str]],
    phrase: bool = False,
) -> None:
    if not values:
        return
    query_type = "match_phrase" if phrase else "match"
    if len(values) == 1:
        clauses.append({query_type: {field: values[0]}})
    else:
        clauses.append({
            "bool": {
                "should": [{query_type: {field: v}} for v in values],
                "minimum_should_match": 1,
            }
        })


def _add_range(
    clauses: list[dict],
    field: str,
    minv: Optional[float],
    maxv: Optional[float],
) -> None:
    r: dict[str, float] = {}
    if minv is not None:
        r["gte"] = minv
    if maxv is not None:
        r["lte"] = maxv
    if r:
        clauses.append({"range": {field: r}})


def _build_bool_query(
    must: list[dict],
    filters: list[dict],
    should: Optional[list[dict]] = None,
    minimum_should_match: int = 0,
) -> dict:
    if not must and not filters and not should:
        return {"match_all": {}}
    bool_q: dict[str, Any] = {}
    if must:
        bool_q["must"] = must
    if filters:
        bool_q["filter"] = filters
    if should:
        bool_q["should"] = should
        bool_q["minimum_should_match"] = minimum_should_match or 1
    return {"bool": bool_q}


def build_person_query(f: PersonSearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []
    should: list[dict] = []

    if f.name:
        must.append({"match": {"full_name": f.name.lower()}})

    _add_multi_match(must, "job_title", f.job_title)
    _add_multi_term(filters, "job_title_role", f.departments)
    _add_multi_term(filters, "job_title_levels", f.seniority)
    _add_multi_match(must, "job_company_name", f.companies, phrase=True)

    _add_location_match(must, "location_name", f.person_locations)
    _add_location_match(must, "job_company_location_name", f.hq_locations)

    contact_clauses: list[dict] = []
    if f.require_work_email:
        contact_clauses.append({"exists": {"field": "work_email"}})
    if f.require_mobile:
        contact_clauses.append({"exists": {"field": "mobile_phone"}})

    if contact_clauses:
        if f.contact_logic == "or" and len(contact_clauses) > 1:
            should.extend(contact_clauses)
        else:
            filters.extend(contact_clauses)

    _add_multi_term(filters, "job_company_type", f.company_type)
    _add_multi_term(filters, "skills", f.technologies)
    _add_multi_term(filters, "job_company_inferred_revenue", f.revenue_buckets, lowercase=False)

    _add_range(filters, "job_company_total_funding_raised", f.funding_min, f.funding_max)
    _add_range(filters, "job_company_founded", f.founded_min, f.founded_max)

    growth_min = f.headcount_growth_min / 100 if f.headcount_growth_min is not None else None
    growth_max = f.headcount_growth_max / 100 if f.headcount_growth_max is not None else None
    _add_range(filters, "job_company_12mo_employee_growth_rate", growth_min, growth_max)

    return _build_bool_query(must, filters, should if should else None)


def build_company_query(f: CompanySearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []

    _add_multi_match(must, "name", f.companies, phrase=True)

    _add_location_match(must, "location.name", f.locations)

    _add_multi_term(filters, "type", f.type)
    _add_multi_term(filters, "industry", f.industries)
    _add_multi_term(filters, "tags", f.technologies)
    _add_multi_term(filters, "inferred_revenue", f.revenue_buckets, lowercase=False)
    _add_multi_term(filters, "latest_funding_stage", f.funding_stages)

    _add_range(filters, "employee_count", f.employee_count_min, f.employee_count_max)
    _add_range(filters, "total_funding_raised", f.funding_min, f.funding_max)
    _add_range(filters, "founded", f.founded_min, f.founded_max)

    co_growth_min = f.headcount_growth_min / 100 if f.headcount_growth_min is not None else None
    co_growth_max = f.headcount_growth_max / 100 if f.headcount_growth_max is not None else None
    _add_range(
        filters,
        f"employee_growth_rate.{f.headcount_growth_timeframe}",
        co_growth_min,
        co_growth_max,
    )

    if f.headcount_by_location_country:
        country = f.headcount_by_location_country.lower().strip()
        _add_range(
            filters,
            f"employee_count_by_country.{country}",
            f.headcount_by_location_min,
            f.headcount_by_location_max,
        )

    if f.headcount_by_department:
        role = f.headcount_by_department.lower().strip()
        _add_range(
            filters,
            f"employee_count_by_role.{role}",
            f.headcount_by_department_min,
            f.headcount_by_department_max,
        )

    return _build_bool_query(must, filters)


_AUTOCOMPLETE_FIELDS: frozenset[str] = frozenset({
    "class", "company", "country", "industry", "location",
    "major", "region", "role", "school",
    "skill", "sub_role", "title", "website",
})


async def autocomplete(field: str, text: str, size: int = 10) -> list[dict]:
    if field not in _AUTOCOMPLETE_FIELDS:
        return []
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.PDL_BASE_URL}/autocomplete",
                headers={"X-Api-Key": settings.PDL_API_KEY},
                params={"field": field, "text": text, "size": size, "titlecase": "true"},
            )
        if resp.status_code == 200:
            return resp.json().get("data", [])
        return []
    except (httpx.TimeoutException, httpx.RequestError, Exception):
        return []


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
    return body.get("error", {}).get("message", "") or "API error"


def _raise_pdl_error(pdl_status: int, body: dict) -> NoReturn:
    msg = _extract_pdl_error(body)
    if pdl_status == 400:
        raise HTTPException(status_code=400, detail=f"Invalid search parameters: {msg}")
    if pdl_status == 401:
        raise HTTPException(status_code=503, detail="API key is invalid or not configured")
    if pdl_status == 402:
        raise HTTPException(status_code=402, detail="API credit balance exhausted. Please upgrade your plan.")
    if pdl_status == 405:
        raise HTTPException(status_code=500, detail="Internal error: unsupported API request method")
    if pdl_status == 429:
        raise HTTPException(status_code=429, detail="API rate limit reached. Please wait a moment and try again.")
    if pdl_status >= 500:
        raise HTTPException(status_code=502, detail="API is temporarily unavailable. Please try again later.")
    raise HTTPException(status_code=pdl_status, detail=msg)


def _person_needs_company_prefetch(req: PersonSearchRequest) -> bool:
    """Only prefetch when the user has actually narrowed the company set.

    Setting just a country/department without a min or max would translate into a match_all
    company query — burning API credits to fetch arbitrary companies that aren't really filtered.
    """
    dept_active = bool(req.headcount_by_department) and (
        req.headcount_by_department_min is not None
        or req.headcount_by_department_max is not None
    )
    loc_active = bool(req.headcount_by_location_country) and (
        req.headcount_by_location_min is not None
        or req.headcount_by_location_max is not None
    )
    return dept_active or loc_active


async def _prefetch_company_ids_for_person(req: PersonSearchRequest, limit: int = 500) -> list[str]:
    """Run a Company Search using just the headcount-derived filters and return matching company IDs.

    Used because PDL's person dataset does not carry per-role or per-country headcount breakdowns —
    so we look up matching companies first and then constrain the person query to those job_company_id values.
    """
    co_req = CompanySearchRequest(
        headcount_by_department=req.headcount_by_department,
        headcount_by_department_min=req.headcount_by_department_min,
        headcount_by_department_max=req.headcount_by_department_max,
        headcount_by_location_country=req.headcount_by_location_country,
        headcount_by_location_min=req.headcount_by_location_min,
        headcount_by_location_max=req.headcount_by_location_max,
    )

    payload = _make_search_payload(build_company_query(co_req), None)
    payload["size"] = limit

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{settings.PDL_BASE_URL}/company/search",
            headers=_pdl_headers(),
            json=payload,
        )

    if resp.status_code == 200:
        body = resp.json()
        return [c["id"] for c in body.get("data", []) if c.get("id")]
    if resp.status_code == 404:
        return []
    _raise_pdl_error(resp.status_code, resp.json())


async def search_persons(req: PersonSearchRequest) -> SearchResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    company_id_constraint: Optional[list[str]] = None
    if _person_needs_company_prefetch(req):
        try:
            company_id_constraint = await _prefetch_company_ids_for_person(req)
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")
        if not company_id_constraint:
            return SearchResponse(data=[], meta=SearchMeta(total=0))

    query = build_person_query(req)
    if company_id_constraint:
        terms_clause = {"terms": {"job_company_id": company_id_constraint}}
        if "bool" in query:
            query["bool"].setdefault("filter", []).append(terms_clause)
        else:
            query = {"bool": {"filter": [terms_clause]}}

    payload = _make_search_payload(query, req.scroll_token)
    payload["dataset"] = "all"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.PDL_BASE_URL}/person/search",
                headers=_pdl_headers(),
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    if resp.status_code == 200:
        body = resp.json()
        return SearchResponse(data=body.get("data", []), meta=_make_meta(body))
    if resp.status_code == 404:
        return SearchResponse(data=[], meta=SearchMeta(total=0))
    _raise_pdl_error(resp.status_code, resp.json())


async def search_companies(req: CompanySearchRequest) -> SearchResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    payload = _make_search_payload(build_company_query(req), req.scroll_token)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.PDL_BASE_URL}/company/search",
                headers=_pdl_headers(),
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    if resp.status_code == 200:
        body = resp.json()
        return SearchResponse(data=body.get("data", []), meta=_make_meta(body))
    if resp.status_code == 404:
        return SearchResponse(data=[], meta=SearchMeta(total=0))
    _raise_pdl_error(resp.status_code, resp.json())


async def enrich_person(req: PersonRevealRequest) -> PersonRevealResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{settings.PDL_BASE_URL}/person/enrich",
                headers={"X-Api-Key": settings.PDL_API_KEY},
                params={
                    "pdl_id": req.pdl_id,
                    "min_likelihood": 6,
                    "required": "work_email OR recommended_personal_email OR mobile_phone",
                },
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    if resp.status_code == 200:
        body = resp.json()
        data = body.get("data", {})
        return PersonRevealResponse(
            work_email=data.get("work_email"),
            recommended_personal_email=data.get("recommended_personal_email"),
            mobile_phone=data.get("mobile_phone"),
            phone_numbers=data.get("phone_numbers"),
        )
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="No contact data found for this person")
    _raise_pdl_error(resp.status_code, resp.json())
