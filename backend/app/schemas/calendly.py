from datetime import datetime

from pydantic import BaseModel


class CalendlyConnectRequest(BaseModel):
    api_key: str


class CalendlyStatusResponse(BaseModel):
    connected: bool
    scheduling_url: str | None = None
    connected_at: datetime | None = None
