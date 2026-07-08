from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
import app.models  # noqa: F401 — registers all ORM models with Base.metadata


def _add_column_if_missing(sync_conn, table: str, column: str, definition: str) -> None:
    insp = inspect(sync_conn)
    existing = [c["name"] for c in insp.get_columns(table)]
    if column not in existing:
        sync_conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))


def _drop_not_null_if_exists(sync_conn, table: str, column: str) -> None:
    insp = inspect(sync_conn)
    cols = {c["name"]: c for c in insp.get_columns(table)}
    if column in cols and not cols[column]["nullable"]:
        sync_conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # lists table migrations
        await conn.run_sync(
            _add_column_if_missing, "lists", "deleted_at", "TIMESTAMPTZ DEFAULT NULL"
        )
        # list_items table migrations
        await conn.run_sync(_drop_not_null_if_exists, "list_items", "pdl_id")
        await conn.run_sync(_drop_not_null_if_exists, "list_items", "user_id")
        await conn.run_sync(
            _add_column_if_missing, "list_items", "record_id", "VARCHAR(255) NOT NULL DEFAULT ''"
        )
        await conn.run_sync(
            _add_column_if_missing, "list_items", "item_type", "VARCHAR(50) NOT NULL DEFAULT ''"
        )
        await conn.run_sync(
            _add_column_if_missing, "list_items", "data", "JSONB NOT NULL DEFAULT '{}'"
        )
        await conn.run_sync(
            _add_column_if_missing, "list_items", "added_at", "TIMESTAMPTZ NOT NULL DEFAULT NOW()"
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

app.include_router(api_router, prefix="/api/v1")
