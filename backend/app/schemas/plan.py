from datetime import datetime

from pydantic import BaseModel, model_validator


class PlanOut(BaseModel):
    id: str
    name: str
    description: str | None
    plan_type: str
    target: str
    credits: int
    validity_days: int | None
    price_cents: int
    is_active: bool
    created_at: datetime


class UserPlanOut(BaseModel):
    id: str
    plan_id: str
    plan_name: str
    plan_type: str
    credits_total: int
    credits_remaining: int
    status: str
    starts_at: datetime | None
    expires_at: datetime | None
    queue_position: int | None
    purchased_at: datetime


class CreditSummary(BaseModel):
    validity_credits_remaining: int
    payg_credits_remaining: int
    legacy_credits_remaining: int
    total_remaining: int


class MyPlansResponse(BaseModel):
    active_validity: UserPlanOut | None
    queued_validity: list[UserPlanOut]
    active_payg: list[UserPlanOut]
    summary: CreditSummary


class CreatePlanPayload(BaseModel):
    name: str
    description: str | None = None
    plan_type: str
    target: str
    credits: int
    validity_days: int | None = None
    price_cents: int = 0

    @model_validator(mode="after")
    def check_validity_fields(self) -> "CreatePlanPayload":
        if self.plan_type == "validity" and not self.validity_days:
            raise ValueError("validity_days is required for validity plans")
        if self.plan_type == "payg" and self.validity_days is not None:
            raise ValueError("validity_days must be null for PAYG plans")
        if self.credits < 1:
            raise ValueError("credits must be at least 1")
        if self.plan_type not in ("validity", "payg"):
            raise ValueError("plan_type must be 'validity' or 'payg'")
        if self.target not in ("individual", "enterprise"):
            raise ValueError("target must be 'individual' or 'enterprise'")
        return self


class EditPlanPayload(BaseModel):
    name: str | None = None
    description: str | None = None
    price_cents: int | None = None
    credits: int | None = None
    validity_days: int | None = None
