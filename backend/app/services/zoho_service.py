import logging
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.zoho_connection import ZohoConnection

logger = logging.getLogger(__name__)


def _accounts_base_url() -> str:
    return (settings.ZOHO_ACCOUNTS_URL or "https://accounts.zoho.com").rstrip("/")


def get_authorize_url(state: str) -> str:
    if not settings.ZOHO_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Zoho integration is not configured on this server.",
        )
    params = urlencode({
        "response_type": "code",
        "client_id": settings.ZOHO_CLIENT_ID,
        "redirect_uri": settings.ZOHO_CALLBACK_URL,
        "scope": "ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.accounts.CREATE,ZohoCRM.users.READ",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    })
    return f"{_accounts_base_url()}/oauth/v2/auth?{params}"


async def exchange_code_for_token(code: str, accounts_server: str | None = None) -> dict:
    base = (accounts_server or _accounts_base_url()).rstrip("/")
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{base}/oauth/v2/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": settings.ZOHO_CLIENT_ID,
                "client_secret": settings.ZOHO_CLIENT_SECRET,
                "redirect_uri": settings.ZOHO_CALLBACK_URL,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if resp.status_code != 200:
        logger.error("Zoho token exchange failed (%s): %s", resp.status_code, resp.text)
        try:
            return resp.json()
        except Exception:
            return {"error": f"HTTP {resp.status_code}", "error_description": resp.text}
    return resp.json()


async def fetch_user_email(access_token: str) -> str | None:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{_accounts_base_url()}/oauth/user/info",
            headers={"Authorization": f"Zoho-oauthtoken {access_token}"},
        )
    if resp.status_code != 200:
        logger.error("Zoho user info fetch failed (%s): %s", resp.status_code, resp.text)
        return None
    return resp.json().get("Email")


def set_connection_tokens(
    connection: ZohoConnection, access_token: str, refresh_token: str | None = None
) -> None:
    connection.access_token = encrypt_secret(access_token, settings.ZOHO_ENCRYPTION_KEY)
    if refresh_token:
        connection.refresh_token = encrypt_secret(refresh_token, settings.ZOHO_ENCRYPTION_KEY)


async def refresh_access_token(connection: ZohoConnection) -> bool:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{_accounts_base_url()}/oauth/v2/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": decrypt_secret(connection.refresh_token, settings.ZOHO_ENCRYPTION_KEY),
                "client_id": settings.ZOHO_CLIENT_ID,
                "client_secret": settings.ZOHO_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if resp.status_code != 200:
        return False
    data = resp.json()
    new_access_token = data.get("access_token")
    if not new_access_token:
        return False
    connection.access_token = encrypt_secret(new_access_token, settings.ZOHO_ENCRYPTION_KEY)
    connection.token_expires_at = datetime.now(UTC) + timedelta(hours=1)
    return True


def map_person_to_lead(
    mapped_person: dict,
    unlocked_email: str | None,
    unlocked_phone: str | None,
) -> dict:
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name") or "Unknown"
    company = mapped_person.get("active_experience_company_name") or "Unknown Company"

    lead: dict = {
        "Last_Name": last_name,
        "Company": company,
        "Lead_Source": "LeadsBuddy",
    }
    if mapped_person.get("first_name"):
        lead["First_Name"] = mapped_person["first_name"]
    if unlocked_email:
        lead["Email"] = unlocked_email
    if unlocked_phone:
        lead["Phone"] = unlocked_phone
        lead["Mobile"] = unlocked_phone
    if mapped_person.get("active_experience_title"):
        lead["Designation"] = mapped_person["active_experience_title"]
    if mapped_person.get("location_city"):
        lead["City"] = mapped_person["location_city"]
    if mapped_person.get("location_state"):
        lead["State"] = mapped_person["location_state"]
    if mapped_person.get("location_country"):
        lead["Country"] = mapped_person["location_country"]
    if mapped_person.get("active_experience_company_website"):
        lead["Website"] = mapped_person["active_experience_company_website"]
    return lead


def map_company_to_account(mapped_company: dict) -> dict:
    name = mapped_company.get("company_name") or mapped_company.get("company_legal_name")
    account: dict = {"Account_Name": name or "Unknown Company"}
    if mapped_company.get("website"):
        account["Website"] = mapped_company["website"]
    if mapped_company.get("industry"):
        account["Industry"] = mapped_company["industry"]
    if mapped_company.get("hq_city"):
        account["Billing_City"] = mapped_company["hq_city"]
    if mapped_company.get("hq_state"):
        account["Billing_State"] = mapped_company["hq_state"]
    if mapped_company.get("hq_country"):
        account["Billing_Country"] = mapped_company["hq_country"]
    if mapped_company.get("employees_count"):
        account["Employees"] = mapped_company["employees_count"]
    return account


async def create_lead(connection: ZohoConnection, lead_fields: dict) -> str:
    return await _create_record(connection, "Leads", lead_fields)


async def create_account(connection: ZohoConnection, account_fields: dict) -> str:
    return await _create_record(connection, "Accounts", account_fields)


async def _create_record(connection: ZohoConnection, module: str, fields: dict) -> str:
    async def _post(access_token: str) -> httpx.Response:
        async with httpx.AsyncClient(timeout=10) as client:
            return await client.post(
                f"{connection.api_domain}/crm/v2/{module}",
                json={"data": [fields]},
                headers={"Authorization": f"Zoho-oauthtoken {access_token}"},
            )

    resp = await _post(decrypt_secret(connection.access_token, settings.ZOHO_ENCRYPTION_KEY))
    if resp.status_code == 401:
        if not await refresh_access_token(connection):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Zoho connection expired. Please reconnect.",
            )
        resp = await _post(decrypt_secret(connection.access_token, settings.ZOHO_ENCRYPTION_KEY))

    try:
        body = resp.json()
    except Exception:
        body = None

    record = None
    if isinstance(body, dict):
        data = body.get("data")
        if isinstance(data, list) and data:
            record = data[0]

    if resp.status_code not in (200, 201) or not record or record.get("status") != "success":
        detail = resp.text
        if isinstance(record, dict) and record.get("message"):
            detail = record["message"]
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Zoho error: {detail}")

    return str((record.get("details") or {}).get("id", ""))
