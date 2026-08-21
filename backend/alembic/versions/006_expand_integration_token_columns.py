"""expand integration token and key columns to 2048 characters to accommodate encrypted secrets

Revision ID: 006
Revises: 005
Create Date: 2026-08-18
"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "calendly_connections" in tables:
        op.alter_column(
            "calendly_connections",
            "api_key",
            type_=sa.String(2048),
            existing_type=sa.String(512),
            existing_nullable=False,
        )

    if "instantly_connections" in tables:
        op.alter_column(
            "instantly_connections",
            "api_key",
            type_=sa.String(2048),
            existing_type=sa.String(512),
            existing_nullable=False,
        )

    if "smartreach_connections" in tables:
        op.alter_column(
            "smartreach_connections",
            "api_key",
            type_=sa.String(2048),
            existing_type=sa.String(512),
            existing_nullable=False,
        )

    if "webhook_connections" in tables:
        op.alter_column(
            "webhook_connections",
            "signing_secret",
            type_=sa.String(2048),
            existing_type=sa.String(512),
            existing_nullable=False,
        )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "calendly_connections" in tables:
        op.alter_column(
            "calendly_connections",
            "api_key",
            type_=sa.String(512),
            existing_type=sa.String(2048),
            existing_nullable=False,
        )

    if "instantly_connections" in tables:
        op.alter_column(
            "instantly_connections",
            "api_key",
            type_=sa.String(512),
            existing_type=sa.String(2048),
            existing_nullable=False,
        )

    if "smartreach_connections" in tables:
        op.alter_column(
            "smartreach_connections",
            "api_key",
            type_=sa.String(512),
            existing_type=sa.String(2048),
            existing_nullable=False,
        )

    if "webhook_connections" in tables:
        op.alter_column(
            "webhook_connections",
            "signing_secret",
            type_=sa.String(512),
            existing_type=sa.String(2048),
            existing_nullable=False,
        )
