"""add last_login column to users table

Revision ID: 7cb67c816dce
Revises: 837230e41190
Create Date: 2025-04-04 08:48:08.137814

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7cb67c816dce'
down_revision = '837230e41190'
branch_labels = None
depends_on = None


def upgrade():
    # Add last_login column to users table
    op.add_column('users', sa.Column('last_login', postgresql.TIMESTAMP(timezone=True), nullable=True))


def downgrade():
    # Remove last_login column from users table
    op.drop_column('users', 'last_login') 