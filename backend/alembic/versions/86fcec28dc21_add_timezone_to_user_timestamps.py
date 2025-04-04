"""add timezone to user timestamps

Revision ID: 86fcec28dc21
Revises: 7cb67c816dce
Create Date: 2024-03-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '86fcec28dc21'
down_revision = '7cb67c816dce'  # Set this to point to the other head
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Alter created_at column to include timezone
    op.alter_column('users', 'created_at',
        type_=postgresql.TIMESTAMP(timezone=True),
        postgresql_using='created_at AT TIME ZONE \'UTC\'',
        existing_nullable=True)
    
    # Set default timezone for created_at
    op.execute('UPDATE users SET created_at = created_at AT TIME ZONE \'UTC\' WHERE created_at IS NOT NULL')
    
    # Set default value for created_at where it's null
    op.execute('UPDATE users SET created_at = NOW() AT TIME ZONE \'UTC\' WHERE created_at IS NULL')


def downgrade() -> None:
    # Remove timezone from created_at column
    op.alter_column('users', 'created_at',
        type_=postgresql.TIMESTAMP(),
        postgresql_using='created_at::timestamp',
        existing_nullable=True)
