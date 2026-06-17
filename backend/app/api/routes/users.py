from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


@router.get("/me", response_model=UserResponse)
async def get_current_user() -> UserResponse:
    # TODO: inject real auth dependency and DB lookup
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )


@router.get("/", response_model=list[UserResponse])
async def list_users() -> list[UserResponse]:
    # TODO: implement with DB and pagination
    return []
