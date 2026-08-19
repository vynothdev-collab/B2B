"""remove the Custom CRM (Webhook) integration

Revision ID: 008
Revises: 007
Create Date: 2026-08-19
"""
from alembic import op
import sqlalchemy as sa

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "webhook_connections" in inspector.get_table_names():
        op.drop_table("webhook_connections")


def downgrade():
    op.create_table(
        "webhook_connections",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True),
        sa.Column("webhook_url", sa.String(500), nullable=False),
        sa.Column("signing_secret", sa.String(2048), nullable=False),
        sa.Column("last_delivery_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_delivery_status", sa.String(16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
