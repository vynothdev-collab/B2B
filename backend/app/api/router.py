from fastapi import APIRouter, Depends

from app.api.routes import auth, health, lists, search, users
from app.api.routes.admin import auth as admin_auth
from app.api.routes.admin import credits as admin_credits
from app.api.routes.admin import enterprises as admin_enterprises
from app.api.routes.admin import manage as admin_manage
from app.api.routes.admin import users as admin_customers
from app.api.routes.enterprise import users as ent_users
from app.core.security import get_current_user

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin-auth"])
api_router.include_router(admin_manage.router, prefix="/admin/users", tags=["admin-manage"])
api_router.include_router(admin_enterprises.router, prefix="/admin/enterprises", tags=["admin-enterprises"])
api_router.include_router(admin_customers.router, prefix="/admin/customers", tags=["admin-customers"])
api_router.include_router(admin_credits.router, prefix="/admin/credits", tags=["admin-credits"])
api_router.include_router(ent_users.router, prefix="/enterprise", tags=["enterprise"])
api_router.include_router(
    search.router,
    prefix="/search",
    tags=["search"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    lists.router,
    dependencies=[Depends(get_current_user)],
)
