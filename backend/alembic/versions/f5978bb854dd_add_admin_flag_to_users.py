"""add_admin_flag_to_users

Revision ID: f5978bb854dd
Revises: 88099d6dfa8b
Create Date: 2025-04-01 12:53:03.821819

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f5978bb854dd'
down_revision = '88099d6dfa8b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the column with nullable=True initially
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=True))

    # Set existing records to FALSE
    op.execute("UPDATE users SET is_admin = FALSE WHERE is_admin IS NULL")

    # Make the column non-nullable with a default value
    op.alter_column('users', 'is_admin', nullable=False,
                    server_default="FALSE")


def downgrade() -> None:
    op.drop_column('users', 'is_admin')
