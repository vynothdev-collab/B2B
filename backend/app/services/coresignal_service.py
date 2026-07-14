"""Coresignal Multi-Source search provider.

Endpoints hit:
  POST /v2/{employee,company}_multi_source/search/es_dsl  — returns array of record IDs
  GET  /v2/{employee,company}_multi_source/collect/{id}   — fetches the full record
"""

from __future__ import annotations

import asyncio
from datetime import date, timedelta
from typing import TYPE_CHECKING, Any, NoReturn, Optional

import httpx
from fastapi import HTTPException

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

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
    """OR each location value across all listed fields."""
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
    """Nested range query for CoreSignal array-of-object breakdowns.

    Example: employees_count_by_country[] — each entry has `country` + `employee_count`.
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
    today = date.today()
    total = today.year * 12 + (today.month - 1) - months
    y, m = divmod(total, 12)
    return f"{y}-{m + 1:02d}-01"


def _add_date_range(
    clauses: list[dict],
    field: str,
    min_months: Optional[int],   # AT LEAST N months in role → start_date <= N months ago
    max_months: Optional[int],   # AT MOST N months in role  → start_date >= N months ago
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
# Constants and lookup tables.
# ---------------------------------------------------------------------------

# Frontend revenue bucket labels → (min, max) numeric range in USD.
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

# CoreSignal exposes two revenue source types with different field structures:
#   Range sources (4, 6): revenue_annual_range.{src}.annual_revenue_range_from/to
#   Point sources (5, 1): revenue_annual.{src}.annual_revenue (different top-level key)
_REVENUE_RANGE_SOURCES = ("source_4_annual_revenue_range", "source_6_annual_revenue_range")
_REVENUE_RANGE_PARENT = "revenue_annual_range"
_REVENUE_POINT_SOURCES = ("source_5_annual_revenue", "source_1_annual_revenue")
_REVENUE_POINT_PARENT = "revenue_annual"

_DESCRIPTION_FIELDS = ["description", "description_enriched", "categories_and_keywords"]

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

# CoreSignal stores employees_count_breakdown_by_department as a flat object (not nested array).
# Field names verified against CoreSignal sample data.
_DEPT_TO_FIELD: dict[str, str] = {
    "sales":           "employees_count_breakdown_by_department.employees_count_sales",
    "engineering":     "employees_count_breakdown_by_department.employees_count_technical",
    "marketing":       "employees_count_breakdown_by_department.employees_count_marketing",
    "operations":      "employees_count_breakdown_by_department.employees_count_operations",
    "finance":         "employees_count_breakdown_by_department.employees_count_finance",
    "human_resources": "employees_count_breakdown_by_department.employees_count_hr",
    "it":              "employees_count_breakdown_by_department.employees_count_technical",
    "legal":           "employees_count_breakdown_by_department.employees_count_legal",
    "product":         "employees_count_breakdown_by_department.employees_count_product",
    "customer_success":"employees_count_breakdown_by_department.employees_count_customer_service",
    "design":          "employees_count_breakdown_by_department.employees_count_design",
    "data":            "employees_count_breakdown_by_department.employees_count_research",
    "consulting":      "employees_count_breakdown_by_department.employees_count_consulting",
    "administrative":  "employees_count_breakdown_by_department.employees_count_administrative",
}

# CoreSignal only exposes quarterly and yearly native windows; 6- and 24-month
# buckets fall back to the closest available window.
_GROWTH_TIMEFRAME_TO_FIELD: dict[str, str] = {
    "3_month": "employees_count_change.change_quarterly_percentage",
    "6_month": "employees_count_change.change_quarterly_percentage",
    "12_month": "employees_count_change.change_yearly_percentage",
    "24_month": "employees_count_change.change_yearly_percentage",
}

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

_CERT_SEARCH_TERMS: dict[str, list[str]] = {
    "soc2":      ["SOC 2", "SOC2"],
    "gdpr":      ["GDPR"],
    "ccpa":      ["CCPA"],
    "iso_27001": ["ISO 27001"],
    "hipaa":     ["HIPAA"],
    "pci_dss":   ["PCI-DSS", "PCI DSS"],
}

_KEYWORD_SCOPE_TO_FIELDS: dict[str, list[str]] = {
    "company_specialties":      ["categories_and_keywords"],
    "social_media_description": ["description_enriched"],
    "seo_description":          ["description"],
    "ai_description":           ["description_enriched"],
    "product_service_tags":     ["categories_and_keywords"],
    "website_pages":            ["description"],
}
_KEYWORD_ALL_FIELDS = ["description", "description_enriched", "categories_and_keywords"]

_VISIT_CHANGE_TIMEFRAME_TO_FIELD: dict[str, str] = {
    "monthly":   "total_website_visits_change.change_monthly_percentage",
    "quarterly": "total_website_visits_change.change_quarterly_percentage",
    "yearly":    "total_website_visits_change.change_yearly_percentage",
}

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

_NEWS_TIMEFRAME_DAYS: dict[str, int] = {
    "60d": 60,
    "90d": 90,
    "6m":  180,
    "12m": 365,
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

_FUNDING_STAGE_MAP: dict[str, list[str]] = {
    "pre_seed":              ["Pre-Seed", "Pre-seed"],
    "seed":                  ["Seed"],
    "angel":                 ["Angel"],
    "series_a":              ["Series A"],
    "series_b":              ["Series B"],
    "series_c":              ["Series C"],
    "series_d":              ["Series D"],
    "series_e":              ["Series E"],
    "series_f":              ["Series F"],
    "series_g":              ["Series G"],
    "series_h":              ["Series H"],
    "series_unknown":        ["Series Unknown", "Undisclosed"],
    "convertible_note":      ["Convertible Note"],
    "corporate_round":       ["Corporate Round"],
    "debt_financing":        ["Debt Financing"],
    "equity_crowdfunding":   ["Equity Crowdfunding"],
    "grant":                 ["Grant"],
    "private_equity":        ["Private Equity"],
    "post_ipo_equity":       ["Post-IPO Equity"],
    "post_ipo_debt":         ["Post-IPO Debt"],
    "secondary_market":      ["Secondary Market"],
    "venture_round":         ["Venture Round"],
    "initial_coin_offering": ["ICO", "Initial Coin Offering"],
    "non_equity_assistance": ["Non-equity Assistance"],
}


# ---------------------------------------------------------------------------
# Filter helpers.
# ---------------------------------------------------------------------------

def _add_revenue_bucket_filter(clauses: list[dict], buckets: Optional[list[str]]) -> None:
    if not buckets:
        return
    bucket_should: list[dict] = []
    for b in buckets:
        rng = _REVENUE_BUCKET_TO_RANGE.get(b)
        if not rng:
            continue
        low, high = rng
        for src in _REVENUE_RANGE_SOURCES:
            sub: list[dict] = []
            if high is not None:
                sub.append({"range": {f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_from": {"lte": high}}})
            if low is not None:
                sub.append({"range": {f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_to": {"gte": low}}})
            if sub:
                bucket_should.append({"bool": {"filter": sub}})
        for src in _REVENUE_POINT_SOURCES:
            sub = {}
            if low is not None:
                sub["gte"] = low
            if high is not None:
                sub["lte"] = high
            if sub:
                bucket_should.append({"range": {f"{_REVENUE_POINT_PARENT}.{src}.annual_revenue": sub}})
    if bucket_should:
        clauses.append({"bool": {"should": bucket_should, "minimum_should_match": 1}})


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


def _add_company_status_filter(clauses: list[dict], statuses: Optional[list[str]]) -> None:
    """CoreSignal uses two separate fields for company status:
      is_public (boolean)     — ownership type (public / private)
      type (keyword)          — "Nonprofit", "Government Agency", "Educational"
      status.value (keyword)  — operational status: "active", "acquired", "closed", "defunct", "ipo"
    """
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
        elif s_norm == "active":
            should.append({"term": {"status.value": "active"}})
        elif s_norm == "acquired":
            should.append({"term": {"status.value": "acquired"}})
        elif s_norm in ("closed", "defunct"):
            # CoreSignal uses both "closed" and "defunct" for shut-down companies
            should.append({"bool": {"should": [
                {"term": {"status.value": "closed"}},
                {"term": {"status.value": "defunct"}},
            ], "minimum_should_match": 1}})
        elif s_norm == "ipo":
            # IPO companies are public — match either status flag
            should.append({"bool": {"should": [
                {"term": {"status.value": "ipo"}},
                {"term": {"is_public": True}},
            ], "minimum_should_match": 1}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


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
        # "Other" = no technologies_used entry matching any known provider
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


def _add_text_search_filter(clauses: list[dict], terms: Optional[list[str]]) -> None:
    if not terms:
        return
    should: list[dict] = []
    for term in terms:
        for field in _DESCRIPTION_FIELDS:
            should.append({"match_phrase": {field: term}})
    clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_certifications_filter(clauses: list[dict], certs: Optional[list[str]]) -> None:
    """Each cert is an AND requirement; within a cert, aliases are OR-matched."""
    if not certs:
        return
    for cert in certs:
        aliases = _CERT_SEARCH_TERMS.get(cert.lower(), [cert])
        cert_should: list[dict] = []
        for alias in aliases:
            for field in _DESCRIPTION_FIELDS:
                cert_should.append({"match_phrase": {field: alias}})
        clauses.append({"bool": {"should": cert_should, "minimum_should_match": 1}})


def _add_keywords_filter(
    must: list[dict],
    filters: list[dict],
    must_not: list[dict],
    include: Optional[list[str]],
    match_mode: str,
    scope: Optional[list[str]],
    exclude: Optional[list[str]],
) -> None:
    if not include and not exclude:
        return

    if not scope:
        fields = _KEYWORD_ALL_FIELDS
    else:
        fields_set: set[str] = set()
        for s in scope:
            fields_set.update(_KEYWORD_SCOPE_TO_FIELDS.get(s, []))
        fields = list(fields_set) if fields_set else _KEYWORD_ALL_FIELDS

    if include:
        if match_mode == "all":
            for kw in include:
                kw_should = [{"match_phrase": {f: kw}} for f in fields]
                must.append({"bool": {"should": kw_should, "minimum_should_match": 1}})
        else:
            kw_should: list[dict] = []
            for kw in include:
                for f in fields:
                    kw_should.append({"match_phrase": {f: kw}})
            filters.append({"bool": {"should": kw_should, "minimum_should_match": 1}})

    if exclude:
        for kw in exclude:
            kw_must_not = [{"match_phrase": {f: kw}} for f in fields]
            must_not.append({"bool": {"should": kw_must_not, "minimum_should_match": 1}})


def _add_enum_text_filter(
    clauses: list[dict],
    values: Optional[list[str]],
    term_map: dict[str, list[str]],
) -> None:
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


def _news_timeframe_to_date(timeframe: str) -> Optional[str]:
    days = _NEWS_TIMEFRAME_DAYS.get(timeframe)
    if not days:
        return None
    return (date.today() - timedelta(days=days)).strftime("%Y-%m-%d")


def _add_news_filter(
    clauses: list[dict],
    keywords: Optional[list[str]],
    categories: Optional[list[str]],
    timeframe: Optional[str],
) -> None:
    if not keywords and not categories and not timeframe:
        return
    inner: list[dict] = []

    if keywords:
        kw_should: list[dict] = []
        for kw in keywords:
            kw_should.append({"match_phrase": {"news_articles.headline": kw}})
            kw_should.append({"match_phrase": {"news_articles.summary": kw}})
        inner.append({"bool": {"should": kw_should, "minimum_should_match": 1}})

    if categories:
        cat_should: list[dict] = []
        for cat in categories:
            aliases = _NEWS_CATEGORY_TERMS.get(cat.lower(), [cat])
            for alias in aliases:
                cat_should.append({"match_phrase": {"news_articles.headline": alias}})
                cat_should.append({"match_phrase": {"news_articles.summary": alias}})
        inner.append({"bool": {"should": cat_should, "minimum_should_match": 1}})

    if timeframe:
        date_str = _news_timeframe_to_date(timeframe)
        if date_str:
            inner.append({"range": {"news_articles.published_date": {"gte": date_str}}})

    if inner:
        inner_query = {"bool": {"filter": inner}} if len(inner) > 1 else inner[0]
        clauses.append({"nested": {"path": "news_articles", "query": inner_query}})


def _add_funding_stage_filter(clauses: list[dict], stages: Optional[list[str]]) -> None:
    # term on .keyword subfield — prevents "Seed" matching "Pre-Seed" and handles
    # multi-word values like "Series A" that a text-field term query would miss.
    if not stages:
        return
    should: list[dict] = []
    for s in stages:
        aliases = _FUNDING_STAGE_MAP.get(s.lower().strip(), [s])
        for alias in aliases:
            should.append({"term": {"last_funding_round.type.keyword": alias}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


# ---------------------------------------------------------------------------
# Query builders — Person (employee_multi_source).
# ---------------------------------------------------------------------------

def build_person_query(f: PersonSearchRequest, *, use_company_id_filter: bool = False) -> dict:
    """Build ES-DSL query for employee_multi_source.

    When use_company_id_filter=True the caller has already resolved company names
    to IDs and will inject a `terms` clause on active_experience_company_id, so
    we skip the less-reliable active_experience_company_name match_phrase.
    """
    must: list[dict] = []
    filters: list[dict] = []
    must_not: list[dict] = []

    if f.name:
        must.append({"match": {"full_name": f.name.lower()}})

    _add_multi_match(must, "active_experience_title", f.job_title, phrase=(f.job_title_match_type == "exact"))
    _add_multi_term(filters, "active_experience_department", f.departments)
    _add_multi_term(filters, "active_experience_management_level", f.seniority)

    if not use_company_id_filter:
        _add_multi_match(must, "active_experience_company_shorthand_name", f.companies, phrase=True)
        _add_location_match_multi(must, ["active_experience_company_hq_country"], f.hq_countries)
        _add_location_match_multi(must, ["active_experience_company_hq_region"], f.hq_states)
        _add_location_match_multi(must, ["active_experience_company_hq_city"], f.hq_cities)
        _add_multi_match(must, "active_experience_company_industry", f.industries, phrase=True)

    _add_location_match_multi(must, ["location_country"], f.person_location_countries)
    _add_location_match_multi(must, ["location_state"], f.person_location_states)
    _add_location_match_multi(must, ["location_city"], f.person_location_cities)

    if f.require_work_email:
        filters.append({"exists": {"field": "primary_professional_email"}})

    _add_multi_match(filters, "inferred_skills", f.technologies, phrase=True)

    if f.exclude_person_ids:
        must_not.append({"terms": {"id": f.exclude_person_ids}})
    if f.exclude_company_ids:
        must_not.append({"terms": {"active_experience_company_id": f.exclude_company_ids}})
    if f.exclude_company_names:
        for name in f.exclude_company_names:
            must_not.append({"match_phrase": {"active_experience_company_name": name}})

    # time_in_role and time_in_company both map to active_experience_start_date;
    # merge into one range clause to avoid conflicting gte/lte bounds.
    role_min = f.time_in_role_min_months
    role_max = f.time_in_role_max_months
    co_min = f.time_in_company_min_months
    co_max = f.time_in_company_max_months
    merged_min: Optional[int] = max(v for v in (role_min, co_min) if v is not None) if any(v is not None for v in (role_min, co_min)) else None
    merged_max: Optional[int] = min(v for v in (role_max, co_max) if v is not None) if any(v is not None for v in (role_max, co_max)) else None
    _add_date_range(filters, "active_experience_start_date", min_months=merged_min, max_months=merged_max)

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
    must_not: list[dict] = []

    _add_multi_match(must, "company_name", f.companies, phrase=True)

    _add_location_match_multi(must, ["hq_country"], f.location_countries)
    _add_location_match_multi(must, ["hq_state"], f.location_states)
    _add_location_match_multi(must, ["hq_city"], f.location_cities)

    _add_company_type_filter(filters, f.type)
    _add_company_status_filter(filters, f.company_status)
    _add_enum_text_filter(filters, f.company_how_they_sell, _HOW_THEY_SELL_TERMS)
    _add_enum_text_filter(filters, f.company_more_flags, _MORE_FLAGS_TERMS)
    _add_enum_text_filter(filters, f.company_revenue_model, _REVENUE_MODEL_TERMS)
    _add_news_filter(filters, f.company_news_keywords, f.company_news_categories, f.company_news_timeframe)
    _add_multi_term(filters, "industry.exact", f.industries, lowercase=False)

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
    if f.revenue_min is not None or f.revenue_max is not None:
        rev_should: list[dict] = []
        for src in _REVENUE_RANGE_SOURCES:
            sub: list[dict] = []
            if f.revenue_min is not None:
                sub.append({"range": {f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_to": {"gte": f.revenue_min}}})
            if f.revenue_max is not None:
                sub.append({"range": {f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_from": {"lte": f.revenue_max}}})
            if sub:
                rev_should.append({"bool": {"filter": sub}})
        for src in _REVENUE_POINT_SOURCES:
            sub = {}
            if f.revenue_min is not None:
                sub["gte"] = f.revenue_min
            if f.revenue_max is not None:
                sub["lte"] = f.revenue_max
            if sub:
                rev_should.append({"range": {f"{_REVENUE_POINT_PARENT}.{src}.annual_revenue": sub}})
        if rev_should:
            filters.append({"bool": {"should": rev_should, "minimum_should_match": 1}})

    _add_funding_stage_filter(filters, f.funding_stages)
    _add_range(filters, "employees_count", f.employee_count_min, f.employee_count_max)
    _add_range(filters, "last_funding_round.amount_raised", f.funding_min, f.funding_max)

    if f.founded_min is not None or f.founded_max is not None:
        yr: dict[str, Any] = {}
        if f.founded_min is not None:
            yr["gte"] = str(f.founded_min)   # CoreSignal stores founded_year as a string e.g. "2015"
        if f.founded_max is not None:
            yr["lte"] = str(f.founded_max)
        filters.append({"range": {"founded_year": yr}})

    growth_field = _GROWTH_TIMEFRAME_TO_FIELD.get(
        f.headcount_growth_timeframe,
        "employees_count_change.change_yearly_percentage",
    )
    # CoreSignal already stores as percentage; no /100 conversion needed.
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

    if f.job_posting_keywords:
        for kw in f.job_posting_keywords:
            filters.append({
                "nested": {
                    "path": "active_job_postings",
                    "query": {"match": {"active_job_postings.title": kw}},
                }
            })

    _add_keywords_filter(must, filters, must_not, f.keywords_include, f.keywords_match_mode, f.keywords_scope, f.keywords_exclude)

    return _build_bool_query(must, filters, must_not=must_not or None)


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
        raise HTTPException(status_code=400, detail="Invalid search parameters. Please adjust your filters and try again.")
    if status == 401:
        raise HTTPException(status_code=503, detail="Search service is not configured. Please contact support.")
    if status == 402:
        raise HTTPException(status_code=402, detail="Search credit balance exhausted. Please upgrade your plan.")
    if status == 403:
        raise HTTPException(status_code=403, detail="Search service access denied. Please contact support.")
    if status == 429:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment and try again.")
    if status >= 500:
        raise HTTPException(status_code=502, detail="Search service is temporarily unavailable. Please try again later.")
    raise HTTPException(status_code=status, detail=msg)


def _search_url(dataset: str) -> str:
    return f"{settings.CORESIGNAL_BASE_URL}/v2/{dataset}/search/es_dsl"


def _collect_url(dataset: str, record_id: str | int) -> str:
    return f"{settings.CORESIGNAL_BASE_URL}/v2/{dataset}/collect/{record_id}"


def _make_search_body(query: dict) -> dict:
    # CoreSignal restricts the ES DSL body to `query` and a string-list `sort`.
    return {"query": query, "sort": ["_score"]}


async def _collect_records(
    client: httpx.AsyncClient,
    dataset: str,
    ids: list,
) -> list[dict]:
    """Fetch full records concurrently.

    - 404s are silently skipped (record deleted / not found).
    - Network errors per ID are skipped; partial results are returned.
    - API errors (401, 402, 429, 5xx) abort the entire batch.
    """
    async def fetch_one(rid: Any) -> dict | None:
        try:
            resp = await client.get(_collect_url(dataset, rid), headers=_headers())
        except httpx.RequestError:
            return None
        if resp.status_code == 200:
            body = resp.json()
            if isinstance(body, dict) and "data" in body and isinstance(body["data"], dict):
                body = body["data"]
            return body if isinstance(body, dict) else None
        if resp.status_code == 404:
            return None
        try:
            err_body = resp.json()
        except Exception:
            err_body = {}
        _raise_provider_error(resp.status_code, err_body)

    results = await asyncio.gather(*[fetch_one(rid) for rid in ids])
    return [r for r in results if isinstance(r, dict)]


# ---------------------------------------------------------------------------
# Response mappers.
#
# CoreSignal top-level active_experience_* fields only carry a handful of values
# (title, department, management_level, company_id, company_website, logo_url).
# All richer company details live inside the nested experience[] array.
# ---------------------------------------------------------------------------

def _active_experience_item(r: dict) -> dict:
    experiences = [e for e in (r.get("experience") or []) if isinstance(e, dict)]
    if not experiences:
        return {}
    for exp in experiences:
        if exp.get("active_experience") == 1:
            return exp
    return min(experiences, key=lambda e: e.get("order_in_profile") or 999)


def _build_start_date(exp: dict) -> str | None:
    if exp.get("date_from"):
        return exp["date_from"]
    yr = exp.get("date_from_year")
    if not yr:
        return None
    mo = exp.get("date_from_month")
    return f"{yr}-{str(mo).zfill(2)}-01" if mo else f"{yr}-01-01"


def _extract_awards_certs(r: dict) -> list | None:
    result: list[str] = []
    for item in (r.get("awards") or []):
        label = (item.get("title") or item.get("name")) if isinstance(item, dict) else str(item)
        if label:
            result.append(label)
    for item in (r.get("certifications") or []):
        label = (item.get("name") or item.get("title")) if isinstance(item, dict) else str(item)
        if label:
            result.append(label)
    return result or None


def _map_person(r: dict) -> dict:
    if not isinstance(r, dict):
        return {}
    email = r.get("primary_professional_email")
    exp = _active_experience_item(r)

    return {
        # ── Identity ──────────────────────────────────────────────────────────
        "id": str(r.get("id", "")),
        "full_name": r.get("full_name"),
        "first_name": r.get("first_name"),
        "last_name": r.get("last_name"),
        "headline": r.get("headline"),
        "picture_url": r.get("picture_url"),
        "linkedin_url": r.get("linkedin_url"),
        # ── Location ─────────────────────────────────────────────────────────
        "location_country": r.get("location_country"),
        "location_city": r.get("location_city"),
        "location_state": r.get("location_state"),
        # ── Contact / social ─────────────────────────────────────────────────
        "mobile_phone": r.get("mobile_phone"),
        "connections_count": r.get("connections_count"),
        "followers_count": r.get("followers_count"),
        "has_email": bool(email),
        # ── Skills / experience ───────────────────────────────────────────────
        "inferred_skills": r.get("inferred_skills") or [],
        "total_experience_duration_months": r.get("total_experience_duration_months"),
        # ── Salary ───────────────────────────────────────────────────────────
        "projected_base_salary_median": r.get("projected_base_salary_median"),
        "projected_base_salary_currency": r.get("projected_base_salary_currency"),
        # ── Active role ───────────────────────────────────────────────────────
        "active_experience_title": r.get("active_experience_title") or exp.get("position_title"),
        "active_experience_department": r.get("active_experience_department") or exp.get("department"),
        "active_experience_management_level": r.get("active_experience_management_level") or exp.get("management_level"),
        "active_experience_start_date": _build_start_date(exp),
        # ── Active company ────────────────────────────────────────────────────
        "active_experience_company_id": r.get("active_experience_company_id") or exp.get("company_id"),
        # CoreSignal top-level carries shorthand name; full name is in experience[]
        "active_experience_company_name": (
            exp.get("company_name")
            or r.get("active_experience_company_shorthand_name")
        ),
        "active_experience_company_website": r.get("active_experience_company_website") or exp.get("company_website"),
        "active_experience_company_industry": exp.get("company_industry"),
        "active_experience_company_employees_count": exp.get("company_employees_count"),
        "active_experience_company_size": exp.get("company_size_range"),
        "active_experience_company_type": exp.get("company_type"),
        "active_experience_company_status": r.get("active_experience_company_status"),
        "active_experience_company_founded": exp.get("company_founded_year"),
        "active_experience_company_founded_year": exp.get("company_founded_year"),
        "active_experience_company_hq_country": exp.get("company_hq_country"),
        "active_experience_company_hq_city": exp.get("company_hq_city"),
        # company_hq_state is the state/province; company_hq_regions is a broad regions array
        "active_experience_company_hq_region": exp.get("company_hq_state"),
        "active_experience_company_hq_location": exp.get("company_hq_full_address"),
        "active_experience_company_categories_and_keywords": exp.get("company_categories_and_keywords"),
        # Revenue: first non-null across sources in preference order (5 → 4 → 6 → 1)
        "active_experience_company_annual_revenue": next(
            (exp.get(f"company_annual_revenue_source_{s}")
             for s in ("5", "4", "6", "1")
             if exp.get(f"company_annual_revenue_source_{s}") is not None),
            None,
        ),
        # ── Awards & certs ────────────────────────────────────────────────────
        "awards_certifications": _extract_awards_certs(r),
    }


def _map_company(r: dict) -> dict:
    """CoreSignal uses `founded_year`; frontend expects `founded`."""
    if not isinstance(r, dict):
        return {}
    techs_raw = r.get("technologies_used") or []
    technologies_used = [
        {"technology": t["technology"]} if isinstance(t, dict) and "technology" in t else t
        for t in techs_raw
    ]
    # Frontend only needs the count of active job postings, not the full objects
    jobs_raw = r.get("active_job_postings") or []
    active_job_postings = [{"id": j.get("id")} if isinstance(j, dict) else j for j in jobs_raw]

    return {
        # ── Identity ──────────────────────────────────────────────────────────
        "id": str(r.get("id", "")),
        "company_name": r.get("company_name") or r.get("name"),
        "company_legal_name": r.get("company_legal_name"),
        "website": r.get("website"),
        "canonical_linkedin_url": r.get("canonical_linkedin_url"),
        # ── Classification ────────────────────────────────────────────────────
        "industry": r.get("industry"),
        "type": r.get("type"),
        "is_public": r.get("is_public"),
        "company_status": (r.get("status") or {}).get("value") or r.get("company_status"),
        "founded": r.get("founded_year") or r.get("founded"),
        # ── Size ─────────────────────────────────────────────────────────────
        "employees_count": r.get("employees_count"),
        "size_range": r.get("size_range"),
        # ── Location ─────────────────────────────────────────────────────────
        "hq_country": r.get("hq_country"),
        "hq_region": r.get("hq_region"),
        "hq_city": r.get("hq_city"),
        "hq_state": r.get("hq_state"),
        "hq_location": r.get("hq_location"),
        # ── Keywords / tags ───────────────────────────────────────────────────
        "categories_and_keywords": r.get("categories_and_keywords"),
        "awards_certifications": _extract_awards_certs(r),
        # ── Growth metrics ────────────────────────────────────────────────────
        "employees_count_change": r.get("employees_count_change"),
        "total_website_visits_monthly": r.get("total_website_visits_monthly"),
        "total_website_visits_change": r.get("total_website_visits_change"),
        # ── Financial ────────────────────────────────────────────────────────
        "revenue_annual_range": r.get("revenue_annual_range"),
        "last_funding_round": r.get("last_funding_round"),
        # ── Ratings / activity ────────────────────────────────────────────────
        "company_employee_reviews_aggregate_score": r.get("company_employee_reviews_aggregate_score"),
        "active_job_postings": active_job_postings,
        "technologies_used": technologies_used,
    }


async def _store_person_records(db: "AsyncSession", records: list[dict]) -> None:
    import uuid as _uuid
    import datetime as _dt
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    from app.models.search_record import PersonSearchRecord

    if not records:
        return
    now = _dt.datetime.now(_dt.timezone.utc)
    rows = [
        {
            "id": str(_uuid.uuid4()),
            "coresignal_id": str(r.get("id", "")),
            "email": r.get("primary_professional_email") or None,
            "raw_data": r,
            "created_at": now,
            "updated_at": now,
        }
        for r in records
        if r.get("id")
    ]
    if not rows:
        return
    stmt = pg_insert(PersonSearchRecord).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=["coresignal_id"],
        set_={
            "email": stmt.excluded.email,
            "raw_data": stmt.excluded.raw_data,
            "updated_at": stmt.excluded.updated_at,
        },
    )
    await db.execute(stmt)


async def _store_company_records(db: "AsyncSession", records: list[dict]) -> None:
    import uuid as _uuid
    import datetime as _dt
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    from app.models.search_record import CompanySearchRecord

    if not records:
        return
    now = _dt.datetime.now(_dt.timezone.utc)
    rows = [
        {
            "id": str(_uuid.uuid4()),
            "coresignal_id": str(r.get("id", "")),
            "raw_data": r,
            "created_at": now,
            "updated_at": now,
        }
        for r in records
        if r.get("id")
    ]
    if not rows:
        return
    stmt = pg_insert(CompanySearchRecord).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=["coresignal_id"],
        set_={
            "raw_data": stmt.excluded.raw_data,
            "updated_at": stmt.excluded.updated_at,
        },
    )
    await db.execute(stmt)


# ---------------------------------------------------------------------------
# Company pre-fetch — resolve company filters into IDs for person search.
# ---------------------------------------------------------------------------

def _person_has_non_name_company_filters(req: PersonSearchRequest) -> bool:
    """True when company-scoped filters beyond company name are present."""
    company_scoped = any([
        req.company_type,
        req.revenue_buckets,
        req.revenue_min is not None,
        req.revenue_max is not None,
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
        bool(req.keywords_include),
        bool(req.keywords_exclude),
        bool(req.industries),
        bool(req.hq_countries),
        bool(req.hq_states),
        bool(req.hq_cities),
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


def _person_needs_company_prefetch(req: PersonSearchRequest) -> bool:
    return bool(req.companies) or _person_has_non_name_company_filters(req)


async def _prefetch_company_ids_for_person(req: PersonSearchRequest, limit: int = 200) -> list[str]:
    co_req = CompanySearchRequest(
        companies=req.companies,
        location_countries=req.hq_countries,
        location_states=req.hq_states,
        location_cities=req.hq_cities,
        industries=req.industries,
        type=req.company_type,
        revenue_buckets=req.revenue_buckets,
        revenue_min=req.revenue_min,
        revenue_max=req.revenue_max,
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
        keywords_include=req.keywords_include,
        keywords_match_mode=req.keywords_match_mode,
        keywords_scope=req.keywords_scope,
        keywords_exclude=req.keywords_exclude,
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
# Public surface — search_persons / search_companies / agentic_search.
# ---------------------------------------------------------------------------

def _require_api_key() -> None:
    if not settings.CORESIGNAL_API_KEY:
        raise HTTPException(status_code=500, detail="CORESIGNAL_API_KEY is not configured")


def _paginate_ids(ids: list, scroll_token: Optional[str]) -> tuple[list, Optional[str]]:
    try:
        offset = int(scroll_token) if scroll_token else 0
    except ValueError:
        offset = 0
    page_size = settings.CORESIGNAL_PAGE_SIZE
    page = ids[offset : offset + page_size]
    next_token = str(offset + page_size) if offset + page_size < len(ids) else None
    return page, next_token


async def _search_ids(client: httpx.AsyncClient, dataset: str, query: dict) -> list:
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


async def search_persons(req: PersonSearchRequest, db: Optional["AsyncSession"] = None) -> SearchResponse:
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
            # Non-name company filters returned zero matching companies — no results possible.
            if _person_has_non_name_company_filters(req):
                return SearchResponse(data=[], meta=SearchMeta(total=0))
            # Company name not found in company dataset (new/unlisted company);
            # fall back to direct active_experience_company_name match.
            company_id_constraint = None

    # active_experience_company_id is a long field — convert strings to integers before
    # building the terms clause, otherwise ES returns 0 results on type mismatch.
    int_ids = [int(i) for i in (company_id_constraint or []) if str(i).isdigit()]
    query = build_person_query(req, use_company_id_filter=bool(int_ids))
    if int_ids:
        terms_clause = {"terms": {"active_experience_company_id": int_ids}}
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

    if db is not None:
        try:
            await _store_person_records(db, records)
        except Exception:
            pass  # storage failure must never block search results

    return SearchResponse(
        data=[_map_person(r) for r in records],
        meta=SearchMeta(total=len(all_ids), scroll_token=next_token),
    )


async def search_companies(req: CompanySearchRequest, db: Optional["AsyncSession"] = None) -> SearchResponse:
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

    if db is not None:
        try:
            await _store_company_records(db, records)
        except Exception:
            pass  # storage failure must never block search results

    return SearchResponse(
        data=[_map_company(r) for r in records],
        meta=SearchMeta(total=len(all_ids), scroll_token=next_token),
    )


_AGENTIC_URL = "https://api.coresignal.com/cdapi/v2/agentic_search/fast"
_ENTITY_TO_DATASET = {
    "employee": "employee_multi_source",
    "company": "company_multi_source",
}


async def agentic_search(req: AgenticSearchRequest) -> SearchResponse:
    """Translate a natural-language prompt to an ES query via CoreSignal Agentic API."""
    _require_api_key()

    dataset = _ENTITY_TO_DATASET.get(req.entity, "employee_multi_source")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
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

            all_ids = await _search_ids(client, dataset, es_query)
            page_ids = all_ids[: req.limit]
            records = await _collect_records(client, dataset, page_ids)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Agentic search timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    mapper = _map_company if req.entity == "company" else _map_person
    return SearchResponse(
        data=[mapper(r) for r in records],
        meta=SearchMeta(total=len(all_ids)),
    )
