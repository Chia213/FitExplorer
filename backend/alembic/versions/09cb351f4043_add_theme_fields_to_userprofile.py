"""Add theme fields to UserProfile

Revision ID: 09cb351f4043
Revises: e15969de98b1
Create Date: 2025-04-06 09:17:41.685839

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '09cb351f4043'
down_revision = 'e15969de98b1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add theme-related columns to user_profiles table
    op.add_column('user_profiles', sa.Column('theme_mode', sa.String(), nullable=True, server_default='light'))
    op.add_column('user_profiles', sa.Column('premium_theme', sa.String(), nullable=True, server_default='default'))
    op.add_column('user_profiles', sa.Column('unlocked_themes', postgresql.JSON(astext_type=sa.Text()), nullable=True, server_default='["default"]'))


def downgrade() -> None:
    # Remove theme-related columns from user_profiles table
    op.drop_column('user_profiles', 'unlocked_themes')
    op.drop_column('user_profiles', 'premium_theme')
    op.drop_column('user_profiles', 'theme_mode')
