from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ListResponse(BaseModel):
    id: str
    name: str
    list_type: str
    is_default: bool
    record_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ListCreate(BaseModel):
    name: str
    list_type: str


class ListUpdate(BaseModel):
    name: str


class ListItemPayload(BaseModel):
    pdl_id: str
    item_type: str
    data: dict[str, Any]


class ListItemOut(BaseModel):
    id: str
    pdl_id: str
    item_type: str
    data: dict[str, Any]
    added_at: datetime


class AddToListRequest(BaseModel):
    list_id: Optional[str] = None
    list_name: Optional[str] = None
    list_type: Optional[str] = None
    items: list[ListItemPayload]


class AddToListResponse(BaseModel):
    added: int
    list_id: str
    list_name: str
