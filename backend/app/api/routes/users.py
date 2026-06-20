from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr

from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    is_active: bool


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
    )
