"""add entity_type to contact_unlocks to disambiguate person vs company records

Revision ID: 004
Revises: 003
Create Date: 2026-08-07
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "contact_unlocks",
        sa.Column("entity_type", sa.String(20), nullable=False, server_default="person"),
    )
    op.drop_constraint(
        "uq_contact_unlock_user_record_field", "contact_unlocks", type_="unique"
    )
    op.create_unique_constraint(
        "uq_contact_unlock_user_record_entity_field",
        "contact_unlocks",
        ["user_id", "record_id", "entity_type", "field"],
    )


def downgrade():
    op.drop_constraint(
        "uq_contact_unlock_user_record_entity_field", "contact_unlocks", type_="unique"
    )
    op.create_unique_constraint(
        "uq_contact_unlock_user_record_field",
        "contact_unlocks",
        ["user_id", "record_id", "field"],
    )
    op.drop_column("contact_unlocks", "entity_type")
