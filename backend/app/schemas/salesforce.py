from datetime import datetime
from typing import Any

from pydantic import BaseModel


class SalesforceAuthorizeResponse(BaseModel):
    url: str


class SalesforceStatusResponse(BaseModel):
    connected: bool
    salesforce_org_id: str | None = None
    salesforce_user_email: str | None = None
    connected_at: datetime | None = None


class SalesforcePushItem(BaseModel):
    record_id: str
    item_type: str
    data: dict[str, Any] = {}


class SalesforcePushRequest(BaseModel):
    items: list[SalesforcePushItem]


class SalesforcePushItemResult(BaseModel):
    record_id: str
    salesforce_id: str | None = None
    error: str | None = None


class SalesforcePushResponse(BaseModel):
    pushed: int
    failed: int
    results: list[SalesforcePushItemResult]
