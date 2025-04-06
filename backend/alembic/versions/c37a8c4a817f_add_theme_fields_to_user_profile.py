"""add_theme_fields_to_user_profile

Revision ID: c37a8c4a817f
Revises: 09cb351f4043
Create Date: 2025-04-06 09:18:12.671862

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'c37a8c4a817f'
down_revision = '09cb351f4043'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Do nothing - columns were already added by previous migration
    pass


def downgrade() -> None:
    # Do nothing - columns will be dropped by previous migration's downgrade
    pass
