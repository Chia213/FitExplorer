"""add_updated_at_to_routines

Revision ID: fd283dd035a9
Revises: ca97868535f3
Create Date: 2025-04-04 09:40:32.027838

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'fd283dd035a9'
down_revision = 'ca97868535f3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add updated_at column
    op.add_column('routines', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    
    # Set initial updated_at values to match created_at
    op.execute("UPDATE routines SET updated_at = created_at WHERE updated_at IS NULL")


def downgrade() -> None:
    op.drop_column('routines', 'updated_at')
