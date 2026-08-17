from datetime import datetime
from typing import Any

from pydantic import BaseModel


class InstantlyConnectRequest(BaseModel):
    api_key: str


class InstantlyStatusResponse(BaseModel):
    connected: bool
    connected_at: datetime | None = None


class InstantlyCampaign(BaseModel):
    id: str
    name: str


class InstantlyCampaignsResponse(BaseModel):
    campaigns: list[InstantlyCampaign]


class InstantlyPushItem(BaseModel):
    record_id: str
    item_type: str
    data: dict[str, Any] = {}


class InstantlyPushRequest(BaseModel):
    campaign_id: str
    items: list[InstantlyPushItem]


class InstantlyPushItemResult(BaseModel):
    record_id: str
    instantly_lead_id: str | None = None
    error: str | None = None


class InstantlyPushResponse(BaseModel):
    pushed: int
    failed: int
    results: list[InstantlyPushItemResult]
