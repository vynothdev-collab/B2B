import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status

logger = logging.getLogger(__name__)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.search_record import PersonSearchRecord, CompanySearchRecord
from app.models.user import User
from app.schemas.search import (
    AgenticSearchRequest,
    CompanySearchRequest,
    EmailRevealResponse,
    PersonSearchRequest,
    SearchResponse,
    TitleAutocompleteResponse,
)
from app.services import coresignal_service

router = APIRouter()


def _check_credits(user: User) -> None:
    if user.allocated_credits - user.used_credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Please contact your admin to allocate more credits.",
        )


@router.post("/persons", response_model=SearchResponse, summary="Search people")
async def person_search(
    body: PersonSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    _check_credits(current_user)
    result = await coresignal_service.search_persons(body, db=db)
    current_user.used_credits += 1
    await db.flush()
    return result


@router.post("/companies", response_model=SearchResponse, summary="Search companies")
async def company_search(
    body: CompanySearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    _check_credits(current_user)
    result = await coresignal_service.search_companies(body, db=db)
    current_user.used_credits += 1
    await db.flush()
    return result


@router.post("/agentic", response_model=SearchResponse, summary="Natural-language AI search")
async def agentic_search(
    body: AgenticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    _check_credits(current_user)
    result = await coresignal_service.agentic_search(body, db=db)
    current_user.used_credits += 1
    await db.flush()
    return result


@router.get(
    "/persons/{record_id}/email",
    response_model=EmailRevealResponse,
    summary="Reveal stored email for a person record",
)
async def reveal_person_email(
    record_id: str,
    db: AsyncSession = Depends(get_db),
) -> EmailRevealResponse:
    result = await db.execute(
        select(PersonSearchRecord).where(PersonSearchRecord.coresignal_id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found. Run a new search to refresh.",
        )
    return EmailRevealResponse(
        record_id=record_id,
        email=record.email,
        has_email=bool(record.email),
    )


@router.get("/persons/{record_id}/detail", summary="Full person detail with work history")
async def get_person_detail(
    record_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PersonSearchRecord).where(PersonSearchRecord.coresignal_id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Person not found")

    raw = record.raw_data or {}
    mapped = coresignal_service._map_person(raw)

    # Work history — support both CoreSignal field naming variants
    experiences = [e for e in (raw.get("experience") or []) if isinstance(e, dict)]
    work_history = []
    for exp in sorted(experiences, key=lambda e: e.get("order_in_profile") or 999):
        is_current = bool(exp.get("is_current") or exp.get("active_experience"))
        work_history.append({
            "company_name": exp.get("company_name"),
            "company_logo_url": exp.get("company_logo_url"),
            "company_website": exp.get("company_website"),
            "company_linkedin_url": exp.get("company_url"),
            "title": exp.get("title") or exp.get("position_title"),
            "start_date": exp.get("date_from"),
            "end_date": exp.get("date_to"),
            "is_current": is_current,
            "duration": exp.get("duration"),
            "location": exp.get("location") or exp.get("location_country") or exp.get("location_city"),
            "description": exp.get("description"),
        })

    # Education
    education_raw = raw.get("education") or []
    education = []
    for edu in education_raw:
        if isinstance(edu, dict):
            education.append({
                "school": edu.get("institution") or edu.get("school_name") or edu.get("company_name"),
                "school_logo_url": edu.get("institution_logo_url"),
                "degree": edu.get("description") or edu.get("degree_type") or edu.get("degree"),
                "field": edu.get("program") or edu.get("field_of_study"),
                "start_year": edu.get("date_from_year") or edu.get("date_from"),
                "end_year": edu.get("date_to_year") or edu.get("date_to"),
                "activities": edu.get("activities_and_societies"),
            })

    # Certifications
    certifications = []
    for cert in (raw.get("certifications") or []):
        if isinstance(cert, dict):
            certifications.append({
                "title": cert.get("title") or cert.get("name"),
                "issuer": cert.get("issuer"),
                "date": cert.get("date_from") or cert.get("date"),
                "url": cert.get("certificate_url"),
            })

    # Languages
    languages = []
    for lang in (raw.get("languages") or []):
        if isinstance(lang, dict) and lang.get("language"):
            languages.append({
                "language": lang["language"],
                "proficiency": lang.get("proficiency"),
            })

    # Patents
    patents = []
    for p in (raw.get("patents") or []):
        if isinstance(p, dict):
            inventors = [
                inv.get("full_name") for inv in (p.get("inventors") or [])
                if isinstance(inv, dict) and inv.get("full_name")
            ]
            patents.append({
                "title": p.get("title"),
                "status": p.get("status"),
                "date": p.get("date"),
                "url": p.get("patent_url"),
                "description": p.get("description"),
                "patent_number": p.get("patent_or_application_number"),
                "inventors": inventors,
            })

    # Projects
    projects = []
    for pr in (raw.get("projects") or []):
        if isinstance(pr, dict):
            members = [
                m.get("full_name") for m in (pr.get("team_members") or [])
                if isinstance(m, dict) and m.get("full_name")
            ]
            projects.append({
                "name": pr.get("name"),
                "url": pr.get("project_url"),
                "description": pr.get("description"),
                "start_date": pr.get("date_from"),
                "end_date": pr.get("date_to"),
                "members": members,
            })

    # Publications
    publications = []
    for pub in (raw.get("publications") or []):
        if isinstance(pub, dict):
            authors = [
                a.get("full_name") for a in (pub.get("authors") or [])
                if isinstance(a, dict) and a.get("full_name")
            ]
            publications.append({
                "title": pub.get("title"),
                "publisher": pub.get("publisher"),
                "date": pub.get("date"),
                "url": pub.get("publication_url"),
                "description": pub.get("description"),
                "authors": authors,
            })

    # Volunteering
    volunteering = []
    for v in (raw.get("volunteering_positions") or []):
        if isinstance(v, dict):
            volunteering.append({
                "organization": v.get("organization"),
                "role": v.get("role"),
                "cause": v.get("cause"),
                "start_date": v.get("date_from"),
                "end_date": v.get("date_to"),
                "duration": v.get("duration"),
                "description": v.get("description"),
            })

    # Organizations
    organizations = []
    for org in (raw.get("organizations") or []):
        if isinstance(org, dict):
            organizations.append({
                "name": org.get("organization"),
                "position": org.get("position"),
                "description": org.get("description"),
                "start_date": org.get("date_from"),
                "end_date": org.get("date_to"),
            })

    # Courses
    courses = []
    for c in (raw.get("courses") or []):
        if isinstance(c, dict) and c.get("title"):
            courses.append({
                "title": c.get("title"),
                "organizer": c.get("organizer"),
            })

    # Awards
    awards = []
    for a in (raw.get("awards") or []):
        if isinstance(a, dict):
            awards.append({
                "title": a.get("title"),
                "issuer": a.get("issuer"),
                "date": a.get("date"),
                "description": a.get("description"),
            })

    # Recommendations
    recommendations = []
    for r in (raw.get("recommendations") or []):
        if isinstance(r, dict) and r.get("recommendation"):
            recommendations.append({
                "text": r.get("recommendation"),
                "from_name": r.get("full_name"),
                "from_url": r.get("referee_url"),
            })

    # Test scores
    test_scores = []
    for ts in (raw.get("test_scores") or []):
        if isinstance(ts, dict):
            test_scores.append({
                "title": ts.get("title"),
                "score": ts.get("score"),
                "date": ts.get("date"),
                "description": ts.get("description"),
            })

    # Websites
    websites = [
        w.get("personal_website") for w in (raw.get("websites") or [])
        if isinstance(w, dict) and w.get("personal_website")
    ]

    # Total experience from first role date
    total_experience = None
    if work_history:
        earliest = min(
            (w["start_date"] for w in work_history if w.get("start_date")),
            default=None,
        )
        if earliest:
            from datetime import date
            try:
                start = date.fromisoformat(earliest[:10])
                years = (date.today() - start).days // 365
                total_experience = f"{years} year{'s' if years != 1 else ''}"
            except Exception:
                pass

    return {
        **mapped,
        "email": record.email or raw.get("primary_professional_email"),
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


@router.get("/companies/{record_id}/detail", summary="Full company detail")
async def get_company_detail(
    record_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CompanySearchRecord).where(CompanySearchRecord.coresignal_id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Company not found")

    raw = record.raw_data or {}
    mapped = coresignal_service._map_company(raw)

    return {
        **mapped,
        "description": raw.get("description") or raw.get("summary"),
        "specialties": raw.get("specialties"),
        "phone": raw.get("phone"),
        "email": raw.get("email"),
    }


@router.get("/autocomplete/titles", response_model=TitleAutocompleteResponse, summary="PDL job title autocomplete")
async def autocomplete_titles(
    text: str = Query(..., min_length=2, max_length=100),
    size: int = Query(default=10, ge=1, le=25),
) -> TitleAutocompleteResponse:
    if not settings.PDL_API_KEY:
        return TitleAutocompleteResponse(suggestions=[])
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{settings.PDL_BASE_URL}/autocomplete",
                params={"field": "title", "text": text, "size": size},
                headers={"X-Api-Key": settings.PDL_API_KEY},
                timeout=5.0,
            )
            resp.raise_for_status()
        except httpx.TimeoutException:
            logger.warning("PDL autocomplete timed out for text=%r", text)
            return TitleAutocompleteResponse(suggestions=[])
        except httpx.HTTPStatusError as exc:
            logger.warning("PDL autocomplete HTTP %s for text=%r: %s", exc.response.status_code, text, exc.response.text[:200])
            return TitleAutocompleteResponse(suggestions=[])
    names = [item["name"] for item in resp.json().get("data", [])]
    return TitleAutocompleteResponse(suggestions=names)
