from __future__ import annotations

import asyncio
import logging
import re
import time
from datetime import date, timedelta
from typing import TYPE_CHECKING, Any, NoReturn

import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)

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


def _add_multi_term(
    clauses: list[dict],
    field: str,
    values: list[str] | None,
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
    values: list[str] | None,
    phrase: bool = False,
    and_operator: bool = False,
) -> None:
    if not values:
        return
    if phrase:
        items = [{"match_phrase": {field: v}} for v in values]
    elif and_operator:
        items = [{"match": {field: {"query": v, "operator": "and"}}} for v in values]
    else:
        items = [{"match": {field: v}} for v in values]
    if len(items) == 1:
        clauses.append(items[0])
    else:
        clauses.append({"bool": {"should": items, "minimum_should_match": 1}})


def _add_active_experience_industry_filter(
    clauses: list[dict],
    industries: list[str] | None,
) -> None:
    if not industries:
        return
    ind_should = [
        {"match_phrase": {"experience.company_industry": v}} for v in industries
    ]
    industry_match = (
        {"bool": {"should": ind_should, "minimum_should_match": 1}}
        if len(industries) > 1
        else ind_should[0]
    )
    clauses.append(_build_active_experience_nested(industry_match))


def _build_active_experience_nested(inner_query: dict) -> dict:
    return {
        "nested": {
            "path": "experience",
            "query": {
                "bool": {
                    "must": [
                        inner_query,
                        {"term": {"experience.active_experience": 1}},
                    ]
                }
            },
        }
    }


def _add_active_experience_hq_filter(
    clauses: list[dict],
    countries: list[str] | None,
    states: list[str] | None,
    cities: list[str] | None,
) -> None:
    dims = [
        ("experience.company_hq_country", countries),
        ("experience.company_hq_state", states),
        ("experience.company_hq_city", cities),
    ]
    for field, values in dims:
        if not values:
            continue
        cleaned = [v.strip().title() for v in values if v and v.strip()]
        if not cleaned:
            continue
        inner: dict = (
            {"match_phrase": {field: cleaned[0]}}
            if len(cleaned) == 1
            else {
                "bool": {
                    "should": [{"match_phrase": {field: v}} for v in cleaned],
                    "minimum_should_match": 1,
                }
            }
        )
        clauses.append(_build_active_experience_nested(inner))


def _datetime_ago_str(months: int) -> str:
    today = date.today()
    total = today.year * 12 + (today.month - 1) - months
    y, m = divmod(total, 12)
    return f"{y}-{m + 1:02d}-01 00:00:00.000000"


def _add_active_experience_date_filter(
    clauses: list[dict],
    min_months: int | None,
    max_months: int | None,
) -> None:
    r: dict[str, str] = {}
    if max_months is not None:
        r["gte"] = _datetime_ago_str(max_months)
    if min_months is not None:
        r["lte"] = _datetime_ago_str(min_months)
    if not r:
        return
    clauses.append(
        {
            "nested": {
                "path": "experience_recently_started",
                "query": {
                    "range": {
                        "experience_recently_started.identification_date": r,
                    }
                },
            }
        }
    )


def _add_active_experience_range_filter(
    clauses: list[dict],
    exp_field: str,
    minv: float | None,
    maxv: float | None,
) -> None:
    if minv is None and maxv is None:
        return
    r: dict = {}
    if minv is not None:
        r["gte"] = minv
    if maxv is not None:
        r["lte"] = maxv
    clauses.append(
        _build_active_experience_nested({"range": {f"experience.{exp_field}": r}})
    )


def _add_active_experience_founded_filter(
    clauses: list[dict],
    min_year: int | None,
    max_year: int | None,
) -> None:
    if min_year is None and max_year is None:
        return
    r: dict = {}
    if min_year is not None:
        r["gte"] = str(min_year)
    if max_year is not None:
        r["lte"] = str(max_year)
    clauses.append(
        _build_active_experience_nested(
            {"range": {"experience.company_founded_year": r}}
        )
    )


def _add_active_experience_revenue_filter(
    clauses: list[dict],
    minv: float | None,
    maxv: float | None,
) -> None:
    if minv is None and maxv is None:
        return
    r: dict = {}
    if minv is not None:
        r["gte"] = minv
    if maxv is not None:
        r["lte"] = maxv
    should = [
        _build_active_experience_nested({"range": {f"experience.{src}": r}})
        for src in _EXPERIENCE_REVENUE_SOURCES
    ]
    clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_active_experience_revenue_bucket_filter(
    clauses: list[dict],
    buckets: list[str] | None,
) -> None:
    if not buckets:
        return
    should: list[dict] = []
    for b in buckets:
        rng = _REVENUE_BUCKET_TO_RANGE.get(b)
        if not rng:
            continue
        low, high = rng
        for src in _EXPERIENCE_REVENUE_SOURCES:
            r: dict = {}
            if low is not None:
                r["gte"] = low
            if high is not None:
                r["lte"] = high
            if r:
                should.append(
                    _build_active_experience_nested({"range": {f"experience.{src}": r}})
                )
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_active_experience_company_type_filter(
    clauses: list[dict],
    types: list[str] | None,
) -> None:
    if not types:
        return
    should: list[dict] = []
    for t in types:
        for val in _EXPERIENCE_COMPANY_TYPE_VALUES.get(t.lower().strip(), [t]):
            should.append({"match_phrase": {"experience.company_type": val}})
    if should:
        inner = {"bool": {"should": should, "minimum_should_match": 1}}
        clauses.append(_build_active_experience_nested(inner))


def _add_active_experience_company_status_filter(
    clauses: list[dict],
    statuses: list[str] | None,
) -> None:
    if not statuses:
        return
    inner = (
        {"match_phrase": {"experience.company_type": statuses[0]}}
        if len(statuses) == 1
        else {
            "bool": {
                "should": [
                    {"match_phrase": {"experience.company_type": s}} for s in statuses
                ],
                "minimum_should_match": 1,
            }
        }
    )
    clauses.append(_build_active_experience_nested(inner))


def _add_location_match_multi(
    clauses: list[dict],
    fields: list[str],
    values: list[str] | None,
) -> None:
    if not values:
        return
    cleaned = [v.strip().title() for v in values if v and v.strip()]
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
    minv: float | None,
    maxv: float | None,
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
    minv: float | None,
    maxv: float | None,
) -> None:
    r: dict[str, float] = {}
    if minv is not None:
        r["gte"] = minv
    if maxv is not None:
        r["lte"] = maxv
    if not r:
        return
    clauses.append(
        {
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
        }
    )


def _build_bool_query(
    must: list[dict],
    filters: list[dict],
    should: list[dict] | None = None,
    minimum_should_match: int = 0,
    must_not: list[dict] | None = None,
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


_REVENUE_BUCKET_TO_RANGE: dict[str, tuple[float | None, float | None]] = {
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

_REVENUE_RANGE_SOURCES = (
    "source_4_annual_revenue_range",
    "source_6_annual_revenue_range",
)
_REVENUE_RANGE_PARENT = "revenue_annual_range"
_REVENUE_POINT_SOURCES = ("source_5_annual_revenue", "source_1_annual_revenue")
_REVENUE_POINT_PARENT = "revenue_annual"

_EXPERIENCE_REVENUE_SOURCES = (
    "company_annual_revenue_source_1",
    "company_annual_revenue_source_5",
)

_DESCRIPTION_FIELDS = ["description", "description_enriched", "categories_and_keywords"]

_EXPERIENCE_COMPANY_TYPE_VALUES: dict[str, list[str]] = {
    "public": ["Public Company"],
    "private": ["Privately Held"],
    "public_subsidiary": ["Public Company"],
    "nonprofit": ["Nonprofit"],
    "government": ["Government Agency"],
    "educational": ["Educational Institution", "Educational"],
}

_COMPANY_TYPE_TERMS: dict[str, list[str]] = {
    "saas": ["SaaS", "software as a service"],
    "marketplace": ["marketplace"],
    "ecommerce": ["e-commerce", "ecommerce", "online store"],
    "agency": ["agency", "digital agency", "marketing agency"],
    "consulting": ["consulting", "consultancy"],
    "manufacturing": ["manufacturing", "manufacturer"],
    "media_publisher": ["media", "publisher", "publishing"],
    "education": ["education", "edtech", "e-learning"],
    "non_profit": ["nonprofit", "non-profit"],
    "government": ["government", "public sector"],
    "fintech": ["fintech", "financial technology"],
    "healthtech": ["healthtech", "health technology", "medtech"],
    "proptech": ["proptech", "property technology"],
    "logistics": ["logistics", "supply chain"],
    "hardware": ["hardware", "device manufacturer"],
    "biotech": ["biotech", "biotechnology"],
}

_TYPE_MAP_DIRECT = {
    "nonprofit": "Nonprofit",
    "government": "Government Agency",
    "educational": "Educational",
}

_DEPT_TO_FIELD: dict[str, str] = {
    "sales": "employees_count_breakdown_by_department.employees_count_sales",
    "engineering": "employees_count_breakdown_by_department.employees_count_technical",
    "marketing": "employees_count_breakdown_by_department.employees_count_marketing",
    "operations": "employees_count_breakdown_by_department.employees_count_operations",
    "finance": "employees_count_breakdown_by_department.employees_count_finance",
    "human_resources": "employees_count_breakdown_by_department.employees_count_hr",
    "it": "employees_count_breakdown_by_department.employees_count_technical",
    "legal": "employees_count_breakdown_by_department.employees_count_legal",
    "product": "employees_count_breakdown_by_department.employees_count_product",
    "customer_success": "employees_count_breakdown_by_department.employees_count_customer_service",
    "design": "employees_count_breakdown_by_department.employees_count_design",
    "data": "employees_count_breakdown_by_department.employees_count_research",
    "consulting": "employees_count_breakdown_by_department.employees_count_consulting",
    "administrative": "employees_count_breakdown_by_department.employees_count_administrative",
}

_GROWTH_TIMEFRAME_TO_FIELD: dict[str, str] = {
    "3_month": "employees_count_change.change_quarterly_percentage",
    "6_month": "employees_count_change.change_quarterly_percentage",
    "12_month": "employees_count_change.change_yearly_percentage",
    "24_month": "employees_count_change.change_yearly_percentage",
}

_EMAIL_PROVIDER_TECH_ALIASES: dict[str, list[str]] = {
    "microsoft": [
        "microsoft 365",
        "office 365",
        "microsoft exchange",
        "exchange online",
        "microsoft outlook",
        "outlook",
    ],
    "google": [
        "google workspace",
        "g suite",
        "gmail",
        "google apps",
    ],
    "proofpoint": ["proofpoint"],
    "mimecast": ["mimecast"],
}

_KNOWN_EMAIL_PROVIDER_TECHS: list[str] = [
    alias for aliases in _EMAIL_PROVIDER_TECH_ALIASES.values() for alias in aliases
]

_CERT_SEARCH_TERMS: dict[str, list[str]] = {
    "soc2": ["SOC 2", "SOC2"],
    "gdpr": ["GDPR"],
    "ccpa": ["CCPA"],
    "iso_27001": ["ISO 27001"],
    "hipaa": ["HIPAA"],
    "pci_dss": ["PCI-DSS", "PCI DSS"],
}

_KEYWORD_SCOPE_TO_FIELDS: dict[str, list[str]] = {
    "company_specialties": ["categories_and_keywords"],
    "social_media_description": ["description_enriched"],
    "seo_description": ["description"],
    "ai_description": ["description_enriched"],
    "product_service_tags": ["categories_and_keywords"],
    "website_pages": ["description"],
}
_KEYWORD_ALL_FIELDS = ["description", "description_enriched", "categories_and_keywords"]

_VISIT_CHANGE_TIMEFRAME_TO_FIELD: dict[str, str] = {
    "monthly": "total_website_visits_change.change_monthly_percentage",
    "quarterly": "total_website_visits_change.change_quarterly_percentage",
    "yearly": "total_website_visits_change.change_yearly_percentage",
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
    "6m": 180,
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
    "pre_seed": ["Pre-Seed", "Pre-seed"],
    "seed": ["Seed"],
    "angel": ["Angel"],
    "series_a": ["Series A"],
    "series_b": ["Series B"],
    "series_c": ["Series C"],
    "series_d": ["Series D"],
    "series_e": ["Series E"],
    "series_f": ["Series F"],
    "series_g": ["Series G"],
    "series_h": ["Series H"],
    "series_unknown": ["Series Unknown", "Undisclosed"],
    "convertible_note": ["Convertible Note"],
    "corporate_round": ["Corporate Round"],
    "debt_financing": ["Debt Financing"],
    "equity_crowdfunding": ["Equity Crowdfunding"],
    "grant": ["Grant"],
    "private_equity": ["Private Equity"],
    "post_ipo_equity": ["Post-IPO Equity"],
    "post_ipo_debt": ["Post-IPO Debt"],
    "secondary_market": ["Secondary Market"],
    "venture_round": ["Venture Round"],
    "initial_coin_offering": ["ICO", "Initial Coin Offering"],
    "non_equity_assistance": ["Non-equity Assistance"],
}


def _add_revenue_bucket_filter(
    clauses: list[dict], buckets: list[str] | None
) -> None:
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
                sub.append(
                    {
                        "range": {
                            f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_from": {
                                "lte": high
                            }
                        }
                    }
                )
            if low is not None:
                sub.append(
                    {
                        "range": {
                            f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_to": {
                                "gte": low
                            }
                        }
                    }
                )
            if sub:
                bucket_should.append({"bool": {"filter": sub}})
        for src in _REVENUE_POINT_SOURCES:
            sub = {}
            if low is not None:
                sub["gte"] = low
            if high is not None:
                sub["lte"] = high
            if sub:
                bucket_should.append(
                    {"range": {f"{_REVENUE_POINT_PARENT}.{src}.annual_revenue": sub}}
                )
    if bucket_should:
        clauses.append({"bool": {"should": bucket_should, "minimum_should_match": 1}})


def _add_company_type_filter(clauses: list[dict], types: list[str] | None) -> None:
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
            should.append(
                {
                    "bool": {
                        "filter": [
                            {"term": {"is_public": True}},
                            {"exists": {"field": "parent_company_name"}},
                        ]
                    }
                }
            )
        elif t_norm in _TYPE_MAP_DIRECT:
            should.append({"match_phrase": {"type": _TYPE_MAP_DIRECT[t_norm]}})
        elif t_norm in _COMPANY_TYPE_TERMS:
            for phrase in _COMPANY_TYPE_TERMS[t_norm]:
                for field in _DESCRIPTION_FIELDS:
                    should.append({"match_phrase": {field: phrase}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_company_status_filter(
    clauses: list[dict],
    company_types: list[str] | None,
) -> None:
    if not company_types:
        return
    should = [{"match_phrase": {"type": ct}} for ct in company_types]
    clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_email_provider_filter(
    clauses: list[dict], providers: list[str] | None
) -> None:
    if not providers:
        return
    known = [p.lower() for p in providers if p.lower() in _EMAIL_PROVIDER_TECH_ALIASES]
    include_other = any(p.lower() == "other" for p in providers)

    should: list[dict] = []

    for provider in known:
        for alias in _EMAIL_PROVIDER_TECH_ALIASES[provider]:
            should.append(
                {
                    "nested": {
                        "path": "technologies_used",
                        "query": {"term": {"technologies_used.technology": alias}},
                    }
                }
            )

    if include_other:
        must_not_clauses: list[dict] = []
        for alias in _KNOWN_EMAIL_PROVIDER_TECHS:
            must_not_clauses.append(
                {
                    "nested": {
                        "path": "technologies_used",
                        "query": {"term": {"technologies_used.technology": alias}},
                    }
                }
            )
        should.append({"bool": {"must_not": must_not_clauses}})

    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_text_search_filter(clauses: list[dict], terms: list[str] | None) -> None:
    if not terms:
        return
    should: list[dict] = []
    for term in terms:
        for field in _DESCRIPTION_FIELDS:
            should.append({"match_phrase": {field: term}})
    clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def _add_certifications_filter(clauses: list[dict], certs: list[str] | None) -> None:
    if not certs:
        return
    for cert in certs:
        aliases = _CERT_SEARCH_TERMS.get(cert.lower(), [cert])
        cert_should: list[dict] = []
        for alias in aliases:
            for field in _DESCRIPTION_FIELDS:
                cert_should.append({"match_phrase": {field: alias}})
        clauses.append({"bool": {"should": cert_should, "minimum_should_match": 1}})


def _add_person_certifications_filter(
    clauses: list[dict], certs: list[str] | None
) -> None:
    if not certs:
        return
    for cert in certs:
        aliases = _CERT_SEARCH_TERMS.get(cert.lower(), [cert])
        cert_should = [
            {"match_phrase": {"certifications.title": alias}} for alias in aliases
        ]
        inner = {"bool": {"should": cert_should, "minimum_should_match": 1}}
        clauses.append({"nested": {"path": "certifications", "query": inner}})


def _add_keywords_filter(
    must: list[dict],
    filters: list[dict],
    must_not: list[dict],
    include: list[str] | None,
    match_mode: str,
    scope: list[str] | None,
    exclude: list[str] | None,
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
            must_not.append(
                {"bool": {"should": kw_must_not, "minimum_should_match": 1}}
            )


def _add_person_keywords_filter(
    must: list[dict],
    filters: list[dict],
    must_not: list[dict],
    include: list[str] | None,
    match_mode: str,
    exclude: list[str] | None,
) -> None:
    if not include and not exclude:
        return

    field = "experience.company_categories_and_keywords"

    if include:
        if match_mode == "all":
            for kw in include:
                must.append(
                    _build_active_experience_nested({"match_phrase": {field: kw}})
                )
        else:
            should = [
                _build_active_experience_nested({"match_phrase": {field: kw}})
                for kw in include
            ]
            filters.append({"bool": {"should": should, "minimum_should_match": 1}})

    if exclude:
        for kw in exclude:
            must_not.append(
                _build_active_experience_nested({"match_phrase": {field: kw}})
            )


def _add_enum_text_filter(
    clauses: list[dict],
    values: list[str] | None,
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


def _news_timeframe_to_date(timeframe: str) -> str | None:
    days = _NEWS_TIMEFRAME_DAYS.get(timeframe)
    if not days:
        return None
    return (date.today() - timedelta(days=days)).strftime("%Y-%m-%d")


def _add_news_filter(
    clauses: list[dict],
    keywords: list[str] | None,
    categories: list[str] | None,
    timeframe: str | None,
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


def _add_funding_stage_filter(clauses: list[dict], stages: list[str] | None) -> None:
    if not stages:
        return
    should: list[dict] = []
    for s in stages:
        aliases = _FUNDING_STAGE_MAP.get(s.lower().strip(), [s])
        for alias in aliases:
            should.append({"term": {"last_funding_round.type.keyword": alias}})
    if should:
        clauses.append({"bool": {"should": should, "minimum_should_match": 1}})


def build_person_query(f: PersonSearchRequest) -> dict:
    must: list[dict] = []
    filters: list[dict] = []
    must_not: list[dict] = []

    if f.name:
        should = [{"match_phrase": {"full_name": n.lower()}} for n in f.name]
        must.append({"bool": {"should": should, "minimum_should_match": 1}})

    if f.linkedin_url:
        normalized = [u.strip().rstrip("/").lower() for u in f.linkedin_url]
        should = [{"match_phrase": {"url": u}} for u in normalized]
        must.append({"bool": {"should": should, "minimum_should_match": 1}})

    _add_multi_match(
        must,
        "active_experience_title",
        f.job_title,
        phrase=(f.job_title_match_type == "exact"),
        and_operator=(f.job_title_match_type == "contains"),
    )
    _add_multi_match(
        filters, "active_experience_title", f.job_posting_keywords, and_operator=True
    )
    _add_multi_term(filters, "active_experience_department", f.departments)
    _add_multi_term(filters, "active_experience_management_level", f.seniority)

    _add_multi_match(
        must, "active_experience_company_shorthand_name", f.companies, phrase=True
    )
    _add_active_experience_hq_filter(must, f.hq_countries, f.hq_states, f.hq_cities)

    _add_active_experience_industry_filter(must, f.industries)

    _add_person_certifications_filter(must, f.certifications)

    _add_active_experience_company_type_filter(must, f.company_type)
    _add_active_experience_company_status_filter(must, f.company_status)
    _add_active_experience_revenue_bucket_filter(must, f.revenue_buckets)
    _add_active_experience_revenue_filter(must, f.revenue_min, f.revenue_max)
    _add_active_experience_range_filter(
        must, "company_employees_count", f.employee_count_min, f.employee_count_max
    )
    _add_active_experience_range_filter(
        must,
        "company_employees_count_change_yearly_percentage",
        f.headcount_growth_min,
        f.headcount_growth_max,
    )
    _add_active_experience_range_filter(
        must, "company_last_funding_round_amount_raised", f.funding_min, f.funding_max
    )
    _add_active_experience_founded_filter(must, f.founded_min, f.founded_max)

    _add_location_match_multi(must, ["location_country"], f.person_location_countries)
    _add_location_match_multi(must, ["location_state"], f.person_location_states)
    _add_location_match_multi(must, ["location_city"], f.person_location_cities)

    if f.require_work_email:
        filters.append({"exists": {"field": "primary_professional_email"}})

    _add_multi_match(filters, "inferred_skills", f.technologies, phrase=True)

    if f.exclude_person_ids:
        int_person_ids = [int(i) for i in f.exclude_person_ids if str(i).isdigit()]
        if int_person_ids:
            must_not.append({"terms": {"id": int_person_ids}})
    if f.exclude_company_ids:
        int_co_ids = [int(i) for i in f.exclude_company_ids if str(i).isdigit()]
        if int_co_ids:
            must_not.append({"terms": {"active_experience_company_id": int_co_ids}})
    if f.exclude_company_names:
        for name in f.exclude_company_names:
            must_not.append(
                {"match_phrase": {"active_experience_company_shorthand_name": name}}
            )

    role_min = f.time_in_role_min_months
    role_max = f.time_in_role_max_months
    co_min = f.time_in_company_min_months
    co_max = f.time_in_company_max_months
    merged_min: int | None = (
        max(v for v in (role_min, co_min) if v is not None)
        if any(v is not None for v in (role_min, co_min))
        else None
    )
    merged_max: int | None = (
        min(v for v in (role_max, co_max) if v is not None)
        if any(v is not None for v in (role_max, co_max))
        else None
    )
    _add_active_experience_date_filter(
        filters, min_months=merged_min, max_months=merged_max
    )

    if f.experience_years_min is not None or f.experience_years_max is not None:
        months_min = (
            int(f.experience_years_min * 12)
            if f.experience_years_min is not None
            else None
        )
        months_max = (
            int(f.experience_years_max * 12)
            if f.experience_years_max is not None
            else None
        )
        _add_range(filters, "total_experience_duration_months", months_min, months_max)

    _add_person_keywords_filter(
        must,
        filters,
        must_not,
        f.keywords_include,
        f.keywords_match_mode,
        f.keywords_exclude,
    )

    if f.other_compliance:
        _add_person_keywords_filter(
            must, filters, must_not, f.other_compliance, "all", None
        )

    filters.append({"term": {"is_deleted": 0}})
    filters.append({"term": {"is_parent": 1}})

    return _build_bool_query(must, filters, must_not=must_not or None)


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
    _add_news_filter(
        filters,
        f.company_news_keywords,
        f.company_news_categories,
        f.company_news_timeframe,
    )
    _add_multi_match(filters, "industry", f.industries, phrase=True)

    if f.technologies:
        should_tech: list[dict] = []
        for tech in f.technologies:
            should_tech.append(
                {
                    "nested": {
                        "path": "technologies_used",
                        "query": {
                            "term": {"technologies_used.technology": tech.lower()}
                        },
                    }
                }
            )
        filters.append({"bool": {"should": should_tech, "minimum_should_match": 1}})

    _add_revenue_bucket_filter(filters, f.revenue_buckets)
    if f.revenue_min is not None or f.revenue_max is not None:
        rev_should: list[dict] = []
        for src in _REVENUE_RANGE_SOURCES:
            sub: list[dict] = []
            if f.revenue_min is not None:
                sub.append(
                    {
                        "range": {
                            f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_to": {
                                "gte": f.revenue_min
                            }
                        }
                    }
                )
            if f.revenue_max is not None:
                sub.append(
                    {
                        "range": {
                            f"{_REVENUE_RANGE_PARENT}.{src}.annual_revenue_range_from": {
                                "lte": f.revenue_max
                            }
                        }
                    }
                )
            if sub:
                rev_should.append({"bool": {"filter": sub}})
        for src in _REVENUE_POINT_SOURCES:
            sub = {}
            if f.revenue_min is not None:
                sub["gte"] = f.revenue_min
            if f.revenue_max is not None:
                sub["lte"] = f.revenue_max
            if sub:
                rev_should.append(
                    {"range": {f"{_REVENUE_POINT_PARENT}.{src}.annual_revenue": sub}}
                )
        if rev_should:
            filters.append({"bool": {"should": rev_should, "minimum_should_match": 1}})

    _add_funding_stage_filter(filters, f.funding_stages)
    _add_range(filters, "employees_count", f.employee_count_min, f.employee_count_max)
    _add_range(
        filters, "last_funding_round.amount_raised", f.funding_min, f.funding_max
    )

    if f.founded_min is not None or f.founded_max is not None:
        yr: dict[str, Any] = {}
        if f.founded_min is not None:
            yr["gte"] = str(f.founded_min)
        if f.founded_max is not None:
            yr["lte"] = str(f.founded_max)
        filters.append({"range": {"founded_year": yr}})

    growth_field = _GROWTH_TIMEFRAME_TO_FIELD.get(
        f.headcount_growth_timeframe,
        "employees_count_change.change_yearly_percentage",
    )
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
            _add_range(
                filters,
                dept_field,
                f.headcount_by_department_min,
                f.headcount_by_department_max,
            )

    _add_range(
        filters,
        "total_website_visits_monthly",
        f.website_visits_min,
        f.website_visits_max,
    )

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
    _add_text_search_filter(filters, f.other_compliance)

    if f.job_posting_keywords:
        for kw in f.job_posting_keywords:
            filters.append(
                {
                    "nested": {
                        "path": "active_job_postings",
                        "query": {"match": {"active_job_postings.title": kw}},
                    }
                }
            )

    _add_keywords_filter(
        must,
        filters,
        must_not,
        f.keywords_include,
        f.keywords_match_mode,
        f.keywords_scope,
        f.keywords_exclude,
    )

    return _build_bool_query(must, filters, must_not=must_not or None)


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
        logger.error("CoreSignal 400 error body: %s", body)
        raise HTTPException(
            status_code=400,
            detail="Invalid search parameters. Please adjust your filters and try again.",
        )
    if status == 401:
        raise HTTPException(
            status_code=503,
            detail="Search service is not configured. Please contact support.",
        )
    if status == 402:
        raise HTTPException(
            status_code=402,
            detail="Search credit balance exhausted. Please upgrade your plan.",
        )
    if status == 403:
        raise HTTPException(
            status_code=403,
            detail="Search service access denied. Please contact support.",
        )
    if status == 429:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment and try again.",
        )
    if status >= 500:
        raise HTTPException(
            status_code=502,
            detail="Search service is temporarily unavailable. Please try again later.",
        )
    raise HTTPException(status_code=status, detail=msg)


def _search_url(dataset: str) -> str:
    return f"{settings.CORESIGNAL_BASE_URL}/v2/{dataset}/search/es_dsl"


def _collect_url(dataset: str, record_id: str | int) -> str:
    return f"{settings.CORESIGNAL_BASE_URL}/v2/{dataset}/collect/{record_id}"


def _make_search_body(query: dict) -> dict:
    return {"query": query, "sort": ["_score"]}


async def _collect_records(
    client: httpx.AsyncClient,
    dataset: str,
    ids: list,
) -> list[dict]:
    async def fetch_one(rid: Any) -> dict | None:
        try:
            resp = await client.get(_collect_url(dataset, rid), headers=_headers())
        except httpx.RequestError:
            return None
        if resp.status_code == 200:
            body = resp.json()
            if (
                isinstance(body, dict)
                and "data" in body
                and isinstance(body["data"], dict)
            ):
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
    for item in r.get("awards") or []:
        label = (
            (item.get("title") or item.get("name"))
            if isinstance(item, dict)
            else str(item)
        )
        if label:
            result.append(label)
    for item in r.get("certifications") or []:
        label = (
            (item.get("name") or item.get("title"))
            if isinstance(item, dict)
            else str(item)
        )
        if label:
            result.append(label)
    return result or None


def _map_person(r: dict) -> dict:
    if not isinstance(r, dict):
        return {}
    email = r.get("primary_professional_email")
    exp = _active_experience_item(r)

    return {
        "id": str(r.get("id", "")),
        "full_name": r.get("full_name"),
        "first_name": r.get("first_name"),
        "last_name": r.get("last_name"),
        "headline": r.get("headline"),
        "picture_url": r.get("picture_url"),
        "linkedin_url": r.get("linkedin_url"),
        "linkedin_canonical_shorthand_name": r.get("linkedin_canonical_shorthand_name"),
        "location_country": r.get("location_country"),
        "location_city": r.get("location_city"),
        "location_state": r.get("location_state"),
        "mobile_phone": r.get("mobile_phone"),
        "connections_count": r.get("connections_count"),
        "followers_count": r.get("followers_count"),
        "has_email": bool(email),
        "inferred_skills": r.get("inferred_skills") or [],
        "total_experience_duration_months": r.get("total_experience_duration_months"),
        "projected_base_salary_median": r.get("projected_base_salary_median"),
        "projected_base_salary_currency": r.get("projected_base_salary_currency"),
        "active_experience_title": r.get("active_experience_title")
        or exp.get("position_title"),
        "active_experience_department": r.get("active_experience_department")
        or exp.get("department"),
        "active_experience_management_level": r.get(
            "active_experience_management_level"
        )
        or exp.get("management_level"),
        "active_experience_start_date": _build_start_date(exp),
        "active_experience_company_id": r.get("active_experience_company_id")
        or exp.get("company_id"),
        "active_experience_company_name": (
            exp.get("company_name") or r.get("active_experience_company_shorthand_name")
        ),
        "active_experience_company_logo_url": (
            r.get("active_experience_company_logo_url") or exp.get("company_logo_url")
        ),
        "active_experience_company_website": r.get("active_experience_company_website")
        or exp.get("company_website"),
        "active_experience_company_linkedin_url": exp.get("company_linkedin_url"),
        "active_experience_company_industry": exp.get("company_industry"),
        "active_experience_company_employees_count": exp.get("company_employees_count"),
        "active_experience_company_size": exp.get("company_size_range"),
        "active_experience_company_type": exp.get("company_type"),
        "active_experience_company_status": r.get("active_experience_company_status"),
        "active_experience_company_founded": exp.get("company_founded_year"),
        "active_experience_company_founded_year": exp.get("company_founded_year"),
        "active_experience_company_hq_country": exp.get("company_hq_country"),
        "active_experience_company_hq_city": exp.get("company_hq_city"),
        "active_experience_company_hq_region": exp.get("company_hq_state"),
        "active_experience_company_hq_location": exp.get("company_hq_full_address"),
        "active_experience_company_categories_and_keywords": exp.get(
            "company_categories_and_keywords"
        ),
        "active_experience_company_annual_revenue": next(
            (
                exp.get(f"company_annual_revenue_source_{s}")
                for s in ("5", "4", "6", "1")
                if exp.get(f"company_annual_revenue_source_{s}") is not None
            ),
            None,
        ),
        "awards_certifications": _extract_awards_certs(r),
    }


def _map_company(r: dict) -> dict:
    if not isinstance(r, dict):
        return {}
    techs_raw = r.get("technologies_used") or []
    technologies_used = [
        {"technology": t["technology"]}
        if isinstance(t, dict) and "technology" in t
        else t
        for t in techs_raw
    ]
    jobs_raw = r.get("active_job_postings") or []
    active_job_postings = [
        {"id": j.get("id")} if isinstance(j, dict) else j
        for j in jobs_raw
        if not isinstance(j, dict) or j.get("id") is not None
    ]

    return {
        "id": str(r.get("id", "")),
        "company_name": r.get("company_name") or r.get("name"),
        "company_legal_name": r.get("company_legal_name"),
        "website": r.get("website"),
        "logo_url": r.get("logo_url"),
        "canonical_linkedin_url": r.get("canonical_linkedin_url"),
        "industry": r.get("industry"),
        "type": r.get("type"),
        "is_public": r.get("is_public"),
        "company_status": (r.get("status") or {}).get("value")
        or r.get("company_status"),
        "founded": r.get("founded_year") or r.get("founded"),
        "employees_count": r.get("employees_count"),
        "size_range": r.get("size_range"),
        "hq_country": r.get("hq_country"),
        "hq_region": r.get("hq_region"),
        "hq_city": r.get("hq_city"),
        "hq_state": r.get("hq_state"),
        "hq_location": r.get("hq_location"),
        "categories_and_keywords": r.get("categories_and_keywords"),
        "awards_certifications": _extract_awards_certs(r),
        "employees_count_change": r.get("employees_count_change"),
        "total_website_visits_monthly": r.get("total_website_visits_monthly"),
        "total_website_visits_change": r.get("total_website_visits_change"),
        "revenue_annual_range": r.get("revenue_annual_range"),
        "last_funding_round": r.get("last_funding_round"),
        "company_employee_reviews_aggregate_score": r.get(
            "company_employee_reviews_aggregate_score"
        ),
        "active_job_postings": active_job_postings,
        "technologies_used": technologies_used,
    }


def map_person_detail(raw: dict) -> dict:
    """
    Full "business card" mapping for a person — everything _map_person returns
    plus work history, education, certifications, and the rest of the detail
    fields shown in the person detail panel.
    """
    if not isinstance(raw, dict):
        return {}
    mapped = _map_person(raw)

    experiences = [e for e in (raw.get("experience") or []) if isinstance(e, dict)]
    work_history = []
    for exp in sorted(experiences, key=lambda e: e.get("order_in_profile") or 999):
        is_current = bool(exp.get("is_current") or exp.get("active_experience"))
        work_history.append(
            {
                "company_name": exp.get("company_name"),
                "company_logo_url": exp.get("company_logo_url"),
                "company_website": exp.get("company_website"),
                "company_linkedin_url": exp.get("company_url"),
                "title": exp.get("title") or exp.get("position_title"),
                "start_date": exp.get("date_from"),
                "end_date": exp.get("date_to"),
                "is_current": is_current,
                "duration": exp.get("duration"),
                "location": exp.get("location")
                or exp.get("location_country")
                or exp.get("location_city"),
                "description": exp.get("description"),
            }
        )

    education_raw = raw.get("education") or []
    education = []
    for edu in education_raw:
        if isinstance(edu, dict):
            education.append(
                {
                    "school": edu.get("institution")
                    or edu.get("school_name")
                    or edu.get("company_name"),
                    "school_logo_url": edu.get("institution_logo_url"),
                    "degree": edu.get("description")
                    or edu.get("degree_type")
                    or edu.get("degree"),
                    "field": edu.get("program") or edu.get("field_of_study"),
                    "start_year": edu.get("date_from_year") or edu.get("date_from"),
                    "end_year": edu.get("date_to_year") or edu.get("date_to"),
                    "activities": edu.get("activities_and_societies"),
                }
            )

    certifications = []
    for cert in raw.get("certifications") or []:
        if isinstance(cert, dict):
            certifications.append(
                {
                    "title": cert.get("title") or cert.get("name"),
                    "issuer": cert.get("issuer"),
                    "date": cert.get("date_from") or cert.get("date"),
                    "url": cert.get("certificate_url"),
                }
            )

    languages = []
    for lang in raw.get("languages") or []:
        if isinstance(lang, dict) and lang.get("language"):
            languages.append(
                {
                    "language": lang["language"],
                    "proficiency": lang.get("proficiency"),
                }
            )

    patents = []
    for p in raw.get("patents") or []:
        if isinstance(p, dict):
            inventors = [
                inv.get("full_name")
                for inv in (p.get("inventors") or [])
                if isinstance(inv, dict) and inv.get("full_name")
            ]
            patents.append(
                {
                    "title": p.get("title"),
                    "status": p.get("status"),
                    "date": p.get("date"),
                    "url": p.get("patent_url"),
                    "description": p.get("description"),
                    "patent_number": p.get("patent_or_application_number"),
                    "inventors": inventors,
                }
            )

    projects = []
    for pr in raw.get("projects") or []:
        if isinstance(pr, dict):
            members = [
                m.get("full_name")
                for m in (pr.get("team_members") or [])
                if isinstance(m, dict) and m.get("full_name")
            ]
            projects.append(
                {
                    "name": pr.get("name"),
                    "url": pr.get("project_url"),
                    "description": pr.get("description"),
                    "start_date": pr.get("date_from"),
                    "end_date": pr.get("date_to"),
                    "members": members,
                }
            )

    publications = []
    for pub in raw.get("publications") or []:
        if isinstance(pub, dict):
            authors = [
                a.get("full_name")
                for a in (pub.get("authors") or [])
                if isinstance(a, dict) and a.get("full_name")
            ]
            publications.append(
                {
                    "title": pub.get("title"),
                    "publisher": pub.get("publisher"),
                    "date": pub.get("date"),
                    "url": pub.get("publication_url"),
                    "description": pub.get("description"),
                    "authors": authors,
                }
            )

    volunteering = []
    for v in raw.get("volunteering_positions") or []:
        if isinstance(v, dict):
            volunteering.append(
                {
                    "organization": v.get("organization"),
                    "role": v.get("role"),
                    "cause": v.get("cause"),
                    "start_date": v.get("date_from"),
                    "end_date": v.get("date_to"),
                    "duration": v.get("duration"),
                    "description": v.get("description"),
                }
            )

    organizations = []
    for org in raw.get("organizations") or []:
        if isinstance(org, dict):
            organizations.append(
                {
                    "name": org.get("organization"),
                    "position": org.get("position"),
                    "description": org.get("description"),
                    "start_date": org.get("date_from"),
                    "end_date": org.get("date_to"),
                }
            )

    courses = []
    for c in raw.get("courses") or []:
        if isinstance(c, dict) and c.get("title"):
            courses.append(
                {
                    "title": c.get("title"),
                    "organizer": c.get("organizer"),
                }
            )

    awards = []
    for a in raw.get("awards") or []:
        if isinstance(a, dict):
            awards.append(
                {
                    "title": a.get("title"),
                    "issuer": a.get("issuer"),
                    "date": a.get("date"),
                    "description": a.get("description"),
                }
            )

    recommendations = []
    for r in raw.get("recommendations") or []:
        if isinstance(r, dict) and r.get("recommendation"):
            recommendations.append(
                {
                    "text": r.get("recommendation"),
                    "from_name": r.get("full_name"),
                    "from_url": r.get("referee_url"),
                }
            )

    test_scores = []
    for ts in raw.get("test_scores") or []:
        if isinstance(ts, dict):
            test_scores.append(
                {
                    "title": ts.get("title"),
                    "score": ts.get("score"),
                    "date": ts.get("date"),
                    "description": ts.get("description"),
                }
            )

    websites = [
        w.get("personal_website")
        for w in (raw.get("websites") or [])
        if isinstance(w, dict) and w.get("personal_website")
    ]

    total_experience = None
    if work_history:
        earliest = min(
            (w["start_date"] for w in work_history if w.get("start_date")),
            default=None,
        )
        if earliest:
            try:
                start = date.fromisoformat(earliest[:10])
                years = (date.today() - start).days // 365
                total_experience = f"{years} year{'s' if years != 1 else ''}"
            except Exception:
                pass

    return {
        **mapped,
        "summary": raw.get("summary"),
        "work_history": work_history,
        "education": education,
        "certifications": certifications,
        "languages": languages,
        "total_experience": total_experience,
        "patents": patents,
        "projects": projects,
        "publications": publications,
        "volunteering": volunteering,
        "organizations": organizations,
        "courses": courses,
        "awards": awards,
        "recommendations": recommendations,
        "test_scores": test_scores,
        "websites": websites,
    }


def map_company_detail(raw: dict) -> dict:
    """Full "business card" mapping for a company — _map_company plus description/specialties."""
    if not isinstance(raw, dict):
        return {}
    return {
        **_map_company(raw),
        "description": raw.get("description") or raw.get("summary"),
        "specialties": raw.get("specialties"),
    }


async def _store_person_records(db: AsyncSession, records: list[dict]) -> None:
    import datetime as _dt
    import uuid as _uuid

    from sqlalchemy.dialects.postgresql import insert as pg_insert

    from app.models.search_record import PersonSearchRecord

    if not records:
        return
    now = _dt.datetime.now(_dt.UTC)
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


async def _store_company_records(db: AsyncSession, records: list[dict]) -> None:
    import datetime as _dt
    import uuid as _uuid

    from sqlalchemy.dialects.postgresql import insert as pg_insert

    from app.models.search_record import CompanySearchRecord

    if not records:
        return
    now = _dt.datetime.now(_dt.UTC)
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


def _require_api_key() -> None:
    if not settings.CORESIGNAL_API_KEY:
        raise HTTPException(
            status_code=500, detail="CORESIGNAL_API_KEY is not configured"
        )


def _safe_int(val: str | None) -> int:
    try:
        return int(val or 0)
    except (ValueError, TypeError):
        return 0


async def _search_ids(
    client: httpx.AsyncClient,
    dataset: str,
    query: dict,
    scroll_token: str | None = None,
    page_size: int = 10,
) -> dict[str, Any]:
    params: dict[str, Any] = {"items_per_page": page_size}
    if scroll_token:
        params["after"] = scroll_token

    resp = await client.post(
        _search_url(dataset),
        headers=_headers(),
        params=params,
        json=_make_search_body(query),
    )

    if resp.status_code == 200:
        body = resp.json()
        return {
            "ids": body if isinstance(body, list) else [],
            "total": _safe_int(resp.headers.get("x-total-results")),
            "total_pages": _safe_int(resp.headers.get("x-total-pages")),
            "next_token": resp.headers.get("x-next-page-after"),
        }

    try:
        err_body = resp.json()
    except Exception:
        err_body = {}

    _raise_provider_error(resp.status_code, err_body)
    raise AssertionError("unreachable")


async def search_persons(
    req: PersonSearchRequest, db: AsyncSession | None = None, full_detail: bool = False
) -> SearchResponse:
    _require_api_key()

    query = build_person_query(req)

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            search_result = await _search_ids(
                client,
                "employee_multi_source",
                query,
                scroll_token=req.scroll_token,
                page_size=req.page_size,
            )
            page_ids = search_result["ids"]
            records = await _collect_records(client, "employee_multi_source", page_ids)
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, detail="API request timed out. Please try again."
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502, detail="Could not reach API. Please try again later."
        )

    if db is not None:
        try:
            await _store_person_records(db, records)
        except Exception:
            pass

    person_mapper = map_person_detail if full_detail else _map_person
    return SearchResponse(
        data=[person_mapper(r) for r in records],
        meta=SearchMeta(
            total=search_result["total"],
            total_pages=search_result["total_pages"] or None,
            scroll_token=search_result["next_token"],
        ),
    )


async def search_companies(
    req: CompanySearchRequest, db: AsyncSession | None = None, full_detail: bool = False
) -> SearchResponse:
    _require_api_key()

    query = build_company_query(req)
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            search_result = await _search_ids(
                client,
                "company_multi_source",
                query,
                scroll_token=req.scroll_token,
                page_size=req.page_size,
            )
            page_ids = search_result["ids"]
            records = await _collect_records(client, "company_multi_source", page_ids)
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, detail="API request timed out. Please try again."
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502, detail="Could not reach API. Please try again later."
        )

    if db is not None:
        try:
            await _store_company_records(db, records)
        except Exception:
            pass

    company_mapper = map_company_detail if full_detail else _map_company
    return SearchResponse(
        data=[company_mapper(r) for r in records],
        meta=SearchMeta(
            total=search_result["total"],
            total_pages=search_result["total_pages"] or None,
            scroll_token=search_result["next_token"],
        ),
    )


_AGENTIC_URL = f"{settings.CORESIGNAL_BASE_URL}/v2/agentic_search/fast"


async def agentic_search(
    req: AgenticSearchRequest, db: AsyncSession | None = None
) -> SearchResponse:
    _require_api_key()

    dataset = (
        "company_multi_source" if req.entity == "company" else "employee_multi_source"
    )

    if req.es_query:
        query = req.es_query
    else:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    _AGENTIC_URL,
                    headers=_headers(),
                    json={"prompt": req.prompt, "entity": req.entity},
                )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504, detail="Agentic search timed out. Please try again."
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=502, detail="Could not reach API. Please try again later."
            )

        if resp.status_code != 200:
            try:
                err_body = resp.json()
            except Exception:
                err_body = {}
            _raise_provider_error(resp.status_code, err_body)

        try:
            agentic_body = resp.json()
        except Exception:
            return SearchResponse(data=[], meta=SearchMeta(total=0))

        if not isinstance(agentic_body, dict):
            return SearchResponse(data=[], meta=SearchMeta(total=0))

        query = agentic_body.get("query", agentic_body)

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            search_result = await _search_ids(
                client,
                dataset,
                query,
                scroll_token=req.scroll_token,
                page_size=req.page_size,
            )
            records = await _collect_records(client, dataset, search_result["ids"])
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504, detail="Search timed out. Please try again."
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502, detail="Could not reach API. Please try again later."
        )

    map_fn = _map_company if req.entity == "company" else _map_person

    if db is not None:
        try:
            if req.entity == "company":
                await _store_company_records(db, records)
            else:
                await _store_person_records(db, records)
        except Exception:
            pass

    return SearchResponse(
        data=[map_fn(r) for r in records],
        meta=SearchMeta(
            total=search_result["total"],
            total_pages=search_result["total_pages"] or None,
            scroll_token=search_result["next_token"],
            es_query=query,
        ),
    )


# ---------------------------------------------------------------------------
# URL normalization utilities (extension-only)
# ---------------------------------------------------------------------------

def _normalize_linkedin_url(url: str) -> str:
    """Normalize any LinkedIn URL to https://www.linkedin.com/... without trailing slash."""
    url = url.strip()
    url = re.sub(r"^https?://", "", url, flags=re.IGNORECASE)
    if not url.lower().startswith("www."):
        url = "www." + url
    url = url.rstrip("/")
    return "https://" + url.lower()


def _extract_linkedin_shorthand(url: str) -> str:
    """Extract LinkedIn profile shorthand slug from a /in/ URL. E.g. .../in/teja-kumar/ -> teja-kumar."""
    url = url.strip().rstrip("/").lower()
    if "/in/" in url:
        return url.split("/in/")[1].split("/")[0].split("?")[0]
    return ""


def _extract_linkedin_company_shorthand(url: str) -> str:
    """Extract company shorthand from a /company/ URL. E.g. .../company/zoho/ -> zoho."""
    url = url.strip().rstrip("/").lower()
    if "/company/" in url:
        return url.split("/company/")[1].split("/")[0].split("?")[0]
    return ""


def _extract_root_domain(url: str) -> str:
    """Extract bare root domain from any URL, e.g. https://www.stripe.com/about -> stripe.com."""
    url = url.strip()
    url = re.sub(r"^https?://", "", url, flags=re.IGNORECASE)
    url = re.sub(r"^www\.", "", url, flags=re.IGNORECASE)
    url = url.split("/")[0].split("?")[0].split("#")[0]
    return url.lower()


# ---------------------------------------------------------------------------
# Extension-specific search functions (always limit = 1)
# ---------------------------------------------------------------------------

async def search_extension_person(linkedin_url: str, db: "AsyncSession | None" = None) -> SearchResponse:
    """Exact-match person lookup by LinkedIn profile shorthand name. Returns at most one record."""
    _require_api_key()

    shorthand = _extract_linkedin_shorthand(linkedin_url)
    if not shorthand:
        raise HTTPException(status_code=400, detail="Invalid LinkedIn profile URL")

    logger.info("extension_person_search url=%s shorthand=%s", linkedin_url, shorthand)

    query = {
        "bool": {
            "filter": [
                {"term": {"is_deleted": 0}},
                {"term": {"is_parent": 1}},
                {"terms": {"linkedin_shorthand_names.exact": [shorthand]}},
            ]
        }
    }

    t0 = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            search_result = await _search_ids(client, "employee_multi_source", query, page_size=1)
            records = await _collect_records(client, "employee_multi_source", search_result["ids"])
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    logger.info(
        "extension_person_search shorthand=%s total=%d duration=%.2fs",
        shorthand, search_result["total"], time.monotonic() - t0,
    )

    if db is not None:
        try:
            await _store_person_records(db, records)
        except Exception:
            pass

    single = records[:1]
    return SearchResponse(
        data=[_map_person(r) for r in single],
        meta=SearchMeta(total=1 if single else 0, total_pages=1 if single else 0, scroll_token=None),
    )


async def search_extension_company(
    linkedin_url: str | None = None,
    website: str | None = None,
    company_name: str | None = None,
    db: "AsyncSession | None" = None,
) -> SearchResponse:
    """
    Exact-match company lookup for the extension. Returns at most one record.
    Priority: linkedin_url > website > company_name.
    """
    _require_api_key()

    must: list[dict] = []
    search_type: str

    if linkedin_url:
        normalized = _normalize_linkedin_url(linkedin_url)
        shorthand = _extract_linkedin_company_shorthand(linkedin_url)
        must.append({
            "bool": {
                "should": [
                    {"terms": {"canonical_linkedin_url": [normalized]}},
                    {"terms": {"linkedin_url": [normalized]}},
                    *(
                        [
                            {"terms": {"canonical_linkedin_shorthand_name.exact": [shorthand]}},
                            {"terms": {"linkedin_shorthand_name.exact": [shorthand]}},
                        ]
                        if shorthand else []
                    ),
                ],
                "minimum_should_match": 1,
            }
        })
        search_type = f"linkedin:{normalized}"
    elif website:
        domain = _extract_root_domain(website)
        must.append({"match_phrase": {"website": domain}})
        search_type = f"website:{domain}"
    elif company_name:
        must.append({"match_phrase": {"company_name": company_name}})
        search_type = f"name:{company_name}"
    else:
        raise HTTPException(status_code=400, detail="Provide linkedin_url, website, or company_name.")

    query = {"bool": {"must": must}}
    logger.info("extension_company_search type=%s", search_type)

    t0 = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            search_result = await _search_ids(client, "company_multi_source", query, page_size=1)
            records = await _collect_records(client, "company_multi_source", search_result["ids"])
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="API request timed out. Please try again.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach API. Please try again later.")

    logger.info(
        "extension_company_search type=%s total=%d duration=%.2fs",
        search_type, search_result["total"], time.monotonic() - t0,
    )

    if db is not None:
        try:
            await _store_company_records(db, records)
        except Exception:
            pass

    single = records[:1]
    return SearchResponse(
        data=[_map_company(r) for r in single],
        meta=SearchMeta(total=1 if single else 0, total_pages=1 if single else 0, scroll_token=None),
    )
