"""add_all_notifications_enabled_to_user_profile

Revision ID: 492b3f54f66b
Revises: 70e7de046ab7
Create Date: 2025-04-05 18:25:34.618316

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '492b3f54f66b'
down_revision = '70e7de046ab7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add all_notifications_enabled column with default value True
    op.add_column('user_profiles', sa.Column('all_notifications_enabled', sa.Boolean(), server_default=sa.text('true'), nullable=False))


def downgrade() -> None:
    # Remove the column on downgrade
    op.drop_column('user_profiles', 'all_notifications_enabled')
