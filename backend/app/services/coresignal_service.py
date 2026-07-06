"""Coresignal Multi-Source search provider.

Endpoints hit:
  POST /v2/{employee,company}_multi_source/search/es_dsl  — returns array of record IDs
  GET  /v2/{employee,company}_multi_source/collect/{id}   — fetches the full record
"""

from __future__ import annotations

from datetime import date
from typing import Any, NoReturn, Optional

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.schemas.search import (
    AgenticSearchRequest,
    CompanySearchRequest,
    PersonSearchRequest,
    SearchMeta,
    SearchResponse,
)


# ---------------------------------------------------------------------------
# ES-DSL query helpers.
# ---------------------------------------------------------------------------

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


def _add_location_match_multi(
    clauses: list[dict],
    fields: list[str],
    values: Optional[list[str]],
) -> None:
    """OR each provided location string across all listed Coresignal location fields."""
    if not values:
        return
    cleaned = [v.lower().strip() for v in values if v and v.strip()]
    if not cleaned:
        return
    should: list[dict] = []
    for v in cleaned:
        for field in fields:
            should.append({"match_phrase": {field: v}})
    clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


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


def _add_nested_range(
    clauses: list[dict],
    path: str,
    key_field: str,
    key_value: str,
    value_field: str,
    minv: Optional[float],
    maxv: Optional[float],
) -> None:
    """Nested range query used for Coresignal's array-of-object breakdowns.

    Example: `employees_count_by_country[]` where each entry has `country` + `employee_count`.
    """
    r: dict[str, float] = {}
    if minv is not None:
        r["gte"] = minv
    if maxv is not None:
        r["lte"] = maxv
    if not r:
        return
    clauses.append({
        "nested": {
            "path": path,
            "query": {
                "bool": {
                    "filter": [
                        {"term": {f"{path}.{key_field}": key_value.lower()}},
                        {"range": {f"{path}.{value_field}": r}},
                    ]
                }
            },
        }
    })


def _months_ago_str(months: int) -> str:
    """Return YYYY-MM-DD string for `months` months before today (1st of that month)."""
    today = date.today()
    total = today.year * 12 + (today.month - 1) - months
    y, m = divmod(total, 12)
    return f"{y}-{m + 1:02d}-01"


def _add_date_range(
    clauses: list[dict],
    field: str,
    min_months: Optional[int],   # person has been in role AT LEAST this many months → start_date <= N months ago
    max_months: Optional[int],   # person has been in role AT MOST this many months  → start_date >= N months ago
) -> None:
    r: dict[str, str] = {}
    if max_months is not None:
        r["gte"] = _months_ago_str(max_months)
    if min_months is not None:
        r["lte"] = _months_ago_str(min_months)
    if r:
        clauses.append({"range": {field: r}})


def _build_bool_query(
    must: list[dict],
    filters: list[dict],
    should: Optional[list[dict]] = None,
    minimum_should_match: int = 0,
    must_not: Optional[list[dict]] = None,
) -> dict:
    if not must and not filters and not should and not must_not:
        return {"match_all": {}}
    bool_q: dict[str, Any] = {}
    if must:
        bool_q["must"] = must
    if filters:
        bool_q["filter"] = filters
    if should:
        bool_q["should"] = should
        bool_q["minimum_should_match"] = minimum_should_match or 1
    if must_not:
        bool_q["must_not"] = must_not
    return {"bool": bool_q}


# ---------------------------------------------------------------------------
# Bucket conversion helpers.
# ---------------------------------------------------------------------------

# Revenue bucket strings come from the frontend enum. Coresignal stores actual
# numeric ranges under `revenue_annual_range` — convert the bucket into a
# (min, max) pair applied as a range clause.
_REVENUE_BUCKET_TO_RANGE: dict[str, tuple[Optional[float], Optional[float]]] = {
    "$0-$1M": (0, 1_000_000),
    "$1M-$10M": (1_000_000, 10_000_000),
    "$10M-$25M": (10_000_000, 25_000_000),
    "$25M-$50M": (25_000_000, 50_000_000),
    "$50M-$100M": (50_000_000, 100_000_000),
    "$100M-$250M": (100_000_000, 250_000_000),
    "$250M-$500M": (250_000_000, 500_000_000),
    "$500M-$1B": (500_000_000, 1_000_000_000),
    "$1B-$10B": (1_000_000_000, 10_000_000_000),
    "$10B+": (10_000_000_000, None),
}


def _add_revenue_bucket_filter(clauses: list[dict], buckets: Optional[list[str]]) -> None:
    if not buckets:
        return
    should: list[dict] = []
    for b in buckets:
        rng = _REVENUE_BUCKET_TO_RANGE.get(b)
        if not rng:
            continue
        low, high = rng
        # Match records whose annual_revenue_range overlaps the bucket.
        clause: dict[str, Any] = {"bool": {"filter": []}}
        if high is not None:
            clause["bool"]["filter"].append({
                "range": {"revenue_annual_range.annual_revenue_range_from": {"lte": high}}
            })
        if low is not None:
            clause["bool"]["filter"].append({
                "range": {"revenue_annual_range.annual_revenue_range_to": {"gte": low}}
            })
        if clause["bool"]["filter"]:
            should.append(clause)
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


_DESCRIPTION_FIELDS = ["description", "description_enriched", "categories_and_keywords"]

# Company type — map frontend enum values to Coresignal fields.
_COMPANY_TYPE_TERMS: dict[str, list[str]] = {
    "saas":           ["SaaS", "software as a service"],
    "marketplace":    ["marketplace"],
    "ecommerce":      ["e-commerce", "ecommerce", "online store"],
    "agency":         ["agency", "digital agency", "marketing agency"],
    "consulting":     ["consulting", "consultancy"],
    "manufacturing":  ["manufacturing", "manufacturer"],
    "media_publisher":["media", "publisher", "publishing"],
    "education":      ["education", "edtech", "e-learning"],
    "non_profit":     ["nonprofit", "non-profit"],
    "government":     ["government", "public sector"],
    "fintech":        ["fintech", "financial technology"],
    "healthtech":     ["healthtech", "health technology", "medtech"],
    "proptech":       ["proptech", "property technology"],
    "logistics":      ["logistics", "supply chain"],
    "hardware":       ["hardware", "device manufacturer"],
    "biotech":        ["biotech", "biotechnology"],
}

_TYPE_MAP_DIRECT = {
    "nonprofit": "Nonprofit",
    "government": "Government Agency",
    "educational": "Educational",
}


def _add_company_type_filter(clauses: list[dict], types: Optional[list[str]]) -> None:
    if not types:
        return
    should: list[dict] = []
    for t in types:
        t_norm = (t or "").lower().strip()
        if t_norm == "public":
            should.append({"term": {"is_public": True}})
        elif t_norm == "private":
            should.append({"term": {"is_public": False}})
        elif t_norm == "public_subsidiary":
            should.append({"bool": {"filter": [
                {"term": {"is_public": True}},
                {"exists": {"field": "parent_company_name"}},
            ]}})
        elif t_norm in _TYPE_MAP_DIRECT:
            should.append({"term": {"type": _TYPE_MAP_DIRECT[t_norm]}})
        elif t_norm in _COMPANY_TYPE_TERMS:
            for phrase in _COMPANY_TYPE_TERMS[t_norm]:
                for field in _DESCRIPTION_FIELDS:
                    should.append({"match_phrase": {field: phrase}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


# Department name -> flat field inside employees_count_breakdown_by_department.
# CoreSignal exposes this as a flat object (not a nested array).
_DEPT_TO_FIELD: dict[str, str] = {
    "sales":          "employees_count_breakdown_by_department.employees_count_sales",
    "engineering":    "employees_count_breakdown_by_department.employees_count_engineering",
    "marketing":      "employees_count_breakdown_by_department.employees_count_marketing",
    "operations":     "employees_count_breakdown_by_department.employees_count_operations",
    "finance":        "employees_count_breakdown_by_department.employees_count_finance",
    "human_resources":"employees_count_breakdown_by_department.employees_count_human_resources",
    "it":             "employees_count_breakdown_by_department.employees_count_it",
    "legal":          "employees_count_breakdown_by_department.employees_count_legal",
    "product":        "employees_count_breakdown_by_department.employees_count_product_management",
    "customer_success":"employees_count_breakdown_by_department.employees_count_customer_success",
    "design":         "employees_count_breakdown_by_department.employees_count_design",
    "data":           "employees_count_breakdown_by_department.employees_count_data_science",
}


# Growth timeframe -> Coresignal percentage field.
# Coresignal exposes native monthly/quarterly/yearly change percentages;
# 6- and 24-month buckets fall back to the closest native window.
_GROWTH_TIMEFRAME_TO_FIELD: dict[str, str] = {
    "3_month": "employees_count_change.change_quarterly_percentage",
    "6_month": "employees_count_change.change_quarterly_percentage",
    "12_month": "employees_count_change.change_yearly_percentage",
    "24_month": "employees_count_change.change_yearly_percentage",
}

# Email provider → technology aliases stored in technologies_used.technology (lowercase).
_EMAIL_PROVIDER_TECH_ALIASES: dict[str, list[str]] = {
    "microsoft": [
        "microsoft 365", "office 365", "microsoft exchange",
        "exchange online", "microsoft outlook", "outlook",
    ],
    "google": [
        "google workspace", "g suite", "gmail", "google apps",
    ],
    "proofpoint": ["proofpoint"],
    "mimecast":   ["mimecast"],
}

_KNOWN_EMAIL_PROVIDER_TECHS: list[str] = [
    alias for aliases in _EMAIL_PROVIDER_TECH_ALIASES.values() for alias in aliases
]


def _add_email_provider_filter(clauses: list[dict], providers: Optional[list[str]]) -> None:
    if not providers:
        return
    known = [p.lower() for p in providers if p.lower() in _EMAIL_PROVIDER_TECH_ALIASES]
    include_other = any(p.lower() == "other" for p in providers)

    should: list[dict] = []

    for provider in known:
        for alias in _EMAIL_PROVIDER_TECH_ALIASES[provider]:
            should.append({
                "nested": {
                    "path": "technologies_used",
                    "query": {"term": {"technologies_used.technology": alias}},
                }
            })

    if include_other:
        # "Other" = no technologies_used entry matching any known provider.
        must_not_clauses: list[dict] = []
        for alias in _KNOWN_EMAIL_PROVIDER_TECHS:
            must_not_clauses.append({
                "nested": {
                    "path": "technologies_used",
                    "query": {"term": {"technologies_used.technology": alias}},
                }
            })
        should.append({"bool": {"must_not": must_not_clauses}})

    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


# Certification keyword aliases — each value is tried as match_phrase on short_description.
_CERT_SEARCH_TERMS: dict[str, list[str]] = {
    "soc2":      ["SOC 2", "SOC2"],
    "gdpr":      ["GDPR"],
    "ccpa":      ["CCPA"],
    "iso_27001": ["ISO 27001"],
    "hipaa":     ["HIPAA"],
    "pci_dss":   ["PCI-DSS", "PCI DSS"],
}

def _add_text_search_filter(clauses: list[dict], terms: Optional[list[str]]) -> None:
    """OR-match each term as a phrase across company description/tag fields."""
    if not terms:
        return
    should: list[dict] = []
    for term in terms:
        for field in _DESCRIPTION_FIELDS:
            should.append({"match_phrase": {field: term}})
    clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_certifications_filter(clauses: list[dict], certs: Optional[list[str]]) -> None:
    """Each selected cert generates an OR-group of phrase matches; all selected certs must match (AND)."""
    if not certs:
        return
    for cert in certs:
        aliases = _CERT_SEARCH_TERMS.get(cert.lower(), [cert])
        cert_should: list[dict] = []
        for alias in aliases:
            for field in _DESCRIPTION_FIELDS:
                cert_should.append({"match_phrase": {field: alias}})
        clauses.append({"bool": {"should": cert_should, "minimum_should_match": 1}})


_VISIT_CHANGE_TIMEFRAME_TO_FIELD: dict[str, str] = {
    "monthly":   "total_website_visits_change.change_monthly_percentage",
    "quarterly": "total_website_visits_change.change_quarterly_percentage",
    "yearly":    "total_website_visits_change.change_yearly_percentage",
}


def _add_company_status_filter(clauses: list[dict], statuses: Optional[list[str]]) -> None:
    if not statuses:
        return
    should: list[dict] = []
    for s in statuses:
        s_norm = (s or "").lower().strip()
        if s_norm == "public":
            should.append({"term": {"is_public": True}})
        elif s_norm == "private":
            should.append({"term": {"is_public": False}})
        elif s_norm == "nonprofit":
            should.append({"term": {"type": "Nonprofit"}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


_HOW_THEY_SELL_TERMS: dict[str, list[str]] = {
    "b2b": ["B2B", "business to business"],
    "b2c": ["B2C", "business to consumer"],
    "b2b2c": ["B2B2C"],
    "d2c": ["D2C", "direct to consumer", "direct-to-consumer"],
    "franchise": ["franchise"],
    "government": ["government contracts", "government sales"],
}

_MORE_FLAGS_TERMS: dict[str, list[str]] = {
    "is_retail": ["retail"],
    "is_marketplace": ["marketplace"],
    "is_mainly_ai": ["artificial intelligence", "AI company", "AI-powered"],
    "is_mainly_crypto": ["crypto", "blockchain", "web3"],
    "multi_product": ["multi-product", "product suite", "platform"],
}

_REVENUE_MODEL_TERMS: dict[str, list[str]] = {
    "free_tier": ["free tier", "free trial", "freemium"],
    "self_serve": ["self-serve", "self service"],
    "sales_led": ["sales-led", "enterprise sales"],
    "usage_based": ["usage-based", "pay per use", "consumption-based"],
    "subscription": ["subscription", "recurring revenue"],
    "enterprise_plan": ["enterprise plan", "enterprise pricing"],
    "public_pricing": ["pricing page", "public pricing"],
}

_NEWS_CATEGORY_TERMS: dict[str, list[str]] = {
    "funding_investment": ["funding", "investment", "raised", "series"],
    "mergers_acquisitions": ["acquisition", "merger", "acquired"],
    "product_launch": ["product launch", "new product", "launch"],
    "partnership": ["partnership", "partner", "collaboration"],
    "expansion": ["expansion", "expanding", "new market"],
    "layoffs_restructuring": ["layoffs", "restructuring", "downsizing"],
    "ipo": ["IPO", "initial public offering", "went public"],
    "leadership_change": ["CEO", "leadership change", "appointed", "new chief"],
    "legal_regulatory": ["lawsuit", "regulatory", "compliance", "fine"],
    "awards_recognition": ["award", "recognition", "ranked", "best place"],
}


def _add_enum_text_filter(
    clauses: list[dict],
    values: Optional[list[str]],
    term_map: dict[str, list[str]],
) -> None:
    """For each selected value, OR-match its aliases across description fields."""
    if not values:
        return
    should: list[dict] = []
    for val in values:
        aliases = term_map.get(val.lower(), [val])
        for alias in aliases:
            for field in _DESCRIPTION_FIELDS:
                should.append({"match_phrase": {field: alias}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


# ---------------------------------------------------------------------------
# Query builders — Person (employee_multi_source).
# ---------------------------------------------------------------------------

def build_person_query(f: PersonSearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []
    must_not: list[dict] = []

    if f.name:
        must.append({"match": {"full_name": f.name.lower()}})

    _add_multi_match(must, "active_experience_title", f.job_title)
    _add_multi_term(filters, "active_experience_department", f.departments)
    _add_multi_term(filters, "active_experience_management_level", f.seniority)
    _add_multi_match(must, "active_experience_company_name", f.companies, phrase=True)

    # Person location: OR across country/state/city.
    _add_location_match_multi(
        must,
        ["location_country", "location_state", "location_city"],
        f.person_locations,
    )
    # Company HQ location.
    _add_location_match_multi(
        must,
        [
            "active_experience_company_hq_country",
            "active_experience_company_hq_region",
            "active_experience_company_hq_city",
        ],
        f.hq_locations,
    )

    if f.require_work_email:
        filters.append({"exists": {"field": "primary_professional_email"}})

    _add_multi_match(must, "active_experience_company_industry", f.industries, phrase=True)
    _add_multi_term(filters, "inferred_skills", f.technologies)

    if f.exclude_person_ids:
        must_not.append({"terms": {"id": f.exclude_person_ids}})
    if f.exclude_company_ids:
        must_not.append({"terms": {"active_experience_company_id": f.exclude_company_ids}})
    if f.exclude_company_names:
        for name in f.exclude_company_names:
            must_not.append({"match_phrase": {"active_experience_company_name": name}})

    # Time in role + time in company both map to active_experience_start_date.
    # Merge into one range clause to avoid conflicting gte/lte clauses.
    role_min = f.time_in_role_min_months
    role_max = f.time_in_role_max_months
    co_min = f.time_in_company_min_months
    co_max = f.time_in_company_max_months
    merged_min: Optional[int] = max(v for v in (role_min, co_min) if v is not None) if any(v is not None for v in (role_min, co_min)) else None
    merged_max: Optional[int] = min(v for v in (role_max, co_max) if v is not None) if any(v is not None for v in (role_max, co_max)) else None
    _add_date_range(filters, "active_experience_start_date", min_months=merged_min, max_months=merged_max)

    # Total years of experience → convert to months range
    if f.experience_years_min is not None or f.experience_years_max is not None:
        months_min = int(f.experience_years_min * 12) if f.experience_years_min is not None else None
        months_max = int(f.experience_years_max * 12) if f.experience_years_max is not None else None
        _add_range(filters, "total_experience_duration_months", months_min, months_max)

    return _build_bool_query(must, filters, must_not=must_not or None)


# ---------------------------------------------------------------------------
# Query builders — Company (company_multi_source).
# ---------------------------------------------------------------------------

def build_company_query(f: CompanySearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []

    _add_multi_match(must, "company_name", f.companies, phrase=True)

    _add_location_match_multi(
        must,
        ["hq_country", "hq_region", "hq_city", "hq_location"],
        f.locations,
    )

    _add_company_type_filter(filters, f.type)
    _add_company_status_filter(filters, f.company_status)
    _add_enum_text_filter(filters, f.company_how_they_sell, _HOW_THEY_SELL_TERMS)
    _add_enum_text_filter(filters, f.company_more_flags, _MORE_FLAGS_TERMS)
    _add_enum_text_filter(filters, f.company_revenue_model, _REVENUE_MODEL_TERMS)
    _add_text_search_filter(filters, f.company_news_keywords)
    _add_enum_text_filter(filters, f.company_news_categories, _NEWS_CATEGORY_TERMS)
    _add_multi_term(filters, "industry.exact", f.industries, lowercase=False)

    # Technologies — nested field.
    if f.technologies:
        should_tech: list[dict] = []
        for tech in f.technologies:
            should_tech.append({
                "nested": {
                    "path": "technologies_used",
                    "query": {"term": {"technologies_used.technology": tech.lower()}},
                }
            })
        filters.append({"bool": {"should": should_tech, "minimum_should_match": 1}})

    _add_revenue_bucket_filter(filters, f.revenue_buckets)
    _add_multi_term(filters, "last_funding_round.type", f.funding_stages)

    _add_range(filters, "employees_count", f.employee_count_min, f.employee_count_max)
    _add_range(filters, "last_funding_round.amount_raised", f.funding_min, f.funding_max)
    _add_range(filters, "founded_year", f.founded_min, f.founded_max)

    growth_field = _GROWTH_TIMEFRAME_TO_FIELD.get(
        f.headcount_growth_timeframe,
        "employees_count_change.change_yearly_percentage",
    )
    # Coresignal already stores percent; no /100 conversion.
    _add_range(filters, growth_field, f.headcount_growth_min, f.headcount_growth_max)

    if f.headcount_by_location_country:
        _add_nested_range(
            filters,
            path="employees_count_by_country",
            key_field="country",
            key_value=f.headcount_by_location_country,
            value_field="employee_count",
            minv=f.headcount_by_location_min,
            maxv=f.headcount_by_location_max,
        )

    if f.headcount_by_department:
        dept_field = _DEPT_TO_FIELD.get(f.headcount_by_department.lower())
        if dept_field:
            _add_range(filters, dept_field, f.headcount_by_department_min, f.headcount_by_department_max)

    _add_range(filters, "total_website_visits_monthly", f.website_visits_min, f.website_visits_max)

    visit_change_field = _VISIT_CHANGE_TIMEFRAME_TO_FIELD.get(
        f.visit_change_timeframe,
        "total_website_visits_change.change_monthly_percentage",
    )
    _add_range(filters, visit_change_field, f.visit_change_min, f.visit_change_max)

    if f.traffic_country:
        _add_nested_range(
            filters,
            path="visits_breakdown_by_country",
            key_field="country",
            key_value=f.traffic_country,
            value_field="percentage",
            minv=f.traffic_country_min,
            maxv=f.traffic_country_max,
        )

    _add_email_provider_filter(filters, f.email_providers)
    _add_certifications_filter(filters, f.certifications)
    _add_text_search_filter(filters, f.awards)
    _add_text_search_filter(filters, f.other_compliance)

    # Job posting keywords — match against company description fields
    if f.job_posting_keywords:
        for kw in f.job_posting_keywords:
            filters.append({
                "bool": {
                    "should": [
                        {"match": {"description": kw}},
                        {"match": {"description_enriched": kw}},
                        {"match": {"categories_and_keywords": kw}},
                    ],
                    "minimum_should_match": 1,
                }
            })

    return _build_bool_query(must, filters)


# ---------------------------------------------------------------------------
# HTTP + error handling.
# ---------------------------------------------------------------------------

def _headers() -> dict[str, str]:
    return {
        "apikey": settings.CORESIGNAL_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json",
    }


def _extract_error(body: Any) -> str:
    if isinstance(body, dict):
        return body.get("message") or body.get("error") or "API error"
    return "API error"


def _raise_provider_error(status: int, body: Any) -> NoReturn:
    msg = _extract_error(body)
    if status == 400:
        raise HTTPException(status_code=400, detail=f"Coresignal: Invalid search parameters: {msg}")
    if status == 401:
        raise HTTPException(status_code=503, detail="Coresignal: API key is invalid or not configured")
    if status == 402:
        raise HTTPException(status_code=402, detail="Coresignal: API credit balance exhausted. Please upgrade your plan.")
    if status == 403:
        raise HTTPException(status_code=403, detail="Coresignal: API key is not authorized for this endpoint")
    if status == 429:
        raise HTTPException(status_code=429, detail="Coresignal: API rate limit reached. Please wait a moment and try again.")
    if status >= 500:
        raise HTTPException(status_code=502, detail="Coresignal: API is temporarily unavailable. Please try again later.")
    raise HTTPException(status_code=status, detail=f"Coresignal: {msg}")


def _search_url(dataset: str) -> str:
    # dataset is "employee_multi_source" or "company_multi_source".
    # Coresignal's ES DSL search returns a JSON array of record IDs; use /collect/{id}
    # to fetch each full record.
    return f"{settings.CORESIGNAL_BASE_URL}/v2/{dataset}/search/es_dsl"


def _collect_url(dataset: str, record_id: str | int) -> str:
    return f"{settings.CORESIGNAL_BASE_URL}/v2/{dataset}/collect/{record_id}"


def _make_search_body(query: dict) -> dict:
    # Coresignal restricts the ES DSL body to `query` and a string-list `sort`.
    return {"query": query, "sort": ["_score"]}


async def _collect_records(
    client: httpx.AsyncClient,
    dataset: str,
    ids: list,
) -> list[dict]:
    """Fetch full records for the given IDs. Missing IDs (404) are skipped silently."""
    records: list[dict] = []
    for rid in ids:
        try:
            resp = await client.get(_collect_url(dataset, rid), headers=_headers())
        except httpx.RequestError:
            continue
        if resp.status_code == 200:
            body = resp.json()
            if isinstance(body, dict) and "data" in body and isinstance(body["data"], dict):
                body = body["data"]
            if isinstance(body, dict):
                records.append(body)
        elif resp.status_code == 404:
            continue
        else:
            try:
                err_body = resp.json()
            except Exception:
                err_body = {}
            _raise_provider_error(resp.status_code, err_body)
    return records


# ---------------------------------------------------------------------------
# Response pass-through — return the raw Coresignal record unchanged, with `id`
# normalized to a string so the frontend can key rows by it.
# ---------------------------------------------------------------------------

def _passthrough(r: dict) -> dict:
    if not isinstance(r, dict):
        return {}
    rid = r.get("id")
    if rid is not None:
        r["id"] = str(rid)
    return r


# ---------------------------------------------------------------------------
# Company pre-fetch — resolve headcount-derived filters into a set of company IDs
# so the person query can constrain on `active_experience_company_id`.
# ---------------------------------------------------------------------------

def _person_needs_company_prefetch(req: PersonSearchRequest) -> bool:
    company_scoped = any([
        req.company_type,
        req.revenue_buckets,
        req.funding_min is not None,
        req.funding_max is not None,
        req.founded_min is not None,
        req.founded_max is not None,
        req.headcount_growth_min is not None,
        req.headcount_growth_max is not None,
        req.employee_count_min is not None,
        req.employee_count_max is not None,
        req.website_visits_min is not None,
        req.website_visits_max is not None,
        req.visit_change_min is not None,
        req.visit_change_max is not None,
        bool(req.traffic_country),
        bool(req.email_providers),
        bool(req.job_posting_keywords),
        bool(req.awards),
        bool(req.certifications),
        bool(req.other_compliance),
        bool(req.company_status),
        bool(req.company_how_they_sell),
        bool(req.company_more_flags),
        bool(req.company_revenue_model),
        bool(req.company_news_keywords),
        bool(req.company_news_categories),
        bool(req.company_news_timeframe),
    ])
    dept_active = bool(req.headcount_by_department) and (
        req.headcount_by_department_min is not None
        or req.headcount_by_department_max is not None
    )
    loc_active = bool(req.headcount_by_location_country) and (
        req.headcount_by_location_min is not None
        or req.headcount_by_location_max is not None
    )
    return company_scoped or dept_active or loc_active


async def _prefetch_company_ids_for_person(req: PersonSearchRequest, limit: int = 200) -> list[str]:
    co_req = CompanySearchRequest(
        type=req.company_type,
        revenue_buckets=req.revenue_buckets,
        funding_min=req.funding_min,
        funding_max=req.funding_max,
        founded_min=req.founded_min,
        founded_max=req.founded_max,
        headcount_growth_min=req.headcount_growth_min,
        headcount_growth_max=req.headcount_growth_max,
        headcount_by_department=req.headcount_by_department,
        headcount_by_department_min=req.headcount_by_department_min,
        headcount_by_department_max=req.headcount_by_department_max,
        headcount_by_location_country=req.headcount_by_location_country,
        headcount_by_location_min=req.headcount_by_location_min,
        headcount_by_location_max=req.headcount_by_location_max,
        employee_count_min=req.employee_count_min,
        employee_count_max=req.employee_count_max,
        website_visits_min=req.website_visits_min,
        website_visits_max=req.website_visits_max,
        visit_change_timeframe=req.visit_change_timeframe,
        visit_change_min=req.visit_change_min,
        visit_change_max=req.visit_change_max,
        traffic_country=req.traffic_country,
        traffic_country_min=req.traffic_country_min,
        traffic_country_max=req.traffic_country_max,
        email_providers=req.email_providers,
        job_posting_keywords=req.job_posting_keywords,
        awards=req.awards,
        certifications=req.certifications,
        other_compliance=req.other_compliance,
        company_status=req.company_status,
        company_how_they_sell=req.company_how_they_sell,
        company_more_flags=req.company_more_flags,
        company_revenue_model=req.company_revenue_model,
        company_news_keywords=req.company_news_keywords,
        company_news_categories=req.company_news_categories,
        company_news_timeframe=req.company_news_timeframe,
    )
    body = _make_search_body(build_company_query(co_req))

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            _search_url("company_multi_source"),
            headers=_headers(),
            json=body,
        )

    if resp.status_code == 200:
        ids = resp.json()
        if not isinstance(ids, list):
            return []
        return [str(i) for i in ids[:limit]]
    try:
        err_body = resp.json()
    except Exception:
        err_body = {}
    _raise_provider_error(resp.status_code, err_body)


# ---------------------------------------------------------------------------
# Public surface — search_persons / search_companies.
# ---------------------------------------------------------------------------

def _require_api_key() -> None:
    if not settings.CORESIGNAL_API_KEY:
        raise HTTPException(status_code=500, detail="CORESIGNAL_API_KEY is not configured")


def _paginate_ids(ids: list, scroll_token: Optional[str]) -> tuple[list, Optional[str]]:
    """Slice the full ID list into a single page. Returns (page_ids, next_token)."""
    try:
        offset = int(scroll_token) if scroll_token else 0
    except ValueError:
        offset = 0
    page_size = settings.CORESIGNAL_PAGE_SIZE
    page = ids[offset : offset + page_size]
    next_token = str(offset + page_size) if offset + page_size < len(ids) else None
    return page, next_token


async def _search_ids(client: httpx.AsyncClient, dataset: str, query: dict) -> list:
    """POST an ES DSL query and return the ID list. Raises on non-2xx."""
    resp = await client.post(
        _search_url(dataset),
        headers=_headers(),
        json=_make_search_body(query),
    )
    if resp.status_code == 200:
        body = resp.json()
        return body if isinstance(body, list) else []
    try:
        err_body = resp.json()
    except Exception:
        err_body = {}
    _raise_provider_error(resp.status_code, err_body)


async def search_persons(req: PersonSearchRequest) -> SearchResponse:
    _require_api_key()

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
        terms_clause = {"terms": {"active_experience_company_id": company_id_constraint}}
        if "bool" in query:
            query["bool"].setdefault("filter", []).append(terms_clause)
        else:
            query = {"bool": {"filter": [terms_clause]}}

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            all_ids = await _search_ids(client, "employee_multi_source", query)
            page_ids, next_token = _paginate_ids(all_ids, req.scroll_token)
            records = await _collect_records(client, "employee_multi_source", page_ids)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    return SearchResponse(
        data=[_passthrough(r) for r in records],
        meta=SearchMeta(total=len(all_ids), scroll_token=next_token),
    )


async def search_companies(req: CompanySearchRequest) -> SearchResponse:
    _require_api_key()

    query = build_company_query(req)
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            all_ids = await _search_ids(client, "company_multi_source", query)
            page_ids, next_token = _paginate_ids(all_ids, req.scroll_token)
            records = await _collect_records(client, "company_multi_source", page_ids)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    return SearchResponse(
        data=[_passthrough(r) for r in records],
        meta=SearchMeta(total=len(all_ids), scroll_token=next_token),
    )


_AGENTIC_URL = "https://api.coresignal.com/cdapi/v2/agentic_search/fast"
_ENTITY_TO_DATASET = {
    "employee": "employee_multi_source",
    "company": "company_multi_source",
}


async def agentic_search(req: AgenticSearchRequest) -> SearchResponse:
    """Translate a natural-language prompt to an ES query via CoreSignal Agentic API, then collect full records."""
    _require_api_key()

    dataset = _ENTITY_TO_DATASET.get(req.entity, "employee_multi_source")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Step 1: Translate prompt → ES DSL query
            agentic_resp = await client.post(
                _AGENTIC_URL,
                headers=_headers(),
                json={"prompt": req.prompt, "entity": req.entity, "return_data": False},
            )
            if agentic_resp.status_code != 200:
                try:
                    err_body = agentic_resp.json()
                except Exception:
                    err_body = {}
                _raise_provider_error(agentic_resp.status_code, err_body)

            agentic_body = agentic_resp.json()
            es_query = agentic_body.get("query") if isinstance(agentic_body, dict) else None
            if not es_query:
                return SearchResponse(data=[], meta=SearchMeta(total=0))

            # Step 2: Search dataset with the generated query
            all_ids = await _search_ids(client, dataset, es_query)
            page_ids = all_ids[: req.limit]

            # Step 3: Collect full records
            records = await _collect_records(client, dataset, page_ids)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Agentic search timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    return SearchResponse(
        data=[_passthrough(r) for r in records],
        meta=SearchMeta(total=len(all_ids)),
    )
