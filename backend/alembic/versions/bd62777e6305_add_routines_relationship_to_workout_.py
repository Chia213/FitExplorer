"""add routines relationship to workout model

Revision ID: bd62777e6305
Revises: 09e51a36eeef
Create Date: 2025-04-04 09:40:32.027838

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'bd62777e6305'
down_revision = '09e51a36eeef'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This is just a SQLAlchemy relationship change, no database schema changes needed
    pass


def downgrade() -> None:
    # This is just a SQLAlchemy relationship change, no database schema changes needed
    pass
