from typing import Any, Optional

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


_DEGREE_MAP: dict[str, list[str]] = {
    "high_school": [
        "high school diploma", "ged", "secondary school diploma",
        "high school", "secondary education",
    ],
    "associate": [
        "associates", "associate of arts",
    ],
    "bachelors": [
        "bachelors",
        "bachelor of aerospace engineering",
        "bachelor of applied science",
        "bachelor of architecture",
        "bachelor of arts",
        "bachelor of arts in business administration",
        "bachelor of arts in communication",
        "bachelor of arts in education",
        "bachelor of biosystems engineering",
        "bachelor of business administration",
        "bachelor of chemical engineering",
        "bachelor of civil engineering",
        "bachelor of commerce",
        "bachelor of design",
        "bachelor of education",
        "bachelor of electrical engineering",
        "bachelor of engineering",
        "bachelor of fine arts",
        "bachelor of general studies",
        "bachelor of industrial & systems engineering",
        "bachelor of industrial design",
        "bachelor of interdisciplinary studies",
        "bachelor of interior architecture",
        "bachelor of law",
        "bachelor of liberal arts",
        "bachelor of liberal arts and sciences",
        "bachelor of materials engineering",
        "bachelor of mathematics",
        "bachelor of mechanical engineering",
        "bachelor of medicine",
        "bachelor of music",
        "bachelor of music education",
        "bachelor of pharmacy",
        "bachelor of polymer and fiber engineering",
        "bachelor of professional health science",
        "bachelor of science",
        "bachelor of science in aerospace engineering",
        "bachelor of science in biomedical engineering",
        "bachelor of science in business administration",
        "bachelor of science in chemical engineering",
        "bachelor of science in chemistry",
        "bachelor of science in civil engineering",
        "bachelor of science in commerce business administration",
        "bachelor of science in computer science",
        "bachelor of science in education",
        "bachelor of science in electrical engineering",
        "bachelor of science in engineering",
        "bachelor of science in engineering technology",
        "bachelor of science in geology",
        "bachelor of science in human environmental sciences",
        "bachelor of science in materials engineering",
        "bachelor of science in mechanical engineering",
        "bachelor of science in metallurgical engineering",
        "bachelor of science in microbiology",
        "bachelor of science in nursing",
        "bachelor of science in social work",
        "bachelor of social work",
        "bachelor of software engineering",
        "bachelor of technology",
        "bachelor of textile engineering",
        "bachelor of textile management and technology",
        "bachelor of veterinary science",
        "bachelor of wireless engineering",
    ],
    "masters": [
        "masters",
        "master of accountancy",
        "master of accounting",
        "master of aerospace engineering",
        "master of agriculture",
        "master of applied mathematics",
        "master of aquaculture",
        "master of arts",
        "master of arts in education",
        "master of arts in teaching",
        "master of building construction",
        "master of chemical engineering",
        "master of civil engineering",
        "master of commerce",
        "master of communication disorders",
        "master of community planning",
        "master of dental surgery",
        "master of design",
        "master of divinity",
        "master of education",
        "master of electrical engineering",
        "master of engineering",
        "master of fine arts",
        "master of health science",
        "master of hispanic studies",
        "master of industrial design",
        "master of integrated design and construction",
        "master of international studies",
        "master of landscape architecture",
        "master of laws",
        "master of liberal arts",
        "master of library & information studies",
        "master of library science",
        "master of materials engineering",
        "master of mechanical engineering",
        "master of music",
        "master of natural resources",
        "master of nurse anesthesia",
        "master of political science",
        "master of probability and statistics",
        "master of professional studies",
        "master of public administration",
        "master of public health",
        "master of real estate development",
        "master of rehabilitation counseling",
        "master of science",
        "master of science in aerospace engineering",
        "master of science in basic medical sciences",
        "master of science in biomedical engineering",
        "master of science in chemical engineering",
        "master of science in chemistry",
        "master of science in civil engineering",
        "master of science in computer science",
        "master of science in criminal justice",
        "master of science in education",
        "master of science in electrical engineering",
        "master of science in engineering science & mechanics",
        "master of science in forensic science",
        "master of science in health administration",
        "master of science in health informatics",
        "master of science in human environmental sciences",
        "master of science in industrial engineering",
        "master of science in information systems",
        "master of science in instructional leadership administration",
        "master of science in justice and public safety",
        "master of science in marine science",
        "master of science in materials engineering",
        "master of science in mechanical engineering",
        "master of science in metallurgical engineering",
        "master of science in nursing",
        "master of science in occupational therapy",
        "master of science in operations research",
        "master of science in physician assistant studies",
        "master of science in public health",
        "master of science in software engineering",
        "master of social work",
        "master of software engineering",
        "master of tax accounting",
        "master of taxation",
        "master of technical & professional communication",
        "master of technology",
        "master of urban and regional planning",
        "magister juris",
        "magisters",
    ],
    "mba": ["master of business administration"],
    "phd": [
        "doctor of philosophy",
        "doctor of science",
        "doctor of education",
        "doctor of business administration",
        "doctor of audiology",
        "doctor of chiropractic",
        "doctor of musical arts",
        "doctor of ministry",
        "doctor of nursing practice",
        "doctor of physical therapy",
        "doctor of psychology",
        "doctor of public health",
        "doctorates",
    ],
    "md": ["doctor of medicine"],
    "juris_doctor": [
        "doctor of jurisprudence",
    ],
    "dds": [
        "doctor of dental surgery",
        "doctor of medical dentistry",
    ],
    "pharmd": ["doctor of pharmacy"],
    "dvm": ["doctor of veterinary medicine"],
    "od": ["doctor of optometry"],
    "do": ["doctor of osteophathy"],
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

    if f.name:
        must.append({"match": {"full_name": f.name.lower()}})
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
        canonical: list[str] = []
        for d in f.degree:
            canonical.extend(_DEGREE_MAP.get(d.lower(), [d.lower()]))
        _add_multi_term(filters, "education.degrees", canonical)
    if f.school:
        must.append({"match": {"education.school.name": f.school}})
    if f.field_of_study:
        filters.append({"term": {"education.majors": f.field_of_study.lower()}})
    if f.linkedin_connections_min is not None:
        filters.append({"range": {"linkedin_connections": {"gte": f.linkedin_connections_min}}})

    _add_multi_match(must, "job_title", f.job_title or [])
    _add_multi_term(filters, "job_title_levels", f.seniority or [])
    _add_multi_term(filters, "job_title_role", f.department or [])
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
    _add_multi_term(filters, "experience.title.role", f.past_department or [])

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


async def enrich_person(req: PersonRevealRequest) -> PersonRevealResponse:
    if not settings.PDL_API_KEY:
        raise HTTPException(status_code=500, detail="PDL_API_KEY is not configured")

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

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="No contact data found for this person")
    if resp.status_code == 402:
        raise HTTPException(status_code=402, detail="Credit balance exhausted")
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=_extract_pdl_error(resp.json()))

    body = resp.json()
    data = body.get("data", {})
    return PersonRevealResponse(
        work_email=data.get("work_email"),
        recommended_personal_email=data.get("recommended_personal_email"),
        mobile_phone=data.get("mobile_phone"),
        phone_numbers=data.get("phone_numbers"),
    )
