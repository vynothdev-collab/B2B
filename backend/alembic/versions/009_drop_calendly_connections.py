"""remove the Calendly integration

Revision ID: 009
Revises: 008
Create Date: 2026-08-19
"""
from alembic import op
import sqlalchemy as sa

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "calendly_connections" in inspector.get_table_names():
        op.drop_table("calendly_connections")


def downgrade():
    op.create_table(
        "calendly_connections",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True),
        sa.Column("api_key", sa.String(2048), nullable=False),
        sa.Column("scheduling_url", sa.String(500), nullable=True),
        sa.Column("calendly_name", sa.String(255), nullable=True),
        sa.Column("calendly_email", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
