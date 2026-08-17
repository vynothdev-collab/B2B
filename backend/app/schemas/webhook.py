from datetime import datetime
from typing import Any

from pydantic import BaseModel


class WebhookConnectRequest(BaseModel):
    webhook_url: str


class WebhookConnectResponse(BaseModel):
    connected: bool
    webhook_url: str
    signing_secret: str
    connected_at: datetime | None = None


class WebhookStatusResponse(BaseModel):
    connected: bool
    webhook_url: str | None = None
    connected_at: datetime | None = None
    last_delivery_at: datetime | None = None
    last_delivery_status: str | None = None


class WebhookRegenerateSecretResponse(BaseModel):
    signing_secret: str


class WebhookPushItem(BaseModel):
    record_id: str
    item_type: str
    data: dict[str, Any] = {}


class WebhookPushRequest(BaseModel):
    items: list[WebhookPushItem]


class WebhookPushItemResult(BaseModel):
    record_id: str
    delivered: bool = False
    error: str | None = None


class WebhookPushResponse(BaseModel):
    pushed: int
    failed: int
    results: list[WebhookPushItemResult]
