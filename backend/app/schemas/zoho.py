from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ZohoAuthorizeResponse(BaseModel):
    url: str


class ZohoStatusResponse(BaseModel):
    connected: bool
    zoho_user_email: str | None = None
    connected_at: datetime | None = None


class ZohoPushItem(BaseModel):
    record_id: str
    item_type: str
    data: dict[str, Any] = {}


class ZohoPushRequest(BaseModel):
    items: list[ZohoPushItem]


class ZohoPushItemResult(BaseModel):
    record_id: str
    zoho_id: str | None = None
    error: str | None = None


class ZohoPushResponse(BaseModel):
    pushed: int
    failed: int
    results: list[ZohoPushItemResult]
