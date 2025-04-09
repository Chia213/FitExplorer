"""Add completed flag to workouts

Revision ID: 735ed8196c5c
Revises: d8045dc7fc6c
Create Date: 2025-03-31 22:13:01.026438

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '735ed8196c5c'
down_revision = 'd8045dc7fc6c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add completed column to workouts table
    op.add_column('workouts', sa.Column('completed', sa.Boolean(), nullable=True))
    # Set default value for existing workouts
    op.execute("UPDATE workouts SET completed = FALSE WHERE completed IS NULL")
    # Make the column non-nullable
    op.alter_column('workouts', 'completed', nullable=False)


def downgrade() -> None:
    # Remove completed column from workouts table
    op.drop_column('workouts', 'completed')
