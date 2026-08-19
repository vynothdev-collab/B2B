"""switch hubspot_connections from OAuth tokens to a single API key column

Revision ID: 007
Revises: 006
Create Date: 2026-08-19
"""
from alembic import op
import sqlalchemy as sa

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if "hubspot_connections" not in tables:
        return

    columns = {c["name"] for c in inspector.get_columns("hubspot_connections")}

    op.add_column("hubspot_connections", sa.Column("api_key", sa.String(2048), nullable=True))
    if "access_token" in columns:
        op.execute("UPDATE hubspot_connections SET api_key = access_token")
    op.alter_column("hubspot_connections", "api_key", nullable=False)

    if "access_token" in columns:
        op.drop_column("hubspot_connections", "access_token")
    if "refresh_token" in columns:
        op.drop_column("hubspot_connections", "refresh_token")
    if "token_expires_at" in columns:
        op.drop_column("hubspot_connections", "token_expires_at")


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if "hubspot_connections" not in tables:
        return

    op.add_column("hubspot_connections", sa.Column("access_token", sa.String(2048), nullable=True))
    op.add_column("hubspot_connections", sa.Column("refresh_token", sa.String(2048), nullable=True))
    op.add_column("hubspot_connections", sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE hubspot_connections SET access_token = api_key, refresh_token = ''")
    op.alter_column("hubspot_connections", "access_token", nullable=False)
    op.alter_column("hubspot_connections", "refresh_token", nullable=False)
    op.drop_column("hubspot_connections", "api_key")
