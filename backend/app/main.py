from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text

import app.models  # noqa: F401
from app.api.router import api_router
from app.api.routes.public_api import public_api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.services.platform_settings_service import get_platform_settings

# Path prefixes that stay reachable while maintenance mode is on: admins (so
# they can turn it back off), health checks, and the status endpoint itself.
_MAINTENANCE_EXEMPT_PREFIXES = (
    "/api/v1/admin",
    "/api/v1/health",
    "/api/v1/platform",
)


def _add_column_if_missing(sync_conn, table: str, column: str, definition: str) -> None:
    insp = inspect(sync_conn)
    existing = [c["name"] for c in insp.get_columns(table)]
    if column not in existing:
        sync_conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))


def _drop_not_null_if_exists(sync_conn, table: str, column: str) -> None:
    insp = inspect(sync_conn)
    cols = {c["name"]: c for c in insp.get_columns(table)}
    if column in cols and not cols[column]["nullable"]:
        sync_conn.execute(
            text(f"ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL")
        )


def _drop_column_if_exists(sync_conn, table: str, column: str) -> None:
    insp = inspect(sync_conn)
    existing = [c["name"] for c in insp.get_columns(table)]
    if column in existing:
        sync_conn.execute(text(f"ALTER TABLE {table} DROP COLUMN {column}"))


def _alter_column_type(sync_conn, table: str, column: str, new_type: str) -> None:
    insp = inspect(sync_conn)
    tables = insp.get_table_names()
    if table in tables:
        cols = {c["name"]: c for c in insp.get_columns(table)}
        if column in cols:
            sync_conn.execute(
                text(f"ALTER TABLE {table} ALTER COLUMN {column} TYPE {new_type}")
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(
            _alter_column_type, "instantly_connections", "api_key", "VARCHAR(2048)"
        )
        await conn.run_sync(
            _alter_column_type, "smartreach_connections", "api_key", "VARCHAR(2048)"
        )
        await conn.run_sync(
            _add_column_if_missing, "smartreach_connections", "team_id", "VARCHAR(64)"
        )
        await conn.run_sync(
            _add_column_if_missing, "lists", "deleted_at", "TIMESTAMPTZ DEFAULT NULL"
        )
        await conn.run_sync(_drop_not_null_if_exists, "list_items", "pdl_id")
        await conn.run_sync(_drop_not_null_if_exists, "list_items", "user_id")
        await conn.run_sync(
            _add_column_if_missing,
            "list_items",
            "record_id",
            "VARCHAR(255) NOT NULL DEFAULT ''",
        )
        await conn.run_sync(
            _add_column_if_missing,
            "list_items",
            "item_type",
            "VARCHAR(50) NOT NULL DEFAULT ''",
        )
        await conn.run_sync(
            _add_column_if_missing, "list_items", "data", "JSONB NOT NULL DEFAULT '{}'"
        )
        await conn.run_sync(
            _add_column_if_missing,
            "list_items",
            "added_at",
            "TIMESTAMPTZ NOT NULL DEFAULT NOW()",
        )
        # users table — enterprise multi-tenancy
        await conn.run_sync(
            _add_column_if_missing, "users", "phone", "VARCHAR(50)"
        )
        await conn.run_sync(
            _add_column_if_missing, "users", "enterprise_id", "VARCHAR(36) REFERENCES enterprises(id)"
        )
        await conn.run_sync(
            _add_column_if_missing, "users", "allocated_credits", "INTEGER NOT NULL DEFAULT 0"
        )
        await conn.run_sync(
            _add_column_if_missing, "users", "used_credits", "INTEGER NOT NULL DEFAULT 0"
        )
        await conn.execute(text("UPDATE users SET role='individual' WHERE role='user'"))
        # enterprises table — drop removed columns
        await conn.run_sync(_drop_column_if_exists, "enterprises", "monthly_limit")
        await conn.run_sync(
            _add_column_if_missing, "enterprises", "plan", "VARCHAR(50) NOT NULL DEFAULT 'Free'"
        )
        await conn.run_sync(
            _add_column_if_missing,
            "list_items",
            "deleted_at",
            "TIMESTAMPTZ DEFAULT NULL",
        )
        # plans table — soft delete
        await conn.run_sync(
            _add_column_if_missing, "plans", "deleted_at", "TIMESTAMPTZ DEFAULT NULL"
        )
        # users table — google oauth fields (idempotent; also handled by alembic 002)
        await conn.run_sync(
            _drop_not_null_if_exists, "users", "hashed_password"
        )
        await conn.run_sync(
            _add_column_if_missing, "users", "oauth_provider", "VARCHAR(50)"
        )
        await conn.run_sync(
            _add_column_if_missing, "users", "oauth_provider_id", "VARCHAR(255)"
        )
        await conn.run_sync(
            _add_column_if_missing, "users", "email_verified",
            "BOOLEAN NOT NULL DEFAULT FALSE"
        )
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def maintenance_mode_gate(request: Request, call_next):
    path = request.url.path
    if request.method == "OPTIONS" or path.startswith(_MAINTENANCE_EXEMPT_PREFIXES):
        return await call_next(request)

    if path.startswith("/api/v1/") or path.startswith("/public/v1/"):
        async with AsyncSessionLocal() as db:
            row = await get_platform_settings(db)
        if row.maintenance_mode:
            return JSONResponse(
                status_code=503,
                content={
                    "detail": row.maintenance_message
                    or "The platform is currently undergoing scheduled maintenance. Please check back shortly.",
                    "maintenance_mode": True,
                },
            )

    return await call_next(request)


app.include_router(api_router, prefix="/api/v1")
app.include_router(public_api_router, prefix="/public/v1")
