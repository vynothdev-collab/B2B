from fastapi import APIRouter

from app.api.routes.public_api import search, unlock

public_api_router = APIRouter()
public_api_router.include_router(search.router, tags=["public-api-search"])
public_api_router.include_router(unlock.router, tags=["public-api-unlock"])
