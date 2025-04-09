"""add_color_to_routine_folders

Revision ID: 4b606abf7c34
Revises: eb03304670ef
Create Date: 2025-04-09 22:48:33.864102

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '4b606abf7c34'
down_revision = 'eb03304670ef'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add color column to routine_folders table
    op.add_column('routine_folders', sa.Column('color', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove color column from routine_folders table
    op.drop_column('routine_folders', 'color')
