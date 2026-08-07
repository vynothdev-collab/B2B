"""add contact_unlocks table for per-user per-contact field unlock state

Revision ID: 003
Revises: 002
Create Date: 2026-08-07
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "contact_unlocks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "user_id",
            sa.String(36),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("record_id", sa.String(64), nullable=False),
        sa.Column("field", sa.String(50), nullable=False),
        sa.Column("value", sa.String(512), nullable=True),
        sa.Column("unlocked_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint(
            "user_id", "record_id", "field", name="uq_contact_unlock_user_record_field"
        ),
    )
    op.create_index("ix_contact_unlocks_user_id", "contact_unlocks", ["user_id"])
    op.create_index("ix_contact_unlocks_record_id", "contact_unlocks", ["record_id"])


def downgrade():
    op.drop_index("ix_contact_unlocks_record_id", table_name="contact_unlocks")
    op.drop_index("ix_contact_unlocks_user_id", table_name="contact_unlocks")
    op.drop_table("contact_unlocks")
