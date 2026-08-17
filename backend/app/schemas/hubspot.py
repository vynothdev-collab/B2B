from datetime import datetime
from typing import Any

from pydantic import BaseModel


class HubspotAuthorizeResponse(BaseModel):
    url: str


class HubspotStatusResponse(BaseModel):
    connected: bool
    hubspot_hub_id: str | None = None
    hubspot_hub_domain: str | None = None
    connected_at: datetime | None = None


class HubspotPushItem(BaseModel):
    record_id: str
    item_type: str
    data: dict[str, Any] = {}


class HubspotPushRequest(BaseModel):
    items: list[HubspotPushItem]


class HubspotPushItemResult(BaseModel):
    record_id: str
    hubspot_id: str | None = None
    error: str | None = None


class HubspotPushResponse(BaseModel):
    pushed: int
    failed: int
    results: list[HubspotPushItemResult]
