"""add common foods table

Revision ID: 7ec0f5f8f7a7
Revises: fe8c09641b46
Create Date: 2025-04-05 20:34:52.388248

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime
from sqlalchemy.dialects.postgresql import TIMESTAMP


# revision identifiers, used by Alembic.
revision = '7ec0f5f8f7a7'
down_revision = 'fe8c09641b46'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the common_foods table
    op.create_table(
        'common_foods',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('calories', sa.Float(), nullable=False),
        sa.Column('protein', sa.Float(), nullable=False),
        sa.Column('carbs', sa.Float(), nullable=False),
        sa.Column('fat', sa.Float(), nullable=False),
        sa.Column('serving_size', sa.String(), nullable=False),
        sa.Column('created_at', TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('fiber', sa.Float(), nullable=True),
        sa.Column('sugar', sa.Float(), nullable=True),
        sa.Column('sodium', sa.Float(), nullable=True),
        sa.Column('food_group', sa.String(), nullable=True),
        sa.Column('brand', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create an index on the name column for faster searches
    op.create_index(op.f('ix_common_foods_name'), 'common_foods', ['name'], unique=False)


def downgrade() -> None:
    # Drop the index first
    op.drop_index(op.f('ix_common_foods_name'), table_name='common_foods')
    
    # Drop the common_foods table
    op.drop_table('common_foods')
