"""add is_active column to users table

Revision ID: 837230e41190
Revises: 4f960ea6e362
Create Date: 2025-04-04 08:43:24.295480

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '837230e41190'
down_revision = '4f960ea6e362'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_active column to users table
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'))
    # Update existing rows to have is_active = true
    op.execute("UPDATE users SET is_active = true WHERE is_active IS NULL")


def downgrade():
    # Remove is_active column from users table
    op.drop_column('users', 'is_active') 