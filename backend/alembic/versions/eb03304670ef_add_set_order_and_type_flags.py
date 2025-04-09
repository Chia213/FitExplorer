"""add_set_order_and_type_flags

Revision ID: eb03304670ef
Revises: 5ec5b699f606
Create Date: 2025-04-09 22:37:54.976617

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'eb03304670ef'
down_revision = '5ec5b699f606'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The order column was already added in previous migration 5ec5b699f606
    pass


def downgrade() -> None:
    # Nothing to downgrade since we didn't make any changes
    pass
