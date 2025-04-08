"""add_fields_to_user_achievements

Revision ID: 92c125429747
Revises: a81f293629b0
Create Date: 2025-04-04 10:49:55.506122

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '92c125429747'
down_revision = 'a81f293629b0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to user_achievements table
    op.add_column('user_achievements', sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('user_achievements', sa.Column('achievement_type', sa.String(), nullable=True, server_default='achievement'))
    op.add_column('user_achievements', sa.Column('title', sa.String(), nullable=True))
    op.add_column('user_achievements', sa.Column('description', sa.String(), nullable=True))
    op.add_column('user_achievements', sa.Column('earned_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user_achievements', sa.Column('icon', sa.String(), nullable=True))
    op.add_column('user_achievements', sa.Column('level', sa.Integer(), nullable=True, server_default='1'))
    

def downgrade() -> None:
    # Drop columns added in upgrade
    op.drop_column('user_achievements', 'level')
    op.drop_column('user_achievements', 'icon')
    op.drop_column('user_achievements', 'earned_at')
    op.drop_column('user_achievements', 'description')
    op.drop_column('user_achievements', 'title')
    op.drop_column('user_achievements', 'achievement_type')
    op.drop_column('user_achievements', 'is_read')
