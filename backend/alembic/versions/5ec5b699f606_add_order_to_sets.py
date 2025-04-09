"""add_order_to_sets

Revision ID: 5ec5b699f606
Revises: bd62777e6305
Create Date: 2025-04-09 21:56:22.827453

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5ec5b699f606'
down_revision = 'bd62777e6305'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add order column with default value of 0
    op.add_column('sets', sa.Column('order', sa.Integer(), nullable=False, server_default='0'))
    
    # Create an index on (exercise_id, order) to optimize queries that fetch sets in order
    op.create_index('ix_sets_exercise_id_order', 'sets', ['exercise_id', 'order'])


def downgrade() -> None:
    # Drop the index first
    op.drop_index('ix_sets_exercise_id_order')
    
    # Then drop the column
    op.drop_column('sets', 'order')
