import logging

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.crypto import decrypt_secret, encrypt_secret
from app.models.hubspot_connection import HubspotConnection

logger = logging.getLogger(__name__)

HUBSPOT_API_BASE_URL = "https://api.hubapi.com"


async def validate_api_key(api_key: str) -> dict:
    """Validate a HubSpot private app access token and return account info if available.

    Private app tokens (``pat-...``) aren't recognized by the OAuth
    access-tokens introspection endpoint, so validity is confirmed with a
    real CRM call instead; account info is best-effort on top of that.
    """
    key = api_key.strip() if api_key else ""
    if not key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="HubSpot API key is required.")

    headers = {"Authorization": f"Bearer {key}"}
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(
                f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts", params={"limit": 1}, headers=headers
            )
        except httpx.RequestError as e:
            logger.error("HubSpot key validation request error: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach HubSpot. Please try again."
            ) from e

        if resp.status_code in (401, 403):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid HubSpot API key.")

        if resp.status_code != 200:
            logger.error("HubSpot key validation failed (%s): %s", resp.status_code, resp.text)
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not verify HubSpot API key.")

        info: dict = {}
        try:
            info_resp = await client.get(f"{HUBSPOT_API_BASE_URL}/account-info/v3/details", headers=headers)
            if info_resp.status_code == 200:
                body = info_resp.json()
                info["hub_id"] = body.get("portalId")
                info["hub_domain"] = body.get("uiDomain")
        except httpx.RequestError:
            pass

        return info


def set_connection_key(connection: HubspotConnection, api_key: str) -> None:
    connection.api_key = encrypt_secret(api_key.strip(), settings.HUBSPOT_ENCRYPTION_KEY)


def map_person_to_contact(mapped_person: dict, unlocked_email: str | None, unlocked_phone: str | None) -> dict:
    properties: dict = {}
    if mapped_person.get("first_name"):
        properties["firstname"] = mapped_person["first_name"]
    last_name = mapped_person.get("last_name") or mapped_person.get("full_name")
    if last_name:
        properties["lastname"] = last_name
    if unlocked_email:
        properties["email"] = unlocked_email
    if unlocked_phone:
        properties["phone"] = unlocked_phone
    if mapped_person.get("active_experience_title"):
        properties["jobtitle"] = mapped_person["active_experience_title"]
    if mapped_person.get("active_experience_company_name"):
        properties["company"] = mapped_person["active_experience_company_name"]
    if mapped_person.get("location_city"):
        properties["city"] = mapped_person["location_city"]
    if mapped_person.get("location_state"):
        properties["state"] = mapped_person["location_state"]
    if mapped_person.get("location_country"):
        properties["country"] = mapped_person["location_country"]
    if mapped_person.get("active_experience_company_website"):
        properties["website"] = mapped_person["active_experience_company_website"]
    return {"properties": properties}


async def create_or_update_contact(connection: HubspotConnection, contact_fields: dict, email: str | None) -> str:
    api_key = decrypt_secret(connection.api_key, settings.HUBSPOT_ENCRYPTION_KEY)

    async with httpx.AsyncClient(timeout=10) as client:
        if email:
            resp = await client.put(
                f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts/{email}",
                params={"idProperty": "email"},
                json=contact_fields,
                headers={"Authorization": f"Bearer {api_key}"},
            )
        else:
            resp = await client.post(
                f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts",
                json=contact_fields,
                headers={"Authorization": f"Bearer {api_key}"},
            )

    return _handle_object_response(resp).get("id", "")


def map_company_to_company(mapped_company: dict) -> dict:
    properties: dict = {}
    name = mapped_company.get("company_name") or mapped_company.get("company_legal_name")
    if name:
        properties["name"] = name
    if mapped_company.get("website"):
        properties["domain"] = mapped_company["website"].replace("https://", "").replace("http://", "").rstrip("/")
    if mapped_company.get("industry"):
        properties["industry"] = mapped_company["industry"]
    if mapped_company.get("hq_city"):
        properties["city"] = mapped_company["hq_city"]
    if mapped_company.get("hq_state"):
        properties["state"] = mapped_company["hq_state"]
    if mapped_company.get("hq_country"):
        properties["country"] = mapped_company["hq_country"]
    if mapped_company.get("employees_count"):
        properties["numberofemployees"] = mapped_company["employees_count"]
    return {"properties": properties}


async def create_or_update_company(connection: HubspotConnection, company_fields: dict, domain: str | None) -> str:
    api_key = decrypt_secret(connection.api_key, settings.HUBSPOT_ENCRYPTION_KEY)

    async with httpx.AsyncClient(timeout=10) as client:
        if domain:
            resp = await client.put(
                f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/companies/{domain}",
                params={"idProperty": "domain"},
                json=company_fields,
                headers={"Authorization": f"Bearer {api_key}"},
            )
        else:
            resp = await client.post(
                f"{HUBSPOT_API_BASE_URL}/crm/v3/objects/companies",
                json=company_fields,
                headers={"Authorization": f"Bearer {api_key}"},
            )

    return _handle_object_response(resp).get("id", "")


def _handle_object_response(resp: httpx.Response) -> dict:
    if resp.status_code == 401:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="HubSpot API key is no longer valid. Please reconnect.",
        )

    if resp.status_code not in (200, 201):
        detail = resp.text
        try:
            body = resp.json()
            if isinstance(body, dict) and body.get("message"):
                detail = body["message"]
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"HubSpot error: {detail}")

    return resp.json()
