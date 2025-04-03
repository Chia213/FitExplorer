"""add routines relationship to workout model

Revision ID: bd62777e6305
Revises: add_workout_preferences_table
Create Date: 2025-04-03 23:55:07.330685

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'bd62777e6305'
down_revision = 'add_workout_preferences_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This is just a SQLAlchemy relationship change, no database schema changes needed
    pass


def downgrade() -> None:
    # This is just a SQLAlchemy relationship change, no database schema changes needed
    pass
