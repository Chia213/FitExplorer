"""add_theme_fields_to_user_profile

Revision ID: c37a8c4a817f
Revises: ca97868535f3
Create Date: 2025-04-04 09:40:32.027838

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'c37a8c4a817f'
down_revision = 'ca97868535f3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Do nothing - columns were already added by previous migration
    pass


def downgrade() -> None:
    # Do nothing - columns will be dropped by previous migration's downgrade
    pass
