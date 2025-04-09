"""enforce_is_admin_not_null

Revision ID: 3d145f150723
Revises: 88099d6dfa8b
Create Date: 2025-04-01 12:53:03.821819

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3d145f150723'
down_revision = '88099d6dfa8b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Set default value for existing users
    op.execute("UPDATE users SET is_admin = FALSE WHERE is_admin IS NULL")

    # Alter column to not allow NULL
    op.alter_column('users', 'is_admin',
                    existing_type=sa.Boolean(),
                    nullable=False,
                    server_default='FALSE')


def downgrade() -> None:
    op.alter_column('users', 'is_admin',
                    existing_type=sa.Boolean(),
                    nullable=True,
                    server_default=None)
