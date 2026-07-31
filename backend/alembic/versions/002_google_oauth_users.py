"""add google oauth fields to users

Revision ID: 002
Revises: 001
Create Date: 2026-07-31
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    # Make hashed_password nullable (OAuth users have no password)
    op.alter_column("users", "hashed_password", existing_type=sa.String(255), nullable=True)

    op.add_column("users", sa.Column("oauth_provider", sa.String(50), nullable=True))
    op.add_column("users", sa.Column("oauth_provider_id", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default="false"))

    op.create_index("ix_users_oauth_provider_id", "users", ["oauth_provider_id"])


def downgrade():
    op.drop_index("ix_users_oauth_provider_id", table_name="users")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "oauth_provider_id")
    op.drop_column("users", "oauth_provider")
    op.alter_column("users", "hashed_password", existing_type=sa.String(255), nullable=False)
