"""Add username to users table

Revision ID: 4dc93ab3e6e6
Revises: dc77fb9b125a
Create Date: 2025-03-03 17:31:41.481344

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4dc93ab3e6e6'
down_revision: Union[str, None] = 'dc77fb9b125a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the username column with nullable=True temporarily
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))

    # Add a unique index for the username
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Optionally, populate `username` with a default value (if needed)
    # For example: op.execute("UPDATE users SET username = 'default_username' WHERE username IS NULL")

    # After populating all users, update the column to not allow NULL values
    # op.alter_column('users', 'username', nullable=False)


def downgrade() -> None:
    # Remove the username column and its index
    op.drop_index('ix_users_username', table_name='users')
    op.drop_column('users', 'username')
