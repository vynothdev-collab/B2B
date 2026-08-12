"""add api_keys table for the customer-facing Developer API

Revision ID: 005
Revises: 004
Create Date: 2026-08-12
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "api_keys" not in inspector.get_table_names():
        op.create_table(
            "api_keys",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column(
                "user_id", sa.String(36),
                sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False,
            ),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("key_prefix", sa.String(16), nullable=False),
            sa.Column("key_hash", sa.String(64), nullable=False, unique=True),
            sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
            sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at", sa.DateTime(timezone=True),
                nullable=False, server_default=sa.func.now(),
            ),
        )

    existing_indexes = {ix["name"] for ix in inspector.get_indexes("api_keys")} if (
        "api_keys" in inspector.get_table_names()
    ) else set()
    if "ix_api_keys_user_id" not in existing_indexes:
        op.create_index("ix_api_keys_user_id", "api_keys", ["user_id"])
    if "ix_api_keys_key_hash" not in existing_indexes:
        op.create_index("ix_api_keys_key_hash", "api_keys", ["key_hash"], unique=True)


def downgrade():
    op.drop_index("ix_api_keys_key_hash", table_name="api_keys")
    op.drop_index("ix_api_keys_user_id", table_name="api_keys")
    op.drop_table("api_keys")
