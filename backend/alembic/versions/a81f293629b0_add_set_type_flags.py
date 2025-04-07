"""add_set_type_flags

Revision ID: a81f293629b0
Revises: dbfffbcf92e5
Create Date: 2025-04-07 19:28:27.734024

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a81f293629b0'
down_revision = 'dbfffbcf92e5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the new Set type flag columns
    op.add_column('sets', sa.Column('is_warmup', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('sets', sa.Column('is_drop_set', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('sets', sa.Column('is_superset', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('sets', sa.Column('is_amrap', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('sets', sa.Column('is_restpause', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('sets', sa.Column('is_pyramid', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('sets', sa.Column('is_giant', sa.Boolean(), nullable=True, server_default='false'))
    
    # Add the additional set properties
    op.add_column('sets', sa.Column('drop_number', sa.Integer(), nullable=True))
    op.add_column('sets', sa.Column('original_weight', sa.Float(), nullable=True))
    op.add_column('sets', sa.Column('superset_with', sa.String(), nullable=True))
    op.add_column('sets', sa.Column('rest_pauses', sa.Integer(), nullable=True))
    op.add_column('sets', sa.Column('pyramid_type', sa.String(), nullable=True))
    op.add_column('sets', sa.Column('pyramid_step', sa.Integer(), nullable=True))
    op.add_column('sets', sa.Column('giant_with', postgresql.JSON(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    # Remove all the added columns in the reverse order
    op.drop_column('sets', 'giant_with')
    op.drop_column('sets', 'pyramid_step')
    op.drop_column('sets', 'pyramid_type')
    op.drop_column('sets', 'rest_pauses')
    op.drop_column('sets', 'superset_with')
    op.drop_column('sets', 'original_weight')
    op.drop_column('sets', 'drop_number')
    op.drop_column('sets', 'is_giant')
    op.drop_column('sets', 'is_pyramid')
    op.drop_column('sets', 'is_restpause')
    op.drop_column('sets', 'is_amrap')
    op.drop_column('sets', 'is_superset')
    op.drop_column('sets', 'is_drop_set')
    op.drop_column('sets', 'is_warmup')
