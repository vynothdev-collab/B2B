from datetime import datetime

from pydantic import BaseModel


class ApiKeyCreateRequest(BaseModel):
    name: str


class ApiKeyOut(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: datetime | None = None

    class Config:
        from_attributes = True


class ApiKeyCreateResponse(ApiKeyOut):
    key: str  # full secret — only ever returned here, at creation time
