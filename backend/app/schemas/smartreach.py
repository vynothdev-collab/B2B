from datetime import datetime
from typing import Any

from pydantic import BaseModel


class SmartreachConnectRequest(BaseModel):
    api_key: str


class SmartreachStatusResponse(BaseModel):
    connected: bool
    connected_at: datetime | None = None


class SmartreachCampaign(BaseModel):
    id: str
    name: str


class SmartreachCampaignsResponse(BaseModel):
    campaigns: list[SmartreachCampaign]


class SmartreachPushItem(BaseModel):
    record_id: str
    item_type: str
    data: dict[str, Any] = {}


class SmartreachPushRequest(BaseModel):
    campaign_id: str
    items: list[SmartreachPushItem]


class SmartreachPushItemResult(BaseModel):
    record_id: str
    smartreach_prospect_id: str | None = None
    error: str | None = None


class SmartreachPushResponse(BaseModel):
    pushed: int
    failed: int
    results: list[SmartreachPushItemResult]
